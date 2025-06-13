<template>
  <div class="three-container" ref="container" :class="{ 'visible': !showDetailViewer && !showVR && !isTransitioning}"></div>
  <loadingComp v-if="showLoading" :process="loadingProgress"/>
  <div class="detail-viewer" :class="{ 'visible': showDetailViewer || showVR }">
    <VRScene v-if="showVR" ref="vrRef" />
    <GLBViewer v-if="showDetailViewer" :modelPath="detailModelPath" @close="closeDetailView" ref="glbViewerRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';
import * as THREE from 'three';
import { modeMaps } from '@/config/vrSceneConfig'
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
import VRScene from '@/components/three/VRScene.vue';
import loadingComp from '@/components/ui/Loading.vue';
import gsap from 'gsap';
import { mainStore } from "@/store/model";
import { modelStore } from '@/store/index';
import { modelCacheStore } from '@/store/cache';
const modelCacheManager = modelCacheStore();
const manageStore = modelStore();
let store = mainStore();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedObjects = [];
let outlinePass = null;
let isRendering = false;
let renderPass = null;

const loadingProgress = ref(0);
const originalMaterials = new Map();
// 添加详细视图状态管理
const showDetailViewer = ref(true);
const detailModelPath = ref('the_morning_room.glb');
const glbViewerRef = ref(null);
const vrRef = ref(null);
const originalCameraState = ref(null);
const isTransitioning = ref(false);
const showVR = ref(false);
const showLoading = ref(!showDetailViewer && !showVR);
const diamondMarkers = new Map();
// 模型缓存系统
const materialCache = new Map();
// 添加选中对象的辅助函数
const addSelectedObject = (object) => {
  selectedObjects.length = 0;
  selectedObjects.push(object);
};
const currentScene = ref('office');
const props = defineProps({
  modelPath: {
    type: String,
    required: true
  }
});
// 收集场景中所有的CSS2D标签
const allLabels: any[] = [];

const emit = defineEmits(['modelLoaded', 'error']);
let intersects = []; // clicked objects
const container = ref(null);
let scene, camera, renderer, labelRenderer, controls, composer;
let model;
let animationFrameId = null;
const textureCache = new Map();
const init = async () => {
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
  // 添加缩放限制
  controls.minDistance = 20; // 最小缩放距离
  controls.maxDistance = 200; // 最大缩放距离

  // 限制垂直旋转角度，防止相机看到模型下方
  controls.minPolarAngle = 0; // 最小仰角（0表示正上方）
  controls.maxPolarAngle = Math.PI / 2.2; // 最大仰角（略小于90度，防止看到模型底部）
  // Environment setup
  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromScene(environment).texture;
  scene.environment = envMap;
  environment.dispose();
  pmremGenerator.dispose();
  createLabelRenderer();
  // const url = await getRequest('fuzzy-urls?pattern=the_morning_room.glb');
  // Load model
  if (!showDetailViewer.value && !showVR.value) {
    loadModel();
  }
 
};

// 添加CSS2D标签创建函数
const createCSS2DLabel = (text) => {
  const div = document.createElement('div');
  div.className = 'info-label';
  // div.innerHTML = `
  //   <div class="label-header">
  //     <span>设备B</span>
  //     <span class="status">异常</span>
  //   </div>
  //   <div class="label-content">
  //     <div class="value">288456L</div>
  //     <div class="info">
  //       <span>容量</span>
  //       <span>45632100</span>
  //     </div>
  //   </div>
  // `;
  // const id = manageStore
  div.innerHTML = `
    <div class="label-header">
      <span>${text}</span>
    </div>
  `;
  div.style.pointerEvents = 'auto';
  div.style.cursor = 'pointer';
  div.addEventListener('pointerdown', (event) => {
    handleLabelClick(text, event);
  });
  const label = new CSS2DObject(div);
  // 将标签旋转90度，使其垂直于地面
  label.userData = { vertical: true };
  return label;
};

