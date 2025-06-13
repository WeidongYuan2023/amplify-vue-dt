<template>
  <div class="glb-container" ref="container"></div>
  <loadingComp v-if="showLoading" :process="loadingProgress" />
  <div class="interactive-points-container">
    <div v-for="point in visiblePoints" :key="point.id" class="interactive-point"
      :style="{ left: `${point.screenPosition.x}px`, top: `${point.screenPosition.y}px` }"
      @click="handlePointClick(point)">
      <div class="point-marker">
        <div class="point-pulse"
          :style="{ backgroundColor: point.isActive ? 'rgba(255, 165, 0, 0.4)' : 'rgba(0, 255, 255, 0.4)' }"></div>
        <div class="point-center" :style="{ backgroundColor: point.isActive ? '#0099ff' : '#ffffff' }"></div>
      </div>
      <div class="point-label" v-if="point.showLabel">
        {{ point.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import loadingComp from '@/components/ui/Loading.vue';
import { getRequest } from '@/api/index';
import { modelCacheStore } from '@/store/cache';
import { morningRoomPoints } from '@/config/vrSceneConfig'
import gsap from 'gsap';
import { modelStore } from '@/store/index';
const store = modelStore();
const props = defineProps({
  modelPath: {
    type: String,
    required: true
  }
});

// 更新emit以包含pointClick事件
const emit = defineEmits(['close', 'modelLoaded', 'pointClick']);
const modelCacheManager = modelCacheStore();
let isRendering = true;
const isModelLoaded = ref(false);
const container = ref(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationFrameId: number | null = null;
const showLoading = ref(true);
const loadingProgress = ref(0);

// 添加交互点相关的状态
const interactivePoints = ref<any[]>([]);
const visiblePoints = ref<any[]>([]);

const init = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x555555);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  window.camera = camera; // for debug
  window.lookAtPoint = new THREE.Vector3(0, 0, 0);
  if (isMoringRoom.value) {
    camera.position.set(2, 2, 0);
  } else {
    camera.position.set(-1, 5, 2);
  }

  // 添加一个辅助坐标系
  // const axesHelper = new THREE.AxesHelper(15);
  // scene.add(axesHelper);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  window.controls = controls;
  controls.enableDamping = true;
  controls.autoRotate = false;
  controls.dampingFactor = 0.5;
  // 添加视角和缩放限制
  controls.minDistance = 0.001; // 最小缩放距离
  controls.maxDistance = 5; // 最大缩放距离
  // controls.maxPolarAngle = Math.PI * 0.6; // 限制垂直旋转角度（向下）
  // controls.minPolarAngle = Math.PI * 0.4; // 限制垂直旋转角度（向上）
  controls.enableZoom = true; // 允许缩放
  controls.zoomSpeed = 2.5; // 降低缩放速度
  // 添加环境光和方向光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 加载模型
  loadModel();
};

const loadModel = async () => {
  // 检查缓存
  if (modelCacheManager.hasModel(props.modelPath)) {
    console.log('Load model feom cache:', props.modelPath);
    const cachedModel = modelCacheManager.getModel(props.modelPath).clone();
    handleModelLoaded(cachedModel);
    return;
  }

  // 设置 DRACOLoader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(`${import.meta.env.VITE_APP_CONTEXT_PATH}draco/`);
  dracoLoader.setDecoderConfig({ type: 'js' });
  dracoLoader.preload();

  // 设置 GLTFLoader
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  console.log('Load model from:', props.modelPath);
  const res = await getRequest(`fuzzy-urls?pattern=${props.modelPath}`);
  // console.log('res:', res);
  const url = res.results[0]?.url || '';

  if (!url) {
    console.error('Failed to load model:', props.modelPath);
    return;
  }

  // 加载模型
  loader.load(
    url,
    (gltf) => {
      // 存入缓存
      modelCacheManager.addModel(props.modelPath, gltf.scene.clone());
      handleModelLoaded(gltf.scene);
      dracoLoader.dispose();
    },
    (xhr) => {
      loadingProgress.value = ((xhr.loaded / xhr.total) * 100).toFixed(2);
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('Failed to load model:', error);
    }
  );
};

// 添加模型淡入淡出效果的公共方法
const applyModelFadeEffect = (model, fadeIn = true, duration = 1.2) => {
  // 保存原始材质状态
  const originalMaterials = new Map();

  // 设置初始透明度
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      if (Array.isArray(node.material)) {
        // 保存原始状态
        originalMaterials.set(node, node.material.map(mat => ({
          transparent: mat.transparent,
          opacity: mat.opacity
        })));

        node.material.forEach(mat => {
          if (mat) {
            mat.transparent = true;
            // 确保淡出时从完全不透明开始
            mat.opacity = fadeIn ? 0 : 1;
          }
        });
      } else if (node.material) {
        // 保存原始状态
        originalMaterials.set(node, {
          transparent: node.material.transparent,
          opacity: node.material.opacity
        });

        node.material.transparent = true;
        // 确保淡出时从完全不透明开始
        node.material.opacity = fadeIn ? 0 : 1;
      }
    }
  });

  // 创建淡入/淡出动画，使用更明显的缓动效果
  return gsap.to({}, {
    duration: duration,
    ease: fadeIn ? "power1.out" : "power1.in", // 添加缓动效果
    onUpdate: function () {
      const progress = this.progress();
      model.traverse((node) => {
        if (node.isMesh && node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(mat => {
              if (mat) {
                // 淡出时确保透明度变化更明显
                mat.opacity = fadeIn ? progress : 1 - progress;
              }
            });
          } else if (node.material) {
            // 淡出时确保透明度变化更明显
            node.material.opacity = fadeIn ? progress : 1 - progress;
          }
        }
      });
    },
    onComplete: function () {
      // 动画完成后，恢复材质的原始透明度设置
      model.traverse((node) => {
        if (node.isMesh && node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((mat, index) => {
              if (mat) {
                const original = originalMaterials.get(node);
                if (original && original[index]) {
                  // 如果是淡入，保持opacity为1；如果是淡出，可以恢复原始opacity
                  mat.transparent = original[index].transparent;
                  mat.opacity = fadeIn ? 1 : original[index].opacity;
                }
              }
            });
          } else if (node.material) {
            const original = originalMaterials.get(node);
            if (original) {
              node.material.transparent = original.transparent;
              node.material.opacity = fadeIn ? 1 : original.opacity;
            }
          }
        }
      });

      // 强制渲染一帧确保更改生效
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });
};

