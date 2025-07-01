<template>
  <div id="model-3D-node" class="index">
    <div class="timer">
      <Time />
    </div>
    <div class="left">
      <Left ref="leftRef" @click="handleNodeClickView" @on-hide="floorHide1" @on-hide1="floorHide2" @on-hide2="floorHide3" @on-show="floorShow" />
    </div>
    <div class="main-center">
      <div class="three-container w-full" :class="{ 'hoverElem': hoverElem, 'dragElem': inVRMode }">
        <div v-if="inVRMode" class="back" @click="exitVRView">Back</div>
      </div>
      <div v-if="loading" class="progress-bar">
        <div class="progress-bar-info flex flex-row">
          <div class="progress-bar-text">{{ loadingText }} ({{ progressBarWidth.toFixed(2) + '%' }})</div>
          <div v-if="downloading" class="spinner"></div>
        </div>
        <div v-if="!downloading" class="progress-bar-inner-node">
          <div class="progress-bar-inner" :style="{ width: progressBarWidth + '%' }"></div>
        </div>
      </div>
      <div class="search">
        <div class="search-input">
          <div class="search-input-text">
            <el-autocomplete
              v-model="searchText"
              :fetch-suggestions="querySearch"
              :trigger-on-focus="false"
              popper-class="autocomplete-suggestions"
              placeholder
              clearable
              @select="handleSearchClick"
            ></el-autocomplete>
          </div>
        </div>
        <div class="search-button" @click="handleSearchClick">
          <div class="search-button-text"></div>
        </div>
      </div>
      <div class="module">
        <div v-for="(item, index) in moduleArray" :key="index" class="module-item" @click="handleClick(item, index)">
          <div class="module-item-3Dtext" :class="{ select: store.rightIndex == index, unselect: store.rightIndex != index }">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="right">
      <Surface v-if="store.rightIndex == 1" ref="surfaceRef" class="surface" :surface="surface" />
      <BuildingInfo
        v-if="store.rightIndex == 0"
        ref="buildingRef"
        class="basic-info"
        :area-focus="areaFocus"
        :area-images="areaImagePaths"
        :carousel-key="carouselKey"
      />
      <Sensors v-if="store.rightIndex == 2" ref="sensorsRef" class="sensors-info" :sensor-name="sensorName" @update-icon="updateModelIcon" />
      <Robot v-if="store.rightIndex == 3" ref="robotRef" class="robots-info" :robot-name="robotName" />
      <template v-for="(config, index) in componentMap" :key="index">
        <div v-if="store.rightIndex === Number(index)" :class="config.wrapper">
          <template v-if="Array.isArray(config.components)">
            <component :is="Comp" v-for="Comp in config.components" :key="Comp.name" />
          </template>
        </div>
      </template>
    </div>
    <Tip v-if="showSensorDetail" :sensor="sensor" :type="type" :style="sensorStyle" />
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import gsap from 'gsap';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import Time from '$/time/time.vue';
import RightTop from '$/right/rightTop.vue';
import RightMiddle from '$/right/rightMiddle.vue';
import RightBottom from '$/right/rightBottom.vue';
import Left from '$/left/left.vue';
import BuildingInfo from '$/basicInfo/buildingInfo.vue';
import Surface from '$/surface/surface.vue';
import Sensors from '$/sensorsInfo/sensors.vue';
import Robot from '$/robotsInfo/robotDetail.vue';

import { mainStore } from '@/store/model';
import Tip from '$/sensorsInfo/tip.vue';
const sensorsRef = ref(null);
const robotRef = ref(null);
const surfaceRef = ref(null);
const buildingRef = ref(null);
const leftRef = ref(null);
let compRef;
const store = mainStore();
const areaImagePaths = ref([]);
const carouselKey = ref('');
const showSensorDetail = ref(false);
const sensorStyle = ref({});
const sensor = ref(null);
const surface = ref({});
const areaFocus = ref('');
const focusItem = ref('');
const type = ref('tooltip');

let baseAreaIcon = null;
const loading = ref(false); // 控制进度条显示
const downloading = ref(true);
const hoverElem = ref(false);
const progressBarWidth = ref(0);
const loadingText = ref('Loading data from the server, please wait...');
const moduleArray = ref(store.modelTypes);
let intersects = []; // clicked objects
// 当前场景和相机
let currentScene = null;
let currentCamera = null;
let node = null;
let vrScene = null;
let vrCamera = null;
let inVRMode = ref(false);
let panoramaMesh = null;
const minDistance = 50; // 相机与地板的最小距离
// 存储预创建的元素
const cachedElements = {
  areaIcons: new Map(),
  areaLabels: new Map(),
  sensorIcons: new Map(),
  robotIcons: new Map()
};
const sensorName = ref('');
const robotName = ref('');
const restaurants = ref();

const props = defineProps({
  id: {
    type: String,
    default: 'building1'
  }
});
let sensoreMaterials = [];

store.activeId = props.id;

const areas = Array.from({ length: 13 }, (_, i) => `Area${i + 1}`);
// 组件映射配置
const componentMap = {
  99: {
    components: [RightTop, RightMiddle, RightBottom],
    wrapper: 'right',
    props: {}
  }
};

const createAreaLabel = (node) => {
  const div = document.createElement('div');
  div.innerHTML = node.name.toLowerCase().replace(/(\D)(\d)/, '$1-$2');
  div.className = 'surface-areaLabel';
  const labelObject = new CSS2DObject(div);
  return labelObject;
};

const createAreaIcon = (path, scale = [0.03, 0.04, 0.04]) => {
  const iconPath = store.getImg(path);
  const icon = createImg(iconPath);
  icon.scale.set(...scale);
  icon.position.set(0, 0.01, 0);
  return icon;
};

// 后期处理设置
const setupComposer = () => {
  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  composer.addPass(outlinePass);

  // 轮廓线配置
  Object.assign(outlinePass, {
    selectedObjects,
    edgeStrength: 10,
    edgeThickness: 5,
    visibleEdgeColor: new THREE.Color(0xffff00)
  });
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

const basePlaneIcon = (url) => {
  // 加载纹理
  const path = store.getImg(url);
  let texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;

  // 创建平面几何体
  const planeGeometry = new THREE.PlaneGeometry(0.02, 0.02);

  // 创建材质
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, // 如果图片有透明部分，需要启用透明
    side: THREE.DoubleSide // 双面渲染
  });

  // 创建平面网格
  const planeMesh = new THREE.Mesh(planeGeometry, material);

  // 旋转平面，使其平行于地面
  planeMesh.rotation.x = -Math.PI / 2; // 绕 X 轴旋转 -90 度

  return planeMesh;
};