const createGroupMarker = (position, text) => {
  const group = new THREE.Group();
  group.name = `marker-group-${text}`;
  group.userData = { 
    type: 'marker',
    areaId: text,
    clickable: true
  };
  // 外圈光晕 - 减小尺寸
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(3, 3.5, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
  );
  outerRing.rotation.x = -Math.PI/2;
  outerRing.userData = { 
    type: 'marker',
    areaId: text,
    clickable: true
  };
  group.add(outerRing);

  // 内圈 - 改用渐变材质，减小尺寸
  const innerGeometry = new THREE.CircleGeometry(2.8, 32);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
  gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 50, 255, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  
  const innerTexture = new THREE.CanvasTexture(canvas);
  const innerMaterial = new THREE.MeshBasicMaterial({
    map: innerTexture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const innerCircle = new THREE.Mesh(innerGeometry, innerMaterial);
  innerCircle.rotation.x = -Math.PI/2;
  group.add(innerCircle);
  innerCircle.userData = { 
    type: 'marker',
    areaId: text,
    clickable: true
  };
  // 动态光环 - 减小尺寸
  const ringCount = 3;
  const rings = [];
  for(let i = 0; i < ringCount; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.4, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
      })
    );
    ring.rotation.x = -Math.PI/2;
    ring.userData = { 
      initialScale: 0.8,
      speed: 0.5,
      delay: (i * 1) / ringCount,
      type: 'marker',
      areaId: text,
      clickable: true
    };
    rings.push(ring);
    group.add(ring);
  }

  // 添加连接线 - 从圆环到标签
  const lineHeight = 8; // 线的高度
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00ffff,
    transparent: true,
    opacity: 0.7
  });
  
  // 创建一条从圆环中心向上的线
  const linePoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, lineHeight, 0)
  ];
  lineGeometry.setFromPoints(linePoints);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);

  // 添加文字标签 - 垂直于地面
  const textLabel = createCSS2DLabel(text);
  allLabels.push(textLabel);
  // 将标签放置在连接线顶部
  textLabel.position.set(0, lineHeight, 0);
  textLabel.userData = { 
    type: 'marker',
    areaId: text,
    clickable: true
  };
  group.add(textLabel);

  // 设置组的位置
  group.position.copy(position);
  group.position.y += 1; // 将整个组抬高一些，但不要太高
  if (text === 'Area1001') {
    group.position.x -= 15;
  }
  // 动画效果
  const animate = () => {
    // 光环动画
    rings.forEach(ring => {
      const time = (Date.now() * 0.001 * ring.userData.speed + ring.userData.delay) % 1;
      const scale = ring.userData.initialScale + time * 0.5;
      ring.scale.set(scale, scale, scale);
      ring.material.opacity = 0.3 * (1 - time);
    });

    // 内圈脉冲效果
    const pulseTime = Date.now() * 0.001;
    innerCircle.material.opacity = 0.5 + Math.sin(pulseTime * 2) * 0.2;
    
    // 连接线脉冲效果
    line.material.opacity = 0.5 + Math.sin(pulseTime * 2) * 0.3;

    requestAnimationFrame(animate);
  };
  animate();

  return group;
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
    renderPass = new RenderPass(scene, camera);
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
    // console.log('Load model from cache:', props.modelPath);
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
  // console.log(props.modelPath);
  const file = 'floor_latest1.glb'
  const file1 = 'irvine-office.glb'

  const url = file1

  gltfLoader.load(
    `${import.meta.env.VITE_APP_CONTEXT_PATH}${url}`,
    (gltf) => {
      // 存入缓存
      modelCacheManager.addModel(props.modelPath, gltf.scene.clone());
      handleModelLoaded(gltf.scene);
      dracoLoader.dispose();
    },
    (xhr) => {
      loadingProgress.value = ((xhr.loaded / xhr.total) * 100).toFixed(2);
      // console.log((loadingProgress.value) + '% loaded');
    },
    (error) => {
      // console.error('Error loading model:', error);
      emit('error', error);
      dracoLoader.dispose();
    }
  );
};