// 处理模型加载完成
const handleModelLoaded = (loadedModel) => {
  const model = loadedModel;
  showLoading.value = false;
  scene.add(model);

  // 在模型墙上添加可点击圆点
  if (isMoringRoom.value) {
    addInteractivePoints();
  }

  emit('modelLoaded', model);
  isModelLoaded.value = true;
  animate();

  // 应用淡入效果
  applyModelFadeEffect(model, true, 1.2);
};

const isMoringRoom = computed(() => {
  return store.currentScene.name === 'morningRoom';
});

// 添加交互点
const addInteractivePoints = () => {
  // 清空现有点
  interactivePoints.value = [];
  visiblePoints.value = [];

  // 遍历配置列表，添加每个交互点
  morningRoomPoints.forEach(config => {
    addSingleInteractivePoint(config);
  });

  // 初始更新点的屏幕位置
  updatePointScreenPositions();
};

// 添加单个交互点
const addSingleInteractivePoint = (config) => {
  // 创建一个3D向量来存储点的位置
  const position = new THREE.Vector3(
    config.position.x,
    config.position.y,
    config.position.z
  );

  // 创建点的数据对象
  const point = {
    id: config.id,
    title: config.title || '',
    position: position,
    cameraPosition: config.cameraPosition,
    cameraLookAt: config.cameraLookAt,
    screenPosition: { x: 0, y: 0 },
    visible: false,
    showLabel: false,
    color: config.color || 0x00ffff
  };

  // 添加到交互点数组
  interactivePoints.value.push(point);

  return point;
};