let planeMeshes = [];

// 预创建所有需要的元素
const updateModelIcon = (index = 0) => {
  // 处理区域标签和图标
  baseAreaIcon = basePlaneIcon(getAssetImage(`${store.basicInfo.rootPath}/${store.basicInfo.modelIcons.viewAll}`));

  model.traverse((child) => {
    if (!areas.includes(child.name)) return;

    let iconPath;

    switch (index) {
      case 0:
        compRef = buildingRef;
        createIconForChild(child, store.basicInfo, createBasicIcon, 'areaIcons');
        break;
      case 1:
        compRef = surfaceRef;
        createAreaLabelForChild(child);
        break;
      case 2:
        compRef = sensorsRef;
        iconPath = sensorsRef.value?.getModelIconPath(child.name);
        createIconForChild(child, store.monitoring, createSensorIcon, 'sensorIcons', iconPath);
        break;
      case 3:
        compRef = robotRef;
        createIconForChild(child, store.robots, createRobotIcon, 'robotIcons');
        break;
    }
  });

  // 获取所有 planeMesh
  scene.traverse((child) => {
    if (child.isMesh && child.material.map && child.type === 'plane') {
      planeMeshes.push(child);
    }
  });
};
// 创建区域标签
const createAreaLabelForChild = (child) => {
  const areaLabel = createAreaLabel(child);
  let offset = {};

  if (child.name === 'Area1') {
    offset.z = 0.02;
  }
  areaLabel.position.set(0, 0, offset.z);
  cachedElements.areaLabels.set(child.name, areaLabel);
  child.add(areaLabel);
};

// 通用创建图标的方法
const createIconForChild = (child, config, createIconFunc, cacheKey, paths = '') => {
  let icon;
  const areaNum = child.name.slice(4);
  if (config.kind === 'same') {
    icon = baseAreaIcon.clone();
    icon.type = 'plane';
    icon.material.depthTest = true;
    const padding = areaNum === '1' ? 0.04 : 0;
    icon.position.set(0, 0, padding);
  } else if (config.kind === 'fromData') {
    if (!paths) return;
    icon = createIconFunc(paths);
    icon.material.depthTest = false; // 避免被其他 3D 物体遮挡
  } else if (Object.keys(config.modelIcons).includes(child.name)) {
    const iconPath = config.modelIcons[child.name];
    icon = createIconFunc(iconPath);
    icon.material.depthTest = false;
    icon.position.set(0, 0, 0.02);
  }
  if (icon) {
    icon.name = `area-${areaNum}`;
    cachedElements[cacheKey].set(child.name, icon);
    child.add(icon);
  }
};

const createBasicIcon = (iconPath) => {
  return baseAreaIcon.clone();
};

const resetModelStatus = () => {
  surface.value = {};
  sensorName.value = '';
  robotName.value = '';
  sensoreMaterials = [];
  planeMeshes = [];
  resetVRParameters();

  // 遍历所有区域，移除图标和标签
  model?.traverse((child) => {
    if (!areas.includes(child.name)) return;

    // 移除区域标签
    const areaLabel = cachedElements.areaLabels.get(child.name);
    if (areaLabel) {
      child.remove(areaLabel);
      scene.remove(areaLabel);
      cachedElements.areaLabels.delete(child.name);
    }

    // 移除区域图标
    const areaIcon = cachedElements.areaIcons.get(child.name);
    if (areaIcon) {
      child.remove(areaIcon);
      scene.remove(areaIcon);
      cachedElements.areaIcons.delete(child.name);
    }

    // 移除传感器图标
    const sensorIcon = cachedElements.sensorIcons.get(child.name);
    if (sensorIcon) {
      child.remove(sensorIcon);
      scene.remove(sensorIcon);
      cachedElements.sensorIcons.delete(child.name);
    }

    // 移除机器人图标
    const robotIcon = cachedElements.robotIcons.get(child.name);
    if (robotIcon) {
      child.remove(robotIcon);
      scene.remove(robotIcon);
      cachedElements.robotIcons.delete(child.name);
    }
  });
};

// 闪光动画
const blinkAnimation = () => {
  sensoreMaterials.forEach((spriteMaterial) => {
    gsap.to(spriteMaterial, {
      opacity: 0.5, // 透明度降到 0
      duration: 1, // 动画持续时间
      repeat: -1, // 无限循环
      yoyo: true, // 往返动画
      ease: 'power1.inOut'
    });
  });
};
// 创建传感器图标
const createSensorIcon = (iconPath) => {
  const img = getAssetImage(`${store.monitoring.rootPath}/${iconPath}`)
  const sensorIcon = createAreaIcon(`${img}`);

  return sensorIcon;
};

// 创建机器人图标
const createRobotIcon = (iconPath) => {
  const img = getAssetImage(`${store.robots.rootPath}/${iconPath}`);
  const robotIcon = createAreaIcon(img, [0.05, 0.05, 0.05]);
  return robotIcon;
};

const getAssetImage = (imgPath) => {
  const img = new URL(`/src/${imgPath}`, import.meta.url).href;
  console.log(imgPath, img, 'getAssetImage');
  return img;
};
const handleClick = (item, index) => {
  store.moduleType = item.id;
  store.rightIndex = index;
  leftRef.value?.setFocus('');
  controls.target.set(0, 0, 0);
  store.dialogVisible = false;

  // 相机动画配置
  const cameraConfigs = {
    0: { x: 0, y: 150, z: 60 },
    1: { x: 0, y: 150, z: 0 },
    2: { x: 0, y: 150, z: 0 },
    3: { x: 0, y: 150, z: 0 }
  };

  if (inVRMode.value) {
    exitVRView();
  }
  // 设置相机位置和控制
  const config = cameraConfigs[index];
  gsap.to(camera.position, {
    ...config,
    duration: 1,
    ease: 'none',
    onComplete: () => {
      controls.enableRotate = config.enableControls;
      controls.enableZoom = config.enableControls;
    }
  });

  if (index != 1) {
    outlinePass.selectedObjects = [];
  }

  resetModelStatus();

  // 更新元素可见性
  nextTick(() => {
    if (index == 0 || index == 1 || index == 3) {
      updateModelIcon(index);
    } else {
      console.log('index update icon event trigger');
      sensorsRef.value?.showIcon();
    }
  });
};