const handleModelLoaded = (loadedModel) => {
  model = loadedModel;
  model.scale.set(6, 6, 6);
  // model.scale.set(350, 350, 350);
  // model.position.set(0, 0, 0);
  // 应用材质
  // applyMaterial(model);
  model.traverse((obj) => {
    if (obj.isMesh) {
      // 深度克隆材质并存储
      if (Array.isArray(obj.material)) {
        originalMaterials.set(obj, obj.material.map(mat => mat.clone()));
      } else {
        originalMaterials.set(obj, obj.material.clone());
      }
    }
  });

  model.position.set(0, 0, 0);
  scene.add(model);
  loadingProgress.value = 100;
  showLoading.value = false;
  emit('modelLoaded', model);
  triggerModule(model.singleMode ? 999 : 0);
  // 在建筑地下添加平面
  // addGroundPlane();
  animate();

  // 确保事件监听器只添加一次
  if (!document.hasEventListener) {
    document.addEventListener("click", onPointerDown);
    window.addEventListener('wheel', onMouseWheel);
    document.hasEventListener = true;
  }
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

const onMouseWheel = (event) => {
  if(!manageStore.config.zoom) return;

  zoomInToVR(event);
  zoomOutVR(event);
};
const minDistance = 50; // 相机与地板的最小距离
const zoomInToVR = (event) => {
  if(manageStore.currentScene.name !== 'office') return;
  // 计算鼠标在标准化设备坐标中的位置
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 通过鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera);

  // 计算射线与场景中所有 Mesh 的交点
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length == 0) {
    return;
  }

  // 获取距离相机最近的 Mesh
  const mesh = intersects.find((d) => d.object.type === 'Mesh')?.object;
  const distance = camera?.position?.distanceTo(mesh.position);

  if (mesh && mesh.name && mesh.name.toLowerCase().startsWith('area') && distance < minDistance) {
    const name = mesh.name.toLowerCase().replace(/(\D)(\d)/, '$1-$2');
    const areaId = name.replace('001', '');
    const modeMap = modeMaps.sceneMap;
    const vrMap = modeMaps.sceneVRMap;
    const path = modeMap[areaId];
    const vrPath = vrMap[areaId];
    
    if (path) {
      manageStore.setCurrentScene(path)
    } else if (vrPath) {
      manageStore.setCurrentScene(vrPath)
    }
    console.log(name, 'zoomInToVR')
  }
};

const zoomOutVR = (event) => {

  // 根据滚轮方向调整 fov
  const delta = event.deltaY; // 滚轮滚动量
  // const fov = vrCamera.fov; // 当前 fov

  // // 调整 fov
  // const newFov = fov + delta * 0.1; // 缩放速度
  // vrCamera.fov = THREE.MathUtils.clamp(newFov, 10, 120); // 限制 fov 范围


  // // 更新相机投影矩阵
  // vrCamera.updateProjectionMatrix();
  console.log('zoomOutVR', event)
};

onMounted(async () => {
  await init();
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
  window.removeEventListener('wheel', onMouseWheel);
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

  // 清理菱形标记
  diamondMarkers.forEach((marker) => {
    scene.remove(marker);
    if (marker.geometry) marker.geometry.dispose();
    if (marker.material) marker.material.dispose();
  });
  diamondMarkers.clear();

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
  showLoading.value = false;
  // 强制垃圾回收
  if (window.gc) window.gc();

  modelCacheManager.optimizeMemory();
});

watch(() => store.currentArea, (currentArea) => {
  // console.log('currentArea:', currentArea);
  handleAreaView(currentArea.label);
})

watch(() => store.mode, (newMode, oldVal) => {
  if (newMode === 'model') {
    resumeRendering();
  } else {
    pauseRendering();
  }
}, { immediate: true });

watch(() => manageStore.sceneHistory, (newVal) => {
  // console.log('sceneHistory:', newVal);
  if(!newVal.showBack ) {
    closeDetailView();
  }

}, { deep: true })

watch(() => manageStore.sceneHistory, (newVal) => {
  // console.log('sceneHistory:', newVal);
  if(!newVal.showBack ) {
    closeDetailView();
  }

}, { deep: true })

