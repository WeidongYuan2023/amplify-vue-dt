import * as THREE from 'three'
import { ref, onMounted, nextTick, onBeforeUnmount, Ref, watch } from 'vue'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Hotspot, TooltipStyle } from '@/types'
import { CAMERA_ANIMATION_DURATION, SPHERE_RADIUS } from '@/constants'
import gsap from 'gsap'
import { getRequest } from '@/api/index';
import { modelStore } from '@/store/index';
import { modelCacheStore } from '@/store/cache';
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
    const store = modelStore();
    const modelCache = modelCacheStore();
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
    const isInitialized = ref(false)
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

    const initScene = async () => {
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
        camera.updateProjectionMatrix()

        renderer.setSize(container.value.clientWidth, container.value.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        // 初始化CSS2D渲染器
        labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none'; // 防止干扰鼠标事件

        // ... 现有代码 ...
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
                        animate()
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

        const res = await getRequest(`fuzzy-urls?pattern=vrChart.png`);
        const url = res.results[0]?.url || `${import.meta.env.VITE_APP_CONTEXT_PATH}${sceneConfig.panoramaUrl}`;
        console.log('sceneConfig panoramaUrl:', url)
        // 单独加载纹理并在加载完成后应用
        textureLoader.load(
            `${import.meta.env.VITE_APP_CONTEXT_PATH}${sceneConfig.panoramaUrl}`,
            (texture) => {
                // 设置纹理的颜色空间和其他属性
                // texture.colorSpace = THREE.SRGBColorSpace;
                // texture.minFilter = THREE.LinearFilter;
                // texture.magFilter = THREE.LinearFilter;
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
            (xhr) => {
                console.log(((xhr.loaded / xhr.total) * 100).toFixed(2));
                // console.log((loadingProgress.value) + '% loaded');
              },
            (error) => {
                console.error("Failed to load textureLoader:", error);
            }
        );
        scene.add(sphere)
        camera.position.set(0, 0, 0) // 将相机放在球体中心
        camera.position.z = 0.1

        // 添加窗口大小变化监听
        window.addEventListener('resize', onWindowResize)
        // 标记场景已初始化
        isInitialized.value = true
        isSceneInitialized.value = true
        // 添加旋转控制事件监听
        initRotationControls()
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

        // 确保清除之前的热点
        hotspots.forEach(hotspot => {
            if (scene.children.includes(hotspot)) {
                scene.remove(hotspot);
            }
        });
        hotspots.length = 0;

        const hotspotGeometry = new THREE.RingGeometry(15, 20, 64)
        const hotspotMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
            depthTest: false,
            depthWrite: false
        })

        oHotspots.forEach(pos => {
            const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial)
            hotspot.position.set(pos.x, pos.y, pos.z)
            hotspot.rotation.x = -Math.PI / 2
            hotspot.userData.content = pos.content
            hotspot.userData.detail = pos.detail
            hotspot.userData.type = 'hotspot'
            hotspot.userData.originalScale = { x: 1, y: 1, z: 1 }
            // 让热点始终面向相机
            scene.add(hotspot)
            hotspots.push(hotspot)
            console.log('hotspot has added into scene:', hotspot.position, pos)
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

        // 创建闪光圆环几何体和材质
        const pulseGeometry = new THREE.RingGeometry(7, 9, 32)
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // 青色闪光
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
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
            // 创建闪光圆环并添加到信息点
            const pulseRing = new THREE.Mesh(pulseGeometry, pulseMaterial.clone())
            infoPoint.add(pulseRing) // 将闪光环添加为信息点的子对象
            
            // 添加脉冲动画
            gsap.to(pulseRing.scale, {
                x: 1.3,
                y: 1.3,
                z: 1,
                duration: 1.5,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                onUpdate: () => {
                    // 随着缩放变化透明度
                    const material = pulseRing.material as THREE.MeshBasicMaterial;
                    material.opacity = 0.7 * (1 - (pulseRing.scale.x - 1) / 0.3);
                }
            });
            // infoPoint.lookAt(camera.position)
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
    const dampingFactor = 0.05; // 阻尼系数
    const targetLon = ref(0);
    const targetLat = ref(0);
    // 初始化旋转控制
    const initRotationControls = () => {
        if (!container.value) return
        container.value.addEventListener('mousedown', onPointerDown)
        document.addEventListener('mousemove', onPointerMove)
        document.addEventListener('mouseup', onPointerUp)

        // 触摸事件
        container.value.addEventListener('touchstart', onTouchStart)
        document.addEventListener('touchmove', onTouchMove)
        document.addEventListener('touchend', onTouchEnd)

        // 滚轮缩放
        container.value.addEventListener('wheel', onMouseWheel)

        // 初始化目标值
        targetLon.value = lon.value;
        targetLat.value = lat.value;
    }

    // 修改鼠标移动事件，更新目标值而非直接更新当前值
    const onPointerMove = (event: MouseEvent) => {
        if (isUserInteracting.value === false) return

        targetLon.value = (onPointerDownMouseX.value - event.clientX) * 0.1 + onPointerDownLon.value
        targetLat.value = (event.clientY - onPointerDownMouseY.value) * 0.1 + onPointerDownLat.value

        // 限制垂直旋转角度，防止过度旋转
        targetLat.value = Math.max(-85, Math.min(85, targetLat.value))
    }

    // 同样修改触摸移动事件
    const onTouchMove = (event: TouchEvent) => {
        if (isUserInteracting.value === false) return

        if (event.touches.length === 1) {
            targetLon.value = (onPointerDownMouseX.value - event.touches[0].pageX) * 0.1 + onPointerDownLon.value
            targetLat.value = (event.touches[0].pageY - onPointerDownMouseY.value) * 0.1 + onPointerDownLat.value

            // 限制垂直旋转角度
            targetLat.value = Math.max(-85, Math.min(85, targetLat.value))
        }
    }

    // ... 现有代码 ...

    // 鼠标按下事件处理
    const onPointerDown = (event: MouseEvent) => {
        if (!container.value) return

        isUserInteracting.value = true

        const clientX = event.clientX
        const clientY = event.clientY

        onPointerDownMouseX.value = clientX
        onPointerDownMouseY.value = clientY

        onPointerDownLon.value = lon.value
        onPointerDownLat.value = lat.value

        // 设置鼠标样式为抓取状态
        container.value.style.cursor = 'grabbing'

        // 阻止默认行为，防止拖动选择文本
        event.preventDefault()
    }

    // 鼠标释放事件处理
    const onPointerUp = () => {
        isUserInteracting.value = false

        // 恢复鼠标样式
        if (container.value) {
            container.value.style.cursor = 'grab'
        }
    }

    // 触摸开始事件处理
    const onTouchStart = (event: TouchEvent) => {
        if (event.touches.length === 1) {
            isUserInteracting.value = true

            const touch = event.touches[0]
            const clientX = touch.pageX
            const clientY = touch.pageY

            onPointerDownMouseX.value = clientX
            onPointerDownMouseY.value = clientY

            onPointerDownLon.value = lon.value
            onPointerDownLat.value = lat.value
        }

        // 阻止默认行为，防止页面滚动
        event.preventDefault()
    }

    // 触摸结束事件处理
    const onTouchEnd = () => {
        isUserInteracting.value = false
    }

    // 鼠标滚轮事件处理 - 实现缩放功能
    const onMouseWheel = (event: WheelEvent) => {
        if (!camera) return

        // 获取滚轮方向
        const delta = event.deltaY > 0 ? 1 : -1

        // 当前FOV
        const currentFOV = camera.fov

        // 计算新的FOV，实现缩放效果
        // 增加或减少FOV，delta为正时放大，为负时缩小
        let newFOV = currentFOV + delta * 2

        // 限制FOV范围，防止过度缩放
        newFOV = Math.max(10, Math.min(100, newFOV))

        // 当缩放到最大时，将相机位置重置为原始位置
        if (newFOV === 100) {
            animateCameraToPosition(ORIGINAL_CAMERA_POSITION, scene.position)
        }

        // 应用新的FOV
        camera.fov = newFOV
        camera.updateProjectionMatrix()

        // 阻止默认滚动行为
        event.preventDefault()
    }

    // 更新相机位置
    const updateCamera = () => {
        // 应用阻尼效果，平滑过渡到目标值
        lon.value += (targetLon.value - lon.value) * dampingFactor;
        lat.value += (targetLat.value - lat.value) * dampingFactor;

        // 将经纬度转换为3D坐标
        lat.value = Math.max(-85, Math.min(85, lat.value))
        phi.value = THREE.MathUtils.degToRad(90 - lat.value)
        theta.value = THREE.MathUtils.degToRad(lon.value)

        // 计算相机目标点
        const x = SPHERE_RADIUS * Math.sin(phi.value) * Math.cos(theta.value)
        const y = SPHERE_RADIUS * Math.cos(phi.value)
        const z = SPHERE_RADIUS * Math.sin(phi.value) * Math.sin(theta.value)

        camera.lookAt(x, y, z)
    }

    // 清除场景中的所有交互点
    const clearInteractionPoints = () => {
        if (!scene) return

        const elementsToRemove = []
        scene.traverse((object) => {
            if (object.userData && (
                object.userData.type === 'hotspot' ||
                object.userData.type === 'infoPoint' ||
                object.userData.type === 'viewPoint'
            )) {
                elementsToRemove.push(object)
            }
        })

        // 从场景中移除
        elementsToRemove.forEach(element => {
            scene.remove(element)
        })
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

    // 添加一个重置函数，可以在组件重新挂载时调用
    const resetVRScene = () => {
        console.log('重置VR场景')

        if (!isInitialized.value) {
            // 如果场景尚未初始化，则初始化它
            initScene()
            return
        }

        // 清除现有交互点
        clearInteractionPoints()

        // 重新初始化交互点
        initHotspots(sceneConfig.hotspots)
        initInfoPoints(sceneConfig.infoPoints)
        initViewPoints(sceneConfig.viewPoints)

        // 确保渲染循环在运行
        if (!animationFrameId && renderer && scene && camera) {
            animate()
        }
    }

    const fadeOutScene = (duration = 1.0, callback?: () => void) => {
        if (!container.value) return;
        
        const rendererElement = container.value.querySelector('canvas');
        if (rendererElement) {
            // 使用GSAP创建淡出动画
            gsap.to(rendererElement, {
                opacity: 0,
                duration: duration,
                ease: "power2.in",
                onComplete: () => {
                    // 动画完成后执行回调
                    if (callback) {
                        callback();
                    }
                }
            });
        } else if (callback) {
            // 如果找不到渲染元素但有回调，直接执行回调
            callback();
        }
    };

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
    const restoreInteractionPoints = (config: { panoramaUrl: string, hotspots?: Array<any>, infoPoints?: Array<any>, viewPoints?: Array<any> }) => {
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

        // 更新相机位置
        updateCamera()

        // 更新控制器
        controls?.update();

        // 让所有交互点始终面向相机
        // hotspots.forEach(hotspot => {
        //     hotspot.lookAt(camera.position)
        // })

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
                const offsetDistance = labelWidthNDC / 2 + 0.035;
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
                store.sceneHistory.panoramaUrl = sceneConfig.panoramaUrl
                updateTooltip(event, `changing scene: ${viewPoint.userData.content}`)

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
            // 先重置所有信息点的样式
            resetAllInfoPointsStyle();
            tooltipStates.value.forEach((state, index) => {
                state.show = false
                removeConnectionLine(index)
            });
            console.log(infoPoint)
            store.wsStatus.message = `You have clicked annotation: ${infoPoint.userData.content}`;

            // 设置当前点击的信息点样式
            setActiveInfoPointStyle(infoPoint);
            
            showConnectedTooltip(event, infoPoint);
            return
        }

        // 如果点击了其他地方，隐藏提示框
        // tooltipState.value.show = false
        // removeConnectionLine()
    }
     // 添加重置所有信息点样式的函数
     const resetAllInfoPointsStyle = () => {
        // 重置所有连接线和圆点样式
        connectionLines.forEach(svg => {
            const circle = svg.querySelector('circle');
            if (circle) {
                circle.setAttribute("r", "3"); // 恢复默认大小
                circle.setAttribute("fill", "white"); // 恢复默认颜色
            }
            
            const polyline = svg.querySelector('polyline');
            if (polyline) {
                polyline.setAttribute("stroke", "white"); // 恢复默认颜色
            }
        });
        
        // 重置所有标签样式
        infoPoints.forEach(infoPoint => {
            if (infoPoint.userData.label) {
                const labelElement = infoPoint.userData.label.element as HTMLElement;
                if (labelElement) {
                    const labelContainer = labelElement.querySelector('.surface-areaLabel');
                    if (labelContainer) {
                        labelContainer.classList.remove('active-label');
                    }
                    
                    // 重置箭头颜色
                    const arrow = labelElement.querySelector('.surface-areaLabel-arrow');
                    if (arrow) {
                        arrow.classList.remove('active-arrow');
                    }
                }
            }
        });
    }
    
    // 添加设置活跃信息点样式的函数
    const setActiveInfoPointStyle = (infoPoint: THREE.Mesh) => {
        const infoPointIndex = infoPoints.indexOf(infoPoint);
        
        // 设置连接线和圆点样式
        if (infoPointIndex >= 0 && infoPointIndex < connectionLines.length) {
            const svg = connectionLines[infoPointIndex];
            
            const circle = svg.querySelector('circle');
            if (circle) {
                // 使用GSAP添加放大动画效果
                gsap.to(circle, {
                    attr: { 
                        r: 5,  // 放大圆点
                        fill: "#ffffff", // 设置为白色
                        stroke: "#ffffff",
                        "stroke-width": 2
                    },
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
            
            const polyline = svg.querySelector('polyline');
            if (polyline) {
                polyline.setAttribute("stroke", "#ffffff"); // 设置为白色
            }
        }
        
        // 设置标签样式
        if (infoPoint.userData.label) {
            const labelElement = infoPoint.userData.label.element as HTMLElement;
            if (labelElement) {
                const labelContainer = labelElement.querySelector('.surface-areaLabel');
                if (labelContainer) {
                    labelContainer.classList.add('active-label');
                }
                
                // 设置箭头颜色
                const arrow = labelElement.querySelector('.surface-areaLabel-arrow');
                if (arrow) {
                    arrow.classList.add('active-arrow');
                }
            }
        }
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
        const offset = 100 // 增加偏移量为100
        const offsetY = 50
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
                tooltipY = pointScreenY + offsetY
                break
        }

        return { tooltipX, tooltipY }
    }
    // 显示带折线连接的tooltip
    const showConnectedTooltip = (event: MouseEvent, infoPoint: THREE.Mesh) => {
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
        // 检查当前信息点是否是活跃状态
        const infoPointIndex = infoPoints.indexOf(infoPoint);
        const isActive = tooltipStates.value.some(state => 
            state.show && state.infoPointIndex === infoPointIndex
        );

        // 如果是活跃状态，应用放大效果
        if (isActive) {
            // 使用GSAP添加放大动画效果
            gsap.to(circle, {
                attr: { 
                    r: 8,  // 放大圆点
                    fill: "#ffffff", // 设置为白色
                    stroke: "#ffffff",
                    "stroke-width": 2
                },
                duration: 0.3,
                ease: "power2.out"
            });
        }
        const polyline = svg.querySelector('polyline')
        if (polyline) {
            // 计算起点到终点的距离
            const dx = tooltipX - pointScreenX;
            const dy = tooltipY - pointScreenY;
            
            // 创建真正的折线效果
            // 计算中间点，使其Y坐标与起点不同，形成折线
            const midX = Math.round(pointScreenX + (tooltipX - pointScreenX) / 2);
            
            // 根据tooltip的位置决定中间点的Y坐标偏移方向
            let midY;
            if (tooltipY > pointScreenY) {
                // 如果tooltip在下方，中间点向下偏移
                midY = pointScreenY + Math.abs(dy) * 0.3;
            } else {
                // 如果tooltip在上方，中间点向上偏移
                midY = pointScreenY - Math.abs(dy) * 0.3;
            }
            
            // 设置折线的点，形成真正的折线
            const points = `${pointScreenX},${pointScreenY} ${midX},${midY} ${tooltipX + 8 },${tooltipY}`;
            polyline.setAttribute("points", points);
        }
    }
    // 添加处理关闭tooltip的函数
    const handleCloseTooltip = (index: number) => {
        if (index >= 0 && index < tooltipStates.value.length) {
            // 隐藏tooltip
            tooltipStates.value[index].show = false

            // 移除对应的连接线
            removeConnectionLine(index)
            resetAllInfoPointsStyle()
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

    onMounted(async () => {
        await nextTick();
        resumeRendering();
        await initScene()
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

    // 添加清理旋转控制事件的函数
    const cleanupRotationControls = () => {
        if (container.value) {
            container.value.removeEventListener('mousedown', onPointerDown)
            container.value.removeEventListener('touchstart', onTouchStart)
            container.value.removeEventListener('wheel', onMouseWheel)
        }

        document.removeEventListener('mousemove', onPointerMove)
        document.removeEventListener('mouseup', onPointerUp)
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
    }

    // 清理Three.js资源的函数
    const cleanupScene = () => {
        // 停止动画循环
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }

        // 停止渲染循环
        pauseRendering()

        // 清理旋转控制事件
        cleanupRotationControls()

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
        isSceneInitialized.value = false
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
        isLoading.value = false;
    })

    watch(() => store.updateScene, (newValue) => {
        if (newValue) {
            console.log(newValue)
            updateSceneConfig(newValue)
        }
    })

    // watch(() => store.mode, (newMode) => {
    //     if (newMode === 'store') {
    //         resumeRendering();
    //     } else {
    //         pauseRendering();
    //     }
    // }, { immediate: true });

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
        resetVRScene,
        clearInteractionPoints,
        fadeOutScene,
        isInitialized,
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