const textureLoader = new THREE.TextureLoader();
const createImg = (url) => {
  let texture = textureLoader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  //将图片构建到纹理中
  let material = new THREE.SpriteMaterial({
    map: texture
    // transparent: true
  });

  if (store.moduleType == 'MONITORING') {
    sensoreMaterials.push(material);
  }

  let txtMesh = new THREE.Sprite(material);
  txtMesh.scale.set(8, 10, 10);
  txtMesh.lookAt(new THREE.Vector3(0, 0, 0));
  txtMesh.position.x = -20;
  txtMesh.position.y = -20;
  txtMesh.position.z = -20;

  scene.add(txtMesh);

  return txtMesh;
};

const addSelectedObject = (object) => {
  selectedObjects = [];
  selectedObjects.push(object);
};

function clearAllClickEvents(element) {
  element.removeEventListener('click', null);
}

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let labelRenderer = null;
let model = null;
let modelB = null;
let modelC = null;
let raycaster = null;

let composer = null;
let renderPass = null;
let outlinePass = null;
let selectedObjects = [];

const manager = new THREE.LoadingManager();
// 更新进度条的宽度
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  progressBarWidth.value = progress; // 设置进度条宽度
};

// 加载完成时移除进度条
manager.onLoad = function () {
  setTimeout(() => {
    loading.value = false; // 加载完成，隐藏进度条
  }, 500); // 延时500ms，确保加载完成后进度条消失
};

let dracoLoader = new DRACOLoader();
const padding = store.rootPath === '/' ? '' : store.rootPath;
console.log(`${padding}/draco/`);
dracoLoader.setDecoderPath(`${padding}/draco/`);
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.preload();
dracoLoader.dispose();

// 加载错误时的处理
manager.onError = function (url) {
  console.error('Error loading: ', url);
  loading.value = false;
};
const labels = computed(() => {
  const result = [];
  function checkChildren(areas) {
    areas.forEach((area) => {
      if (area.children.length === 0) {
        result.push(area.label);
      } else {
        checkChildren(area.children);
      }
    });
  }
  checkChildren(store.areas);
  return result;
});
const initThree = () => {
  restaurants.value = labels.value.map((label) => ({ 'value': label }));
  // 基础场景设置
  const setupScene = () => {
    scene = new THREE.Scene();
    const node = getNode();

    // 相机设置
    camera = new THREE.PerspectiveCamera(75, node.clientWidth / node.clientHeight, 0.1, 1000);
    camera.position.set(0, 150, 60);

    // 渲染器设置
    setupRenderers(node);

    // 环境设置
    setupEnvironment();

    // 控制器设置
    setupControls();

    // 后期处理
    setupComposer();

    // 加载模型
    loadModel();

    currentScene = scene;
    currentCamera = camera;
  };

  // 渲染器设置
  const setupRenderers = (node) => {
    // WebGL渲染器
    renderer = new THREE.WebGLRenderer({
      antialias: true, // 禁用抗锯齿
      preserveDrawingBuffer: false, // 不保持绘制缓冲区
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(node.clientWidth, node.clientHeight);
    renderer.setClearColor(0x000000, 0);
    node.appendChild(renderer.domElement);

    // CSS2D渲染器
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(node.clientWidth, node.clientHeight);
    Object.assign(labelRenderer.domElement.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: '0'
    });
    node.appendChild(labelRenderer.domElement);
  };

  // 环境设置
  const setupEnvironment = () => {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.0001).texture;
  };

  // 控制器设置
  const setupControls = () => {
    controls = new OrbitControls(camera, labelRenderer.domElement);
  };

  // 模型加载与处理
  const loadModel = async () => {
    loading.value = true;
    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.setDRACOLoader(dracoLoader);
    /**
     * const devUrl = store.getImg(`${store.rootPath}/assets/floor.glb`);
    const proUrl = `${import.meta.env.VITE_MODEL_S3_PATH}/irvine-office/floorA.glb`;
    const url = env == 'development' ? devUrl : proUrl;
     */
    const proUrl = `https://foxx-digital-twin-dev.s3.us-east-1.amazonaws.com/building-data/irvine-office/floorA.glb`;

    loadingText.value = 'Loading the model, please wait...';
    downloading.value = false;
    gltfLoader.load(
      proUrl,
      (gltf) => {
        loadingText.value = 'Rendering';
        model = gltf.scene;
        model.scale.set(350, 350, 350);
        model.position.set(0, 0, 0);
        scene.add(model);
        updateModelIcon();
        autoAdjustFontSize();
        loading.value = false;
      },
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        progressBarWidth.value = percentComplete;
      },
      (error) => {
        console.error('load model failed:', error);
        loading.value = false;
      }
    );
  };

  // 初始化
  setupScene();
  animate();
  raycaster = new THREE.Raycaster();
  node = getNode();
};

let activeMesh = null;
const pointer = new THREE.Vector2();

const floorHide1 = () => {
  gsap.to(camera.position, {
    x: 0,
    y: 150,
    z: 60,
    duration: 1,
    ease: 'none'
  });
  controls.target.set(0, 0, 0);
};

const floorHide2 = () => {
  model.visible = false;
  modelB.visible = true;
  modelC.visible = false;
  gsap.to(camera.position, {
    x: 0,
    y: 100,
    z: 200,
    duration: 1,
    ease: 'none'
  });
  controls.target.set(0, 0, 0);
};

const floorHide3 = () => {
  model.visible = false;
  modelB.visible = false;
  modelC.visible = true;
  gsap.to(camera.position, {
    x: 0,
    y: 100,
    z: 200,
    duration: 1,
    ease: 'none'
  });
  controls.target.set(0, 0, 0);
};

const floorShow = () => {
  if (store.moduleType === 'SURFACE') {
    surfaceRef.value?.reset();
    surface.value = {};
    clearOutlinePass();
  }
  gsap.to(camera.position, {
    x: 0,
    y: 150,
    z: 60,
    duration: 1,
    ease: 'none'
  });
  areaFocus.value = 'overview-default';
  controls.target.set(0, 0, 0);
  store.rightIndex = 0;
};
const outline = (event) => {
  const node = getNode();

  pointer.x = ((event.clientX - node.offsetLeft) / node.clientWidth) * 2 - 1;
  pointer.y = -((event.clientY - node.offsetTop) / node.clientHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children) || [];
  if (intersects.length > 0) {
    console.log(intersects[0].object);
    addSelectedObject(intersects[0].object);
    outlinePass.selectedObjects = selectedObjects;
  } else {
    outlinePass.selectedObjects = [];
  }
};