watch(() => manageStore.currentScene, async (newVal) => {
  // console.log('sceneHistory:', newVal);
  // console.log('manageStore.currentScene:', newVal);
  if (newVal?.name) {
    console.log('currentScene:', newVal);
    if(newVal.name === 'office') {
      await glbViewerRef.value?.fadeOutModel();
      vrRef.value?.fadeOutScene();
      isTransitioning.value = false;
      loadModel() 
    }
    const id = modeMaps.alias[newVal.name];
    if(id) {
      isTransitioning.value = false;
      const areaObject = scene.getObjectByName(`Area${id}`);
      const areaId = `area${id}`.replace('001', '');

      const modeMap = modeMaps.model;
      const vrMap = modeMaps.vr;
      const path = modeMap[areaId];
      const vrPath = vrMap[areaId];
 
      if (areaObject || !model) {
        if (path) {
          vrRef.value?.fadeOutScene();
          await glbViewerRef.value?.fadeOutModel();
          transitionToDetailView(areaObject, path);
        } else if (vrPath) {
          vrRef.value?.fadeOutScene();
          await glbViewerRef.value?.fadeOutModel();
          transitionToDetailView(areaObject, null, vrPath);
        }
      }
    } else {
      closeDetailView();
    }
  }

  if(newVal?.activeArea && manageStore.config.focusArea) {
    focusOnArea(newVal.activeArea);
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
  if (index === 1 || index === 0) {
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
        // const areaText = createImg("ViewSelection.svg");
        // areaText.scale.set(0.03, 0.04, 0.04);
        // areaText.position.set(0, 0.01, 0);
        // areaText.name = `area-${areaNum}`;
        // child.add(areaText);
        // areaMarkers[`area${areaNum}Text`] = areaText;
        model.traverse(child => {
          if (child.name && child.name.startsWith("Area")) {
            const areaNum = child.name.replace("Area", "").replace("001", "");
            // 只在特定房间（area6和area1）上方添加菱形
            // console.log('areaNum:', areaNum);
            if (["6", "1", '13'].includes(areaNum)) {
              const pos = new THREE.Vector3();
              child.getWorldPosition(pos);
              const diamond = createGroupMarker(pos, child.name);
              diamond.name = `marker-group-${areaNum}`;
              // const padding = areaNum === '1' ? 0.04 : 0;
              // diamond.position.set(0, 0, padding);
              scene.add(diamond);
              diamondMarkers.set(areaNum, diamond);
            }
          }
        });
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

// 统一处理标签点击事件
const handleLabelClick = (text, event) => {
  event?.stopPropagation();
  // console.log('Label clicked:', text);
  // 触发与标签关联的区域点击事件
  const areaObject = scene.getObjectByName(text);
  if (areaObject) {
    const label = text.replace('001', '');

    const areaNum = label.replace('Area', '');
    const areaId = `area${areaNum}`;
    const modeMap = modeMaps.sceneMap;
    const vrMap = modeMaps.sceneVRMap;
    const path = modeMap[areaId];
    const vrPath = vrMap[areaId];
    
    if (path) {
      manageStore.setCurrentScene(path)
      // transitionToDetailView(areaObject, path);
    } else if (vrPath) {
      manageStore.setCurrentScene(vrPath)
      // transitionToDetailView(areaObject, null, vrPath);
    }
  }
};

let mouseDownPosition = { x: 0, y: 0 }; // 鼠标按下的初始位置

// 判断是否是拖拽事件
const isDragEvent = (event) => {
  const dx = Math.abs(event.clientX - mouseDownPosition.x);
  const dy = Math.abs(event.clientY - mouseDownPosition.y);
  const threshold = 5; // 阈值设置为 5 像素
  return dx > threshold || dy > threshold;
};

const onPointerDown = event => {
  if (isDragEvent(event)) return;

  if (!container.value || showDetailViewer.value || !isRendering || showVR.value) return;

  const rect = container.value.getBoundingClientRect();

  // 计算归一化的设备坐标
  pointer.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1;

  // 射线投射
  raycaster.setFromCamera(pointer, camera);
  intersects = raycaster.intersectObjects(scene.children, true);

  // 默认清空选中对象
  if (outlinePass) {
    outlinePass.selectedObjects = [];
  }

  // 获取相交的第一个对象
  const intersectedObject = intersects[0]?.object;

  if (!intersectedObject) return;

  // console.log("mesh.name", intersectedObject.name);
  // handleSurfaceModuleClick(intersectedObject);
  manageStore.setActiveArea(intersectedObject.name);

  // const panorama = {panoramaUrl: 'vrChart.png'};

  // 根据区域获取详细模型路径
  // const modelPaths = ['the_great_drawing_room.glb', 'the_morning_room.glb'];
  // const path = modelPaths[currentModelIndex.value];
  // currentModelIndex.value = (currentModelIndex.value + 1) % modelPaths.length;
  // let areaId = intersectedObject.name.toLocaleLowerCase();
  let areaId = '';
  const modeMap = modeMaps.sceneMap
  const vrMap = modeMaps.sceneVRMap

  let targetObject = intersectedObject;
  let isMarker = false;
  
  // 向上遍历对象树，查找标记组
  while (targetObject && !isMarker) {
    if (targetObject.userData && targetObject.userData.type === 'marker' && targetObject.userData.clickable) {
      isMarker = true;
      break;
    }
    targetObject = targetObject.parent;
  }
  if (isMarker) {
    areaId = targetObject.userData.areaId;
    // console.log("点击了标记:", areaId);
  }

  if (targetObject?.name?.startsWith('marker-group-')) {
    const areaNum = targetObject.name.split('-')[2];
    const areaId = `area${areaNum}`;
    const path = modeMap[areaId];
    if (path) {
      // 获取对应的区域对象
      const areaObject = scene.getObjectByName(`Area${areaNum}`);
      if (areaObject) {
        // console.log('area path:', path);
        manageStore.setCurrentScene(path)
        // transitionToDetailView(areaObject, path);
      }
    }
    return;
  }

  const path = modeMap[areaId];

  if (path || vrMap[areaId]) {
    manageStore.setCurrentScene(vrMap[areaId] || path)
    // transitionToDetailView(intersectedObject, path, vrMap[areaId]);
  }
};

const focusOnArea = (text) => {
  const mesh = scene.getObjectByName(text);

  if (mesh) {
    handleSurfaceModuleClick(mesh);
  }
};

const handleSurfaceModuleClick = (mesh) => {
  if (mesh && mesh.name.toLowerCase().startsWith('area')) {
    handleSurfaceAnalysisClick(mesh);
    // const leftLabel = mesh.name.replace(/(\D)(\d)/, '$1 $2');
    // leftRef.value?.setFocus(leftLabel);
  } else {
    resetSurfaceState();
  }
};
// 表面分析点击事件处理
const handleSurfaceAnalysisClick = (mesh) => {
  // surface.value = mesh;

  // 更新选择的物体
  addSelectedObject(mesh);
  outlinePass.selectedObjects = selectedObjects;
  
  // 调整选中物体的位置，使其显示在天花板上
  // if (mesh && mesh.userData) {
  //   // 保存原始位置
  //   if (!mesh.userData.originalY) {
  //     mesh.userData.originalY = mesh.position.y;
  //   }
    
  //   // 临时提升物体位置到天花板高度
  //   const ceilingHeight = 30; // 根据你的场景调整天花板高度
  //   mesh.position.y += ceilingHeight;
  //   addSelectedObject(mesh);

  //   // 更新轮廓
  //   outlinePass.selectedObjects = selectedObjects;
    
  //   // 在下一帧恢复原始位置
  //   setTimeout(() => {
  //     if (mesh.userData.originalY !== undefined) {
  //       mesh.position.y = mesh.userData.originalY;
  //     }
  //   }, 0);
  // } else {
  //   addSelectedObject(mesh);
  //   outlinePass.selectedObjects = selectedObjects;
  // }

  // outlinePass.selectedObjects = selectedObjects;
};

// 重置表面分析模块状态
const resetSurfaceState = () => {
  // surfaceRef.value?.reset();
  // surface.value = {};
  clearOutlinePass();
  // leftRef.value?.setFocus('');
};

const clearOutlinePass = () => {
  if (outlinePass) {
    outlinePass.selectedObjects.forEach((element) => {
      composer.removePass(element);
    });
    selectedObjects = [];
    outlinePass.selectedObjects = [];
    composer?.dispose();
    setupComposer();
  }
};

// 后期处理设置
const setupComposer = () => {
  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  composer.addPass(outlinePass);

  // 轮廓线配置 - 调整参数使外框更平滑并向上提升
  Object.assign(outlinePass, {
    selectedObjects,
    edgeStrength: 8,           // 降低强度使边缘更柔和
    edgeThickness: 3,          // 减小厚度使线条更细腻
    edgeGlow: 1.0,             // 添加发光效果
    pulsePeriod: 0,            // 禁用脉冲效果
    usePatternTexture: false,  // 不使用纹理
    visibleEdgeColor: new THREE.Color(0xffff00),
    hiddenEdgeColor: new THREE.Color(0x555555),
    padding: 2,                // 增加内边距
    // 向上偏移
    kernelSize: THREE.KernelSize?.MEDIUM,  // 使用中等核大小提高平滑度
    renderToScreen: true  
  });
};

const supportOpacity = () => {
  if (originalMaterials.size > 0 || !model) {
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
  if(currentScene.value === 'office') {
    originalCameraState.value = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      rotation: camera.rotation.clone(), // 保存相机旋转
      zoom: camera.zoom // 保存相机缩放
    };
  }

  // 获取点击位置
  const position = new THREE.Vector3();
  if (object) {
    object.getWorldPosition(position);
  } else {
    // 如果没有对象，使用默认位置（场景中心或当前相机目标点）
    position.copy(controls.target);
  }

  // 计算相机目标位置 (稍微偏移以便更好地查看)
  const targetPosition = position.clone().add(new THREE.Vector3(0, 5, 10));

  // 设置详细模型路径并显示详细视图
  detailModelPath.value = modelPath;
  currentScene.value = modelPath;
  const cachedModel = modelCacheManager.hasModel(modelPath)

  if (toVR) {
    showVR.value = true;
    if (model) {
      nextTick(() => {
        const vrElement: HTMLElement = document.querySelector('.vr-container');
        if (vrElement) {
          vrElement.style.opacity = '0';
          vrElement.style.transition = 'opacity 0s';
        }
      });
    }
  } else {
    showVR.value = false;
    // 如果没有缓存目标模型或没有主模型，立即显示详情视图
    if (!cachedModel || !model) {
      showDetailViewer.value = true;
    } else {
      // 否则等待动画完成后再显示
      showDetailViewer.value = false;
    }
  }

  supportOpacity()

  // 收集所有标记组
  const allMarkers: THREE.Group[] = [];
  diamondMarkers.forEach((marker) => {
    allMarkers.push(marker);
  });

  // 相机动画
  // 相机动画和模型透明度动画
  if (!model) return;

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
        allLabels.forEach(label => {
          if (label.element) {
            label.element.style.opacity = (1 - progress).toString();
            // 当透明度接近0时，完全隐藏元素
            if (progress > 0.9) {
              label.element.style.display = 'none';
            }
          }
        });
      },
      onComplete: () => {
        if (!toVR && cachedModel) { // 有缓存的情况下,等待动画执行完直接显示详细视图
          showDetailViewer.value = true;
        }
        // 确保原模型完全透明
        model.traverse((node) => {
          if (node.isMesh && node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => {
                mat.opacity = 0;
              });
            } else {
              node.material.opacity = 0;
            }
          }
        });
        // console.log('showDetailViewer:', showDetailViewer)
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
            allLabels.forEach(label => {
              if (label.element) {
                label.element.style.opacity = 0
              }
            });
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
const closeDetailView = async (toOffice = true) => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  if(toOffice) {
    currentScene.value = 'office';
  }
  
  await glbViewerRef.value?.fadeOutModel();
  // 直接隐藏详情视图
  showDetailViewer.value = false;
  showVR.value = false;

  if (!toOffice) return;
  // manageStore.sceneHistory.showBack = false;
  // 恢复场景背景色
  // scene.background?.copy(originalBackgroundColor);

  // 恢复相机状态
  if (originalCameraState.value) {
    // 恢复相机位置和旋转
    camera.position.copy(originalCameraState.value.position);
    camera.rotation.copy(originalCameraState.value.rotation);
    controls.target.copy(originalCameraState.value.target);
    camera.zoom = originalCameraState.value.zoom;
    camera.updateProjectionMatrix();

    // 恢复控制器
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.update();
  }

  // 恢复所有标签和标记的可见性
  allLabels.forEach(label => {
    if (label.element) {
      label.element.style.opacity = 1
    }
  });

  // 恢复渲染
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
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: auto;
  /* 确保容器可以接收焦点 */
  touch-action: none;
}
.three-container.visible {
  opacity: 1;
  z-index: 1;
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
  z-index: 2;
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

:deep(.info-label) {
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #00ffff;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  box-shadow: 0 0 2px rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(2px);
}

:deep(.label-header) {
  display: flex;
  justify-content: space-between;
}

:deep(.status) {
  color: #ffff00;
  text-shadow: 0 0 5px rgba(255, 255, 0, 0.5);
}

:deep(.label-content) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.value) {
  color: #00ffff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

:deep(.info) {
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 13px;
}
</style>