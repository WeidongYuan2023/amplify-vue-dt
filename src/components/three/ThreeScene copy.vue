<template>
  <div class="three-container" ref="container"></div>
  <div v-if="showLoading" class="loading-overlay">
    <div class="loading-spinner"></div>
    <div class="loading-text">loading... {{ loadingProgress }}%</div>
  </div>
  <div class="detail-viewer" :class="{ 'visible': showDetailViewer || showVR }">
    <VRScene v-if="showVR" />
    <GLBViewer v-if="showDetailViewer" :modelPath="detailModelPath" @close="closeDetailView" ref="glbViewerRef" />
  </div>
  <!-- <button v-if="showDetailViewer || showVR" class="back-button" @click="closeDetailView">
    Back
  </button> -->
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import GLBViewer from '@/components/three/DetailViewer.vue';
import VRScene from '@/components/three/VRScene.vue'

import gsap from 'gsap';
import { mainStore } from "@/store/model";
import { modelStore } from '@/store/index';
import { modelCacheStore } from '@/store/cache';
const modelCacheManager = modelCacheStore();
const manageStore = modelStore();
let store = mainStore();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const selectedObjects = [];
let outlinePass = null;
let isRendering = false;
const showLoading = ref(true);
const loadingProgress = ref(0);
const originalMaterials = new Map();
// 添加详细视图状态管理
const showDetailViewer = ref(false);
const detailModelPath = ref('');
const glbViewerRef = ref(null);
const originalCameraState = ref(null);
const isTransitioning = ref(false);
const showVR = ref(false);

// 模型缓存系统
const materialCache = new Map();
// 添加选中对象的辅助函数
const addSelectedObject = (object) => {
  selectedObjects.length = 0;
  selectedObjects.push(object);
};
const props = defineProps({
  modelPath: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['modelLoaded', 'error']);

const container = ref(null);
let scene, camera, renderer, labelRenderer, controls, composer;
let model;
let animationFrameId = null;
const textureCache = new Map();
const init = () => {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xadd8e6);
  scene.fog = new THREE.FogExp2(0xadd8e6, 0.0005);
  // Camera setup
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.set(0, 150, 60);
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Controls setup
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  // Environment setup
  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromScene(environment).texture;
  scene.environment = envMap;
  environment.dispose();
  pmremGenerator.dispose();

  // Load model
  loadModel();
};

// 创建labelRenderer的函数
const createLabelRenderer = () => {
  if (labelRenderer) return; // 如果已经创建则返回

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  container.value.appendChild(labelRenderer.domElement);
};

// 创建outlinePass的函数
const createOutlinePass = () => {
  if (outlinePass) return; // 如果已经创建则返回

  // 确保composer已创建
  if (!composer) {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
  }

  outlinePass = new OutlinePass(
    new THREE.Vector2(container.value.clientWidth, container.value.clientHeight),
    scene,
    camera
  );
  composer.addPass(outlinePass);

  // 轮廓线配置
  Object.assign(outlinePass, {
    selectedObjects,
    edgeStrength: 10,
    edgeThickness: 5,
    visibleEdgeColor: new THREE.Color(0xffff00)
  });
};