const getIntersects = (event) => {
  const node = getNode();
  if (!node) return [];

  // 获取鼠标位置
  const rect = node.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // 更新 raycaster
  raycaster.setFromCamera(pointer, camera);
  const elems = store.moduleType == 'BASIC' ? planeMeshes : scene.children;
  const intersects = raycaster.intersectObjects(elems, true); // 确保检测到所有子对象

  return intersects;
};

const handleBasicHover = (mesh) => {
  cachedElements.areaIcons.forEach((icon) => {
    icon.scale.set(1, 1, 1);
  });
  if (mesh && mesh.name) {
    mesh.scale?.set(1.2, 1.2, 1.2);
    hoverElem.value = true;
  } else if (mesh) {
    mesh.scale?.set(1, 1, 1);
    hoverElem.value = false;
  }
};

const handleSurfaceHover = (intersects) => {};

const handleMonitoringHover = (sprite, event) => {
  // 重置所有图标的透明度
  cachedElements.sensorIcons.forEach((icon) => {
    icon.material.opacity = 0.8; // 默认透明度
  });
  showSensorDetail.value = false;

  if (sprite && sprite.type === 'Sprite') {
    showSensorDetail.value = true;

    const data = sensorsRef.value?.getModelIcon(sprite.name);

    if (data) {
      sensor.value = data;
      sensorStyle.value = {
        position: 'absolute',
        top: event.clientY + 2 + 'px',
        left: event.clientX + 2 + 'px',
        zIndex: '9999'
      };
    }
    sprite.material.opacity = 1; // 鼠标悬停时透明度变为 1
    hoverElem.value = true;
  } else {
    hoverElem.value = false;
  }
};

const handleRobotHover = (intersects) => {};

const onDocumentMouseMove = (event) => {
  if (inVRMode.value) {
    onVRMouseMove(event);
    return;
  }
  const intersects = getIntersects(event);
  const sprite = intersects.find((d) => d.object.type === 'Sprite')?.object || {};
  const mesh = intersects.find((d) => d.object.type === 'Mesh')?.object;
  const plane = intersects.find((d) => d.object.type === 'plane')?.object;

  // 根据当前模块类型执行不同的逻辑
  const handlers = {
    BASIC: () => handleBasicHover(plane),
    SURFACE: () => handleSurfaceHover(mesh),
    MONITORING: () => handleMonitoringHover(sprite, event),
    ROBOT: () => handleRobotHover(sprite)
  };

  const handler = handlers[store.moduleType];
  if (handler) {
    handler();
  }
};
const debouncedMouseMove = useDebounceFn(onDocumentMouseMove, 0);

let mouseDownPosition = { x: 0, y: 0 }; // 鼠标按下的初始位置

const onModelMouseDown = useDebounceFn((event) => {
  const node = getNode();
  if (!node) return;

  mouseDownPosition.x = event.clientX;
  mouseDownPosition.y = event.clientY;
  // 获取点击位置
  const rect = node.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // 更新 raycaster
  raycaster.setFromCamera(pointer, camera);

  // 获取交集的对象
  intersects = raycaster.intersectObjects(scene.children, true); // true: 确保检查所有子对象
  selectedObjects = [];
}, 300);
const onMouseDown = (event) => {
  if (inVRMode.value) {
    onVRMouseDown(event);
  } else {
    onModelMouseDown(event);
  }
};

const debouncedMouseDown = useDebounceFn(onMouseDown, 0);

const onMouseUp = (event) => {
  if (inVRMode.value) {
    onVRMouseUp(event);
    return;
  }
  // 如果是拖拽事件，直接返回
  // if (isDragEvent(event)) return;

  // 处理点击事件
  handleClickEvent(event);
};

// 判断是否是拖拽事件
const isDragEvent = (event) => {
  const dx = Math.abs(event.clientX - mouseDownPosition.x);
  const dy = Math.abs(event.clientY - mouseDownPosition.y);
  const threshold = 5; // 阈值设置为 5 像素
  return dx > threshold || dy > threshold;
};

// 处理点击事件
const handleClickEvent = useDebounceFn((event) => {
  if (isDragEvent(event)) return;

  const sprite = getIntersectedSprite();
  const mesh = getIntersectedMesh();
  const plane = getPlaneMesh();

  // 根据当前模块类型执行不同的逻辑
  const handlers = {
    BASIC: () => handleBasicModuleClick(plane),
    SURFACE: () => handleSurfaceModuleClick(mesh),
    MONITORING: () => handleMonitoringModuleClick(sprite),
    ROBOT: () => handleRobotModuleClick(sprite)
  };

  const handler = handlers[store.moduleType];
  if (handler) {
    handler();
  }

  // 清理状态
  resetState();
}, 300);

// 获取相交的 Sprite 对象
const getIntersectedSprite = () => {
  return intersects.find((d) => d.object.type === 'Sprite')?.object || {};
};

// 获取相交的 Mesh 对象
const getIntersectedMesh = () => {
  return intersects.find((d) => d.object.type === 'Mesh')?.object;
};

const getPlaneMesh = () => {
  return intersects.find((d) => d.object.type === 'plane')?.object;
};

// 处理基础模块点击事件
const handleBasicModuleClick = (mesh, id = '') => {
  if (mesh && mesh.name && mesh.name.toLowerCase().startsWith('area')) {
    /**
    const name = mesh.name.toLowerCase().replace(/(\D)(\d)/, '$1-$2');
    areaImagePaths.value = store.basicInfo.imagePaths[name];
    carouselKey.value = new Date().getTime();
    store.dialogVisible = true;
    */
    const name = id || mesh.name;
    const pics = store.basicInfo.imagePaths[name];
    const leftLabel = name.split('-').join(' ');
    leftRef.value?.setFocus(leftLabel);
    const filePath = buildingRef.value?.getBuildingPath(pics[0]);
    enterVRView(filePath, mesh);
  } else {
    leftRef.value?.setFocus('');
  }
};

// 处理表面分析模块点击事件
const handleSurfaceModuleClick = (mesh) => {
  if (mesh && mesh.name.toLowerCase().startsWith('area')) {
    handleSurfaceAnalysisClick(mesh);
    const leftLabel = mesh.name.replace(/(\D)(\d)/, '$1 $2');
    leftRef.value?.setFocus(leftLabel);
  } else {
    resetSurfaceState();
  }
};

// 处理监控模块点击事件
const handleMonitoringModuleClick = (sprite) => {
  if (sprite.type === 'Sprite') {
    sensorsRef.value?.sensorClick(sprite.name);
  } else {
    sensorsRef.value?.close();
  }
};