// 更新所有点的屏幕位置
const updatePointScreenPositions = () => {
  if (!camera || !renderer || !container.value || interactivePoints.value.length === 0) return;

  const tempV = new THREE.Vector3();
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(matrix);

  // 创建射线检测器
  const raycaster = new THREE.Raycaster();

  // 更新每个点的屏幕位置
  visiblePoints.value = interactivePoints.value.filter(point => {
    // 检查点是否在视锥体内
    if (!frustum.containsPoint(point.position)) {
      return false;
    }

    // 将3D位置转换为屏幕坐标
    tempV.copy(point.position);
    tempV.project(camera);

    const widthHalf = container.value.clientWidth / 2;
    const heightHalf = container.value.clientHeight / 2;

    point.screenPosition = {
      x: (tempV.x * widthHalf) + widthHalf,
      y: -(tempV.y * heightHalf) + heightHalf
    };

    // 检查点是否被遮挡
    // raycaster.set(camera.position, point.position.clone().sub(camera.position).normalize());
    // const intersects = raycaster.intersectObjects(scene.children, true);

    // // 如果第一个相交点的距离小于相机到点的距离，则点被遮挡
    // if (intersects.length > 0) {
    //   const distanceToPoint = camera.position.distanceTo(point.position);
    //   const distanceToIntersect = intersects[0].distance;

    //   // 添加一个小的容差值，避免浮点数精度问题
    //   const isOccluded = distanceToIntersect < (distanceToPoint - 0.1);
    //   point.isOccluded = isOccluded;

    //   if (isOccluded) {
    //     return false;
    //   }
    // }

    // 检查点是否在屏幕范围内
    return (
      point.screenPosition.x >= 0 &&
      point.screenPosition.x <= container.value.clientWidth &&
      point.screenPosition.y >= 0 &&
      point.screenPosition.y <= container.value.clientHeight
    );
  });
};

// 处理点击事件
const handlePointClick = (point) => {
  // console.log('Point clicked:', point.id);
  interactivePoints.value.forEach(p => {
    p.isActive = false;
    p.showLabel = false;
  });

  // 设置当前点为激活状态
  point.isActive = true;
  // 切换标签显示
  // point.showLabel = !point.showLabel;
  store.wsStatus.message = `${point.id}`;
  // 触发点击事件
  emit('pointClick', {
    pointId: point.id,
    position: point.position.clone(),
    title: point.title
  });


  // animate camera to point
  const startPos = camera.position.clone()
  const endPos = new THREE.Vector3(point.cameraPosition.x, point.cameraPosition.y, point.cameraPosition.z)

  const slerpObj = { t: 0 }
  gsap.to(slerpObj, {
    t: 1,
    duration: 3,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.position.lerpVectors(startPos, endPos, slerpObj.t)
      controls.target.set(point.cameraLookAt.x, point.cameraLookAt.y, point.cameraLookAt.z)
    }
  })

};

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

const animate = () => {
  if (!isRendering) return;
  animationFrameId = requestAnimationFrame(animate);
  controls.update();

  // 更新交互点的屏幕位置
  if (isMoringRoom.value) {
    updatePointScreenPositions();
  }

  //yq for camera
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);  // this gives a unit vector
  const distance = 1; // choose a distance to project forward
  const lookAtPoint = camera.position.clone().add(direction.multiplyScalar(distance));
  // console.log("camera position:", camera.position);
  // console.log("Camera is looking toward:", lookAtPoint);
  window.lookAtPoint = lookAtPoint;

  renderer.render(scene, camera);
};