const createImg = url => {
  if (textureCache.has(url)) {
    const cachedTexture = textureCache.get(url);
    const material = new THREE.SpriteMaterial({ map: cachedTexture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 10, 10);
    sprite.lookAt(new THREE.Vector3(0, 0, 0));
    return sprite;
  }
  let texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  // 存入缓存
  textureCache.set(url, texture);


  //将图片构建到纹理中
  let material1 = new THREE.SpriteMaterial({
    map: texture
    // transparent: true
  });
  let txtMesh = new THREE.Sprite(material1);
  txtMesh.scale.set(8, 10, 10);
  txtMesh.lookAt(new THREE.Vector3(0, 0, 0));

  return txtMesh;
};
const loadModel = () => {
  // 检查缓存
  if (modelCacheManager.hasModel(props.modelPath)) {
    console.log('Load model from cache:', props.modelPath);
    const cachedModel = modelCacheManager.getModel(props.modelPath).clone();
    handleModelLoaded(cachedModel);
    return;
  }

  const dracoLoader = new DRACOLoader();
  const dracoPath = `${import.meta.env.VITE_APP_CONTEXT_PATH}draco/`;  // 开发环境: /draco/
  dracoLoader.setDecoderPath(dracoPath);
  dracoLoader.setDecoderConfig({ type: 'js' });
  dracoLoader.preload();

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  console.log(props.modelPath);

  gltfLoader.load(
    `${import.meta.env.VITE_APP_CONTEXT_PATH}floor_latest.glb`,
    (gltf) => {
      // 存入缓存
      modelCacheManager.addModel(props.modelPath, gltf.scene.clone());
      handleModelLoaded(gltf.scene);
      dracoLoader.dispose();
    },
    (xhr) => {
      loadingProgress.value = ((xhr.loaded / xhr.total) * 100).toFixed(2);
      console.log((loadingProgress.value) + '% loaded');
    },
    (error) => {
      console.error('Error loading model:', error);
      emit('error', error);
      dracoLoader.dispose();
    }
  );
};

const handleModelLoaded = (loadedModel) => {
  model = loadedModel;
  model.scale.set(10, 10, 10);
  model.scale.set(350, 350, 350);
  model.position.set(0, 0, 0);
  // 应用材质
  applyMaterial(model);

  model.position.set(0, 0, 0);
  scene.add(model);
  loadingProgress.value = 100;
  showLoading.value = false;
  emit('modelLoaded', model);
  triggerModule(model.singleMode ? 999 : 0);
  animate();

  // 确保事件监听器只添加一次
  if (!document.hasEventListener) {
    document.addEventListener("click", onPointerDown);
    document.hasEventListener = true;
  }
};

// 材质处理函数
const applyMaterial = (modelObject) => {
  const materialKey = 'blue-transparent';

  // 检查材质缓存
  // if (!materialCache.has(materialKey)) {
  //   materialCache.set(materialKey, new THREE.MeshPhongMaterial({
  //     color: 0x00bfff,
  //     transparent: true,
  //     opacity: 0.6,
  //     side: THREE.DoubleSide,
  //     depthWrite: true,
  //     shininess: 30,
  //     specular: 0x999999,
  //     emissive: 0x0066cc,
  //     emissiveIntensity: 0.5
  //   }));
  // }

  // const material = materialCache.get(materialKey);

  // modelObject.traverse((node) => {
  //   if (node.isMesh) {
  //     node.material = material;
  //   }
  // });
};

const animate = () => {
  if (!isRendering) return;
  animationFrameId = requestAnimationFrame(animate);
  controls?.update();
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  labelRenderer?.render(scene, camera);
};

const handleResize = () => {
  nextTick(() => {
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(container.value.clientWidth, container.value.clientHeight);
    labelRenderer?.setSize(container.value.clientWidth, container.value.clientHeight);
    composer?.setSize(container.value.clientWidth, container.value.clientHeight); 
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


onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
  if (manageStore.mode === 'model') {
    resumeRendering();
  }
});

onBeforeUnmount(() => {
  // 停止渲染循环
  pauseRendering();

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  window.removeEventListener('resize', handleResize);
  document.removeEventListener("click", onPointerDown);
  textureCache.forEach(texture => {
    texture.dispose();
  });
  textureCache.clear();

  // 清理材质缓存
  materialCache.forEach(material => {
    if (material.map) material.map.dispose();
    material.dispose();
  });
  materialCache.clear();

  // 清理所有标记
  Object.values(areaMarkers).forEach((marker: any) => {
    if (marker.parent) {
      marker.parent.remove(marker);
    }
    if (marker.material) {
      if (marker.material.map) {
        marker.material.map.dispose();
      }
      marker.material.dispose();
    }
    if (marker.element && marker.element.parentNode) {
      marker.element.parentNode.removeChild(marker.element);
    }
  });
  Object.keys(areaMarkers).forEach(key => delete areaMarkers[key]);

  scene?.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  // if (labelRenderer) {
  //   labelRenderer.dispose();
  // }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  if (scene) {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }

  // 释放控制器
  if (controls) {
    controls.dispose();
  }

  if (composer) {
    composer.passes.forEach(pass => {
      if (pass.dispose) pass.dispose();
    });
    composer.dispose();
  }

  // 强制垃圾回收
  if (window.gc) window.gc();

  modelCacheManager.optimizeMemory();
});

watch(() => store.currentArea, (currentArea) => {
  console.log('currentArea:', currentArea);
  handleAreaView(currentArea.label);
})

watch(() => store.mode, (newMode) => {
  if (newMode === 'model') {
    resumeRendering();
  } else {
    pauseRendering();
  }
}, { immediate: true });

watch(() => manageStore.sceneHistory, (newVal) => {
  // console.log('sceneHistory:', newVal);
  if(!newVal.showBack) {
    closeDetailView();
  }
}, { deep: true })

const handleAreaView = (name) => {
  let mesh = scene.getObjectByName(name);

  if (!mesh) return;

  const pos = new THREE.Vector3();
  mesh.getWorldPosition(pos);
  let pos2 = pos.clone().addScalar(30);
  gsap.to(camera.position, {
    x: pos2.x,
    y: pos2.y,
    z: pos2.z,
    duration: 1,
    ease: "none",
    onUpdate: () => {
      controls.target.set(pos.x, pos.y, pos.z);
    },
    onComplete: () => {
      camera.position.set(pos2.x, pos2.y, pos2.z);
    }
  });
};

const areaMarkers = {};
const triggerModule = index => {
  store.moduleIndex = index;
  controls.target.set(0, 0, 0);

  // 相机动画配置
  const cameraPositions = {
    0: { x: 0, y: 150, z: 60, enableControls: true },
    1: { x: 0, y: 150, z: 0, enableControls: false },
    2: { x: 0, y: 150, z: 0, enableControls: false },
    3: { x: 0, y: 150, z: 0, enableControls: false }
  };

  // 执行相机动画
  const pos = cameraPositions[index] || cameraPositions[0];
  gsap.to(camera.position, {
    x: pos.x,
    y: pos.y,
    z: pos.z,
    duration: 1,
    ease: "none",
    onComplete: () => {
      controls.enableRotate = pos.enableControls;
      controls.enableZoom = pos.enableControls;
    }
  });

  // 根据moduleIndex决定是否创建labelRenderer和outlinePass
  if (index === 1) {
    createLabelRenderer();
    createOutlinePass();
  }

  // 先清理之前存储的所有标记
  Object.values(areaMarkers).forEach((marker: any) => {
    // 如果标记还在场景中，从场景中移除
    if (marker.parent === scene) {
      scene.remove(marker);
    }

    if (marker.parent) {
      marker.parent.remove(marker);
    }

    // 释放材质和纹理
    if (marker.material) {
      if (marker.material.map) {
        marker.material.map.dispose();
      }
      marker.material.dispose();
    }

    if (marker.element) {
      // 如果有父元素，从DOM中移除
      if (marker.element.parentNode) {
        marker.element.parentNode.removeChild(marker.element);
      }
    }
  });

  // 清空标记对象
  Object.keys(areaMarkers).forEach(key => delete areaMarkers[key]);


  // 清除所有区域上的标记
  model.traverse(child => {
    if (child.name && child.name.startsWith("Area")) {
      // 移除所有可能的标记
      const childrenToRemove = [];
      child.children.forEach(subChild => {
        if (subChild.name && (
          subChild.name.includes("area-") ||
          subChild.name.includes("Label") ||
          subChild.name.includes("Icon")
        )) {
          childrenToRemove.push(subChild);
        }
      });

      // 安全地移除子对象
      childrenToRemove.forEach(subChild => child.remove(subChild));

      // 根据当前模式添加相应标记
      const areaNum = child.name.replace("Area", "");

      if (index === 0) {
        // 模式0: 添加选择图标
        const areaText = createImg("ViewSelection.svg");
        areaText.scale.set(0.03, 0.04, 0.04);
        areaText.position.set(0, 0.01, 0);
        areaText.name = `area-${areaNum}`;
        child.add(areaText);
        areaMarkers[`area${areaNum}Text`] = areaText;
      }
      else if (index === 1) {
        // 模式1: 添加文本标签
        const div = document.createElement("div");
        div.innerHTML = `area${areaNum}`;
        div.className = "areaLabel";
        const areaLabel = new CSS2DObject(div);
        child.add(areaLabel);
        areaMarkers[`area${areaNum}Label`] = areaLabel;
      }
      else if (index === 2 && ["6", "7", "8"].includes(areaNum)) {
        // 模式2: 添加传感器图标到特定区域
        const sensorIcon = createImg(`tempreture${areaNum === "6" ? "" : areaNum}.svg`);
        sensorIcon.scale.set(0.03, 0.04, 0.04);
        sensorIcon.position.set(0, 0.01, 0);
        sensorIcon.name = `area-${areaNum}`;
        child.add(sensorIcon);
        areaMarkers[`sensorsIcon${areaNum === "6" ? "" : areaNum}`] = sensorIcon;
      }
      else if (index === 3 && ["6", "13"].includes(areaNum)) {
        // 模式3: 添加机器人图标到特定区域
        const robotIcon = createImg("robotImg.png");
        robotIcon.scale.set(0.05, 0.05, 0.05);
        robotIcon.position.set(areaNum === "13" ? 0.01 : 0, 0.01, areaNum === "13" ? 0.04 : 0);
        robotIcon.name = `area-${areaNum}`;
        child.add(robotIcon);
        areaMarkers[`robotIcon${areaNum}`] = robotIcon;
      }
    }
  });
};
const currentModelIndex = ref(0);
const onPointerDown = event => {
  if (!container.value || showDetailViewer.value || !isRendering || showVR.value) return;

  const rect = container.value.getBoundingClientRect();

  // 计算归一化的设备坐标
  pointer.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1;

  // 射线投射
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  // 默认清空选中对象
  if (outlinePass) {
    outlinePass.selectedObjects = [];
  }

  // 获取相交的第一个对象
  const intersectedObject = intersects[0]?.object;

  if (!intersectedObject || !intersectedObject.name) return;

  console.log("mesh.name", intersectedObject.name);
  // const panorama = {panoramaUrl: '/vrChart.png'};

  // 根据区域获取详细模型路径
  // const modelPaths = ['/the_great_drawing_room.glb', '/the_morning_room.glb'];
  // const path = modelPaths[currentModelIndex.value];
  // currentModelIndex.value = (currentModelIndex.value + 1) % modelPaths.length;
  const areaId = intersectedObject.name.toLocaleLowerCase();
  const modeMap = {
    'area6': 'the_great_drawing_room.glb',
    'area-6': 'the_great_drawing_room.glb',
    'area1': 'the_morning_room.glb',
    'area-1': 'the_morning_room.glb',
  }
  const vrMap = {
    'area13': '/vrChart.png',
    'area-13': '/vrChart.png'
  }

  const path = modeMap[areaId];

  if (path || vrMap[areaId]) {
    transitionToDetailView(intersectedObject, path, vrMap[areaId]);
  }
};

const supportOpacity = () => {
  if (originalMaterials.size > 0) {
    return;
  }
  // 为模型中的所有材质添加透明度支持
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      // 保存原始材质状态
      if (Array.isArray(node.material)) {
        originalMaterials.set(node, node.material.map(mat => ({
          transparent: mat.transparent,
          opacity: mat.opacity
        })));
        node.material.forEach(mat => {
          mat.transparent = true;
        });
      } else {
        originalMaterials.set(node, {
          transparent: node.material.transparent,
          opacity: node.material.opacity
        });
        node.material.transparent = true;
      }
    }
  });
}