// 处理机器人模块点击事件
const handleRobotModuleClick = (sprite) => {
  if (sprite.type === 'Sprite') {
    robotRef.value?.triggerDialog();
    robotName.value = sprite.name;
  }
  handleRobotClick();
};

// 重置表面分析模块状态
const resetSurfaceState = () => {
  surfaceRef.value?.reset();
  surface.value = {};
  clearOutlinePass();
  leftRef.value?.setFocus('');
};

// 清理全局状态
const resetState = () => {
  intersects = [];
};

const debouncedMouseUp = useDebounceFn(onMouseUp, 0);

// 表面分析点击事件处理
const handleSurfaceAnalysisClick = (mesh) => {
  surface.value = mesh;

  // 更新选择的物体
  addSelectedObject(mesh);
  outlinePass.selectedObjects = selectedObjects;
};

const handleRobotClick = () => {
  if (store.moduleType != 'ROBOT') return;

  // 获取所有的键
  const keys = cachedElements.robotIcons.keys();

  // 循环遍历这些键，并获取对应的值
  for (let key of keys) {
    const value = cachedElements.robotIcons.get(key);

    // 假设 robotModel 是当前 key 对应的模型
    const robotModel = value; // 这里假设 value 就是模型对象

    const intersectRobot = raycaster?.intersectObject(robotModel, true);

    if (intersectRobot.length > 0) {
      robotRef.value?.triggerDialog();
      robotName.value = key;
      break; // 如果找到对应的模型，可以跳出循环
    }
  }
};

let searchText = ref('');
const handleSearchClick = () => {
  let searchMesh = scene.getObjectByName(searchText.value);
  if (searchText.value.toLowerCase() == 'overview') {
    floorShow();
    return;
  }
  if (!searchMesh) {
    ElMessage.error('No corresponding area found!');
    return;
  }

  const leftLabel = searchText.value.replace(/(\D)(\d)/, '$1 $2');
  leftRef.value?.setFocus(leftLabel);

  if (store.moduleType === 'BASIC') {
    const id = searchMesh.name.toLowerCase().replace(/(\D)(\d)/, '$1-$2');
    areaImagePaths.value = store.basicInfo.imagePaths[id];
    store.dialogVisible = true;
  }

  if (store.moduleType === 'SURFACE') {
    handleSurfaceAnalysisClick(searchMesh);
    return;
  }

  const pos = new THREE.Vector3();
  searchMesh.getWorldPosition(pos);
  let pos2 = pos.clone().addScalar(30);
  gsap.to(camera.position, {
    x: pos2.x,
    y: pos2.y,
    z: pos2.z,
    duration: 1,
    ease: 'none',
    onUpdate: () => {
      controls.target.set(pos.x, pos.y, pos.z);
    },
    onComplete: () => {
      camera.position.set(pos2.x, pos2.y, pos2.z);
    }
  });
};

const handleNodeClickView = (data) => {
  const mesh = scene.getObjectByName(data.label);

  if (store.moduleType === 'SURFACE') {
    handleSurfaceAnalysisClick(mesh);
    return;
  }
  if (store.moduleType === 'BASIC') {
    /**
    areaImagePaths.value = store.basicInfo.imagePaths[data.areaId];
    store.dialogVisible = true;
     */
    handleBasicModuleClick(mesh, data.areaId);
    return;
  }
  const pos = new THREE.Vector3();
  mesh.getWorldPosition(pos);
  let pos2 = pos.clone().addScalar(30);
  gsap.to(camera.position, {
    x: pos2.x,
    y: pos2.y,
    z: pos2.z,
    duration: 1,
    ease: 'none',
    onUpdate: () => {
      controls.target.set(pos.x, pos.y, pos.z);
    },
    onComplete: () => {
      camera.position.set(pos2.x, pos2.y, pos2.z);
    }
  });
};

const bind = () => {
  node.addEventListener('mousedown', debouncedMouseDown);
  node.addEventListener('mouseup', debouncedMouseUp);
  node.addEventListener('mousemove', debouncedMouseMove);
  window.addEventListener('resize', resize);
  window.addEventListener('wheel', onMouseWheel);
  document.addEventListener('keydown', keydown);
  const canvas = renderer.domElement;

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost');
  });

  canvas.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored');
    // 重新初始化 WebGL 资源
    initThree();
  });
};

const zoomInToVR = (event) => {
  if (inVRMode.value) return;
  // 计算鼠标在标准化设备坐标中的位置
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 通过鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera);

  // 计算射线与场景中所有 Mesh 的交点
  /**
   const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length == 0) {
    return;
  }

  // 获取距离相机最近的 Mesh
  const mesh = intersects.find((d) => d.object.type === 'Mesh')?.object;
  const distance = camera?.position?.distanceTo(mesh.position);

  if (mesh && mesh.name && mesh.name.toLowerCase().startsWith('area') && distance < minDistance) {
    const name = mesh.name.toLowerCase().replace(/(\D)(\d)/, '$1-$2');

    areaImagePaths.value = store.basicInfo.imagePaths[name];

    const filePath = buildingRef.value?.getBuildingPath(areaImagePaths.value[0]);

    debounceEnterVR(filePath, mesh);
  }
  */
};

const zoomOutVR = (event) => {
  if (!inVRMode.value) return;

  // 根据滚轮方向调整 fov
  const delta = event.deltaY; // 滚轮滚动量
  const fov = vrCamera.fov; // 当前 fov

  // 调整 fov
  const newFov = fov + delta * 0.1; // 缩放速度
  vrCamera.fov = THREE.MathUtils.clamp(newFov, 10, 120); // 限制 fov 范围

  /**
   * if (newFov > 120) {
    debounceExitVR();
  }
   * 
   */

  // 更新相机投影矩阵
  vrCamera.updateProjectionMatrix();
};

const onMouseWheel = (event) => {
  if (store.moduleType !== 'BASIC') {
    return;
  }
  zoomInToVR(event);
  zoomOutVR(event);
};

const resize = () => {
  // 更新渲染器的大小
  const node = getNode();
  const width = node.clientWidth;
  const height = node.clientHeight;
  renderer.setSize(width, height);

  // 更新相机的视野比例
  camera.aspect = width / height;

  // 更新投影矩阵
  camera.updateProjectionMatrix();

  labelRenderer.setSize(width, height);
  // 重新渲染场景以避免失真
  renderer.render(scene, camera); // 添加此行

  if (composer) {
    composer.setSize(width, height);
  }

  if (outlinePass) {
    outlinePass.setSize(width, height);
  }

  autoAdjustFontSize();
};