// 监听模型路径变化
watch(() => props.modelPath, (newPath) => {
  if (newPath && scene) {
    // 清除当前场景中的模型
    scene.traverse((object) => {
      if (object.type === 'Mesh' || object.type === 'Group') {
        if (object.parent === scene) {
          scene.remove(object);
        }
      }
    });
    showLoading.value = true;
    loadingProgress.value = 0;
    // 加载新模型
    loadModel();
  }
});

const handleResize = () => {
  if (!container.value) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);

  // 更新交互点位置
  updatePointScreenPositions();
};

onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
});

const clearPoints = () => {
  // 清空交互点数组前，确保所有点的激活状态被重置
  interactivePoints.value.forEach(point => {
    point.isActive = false;
    point.showLabel = false;
  });

  // 清空交互点数组
  interactivePoints.value = [];
  visiblePoints.value = [];

}

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  console.log('glb-container unmounted');

  window.removeEventListener('resize', handleResize);
  clearPoints();
  // 清理资源
  scene?.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
  showLoading.value = false;
  renderer?.dispose();
  controls?.dispose();
  modelCacheManager.optimizeMemory();
});

// 添加模型淡出效果方法
const fadeOutModel = async (callback?: () => void, duration = 1.2) => { // 增加默认持续时间
  // 查找场景中的模型
  let modelToFadeOut: THREE.Object3D | null = null;

  scene.traverse((object) => {
    if ((object.type === 'Mesh' || object.type === 'Group') && object.parent === scene) {
      modelToFadeOut = object;
    }
  });

  if (!modelToFadeOut) {
    if (callback) callback();
    return;
  }

  console.log('Fade out model:', modelToFadeOut);

  try {
    // 应用淡出效果，增加持续时间使效果更明显
    const fadePromise = applyModelFadeEffect(modelToFadeOut, false, duration);

    // 等待动画完成
    await fadePromise;

    // 淡出完成后，从场景中移除模型
    if (modelToFadeOut && modelToFadeOut.parent) {
      modelToFadeOut.parent.remove(modelToFadeOut);
    }
    clearPoints();
    // 执行回调
    if (callback) callback();
  } catch (error) {
    console.error('Error during model fade out:', error);
    // 即使出错也执行回调
    if (callback) callback();
  }
};

// 设置交互点配置的方法
const setInteractivePoints = (pointsConfig) => {
  // 清空现有点
  interactivePoints.value = [];
  visiblePoints.value = [];

  // 添加新的交互点
  if (Array.isArray(pointsConfig)) {
    pointsConfig.forEach(config => {
      addSingleInteractivePoint(config);
    });
  }

  // 更新屏幕位置
  updatePointScreenPositions();
};

// 添加一个方法来设置特定点的激活状态
const setActivePoint = (pointId) => {
  // 重置所有点的激活状态
  interactivePoints.value.forEach(point => {
    point.isActive = false;
    point.showLabel = false;
  });

  // 查找并激活指定的点
  const pointToActivate = interactivePoints.value.find(point => point.id === pointId);
  if (pointToActivate) {
    pointToActivate.isActive = true;
    pointToActivate.showLabel = true;
  }
};

defineExpose({
  pauseRendering,
  resumeRendering,
  isModelLoaded,
  fadeOutModel,
  setInteractivePoints
});
</script>

<style scoped>
.glb-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.interactive-points-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.interactive-point {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: pointer;
  z-index: 20;
}

.interactive-point.active .point-marker {
  transform: scale(1.5);
}

.point-marker {
  position: relative;
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

.point-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  z-index: 2;
  transition: background-color 0.3s ease;
}

.point-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background-color: rgba(0, 255, 255, 0.4);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 1.5s infinite;
  transition: background-color 0.3s ease;
}

.point-label {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 3;
  min-width: 80px;
  text-align: center;
}

.interactive-point.active .point-label {
  background-color: rgba(255, 165, 0, 0.8);
  color: #000;
  font-weight: bold;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }

  70% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>