// 在文件顶部添加一个变量来存储原始背景色
const originalBackgroundColor = new THREE.Color(0xadd8e6);

// 平滑过渡到详细视图
const transitionToDetailView = (object, modelPath, toVR = false) => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  manageStore.sceneHistory.showBack = true;

  // 保存当前相机状态和背景色
  originalCameraState.value = {
    position: camera.position.clone(),
    target: controls.target.clone(),
    rotation: camera.rotation.clone(), // 保存相机旋转
    zoom: camera.zoom // 保存相机缩放
  };

  // 获取点击位置
  const position = new THREE.Vector3();
  object.getWorldPosition(position);

  // 计算相机目标位置 (稍微偏移以便更好地查看)
  const targetPosition = position.clone().add(new THREE.Vector3(0, 5, 10));

  // 设置详细模型路径并显示详细视图
  detailModelPath.value = modelPath;

  const cachedModel = modelCacheManager.hasModel(modelPath)

  // 如果没有缓存目标模型，先加载
  if (!toVR && !cachedModel) {
    showDetailViewer.value = true;
  }

  if (toVR) {
    showVR.value = true;
    nextTick(() => {
      const vrElement: HTMLElement = document.querySelector('.vr-container');
      if (vrElement) {
        vrElement.style.opacity = '0';
        vrElement.style.transition = 'opacity 0s';
      }
    });
  }

  supportOpacity()
  // 相机动画
  // 相机动画和模型透明度动画
  gsap.timeline()
    .to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        controls.target.lerp(position, 0.1); // 改为0.1使过渡更平滑
      }
    })
    .to({}, {
      duration: 0.5,
      onUpdate: function () {
        // 获取动画进度 (0-1)
        const progress = this.progress();
        // 根据进度设置所有材质的透明度
        model.traverse((node) => {
          if (node.isMesh && node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => {
                mat.opacity = 1 - progress;
              });
            } else {
              node.material.opacity = 1 - progress;
            }
          }
        });
      },
      onComplete: () => {
        if (!toVR && cachedModel) { // 有缓存的情况下,等待动画执行完直接显示详细视图
          showDetailViewer.value = true;
        }

        if (toVR) {
          nextTick(() => {
            const vrElement: any = document.querySelector('.vr-container');
            if (vrElement) {
              // 设置过渡效果并淡入
              vrElement.style.transition = 'opacity 1s ease-in-out';
              vrElement.style.opacity = '1';
              
              // 通知VR场景组件开始渲染
              const vrComponent = vrElement?.__vue__;
              if (vrComponent && vrComponent.resumeRendering) {
                vrComponent.resumeRendering();
              }
            }
          });
        }

        // 延迟一帧以确保GLBViewer已挂载
        nextTick(() => {
          // 暂停主场景渲染
          pauseRendering();
          isTransitioning.value = false;

          // 恢复材质原始状态，以便下次使用
          originalMaterials.forEach((originalState, node) => {
            if (Array.isArray(node.material) && Array.isArray(originalState)) {
              node.material.forEach((mat, index) => {
                if (originalState[index]) {
                  mat.transparent = originalState[index].transparent;
                  mat.opacity = originalState[index].opacity;
                }
              });
            } else if (!Array.isArray(node.material)) {
              node.material.transparent = originalState.transparent;
              node.material.opacity = originalState.opacity;
            }
          });
        });
      }
    });
};