const getNode = () => {
  return document.querySelector('.three-container');
};

let tween = null;
let fadeOutTween = null,
  fadeInTween = null,
  moveTween = null;
let ringMesh = null;

// 进入 VR 看房
const enterVRView = (path, mesh) => {
  isMouseDown = false;
  resetVRParameters();

  if (inVRMode.value) {
    textureLoader.load(path, (texture) => {
      // 淡出当前纹理
      gsap.to(panoramaMesh.material, {
        opacity: 0, // 将透明度降到 0
        duration: 1, // 淡出持续时间
        ease: 'power2.inOut',
        onComplete: () => {
          // 加载新纹理
          if (panoramaMesh && panoramaMesh.material) {
            // 释放旧纹理
            panoramaMesh.material.map.dispose();
            // 设置新纹理
            panoramaMesh.material.map = texture;
            panoramaMesh.material.needsUpdate = true;
            panoramaMesh.rotation.set(0, 0, 0);

            // 淡入新纹理
            gsap.to(panoramaMesh.material, {
              opacity: 1, // 将透明度升到 1
              duration: 0.5, // 淡入持续时间
              ease: 'power2.inOut',
              onComplete: () => {
                console.log('Texture fade-in complete');
              }
            });
          }
        }
      });
    });

    return; // 直接返回，不再执行后续逻辑
  }

  // 加载全景图
  if (vrScene == null) {
    vrScene = new THREE.Scene();
    vrCamera = new THREE.PerspectiveCamera(75, node.clientWidth / node.clientHeight, 0.1, 1000);
  }

  if (tween && (tween.isPlaying() || tween.isPaused())) {
    tween.stop();
  }

  if (!tween) {
    tween = new TWEEN.Tween(camera.position);
  }

  /**
  // 动态过渡：相机移动到全景图中心
  tween
    .to({ x: pos.x, y: pos.y, z: pos.z - 5 }, 800)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      // 渐隐 panoramaMesh
      if (panoramaMesh && panoramaMesh.material.opacity < 1) {
        panoramaMesh.material.opacity += 0.01; // 每帧减少透明度
      }
    })
    .onComplete(() => {
      currentScene = vrScene;
      currentCamera = vrCamera;
      inVRMode.value = true;
      disposeScene(vrScene);
    })
    .start();
   */

  // 计算相机拉近的极限位置
  /**
   *const floorPosition = new THREE.Vector3(mesh.position.x, 0, mesh.position.z);
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    let pos2 = pos.clone().addScalar(30);
    const direction = new THREE.Vector3().subVectors(camera.position, floorPosition).normalize();
    const cameraTargetPosition = new THREE.Vector3().copy(floorPosition).add(direction.multiplyScalar(minDistance));
  */
  // 加载新场景的内容
  const panoramaTexture = textureLoader.load(path);
  const panoramaGeometry = new THREE.SphereGeometry(500, 60, 40);
  const panoramaMaterial = new THREE.MeshBasicMaterial({
    map: panoramaTexture,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0 // 初始透明度为0
  });
  panoramaMesh = new THREE.Mesh(panoramaGeometry, panoramaMaterial);
  panoramaMesh.scale.x = -1;
  vrScene.add(panoramaMesh);
  /**
   * addRingMesh();
   */

  // 加载新场景的内容
  gsap.to(panoramaMesh, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      currentScene = vrScene;
      currentCamera = vrCamera;
      inVRMode.value = true;
      // 新场景的淡入效果
      gsap.to(panoramaMesh.material, {
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          console.log('New scene fully visible');
        }
      });
    }
  });
};

// 退出 VR 看房
const exitVRView = () => {
  if (!tween) {
    tween = new TWEEN.Tween(camera.position);
  }

  resetVRParameters();
  leftRef.value?.setFocus('');

  if (tween && (tween.isPlaying() || tween.isPaused())) {
    // 停止当前 Tween
    tween.stop();
  }

  // 动态过渡：相机返回原始位置
  fadeOutTween = new TWEEN.Tween(model.scale) // 对原模型的 scale 进行动画
    .to({ x: 350, y: 350, z: 350 }, 800) // 恢复到原始大小
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      // 渐隐 panoramaMesh
      if (panoramaMesh) {
        panoramaMesh.material.opacity -= 0.01; // 每帧减少透明度
      }
      if (ringMesh) {
        ringMesh.material.opacity -= 0.01;
      }
    })
    .onComplete(() => {
      currentScene = scene;
      currentCamera = camera;
      inVRMode.value = false;
      camera.position.set(0, 150, 60);
      // 释放 VR 场景资源
      if (panoramaMesh) {
        panoramaMesh.material.map.dispose();
        vrScene.remove(panoramaMesh); // 从场景中移除
        disposeScene(vrScene); // 释放资源
        panoramaMesh = null; // 重置引用
      }
      if (ringMesh) {
        vrScene.remove(ringMesh);
        ringMesh = null;
      }
    })
    .start();
};

const addRingMesh = () => {
  // 创建白色圆环
  const ringGeometry = new THREE.RingGeometry(1, 1.2, 64); // 内半径 0.8，外半径 1，分段数 64
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // 白色
    side: THREE.DoubleSide, // 双面渲染
    transparent: true, // 启用透明度
    opacity: 1 // 设置透明度
  });
  ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  // 获取人物的位置（假设 VR 相机位置接近人物）
  const personPosition = vrCamera.position.clone(); // 复制相机位置
  console.log('人物位置:', personPosition);

  // 将圆环添加到相机
  ringMesh.position.set(0, -10, 0); // 调整圆环在相机坐标系中的位置
  ringMesh.rotation.x = Math.PI / 2; // 旋转圆环使其水平
  panoramaMesh.add(ringMesh); // 添加到 VR 场景
};

const updateRingPosition = (pos = { x: 0, y: -10, z: 0 }) => {
  if (ringMesh) {
    ringMesh.position.copy(pos.x, pos.y, pos.z); // 直接更新坐标
    ringMesh.updateMatrix();
    console.log('圆环位置更新:', pos);
  }
};

const removeRingMesh = () => {
  if (ringMesh) {
    vrScene.remove(ringMesh);
  }
};

const debounceEnterVR = useDebounceFn(enterVRView, 300);
const debounceExitVR = useDebounceFn(exitVRView, 300);
const disposeScene = (scene) => {
  scene.traverse((object) => {
    if (object.isMesh) {
      if (object.geometry) {
        object.geometry.dispose(); // 释放几何体
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose()); // 释放材质数组
        } else {
          object.material.dispose(); // 释放单一材质
        }
      }
    }
  });
};

