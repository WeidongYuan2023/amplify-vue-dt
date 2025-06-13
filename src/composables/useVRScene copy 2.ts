import * as THREE from 'three'
import { ref, onMounted, onBeforeUnmount, Ref, watch } from 'vue'
import { CSS2DObject, CSS2DRenderer } from '@types/three/examples/jsm/renderers/CSS2DRenderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Hotspot, TooltipStyle } from '@/types'
import { CAMERA_ANIMATION_DURATION, SPHERE_RADIUS } from '@/constants'
import gsap from 'gsap'
import { modelStore } from '@/store/index';

// 定义场景配置接口
interface SceneConfig {
    panoramaUrl: string
    hotspots?: Hotspot[]
    infoPoints?: Hotspot[]
    viewPoints?: Hotspot[]
}

// 默认配置
const DEFAULT_CONFIG: SceneConfig = {
    panoramaUrl: '',
    hotspots: [],
    infoPoints: [],
    viewPoints: []
}

export function useVRScene(container: Ref<HTMLElement | undefined>, config: Partial<SceneConfig> = {}) {
    // 合并配置
    const sceneConfig = { ...DEFAULT_CONFIG, ...config }
    const model = modelStore();
    // 添加加载状态
    let controls: OrbitControls;
    const isLoading = ref(true)
    const loadingProgress = ref(0)
    const isSceneInitialized = ref(false)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    let renderer: THREE.WebGLRenderer
    const hotspots: THREE.Mesh[] = []
    const infoPoints: THREE.Mesh[] = []
    const viewPoints: THREE.Mesh[] = []
    let labelRenderer: CSS2DRenderer // 添加CSS2D渲染器
    const labelObjects: CSS2DObject[] = [] // 存储所有标签对象
    // 当前全景图纹理
    let currentPanoramaTexture: THREE.Texture
    let sphere: THREE.Mesh
    // 添加动画帧ID，用于取消动画
    let animationFrameId: number | null = null
    // 旋转控制相关变量
    const isUserInteracting = ref(false)
    const onPointerDownMouseX = ref(0)
    const onPointerDownMouseY = ref(0)
    const lon = ref(0)
    const lat = ref(0)
    const onPointerDownLon = ref(0)
    const onPointerDownLat = ref(0)
    const phi = ref(0)
    const theta = ref(0)
    const connectionLines: SVGSVGElement[] = []
    // 添加渲染控制变量
    let isRendering = false;
    // 修改为数组，存储多个tooltip状态
    // 修改 tooltipStates 类型定义，添加固定位置标记
    const tooltipStates = ref<{
        show: boolean;
        content: string;
        infoPointIndex: number;
        detail: { [key: string]: any };
        style: TooltipStyle;
        fixedPosition?: boolean; // 添加固定位置标记
        index?: number; // 添加索引，用于关闭时识别
    }[]>([])
    const tooltipState = ref({
        show: false,
        content: '',
        style: {
            left: '0px',
            top: '0px'
        } as TooltipStyle
    })

    const initScene = () => {
        if (!container.value) return
        // 如果场景已经初始化，先清理资源
        if (isSceneInitialized.value) {
            cleanupScene()
        }
        scene.background = new THREE.Color(0xdddddd);
        renderer = new THREE.WebGLRenderer({ 
            antialias: true
         })
        camera.aspect = container.value.clientWidth / container.value.clientHeight
        camera.near = 0.01;
        camera.far = SPHERE_RADIUS * 2;
        camera.updateProjectionMatrix()

        renderer.setSize(container.value.clientWidth, container.value.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        // 初始化CSS2D渲染器
        labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none'; // 防止干扰鼠标事件
        // 添加旋转控制事件监听
        camera.position.set(0, 0, 0.5) // 将相机放在球体中心
        initRotationControls()
        container.value.appendChild(renderer.domElement)
        container.value.appendChild(labelRenderer.domElement) // 添加CSS2D渲染器到容器

        // 创建加载管理器
        const loadingManager = new THREE.LoadingManager(
            // 加载完成回调
            () => {
                isLoading.value = false
                // 使用GSAP添加淡入效果
                if (container.value) {
                    const rendererElement = container.value.querySelector('canvas')
                    if (rendererElement) {
                        gsap.fromTo(rendererElement,
                            { opacity: 0 },
                            { opacity: 1, duration: 1, ease: 'power2.out' }
                        )
                        // 初始化各种交互点
                        initHotspots()
                        initInfoPoints()
                        initViewPoints()
                    }
                }
                container.value?.appendChild(renderer.domElement)
            },
            // 加载进度回调
            (url, itemsLoaded, itemsTotal) => {
                loadingProgress.value = Math.floor((itemsLoaded / itemsTotal) * 100)
            }
        )

        // 创建球形全景
        const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 60, 40)
        geometry.scale(-1, 1, 1) // 将纹理翻转到球体内部

        // 使用加载管理器加载全景图纹理
        const textureLoader = new THREE.TextureLoader(loadingManager)
        // 先创建一个基础材质
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,  // 设置白色基础颜色
            transparent: false,
            depthWrite: false,  // 修改为false
            depthTest: true
        });
        
        // 创建球体
        sphere = new THREE.Mesh(geometry, material)
        scene.add(sphere)
        
        // 单独加载纹理并在加载完成后应用
        textureLoader.load(
            sceneConfig.panoramaUrl,
            (texture) => {
                // 设置纹理的颜色空间和其他属性
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.mapping = THREE.EquirectangularReflectionMapping;
                
                // 将纹理应用到材质
                material.map = texture;
                material.needsUpdate = true;
                currentPanoramaTexture = texture;
                
                // 确保场景重新渲染
                if (renderer) {
                    renderer.render(scene, camera);
                }
            },
            undefined,
            (error) => {
                console.error("Failed to load textureLoader:", error);
            }
        );
        scene.add(sphere)
       
        camera.position.z = 0.1

        // 添加窗口大小变化监听
        window.addEventListener('resize', onWindowResize)
        // 标记场景已初始化
        isSceneInitialized.value = true

        // 开始动画循环
        animate()
    }

    // 更新场景配置
    const updateSceneConfig = (newConfig: Partial<SceneConfig>) => {
        // 合并新配置
        Object.assign(sceneConfig, newConfig)

        // 如果场景已初始化，更新场景
        if (isSceneInitialized.value) {
            // 清除现有交互点
            clearInteractionPoints()
            restoreInteractionPoints(newConfig)
            // 如果提供了新的全景图URL，更新全景图
            if (newConfig.panoramaUrl) {
                changePanorama(newConfig.panoramaUrl)
            }
        }
    }

    const initHotspots = (oHotspots = sceneConfig.hotspots) => {
        if (!oHotspots || oHotspots.length === 0) return

        const hotspotGeometry = new THREE.RingGeometry(12, 18, 64)
        const hotspotMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            depthTest: false,
            depthWrite: false
        })

        oHotspots.forEach(pos => {
            const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial)
            hotspot.position.set(pos.x, pos.y, pos.z)
            hotspot.userData.content = pos.content
            hotspot.userData.detail = pos.detail
            hotspot.userData.type = 'hotspot'
            hotspot.userData.originalScale = { x: 1, y: 1, z: 1 }
            // 让热点始终面向相机
            hotspot.lookAt(camera.position)
            scene.add(hotspot)
            hotspots.push(hotspot)
        })
    }
    const initInfoPoints = (oInfoPoints = sceneConfig.infoPoints) => {
        if (!oInfoPoints || oInfoPoints.length === 0) return

        // 创建信息点（白色圆点）
        const infoPointGeometry = new THREE.CircleGeometry(5, 32)
        const infoPointMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
            depthTest: false,
            depthWrite: false
        })

        // 创建文本卡片精灵
        const createAreaLabel = (text: string, direction: string = 'right') => {
            // 创建外层容器
            const container = document.createElement('div');
            container.className = 'surface-areaLabel-container';

            // 创建文本标签
            const div = document.createElement('div');
            div.innerHTML = text;
            div.className = 'surface-areaLabel';

            // 创建箭头元素
            const arrow = document.createElement('div');
            arrow.className = 'surface-areaLabel-arrow';

            // 根据方向设置箭头样式类
            switch (direction) {
                case 'up':
                case 'top':
                    arrow.classList.add('arrow-top');
                    break;
                case 'down':
                case 'bottom':
                    arrow.classList.add('arrow-bottom');
                    break;
                case 'left':
                    arrow.classList.add('arrow-left');
                    break;
                case 'right':
                default:
                    arrow.classList.add('arrow-right');
                    break;
            }

            // 组装容器
            container.appendChild(div);
            container.appendChild(arrow);

            const labelObject = new CSS2DObject(container);
            return labelObject;
        };

        oInfoPoints.forEach((pos: any) => {
            const infoPoint = new THREE.Mesh(infoPointGeometry, infoPointMaterial)
            infoPoint.position.set(pos.x, pos.y, pos.z)
            infoPoint.userData.content = pos.content
            infoPoint.userData.detail = pos.detail
            infoPoint.userData.type = 'infoPoint'
            const direction = pos.direction || 'right' // 保存方向信息
            infoPoint.userData.direction = direction
            infoPoint.lookAt(camera.position)
            scene.add(infoPoint)
            infoPoints.push(infoPoint)

            // 添加CSS2D标签，传入方向参数
            const label = createAreaLabel(pos.content, direction)

            // 初始位置设置为与信息点相同
            label.position.copy(infoPoint.position)

            // 存储方向信息，用于动态更新
            infoPoint.userData.labelDirection = direction

            scene.add(label)
            labelObjects.push(label)
            infoPoint.userData.label = label
        })
    }
    // 添加鼠标悬停检测
    const checkHover = (event: MouseEvent) => {
        if (!container.value || isUserInteracting.value) return

        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        const rect = container.value.getBoundingClientRect()

        mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        // 检查是否悬停在热点上
        const hotspotIntersects = raycaster.intersectObjects(hotspots)

        // 重置所有hotspots的大小
        hotspots.forEach(hotspot => {
            hotspot.scale.set(1, 1, 1)
        })

        // 如果悬停在热点上，放大该hotspot
        if (hotspotIntersects.length > 0) {
            const hotspot = hotspotIntersects[0].object
            gsap.to(hotspot.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.3,
                ease: "power2.out"
            });
            container.value.style.cursor = 'pointer'
        } else {
            hotspots.forEach(hotspot => {
                gsap.to(hotspot.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            container.value.style.cursor = 'grab'
        }

        // 检查是否悬停在信息点或视角切换点上
        const otherIntersects = raycaster.intersectObjects([...infoPoints, ...viewPoints])
        if (otherIntersects.length > 0) {
            container.value.style.cursor = 'pointer'
        }
    }

    const initViewPoints = (oViewPoints = sceneConfig.viewPoints) => {
        if (!oViewPoints || oViewPoints.length === 0) return

        // 使用贴图创建视角切换点（箭头形状）
        const url = new URL('../assets/arrow-up.svg', import.meta.url).href
        console.log(url)
        const arrowTexture = new THREE.TextureLoader().load(url)

        // 创建平面几何体作为箭头的载体
        const viewPointGeometry = new THREE.PlaneGeometry(30, 40)
        const viewPointMaterial = new THREE.MeshBasicMaterial({
            map: arrowTexture,
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            depthTest: false,
            depthWrite: false
        })

        oViewPoints.forEach(pos => {
            // 创建箭头网格
            const viewPoint = new THREE.Mesh(viewPointGeometry, viewPointMaterial)
            viewPoint.position.set(pos.x, pos.y, pos.z)
            viewPoint.userData.content = pos.content
            viewPoint.userData.type = 'viewPoint'
            viewPoint.userData.panoramaUrl = pos.panoramaUrl

            // 添加点击区域扩大效果
            viewPoint.userData.originalScale = { x: 1, y: 1, z: 1 }

            // 让箭头始终面向相机
            viewPoint.lookAt(camera.position)
            scene.add(viewPoint)
            viewPoints.push(viewPoint)
        })
    }
    // 初始化旋转控制
    const initRotationControls = () => {
        // 创建OrbitControls实例
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        // controls.autoRotate = false; 
        controls.dampingFactor = 0.1;
        // controls.maxPolarAngle = Math.PI * 0.6; // 限制垂直旋转角度（向下）
        // controls.minPolarAngle = Math.PI * 0.4; // 限制垂直旋转角度（向上）
        controls.enableZoom = true; // 允许缩放
        controls.zoomSpeed = 10.0; // 降低缩放速度
        controls.rotateSpeed = -1.0; 

        // renderer.domElement.addEventListener('wheel', (event) => {
        //     // 阻止默认滚动行为，确保滚轮事件只被OrbitControls处理
        //     event.preventDefault();
        // }, { passive: false });

        // 添加变化监听器，确保每次变化都能立即渲染
        controls.addEventListener('change', () => {
            console.log('Camera position:', camera.position);
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
                labelRenderer.render(scene, camera); // 确保标签也被重新渲染
            }
        });
    }

    // 清除场景中的所有交互点
    const clearInteractionPoints = () => {
        // 清除热点
        hotspots.forEach(hotspot => {
            scene.remove(hotspot)
        })
        hotspots.length = 0

        // 清除信息点及其标签
        infoPoints.forEach(infoPoint => {
            scene.remove(infoPoint)
            if (infoPoint.userData.label) {
                scene.remove(infoPoint.userData.label)
            }
        })
        infoPoints.length = 0

        // 清除视角切换点
        viewPoints.forEach(viewPoint => {
            scene.remove(viewPoint)
        })
        viewPoints.length = 0

        // 清除标签对象
        labelObjects.forEach(label => {
            scene.remove(label)
        })
        labelObjects.length = 0

        // 清除连接线和提示框
        connectionLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line)
            }
        })
        connectionLines.length = 0
        tooltipStates.value = []
    }
    // 切换全景图
    const changePanorama = (panoramaUrl: string) => {
        // 设置加载状态
        // isLoading.value = true
        loadingProgress.value = 0

        // 创建加载管理器
        const loadingManager = new THREE.LoadingManager(
            // 加载完成回调
            () => {
                // isLoading.value = false
                // 添加场景切换完成后的淡入效果
                if (container.value) {
                    const rendererElement = container.value.querySelector('canvas')
                    if (rendererElement) {
                        gsap.fromTo(rendererElement,
                            { opacity: 0.3 },
                            { opacity: 1, duration: 1.2, ease: "power2.out" }
                        )
                    }
                }
            },
            // 加载进度回调
            (url, itemsLoaded, itemsTotal) => {
                loadingProgress.value = Math.floor((itemsLoaded / itemsTotal) * 100)
            }
        )


        // 添加场景切换开始时的淡出效果
        if (container.value) {
            const rendererElement = container.value.querySelector('canvas')
            if (rendererElement) {
                gsap.to(rendererElement, {
                    opacity: 0.3,
                    duration: 0.8,
                    ease: "power2.in"
                })
            }
        }

        // 加载新的全景图纹理
        const textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.load(panoramaUrl, (texture) => {
            // 确保 sphere 和 sphere.material 存在
            if (sphere && sphere.material) {
                // 类型守卫，确保 material 是 MeshBasicMaterial
                if (Array.isArray(sphere.material)) {
                    console.error("Material is an array, cannot assign texture directly.");
                    return;
                }

                if (sphere.material instanceof THREE.MeshBasicMaterial) {
                    sphere.material.map = texture; // 安全地设置 map 属性
                    sphere.material.needsUpdate = true; // 标记材质需要更新
                    currentPanoramaTexture = texture;
                } else {
                    console.error("Material is not an instance of MeshBasicMaterial.");
                }
            }
        });
    }

    // 确保restoreInteractionPoints函数正确实现
    const restoreInteractionPoints = (config: { panoramaUrl?: string, hotspots?: Array<any>, infoPoints?: Array<any>, viewPoints?: Array<any> }) => {
        // 先清除现有交互点，确保不会重复添加
        clearInteractionPoints()
        console.log(hotspots, infoPoints, viewPoints)

        // 重新初始化各种交互点
        initHotspots()
        initInfoPoints()
        initViewPoints()
    }

    const onWindowResize = () => {
        if (!container.value) return

        camera.aspect = container.value.clientWidth / container.value.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.value.clientWidth, container.value.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // 更新CSS2D渲染器大小
        labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight)
    }

    const animate = () => {
        if (!isRendering) return;

        animationFrameId = requestAnimationFrame(animate)

        // 更新控制器
        if (controls) {
            controls.update();
        }

        // 让所有交互点始终面向相机
        hotspots.forEach(hotspot => {
            hotspot.lookAt(camera.position)
        })

        infoPoints.forEach(infoPoint => {
            infoPoint.lookAt(camera.position)
            // 更新标签位置
            if (infoPoint.userData.label) {
                const label = infoPoint.userData.label

                // 获取信息点在屏幕上的位置
                const pointPosition = infoPoint.position.clone()
                const screenPosition = pointPosition.clone().project(camera)

                // 获取标签方向
                const direction = infoPoint.userData.labelDirection || 'right'

                // 计算标签在屏幕空间中的偏移方向
                let offsetX = 0;
                let offsetY = 0;
                // 获取标签的实际DOM元素
                const labelElement = label.element as HTMLElement;
                const labelWidth = labelElement.offsetWidth;
                const labelHeight = labelElement.offsetHeight;
                let labelWidthNDC = (labelWidth / container.value.clientWidth) * 2;
                let labelHeightNDC = (labelHeight / container.value.clientHeight) * 2;

                // 计算最终偏移距离
                const offsetDistance = labelWidthNDC / 2 + 0.025;
                const offsetDistanceY = labelHeightNDC / 2 + 0.025;

                switch (direction) {
                    case 'up':
                    case 'top':
                        offsetY = offsetDistanceY;
                        break;
                    case 'down':
                    case 'bottom':
                        offsetY = -offsetDistanceY;
                        break;
                    case 'left':
                        offsetX = -offsetDistance;
                        break;
                    case 'right':
                    default:
                        offsetX = offsetDistance;
                        break;
                }

                // 在屏幕空间中应用偏移
                screenPosition.x += offsetX;
                screenPosition.y += offsetY;

                // 将屏幕坐标转回世界坐标
                screenPosition.unproject(camera);

                // 计算从相机到新位置的射线
                const dir = screenPosition.sub(camera.position).normalize();

                // 计算射线与球面的交点
                const distance = SPHERE_RADIUS; // 使用球体半径
                const newPosition = camera.position.clone().add(dir.multiplyScalar(distance));

                // 设置标签位置
                label.position.copy(newPosition);
            }
        })

        viewPoints.forEach(viewPoint => {
            viewPoint.lookAt(camera.position)
            // 同时更新内环的朝向
            if (viewPoint.children.length > 0) {
                viewPoint.children[0].lookAt(camera.position)
            }
        })

        // 更新所有连接线和tooltip的位置
        if (container.value) {
            for (let i = 0; i < connectionLines.length; i++) {
                const svg = connectionLines[i]
                const tooltipState = tooltipStates.value[i]

                if (svg && tooltipState) {
                    const infoPointIndex = parseInt(svg.dataset.infoPointIndex || '-1')
                    if (infoPointIndex >= 0 && infoPointIndex < infoPoints.length) {
                        const infoPoint = infoPoints[infoPointIndex]

                        // 使用共通函数计算屏幕坐标
                        const { x: pointScreenX, y: pointScreenY, isVisible } = calculateInfoPointScreenPosition(infoPoint)

                        // 如果信息点不在视野内，隐藏tooltip和连接线
                        if (!isVisible) {
                            tooltipState.show = false
                            svg.style.display = 'none'
                            continue
                        } else {
                            // 如果之前被隐藏了，现在重新显示
                            tooltipState.show = true
                            svg.style.display = 'block'
                        }

                        // 如果tooltip是显示状态，更新位置
                        if (tooltipState.show) {
                            // 使用共通函数计算tooltip位置
                            const { tooltipX, tooltipY } = calculateTooltipPosition(infoPoint, pointScreenX, pointScreenY)

                            // 更新tooltip位置
                            tooltipState.style = {
                                left: `${tooltipX}px`,
                                top: `${tooltipY}px`
                            }

                            // 更新连接线
                            updateConnectionLine(svg, infoPoint, tooltipX, tooltipY)
                        }
                    }
                }
            }
        }

        if (renderer) {
            renderer.render(scene, camera)
        }

        if (labelRenderer) {
            labelRenderer.render(scene, camera) // 渲染CSS2D对象
        }
    }

    // 添加暂停和恢复渲染的方法
    const pauseRendering = () => {
        isRendering = false;
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    const resumeRendering = () => {
        if (!isRendering) {
            isRendering = true;
            animate();
        }
    };

    const ORIGINAL_FOV = 75; // 与相机初始化时的FOV值保持一致
    // 添加一个常量用于存储相机的原始位置
    const ORIGINAL_CAMERA_POSITION = new THREE.Vector3(0, 0, 0.1)
    const handleClick = (event: MouseEvent) => {
        // 如果用户正在拖动，不处理点击事件
        if (isUserInteracting.value) return

        // 防止快速连续点击
        // if (currentConnectionLine) {
        //     removeConnectionLine();
        // }

        if (!container.value) return

        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        const rect = container.value.getBoundingClientRect()

        mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        // 检查是否点击了视角切换点
        const viewPointIntersects = raycaster.intersectObjects(viewPoints)
        if (viewPointIntersects.length > 0) {
            const viewPoint = viewPointIntersects[0].object
            const panoramaUrl = viewPoint.userData.panoramaUrl

            if (panoramaUrl) {
                changePanorama(panoramaUrl)
                clearInteractionPoints()
                model.sceneHistory.panoramaUrl = sceneConfig.panoramaUrl
                updateTooltip(event, `正在切换到: ${viewPoint.userData.content}`)

                // 短暂显示提示后隐藏
                setTimeout(() => {
                    tooltipState.value.show = false
                }, 2000)
            }
            return
        }



        // 检查是否点击了热点
        const hotspotIntersects = raycaster.intersectObjects(hotspots)
        if (hotspotIntersects.length > 0) {
            const hotspot = hotspotIntersects[0].object
            // 计算目标位置 - 向热点方向移动，但不是完全到热点位置
            const direction = hotspot.position.clone().normalize()
            const targetPosition = direction.multiplyScalar(SPHERE_RADIUS * 0.5) // 移动到半径的一半距离

            // 执行相机动画
            animateCameraToPosition(targetPosition, hotspot.position)
            return
        } else {
            // 如果点击了其他区域，相机返回原始位置
            // animateCameraToPosition(ORIGINAL_CAMERA_POSITION, scene.position)
        }

        // 检查是否点击了信息点
        const infoPointIntersects = raycaster.intersectObjects(infoPoints)
        if (infoPointIntersects.length > 0) {
            const infoPoint = infoPointIntersects[0].object
            //   updateTooltip(event, infoPoint.userData.content)
            showConnectedTooltip(event, infoPoint);
            return
        }

        // 如果点击了其他地方，隐藏提示框
        // tooltipState.value.show = false
        // removeConnectionLine()
    }
    const updateTooltip = (event: MouseEvent, content: string) => {
        tooltipState.value = {
            show: true,
            content,
            style: {
                left: `${event.clientX}px`,
                top: `${event.clientY}px`
            }
        }
    }
    // 修改相机动画函数，使其移动到指定位置
    const animateCameraToPosition = (targetPosition: THREE.Vector3, lookAtTarget: THREE.Vector3) => {
        const startPosition = camera.position.clone()
        const startTime = Date.now()

        function update() {
            const currentTime = Date.now()
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / CAMERA_ANIMATION_DURATION, 1)

            camera.position.lerpVectors(startPosition, targetPosition, progress)

            // 确保相机始终朝向球体中心
            camera.lookAt(lookAtTarget)

            if (progress < 1) {
                requestAnimationFrame(update)
            }
        }

        update()
    }
    // 提取共通函数：计算信息点的屏幕坐标
    const calculateInfoPointScreenPosition = (infoPoint: THREE.Mesh) => {
        if (!container.value) return { x: 0, y: 0, isVisible: false }

        // 获取信息点在屏幕上的坐标
        const pointPosition = infoPoint.position.clone()
        const tempV = pointPosition.clone()
        tempV.project(camera)

        // 检查信息点是否在视野内
        const isVisible = tempV.x >= -1 && tempV.x <= 1 && tempV.y >= -1 && tempV.y <= 1 && tempV.z < 1

        const widthHalf = container.value.clientWidth / 2
        const heightHalf = container.value.clientHeight / 2

        // 将NDC坐标转换为屏幕坐标
        const pointScreenX = Math.round((tempV.x * widthHalf) + widthHalf)
        const pointScreenY = Math.round(-(tempV.y * heightHalf) + heightHalf)

        return { x: pointScreenX, y: pointScreenY, isVisible }
    }

    // 提取共通函数：计算tooltip位置
    const calculateTooltipPosition = (infoPoint: THREE.Mesh, pointScreenX: number, pointScreenY: number) => {
        // 计算tooltip的位置 - 根据信息点的方向属性
        const direction = infoPoint.userData.detail?.direction || 'right'
        let tooltipX = pointScreenX
        let tooltipY = pointScreenY

        // 根据方向设置tooltip的位置
        const offset = 120 // 增加偏移量为120
        switch (direction) {
            case 'up':
            case 'top':
                tooltipX = pointScreenX
                tooltipY = pointScreenY - offset
                break
            case 'down':
            case 'bottom':
                tooltipX = pointScreenX
                tooltipY = pointScreenY + offset
                break
            case 'left':
                tooltipX = pointScreenX - offset
                tooltipY = pointScreenY
                break
            case 'right':
            default:
                tooltipX = pointScreenX + offset
                tooltipY = pointScreenY
                break
        }

        return { tooltipX, tooltipY }
    }
    // 显示带折线连接的tooltip
    const showConnectedTooltip = (event: MouseEvent, infoPoint: any) => {
        // 创建连接线
        if (container.value) {
            if (isUserInteracting.value) return;

            // 使用射线检测获取精确的点击位置
            const raycaster = new THREE.Raycaster()
            const mouse = new THREE.Vector2()
            const rect = container.value.getBoundingClientRect()

            mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
            mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1

            raycaster.setFromCamera(mouse, camera)

            // 使用共通函数计算屏幕坐标
            const { x: pointScreenX, y: pointScreenY } = calculateInfoPointScreenPosition(infoPoint)

            // 使用共通函数计算tooltip位置
            const { tooltipX, tooltipY } = calculateTooltipPosition(infoPoint, pointScreenX, pointScreenY)

            // 检查是否已经存在该信息点的tooltip
            const infoPointIndex = infoPoints.indexOf(infoPoint)
            const existingTooltipIndex = tooltipStates.value.findIndex(t => t.infoPointIndex === infoPointIndex)

            if (existingTooltipIndex >= 0) {
                // 如果已存在，更新它，确保show为true
                tooltipStates.value[existingTooltipIndex] = {
                    show: true, // 确保设置为true，显示tooltip
                    content: infoPoint.userData.content,
                    detail: infoPoint.userData.detail,
                    infoPointIndex: infoPointIndex,
                    style: {
                        left: `${tooltipX}px`,
                        top: `${tooltipY}px`
                    },
                    index: existingTooltipIndex // 设置索引
                }

                // 更新现有连接线
                updateConnectionLine(connectionLines[existingTooltipIndex], infoPoint, tooltipX, tooltipY)
            } else {
                // 如果不存在，添加新的tooltip，确保show为true
                const newIndex = tooltipStates.value.length
                tooltipStates.value.push({
                    show: true, // 确保设置为true，显示tooltip
                    content: infoPoint.userData.content,
                    detail: infoPoint.userData.detail,
                    infoPointIndex: infoPointIndex,
                    style: {
                        left: `${tooltipX}px`,
                        top: `${tooltipY}px`
                    },
                    index: newIndex // 设置索引
                })

                // 创建新的连接线
                const svg = createConnectionLine(infoPoint, tooltipX, tooltipY)
                if (svg) {
                    connectionLines.push(svg)
                }
            }
        }
    }

    // 创建连接线的辅助函数
    const createConnectionLine = (infoPoint: THREE.Mesh, tooltipX: number, tooltipY: number): SVGSVGElement | null => {
        if (!container.value) return null

        // 使用共通函数计算屏幕坐标
        const { x: pointScreenX, y: pointScreenY } = calculateInfoPointScreenPosition(infoPoint)

        // 创建SVG元素
        const svgNS = "http://www.w3.org/2000/svg"
        const svg = document.createElementNS(svgNS, "svg")
        svg.setAttribute("width", container.value.clientWidth.toString())
        svg.setAttribute("height", container.value.clientHeight.toString())
        svg.style.position = "absolute"
        svg.style.top = "0"
        svg.style.left = "0"
        svg.style.pointerEvents = "none"
        svg.style.zIndex = "1000"

        // 创建折线
        const polyline = document.createElementNS(svgNS, "polyline")

        // 计算中间点，创建折线效果
        const midX = Math.round(pointScreenX + (tooltipX - pointScreenX) / 2)
        const midY = pointScreenY // 保持与信息点相同的高度

        // 创建一个小圆点标记起始位置
        const circle = document.createElementNS(svgNS, "circle")
        circle.setAttribute("cx", pointScreenX.toString())
        circle.setAttribute("cy", pointScreenY.toString())
        circle.setAttribute("r", "3")
        circle.setAttribute("fill", "white")

        // 设置折线的点，形成两段折线
        const points = `${pointScreenX},${pointScreenY} ${midX},${midY} ${tooltipX},${tooltipY}`

        polyline.setAttribute("points", points)
        polyline.setAttribute("stroke", "white")
        polyline.setAttribute("stroke-width", "2")
        polyline.setAttribute("fill", "none")

        // 添加起始点标记和折线
        svg.appendChild(circle)
        svg.appendChild(polyline)
        container.value.appendChild(svg)

        // 存储信息点引用，用于在animate函数中更新位置
        svg.dataset.infoPointIndex = infoPoints.indexOf(infoPoint).toString()

        return svg
    }

    const updateConnectionLine = (svg: SVGSVGElement, infoPoint: THREE.Mesh, tooltipX: number, tooltipY: number) => {
        if (!container.value) return

        // 使用共通函数计算屏幕坐标
        const { x: pointScreenX, y: pointScreenY } = calculateInfoPointScreenPosition(infoPoint)

        // 更新连接线
        const circle = svg.querySelector('circle')
        if (circle) {
            circle.setAttribute("cx", pointScreenX.toString())
            circle.setAttribute("cy", pointScreenY.toString())
        }

        const polyline = svg.querySelector('polyline')
        if (polyline) {
            // 计算中间点，创建折线效果
            const midX = Math.round(pointScreenX + (tooltipX - pointScreenX) / 2)
            const midY = pointScreenY // 保持与信息点相同的高度

            // 更新折线的点
            const points = `${pointScreenX},${pointScreenY} ${midX},${midY} ${tooltipX},${tooltipY}`
            polyline.setAttribute("points", points)
        }
    }
    // 添加处理关闭tooltip的函数
    const handleCloseTooltip = (index: number) => {
        if (index >= 0 && index < tooltipStates.value.length) {
            // 隐藏tooltip
            tooltipStates.value[index].show = false

            // 移除对应的连接线
            removeConnectionLine(index)
        }
    }
    // 移除连接线
    const removeConnectionLine = (index?: number) => {
        if (index !== undefined) {
            // 移除特定的连接线
            if (index >= 0 && index < connectionLines.length) {
                const svg = connectionLines[index]
                if (svg && svg.parentNode) {
                    svg.parentNode.removeChild(svg)
                }
                connectionLines.splice(index, 1)
                tooltipStates.value.splice(index, 1)
            }
        } else {
            // 移除所有连接线
            connectionLines.forEach(svg => {
                if (svg && svg.parentNode) {
                    svg.parentNode.removeChild(svg)
                }
            })
            connectionLines.length = 0
            tooltipStates.value.length = 0
        }
    }

    onMounted(() => {
        initScene()
        // animate()
        if (container.value) {
            const resizeObserver = new ResizeObserver(() => {
                onWindowResize()
            })
            resizeObserver.observe(container.value)
        }
        container.value?.addEventListener('click', handleClick)
        container.value?.addEventListener('mousemove', checkHover) // 添加鼠标移动监听
        window.addEventListener('resize', onWindowResize)
    })

    // 清理Three.js资源的函数
    const cleanupScene = () => {
        // 停止动画循环
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }

        // 停止渲染循环
        pauseRendering()

        // 清理交互点
        clearInteractionPoints()

        // 清理渲染器
        if (renderer) {
            renderer.dispose()
        }

        // 清理相机控制器
        if (controls) {
            controls.dispose()
        }
        // 移除所有hotspots
        hotspots.forEach(hotspot => {
            scene.remove(hotspot)
        })
        hotspots.length = 0

        // 移除所有infoPoints
        infoPoints.forEach(infoPoint => {
            scene.remove(infoPoint)
        })
        infoPoints.length = 0

        // 移除所有viewPoints
        viewPoints.forEach(viewPoint => {
            scene.remove(viewPoint)
        })
        viewPoints.length = 0

        // 移除所有标签对象
        labelObjects.forEach(labelObject => {
            scene.remove(labelObject)
        })
        labelObjects.length = 0

        // 移除连接线
        connectionLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line)
            }
        })
        connectionLines.length = 0

        if (sphere) {
            scene.remove(sphere)
            if (sphere.geometry) sphere.geometry.dispose()
            if (sphere.material) {
                if (Array.isArray(sphere.material)) {
                    sphere.material.forEach(m => m.dispose())
                } else {
                    sphere.material.dispose()
                }
            }
        }

        // 释放纹理
        if (currentPanoramaTexture) {
            currentPanoramaTexture.dispose()
        }
        controls?.dispose()

        // 移除渲染器
        if (renderer && container.value) {
            renderer.dispose()
            renderer.forceContextLoss()
            container.value.removeChild(renderer.domElement)
        }

        // 移除标签渲染器
        if (labelRenderer && container.value) {
            container.value.removeChild(labelRenderer.domElement)
        }

        // 重置状态
        tooltipStates.value = []
        tooltipState.value = {
            show: false,
            content: '',
            style: {
                left: '0px',
                top: '0px'
            }
        }
    }

    onBeforeUnmount(() => {
        cleanupScene()
        // 移除所有事件监听
        container.value?.removeEventListener('click', handleClick)

        // 移除旋转控制相关事件
        if (container.value) {
            const resizeObserver = new ResizeObserver(() => { })
            resizeObserver.unobserve(container.value)
            resizeObserver.disconnect()
        }

        window.removeEventListener('resize', onWindowResize)
        renderer?.dispose()
        removeConnectionLine()

        if (labelRenderer && labelRenderer.domElement && labelRenderer.domElement.parentNode) {
            labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement)
        }
    })

    watch(() => model.updateScene, (newValue) => {
        if (newValue) {
            console.log(newValue)
            updateSceneConfig(newValue)
        }
    })

    watch(() => model.mode, (newMode) => {
        if (newMode === 'model') {
            resumeRendering();
        } else {
            pauseRendering();
        }
    }, { immediate: true });

    return {
        tooltipStates,
        tooltipState,
        handleCloseTooltip,
        changePanorama, // 暴露切换全景图方法
        isRotating: isUserInteracting, // 暴露是否正在旋转状态
        isLoading, // 暴露加载状态
        loadingProgress, // 暴露加载进度
        pauseRendering,
        resumeRendering,
        // 提供初始化方法
        initialize: () => {
            if (!isSceneInitialized.value) {
                initScene()
            }
        },
        // 提供更新方法
        update: (newConfig: Partial<SceneConfig>) => {
            updateSceneConfig(newConfig)
        },
        // 提供重置方法
        reset: () => {
            cleanupScene()
            initScene()
        },
        // 提供销毁方法
        destroy: () => {
            cleanupScene()
            isSceneInitialized.value = false
        }
    }
}