// 关闭详细视图
const closeDetailView = async () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;

  await glbViewerRef.value?.fadeOutModel();
  // 直接隱藏詳細視圖
  showDetailViewer.value = false;
  showVR.value = false;
  manageStore.sceneHistory.showBack = false;
  // 恢復場景背景色
  scene.background.copy(originalBackgroundColor);

  // 恢復相機狀態
  if (originalCameraState.value) {
    // 恢復相機位置和旋轉
    camera.position.copy(originalCameraState.value.position);
    camera.rotation.copy(originalCameraState.value.rotation);
    controls.target.copy(originalCameraState.value.target);
    camera.zoom = originalCameraState.value.zoom;
    camera.updateProjectionMatrix();

    // 恢復控制器
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.update();
  }

  // 恢復渲染
  resumeRendering();
  isTransitioning.value = false;
};

const showSubModel = computed(() => {
  return glbViewerRef.value?.isModelLoaded
});

defineExpose({
  scene,
  camera,
  controls,
  model,
  triggerModule,
  pauseRendering,
  resumeRendering
});
</script>

<style scoped>
.three-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto;
  /* 确保容器可以接收焦点 */
  touch-action: none;
}

.detail-viewer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.detail-viewer.visible {
  opacity: 1;
  z-index: 1;
}

/* 添加loading状态样式 */
.subModelLoading {
  opacity: 0;
  z-index: 1;
  /* 保持高z-index以便能接收事件 */
  pointer-events: none;
  /* 加载时不接收鼠标事件 */
}

.back-button {
  position: absolute;
  top: 100px;
  right: 20px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 100;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>