let isMouseDown = false;
let prevMouseX = 0,
  prevMouseY = 0;
let rotationX = 0,
  rotationY = 0;
const onVRMouseDown = (event) => {
  isMouseDown = true;
  prevMouseX = event.clientX;
  prevMouseY = event.clientY;
};
const onVRMouseUp = (event) => {
  isMouseDown = false;
  prevMouseX = 0;
  prevMouseY = 0;
};
const onVRMouseMove = (event) => {
  if (isMouseDown) {
    let deltaX = prevMouseX - event.clientX;
    let deltaY = prevMouseY - event.clientY;

    rotationX += deltaY * 0.005;
    rotationY += deltaX * 0.005;

    panoramaMesh.rotation.set(rotationX, rotationY, 0);

    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
  }
};

const resetVRParameters = () => {
  prevMouseX = 0;
  prevMouseY = 0;
  rotationX = 0;
  rotationY = 0;
};

const animate = () => {
  requestAnimationFrame(animate);
  tween?.update(); // 更新 Tween 动画
  fadeOutTween?.update();
  fadeInTween?.update();
  moveTween?.update();

  if (!renderer || !currentScene) return;

  if (composer && currentScene) {
    composer.render();
  }

  if (inVRMode.value) {
    renderer.render(currentScene, currentCamera);
  }

  labelRenderer?.render(currentScene, currentCamera);

  controls?.update();
};

const autoAdjustFontSize = useDebounceFn(() => {
  // 获取所有具有 module-item-3Dtext 类名的元素
  const targetDivs = document.getElementsByClassName('module-item');
  const testChars = 'Surface Analysis'; // 指定的字符

  // 选择第一个元素来计算最大字体大小
  const firstDiv = targetDivs[0];
  const maxWidth = firstDiv.offsetWidth;

  // 创建临时元素
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.whiteSpace = 'nowrap';
  tempDiv.style.fontWeight = '800';
  tempDiv.style.padding = '0 16px';
  tempDiv.style.fontSize = getComputedStyle(firstDiv).fontSize;
  tempDiv.textContent = testChars;
  document.body.appendChild(tempDiv);

  // 计算指定字符的宽度
  let textWidth = tempDiv.offsetWidth;
  document.body.removeChild(tempDiv);

  // 获取当前字体大小
  let fontSize = parseFloat(getComputedStyle(firstDiv).fontSize);

  // 如果字符宽度大于 div 宽度，缩小字体
  while (textWidth > maxWidth) {
    fontSize -= 1;

    // 重新计算字符宽度
    tempDiv.style.fontSize = `${fontSize}px`;
    textWidth = tempDiv.offsetWidth;
  }

  // 将计算得到的字体大小应用到其他元素
  const finalFontSize = `${fontSize}px`;
  for (let i = 1; i < targetDivs.length; i++) {
    targetDivs[i].style.fontSize = finalFontSize;
  }
}, 500);

const querySearch = (queryString, cb) => {
  let results = queryString ? restaurants.value.filter(createFilter(queryString)) : restaurants.value;
  // 调用 callback 返回建议列表的数据
  cb(results);
};
const createFilter = (queryString) => {
  return (item) => {
    return item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
  };
};

const keydown = (event) => {
  if (event.key === 'Escape' && store.moduleType == 'BASIC' && inVRMode.value) {
    exitVRView();
  }
};
onMounted(() => {
  initThree();
  bind();
});

const unbind = () => {
  window.removeEventListener('resize', resize);
  window.removeEventListener('wheel', onMouseWheel);
  const node = getNode();
  node.removeEventListener('mousedown', debouncedMouseDown);
  node.removeEventListener('mouseup', debouncedMouseUp);
  node.removeEventListener('mousemove', onDocumentMouseMove);
  document.removeEventListener('keydown', keydown);
};
// 释放资源
const disposeResources = () => {
  model?.traverse((node) => {
    if (node.isMesh) {
      node.geometry?.dispose();

      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((m) => m.dispose());
        } else {
          node.material.dispose();
        }
      }
    }
  });
  if (panoramaMesh && vrScene) {
    panoramaMesh.material.map.dispose();
    vrScene.remove(panoramaMesh); // 从场景中移除
    disposeScene(vrScene); // 释放资源
    panoramaMesh = null; // 重置引用
  }
  unbind();
  scene.remove(model);
  renderer.dispose();
  controls.dispose();
  store.moduleType = 'BASIC';
  store.dialogVisible = false;
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  vrScene?.remove(panoramaMesh);
  vrScene = null;
  panoramaMesh?.material?.dispose();
  panoramaMesh = null;
};

onUnmounted(() => {
  disposeResources();
});

// 页面刷新或导航前释放资源
window.addEventListener('beforeunload', () => {
  disposeResources();
});
</script>
<style lang="scss">
:root {
  --gradient-color: linear-gradient(
    90deg,
    #4c90cd 7.76%,
    #4677ba 21.59%,
    #415da8 39.1%,
    #3d4b9b 56.61%,
    #3a4093 75.96%,
    #3a3d91 97.16%,
    #3a3d91 99.93%
  );
}
.surface-areaLabel {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Montserrat, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  width: 52px;
  height: 32px;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  border-radius: 4px;
  text-transform: capitalize;
  background: rgba(255, 255, 255, 0.8); /* 白色半透明背景 */
  color: #11191e;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 模糊阴影 */
}
.autocomplete-suggestions {
  background: #edf4ff !important;
  box-shadow: 0px 0px 11px 0px #009cffb2 !important;
}
.el-autocomplete-suggestion li {
  color: #000235;
}
.el-popper__arrow:before {
  border: 0 !important;
  background: #edf4ff !important;
}
</style>
<style lang="scss" scoped>
.unselect {
  background: url('@/assets/Rectangle.png') no-repeat;
}

.select {
  background: url('@/assets/Rectangle1.png') no-repeat;
}

.click {
  background: #4c90cd;
  color: #000;
}

.unclick {
  background: #e0e0e0;
  color: #fff;
}

.index {
  display: flex;
  width: 100%;
  height: 100%;
  background: url('@/assets/bg.png') no-repeat;
  background-size: 100% 100%;
  padding: 118px 48px 0 48px;
  overflow: hidden;
  box-sizing: border-box;
  font-family: 'Montserrat', Arial, sans-serif;
  position: absolute;

  .compass {
    width: 64px;
    height: 64px;
    position: absolute;
    z-index: 10;
    right: 516px;
    top: 256px;
    background: url('@/assets/NorthCompass.svg') no-repeat;
    background-size: 100% 100%;
  }

  .back {
    position: absolute;
    z-index: 11;
    background-color: #0099ff;
    color: #fff;
    border-radius: 10px;
    padding: 0.5rem;
    right: 1rem;
    top: 1rem;
    cursor: pointer;
    width: 120;
    height: 48;
    padding-right: 24px;
    padding-left: 24px;
    gap: 8px;
  }

  .search {
    position: absolute;
    left: 10%;
    top: -3.5rem;
    max-width: 880px;
    width: 80%;
    padding: 0;
    margin: 0;
    height: 60px;
    display: flex;
    border: none;
    background-color: transparent;

    &:hover {
      box-shadow: none;
    }

    &-input {
      flex: 3;
      display: flex;
      align-items: center;
      justify-content: center;

      &-text {
        width: 98%;

        input {
          height: 80%;
          width: 80%;
          background: #9cadde;
          outline: none;
          border: none;
          margin-left: 1%;
          font-size: 20px;
          color: #fff;
          font-weight: 500;
          letter-spacing: 3px;
        }
      }
    }

    &-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &-text {
        width: 80%;
        height: 56px;

        background: url('/assets/Search.png') no-repeat;
        background-size: 100% 100%;
      }
    }
  }

  .module {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: 8px;
    max-width: 880px;
    width: 80%;
    height: 40px;
    display: flex;
    gap: 1rem;

    &-item {
      flex: 1;
      cursor: pointer;

      &-3Dtext {
        width: 100%;
        height: 40px;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-weight: 800;
        font-size: 16px;
        color: #fff;
        background-size: 100% 100%;
      }
    }
  }

  .left {
    /* 左边区域占 25% */
    width: 20rem;
    /* 最大宽度 */
    max-height: 100%;
    height: calc(100vh - 118px);
    padding: 0 0 56px 0;
    gap: 0px;
    border: 1px 0px 0px 0px;
    opacity: 0px;
  }

  .right {
    width: 20rem;
    background: url('@/assets/bg-right.png') no-repeat;
    box-shadow:
      -10px 0px 40px rgba(211, 219, 224, 0.4),
      inset 0px 0px 24px rgba(0, 153, 255, 0.05);
    backdrop-filter: blur(5.25px);
    background-size: 100% 100%;
    /* Note: backdrop-filter has minimal browser support */
    border-radius: 8px;
  }

  .right,
  .basic-info,
  .sensors-info,
  .surface,
  .sensors-details,
  .floor-info {
    width: 20rem;
    /* 右边区域占 25% */
    /* 最大宽度 */
    height: calc(100vh - 174px);
    padding: 0 0 0 8px;
    display: flex;
    flex-direction: column;
  }

  .main-center {
    flex: 1;
    /* 中间区域占据剩余空间 */
    height: 100%;
    position: relative;

    .three-container {
      position: absolute;
      width: 100%;
      height: 100%;
      user-select: none;

      .exit-vr-node {
        position: absolute;
        z-index: 10;
        background: #fff;
        display: none;
        font-weight: bold;
        top: 20px;
        right: 20px;
        padding: 4px 8px;
        border-radius: 4px;
        color: #000;
        cursor: pointer;
      }

      .exit-vr-node-show {
        display: block;
      }
    }

    .dragElem {
      cursor: grab;
    }

    .progress-bar {
      position: absolute;
      width: 80%;
      top: 50%;
      left: 50%;
      display: flex;
      flex-direction: column;
      transform: translate(-50%, -50%);
    }

    .progress-bar-inner-node {
      width: 100%;
      height: 36px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      background: linear-gradient(327.58deg, rgba(17, 25, 30, 0.1) 20.89%, rgba(17, 25, 30, 0.05) 76.72%);
      border: 1px solid;
      border-image-source: linear-gradient(140.81deg, rgba(17, 25, 30, 0.05) 22.51%, #ffffff 106.87%);
      box-shadow: 0 0 15px ffffff66;
    }

    .progress-bar-inner {
      height: 8px;
      width: 0%;
      background: #0099ff;
      border-radius: 8px;
      box-shadow: 0 0 10px #0099ff;
      transition: width 0.3s ease;
      /* 平滑过渡 */
    }

    .progress-bar-info {
      transform: translate(0, -4px);
      gap: 8px;
    }

    .progress-bar-text {
      font-size: 14px;
      font-weight: 600;
      line-height: 16px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      // animation: textEffect 3s infinite ease-in-out; /* 动态效果 */
    }

    @keyframes textEffect {
      0% {
        opacity: 0;
        transform: translateX(-10px);
      }
      50% {
        opacity: 1;
        transform: translateX(0);
      }
      100% {
        opacity: 0;
        transform: translateX(10px);
      }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #0099ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }

  .bottom {
    position: absolute;
    bottom: 5%;
    left: 50%;
    margin-left: -30%;
    width: 60%;
    height: 350px;
  }

  .timer {
    position: absolute;
    z-index: 10;
    right: 64px;
    top: 74px;
    width: 320px;
    height: 24px;
  }

  .floor-stratification {
    position: absolute;
    right: 500px;
    bottom: 148px;
    width: 132px;
    min-height: 200px;
    background: #e1e1e1;
    border-radius: 10px;
    display: flex;
    flex-direction: column;

    &-item {
      min-height: 100px;
      padding: 20px;

      &-title {
        font-size: 16px;
        font-weight: 700;
        color: #4c90cd;
      }
    }
  }

  .switching {
    width: 200px;
    height: 32px;
    position: absolute;
    bottom: 10%;
    left: 50%;
    margin-left: -100px;
    cursor: pointer;

    &-left {
      width: 50%;
      height: 100%;
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;

      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      float: left;
    }

    &-right {
      width: 50%;
      height: 100%;
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      float: left;
    }
  }

  :deep(.el-dialog__title) {
    font-weight: 600;
  }

  :deep(.el-dialog__header) {
    height: 50px;
  }

  :deep(.el-dialog__body) {
    text-align: center;

    img {
      width: auto;
      height: 500px;
      margin: 0 auto;
      object-fit: cover;
    }
  }

  :deep(.el-carousel) {
    height: 550px;

    .el-carousel__container {
      height: 100%;
    }
  }
}
:deep(.search-input-text .el-input__wrapper) {
  background: #9cadde;
}
:deep(.search-input-text .el-input__inner) {
  height: 44px;
  color: #fff;
}
</style>
