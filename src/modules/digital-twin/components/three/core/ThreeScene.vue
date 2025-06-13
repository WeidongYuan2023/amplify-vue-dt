<template>
  <div class="three-container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
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
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import gsap from 'gsap';
import { mainStore } from '@/store/store';
let store = mainStore();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const selectedObjects = [];
let outlinePass = null;

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
  scene.background = new THREE.Color(0xdddddd);

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth /container.value.clientHeight, 0.1, 1000);
  camera.position.set(0, 150, 60);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Label renderer setup
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  container.value.appendChild(labelRenderer.domElement);

  // Controls setup
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Post-processing setup
  const renderPass = new RenderPass(scene, camera);
  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);

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

const createImg = url => {
    let texture = new THREE.TextureLoader().load(url);
    texture.colorSpace = THREE.SRGBColorSpace;

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
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  dracoLoader.setDecoderConfig({ type: 'js' });
  dracoLoader.preload();

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  
  // Use a fallback model if the provided model path isn't available
  const modelToLoad = props.modelPath || '/models/floor.glb';
  
  console.log('Loading model from:', modelToLoad);

  gltfLoader.load(
    modelToLoad,
    (gltf) => {
      model = gltf.scene;
      model.scale.set(10, 10, 10);
      scene.add(model);
      emit('modelLoaded', model);
      triggerModule(0);
      animate();
      dracoLoader.dispose();
      document.addEventListener("click", onPointerDown);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('Error loading model:', error);
      emit('error', error);
      
      // Add fallback visual for development
      const geometry = new THREE.BoxGeometry(50, 50, 50);
      const material = new THREE.MeshStandardMaterial({ color: 0x6666ff, wireframe: true });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      // Add grid for reference
      const gridHelper = new THREE.GridHelper(200, 20);
      scene.add(gridHelper);
      
      animate();
      dracoLoader.dispose();
    }
  );
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  controls.update();
  composer.render();
  labelRenderer.render(scene, camera);
};

const handleResize = () => {
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight);
  composer.setSize(container.value.clientWidth, container.value.clientHeight);
};

onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  window.removeEventListener('resize', handleResize);
  textureCache.forEach(texture => {
    texture.dispose();
  });
  textureCache.clear();
  
  // 清理所有标记
  Object.values(areaMarkers).forEach(marker => {
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
  
  scene.traverse((object) => {
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

  if(labelRenderer) {
    labelRenderer.dispose();
  }
  
  renderer.dispose();
  composer.dispose();
});

watch(() => store.currentArea, (currentArea) => {
  console.log('currentArea:', currentArea);
  handleAreaView(currentArea.label);
})

const handleAreaView = (name) => {
    let mesh = scene.getObjectByName(name);

    if(!mesh) return;

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

function onPointerDown(event) {
    // 计算鼠标位置的标准化设备坐标
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(pointer, camera);

    // 计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // 获取第一个相交的对象
        const object = intersects[0].object;
        
        // 如果相交的对象有名字（通常在模型中定义），则打印出来
        if (object.name) {
            console.log('Clicked on:', object.name);
            addSelectedObject(object);
            // 可以在这里添加你的交互逻辑
        }
    }
}

const areaMarkers = {};
const triggerModule = index => {
  console.log('Triggering module:', index);
  
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
      if (controls) {
        controls.enableRotate = pos.enableControls;
        controls.enableZoom = pos.enableControls;
      }
    }
  });

  // 先清理之前存储的所有标记
  Object.values(areaMarkers).forEach(marker => {
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
  
  // 如果模型加载完成，添加不同的模块标记
  if (model) {
    // 清除所有区域上的标记
    model.traverse(child => {
      // 根据当前模式添加相应标记
      const areaNum = child.name?.replace("Area", "");
      // 检查 areaNum 是否在有效范围内
      if (areaNum && child.name && child.name.startsWith("Area")) {
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
        
        if (index === 0) {
          // 模式0: 添加选择图标
          const areaText = createImg("/assets/ViewSelection.svg");
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
          const sensorIcon = createImg(`/assets/tempreture${areaNum === "6" ? "" : areaNum}.svg`);
          sensorIcon.scale.set(0.03, 0.04, 0.04);
          sensorIcon.position.set(0, 0.01, 0);
          sensorIcon.name = `area-${areaNum}`;
          child.add(sensorIcon);
          areaMarkers[`sensorsIcon${areaNum === "6" ? "" : areaNum}`] = sensorIcon;
        }
        else if (index === 3 && ["6", "13"].includes(areaNum)) {
          // 模式3: 添加机器人图标到特定区域
          const robotIcon = createImg("/assets/robotImg.png");
          robotIcon.scale.set(0.05, 0.05, 0.05);
          robotIcon.position.set(areaNum === "13" ? 0.01 : 0, 0.01, areaNum === "13" ? 0.04 : 0);
          robotIcon.name = `area-${areaNum}`;
          child.add(robotIcon);
          areaMarkers[`robotIcon${areaNum}`] = robotIcon;
        }
      }
    });
  }
};

defineExpose({
  scene,
  camera,
  controls,
  model,
  triggerModule
});
</script>

<style>
.areaLabel {
    width: 60px !important;
    height: 30px !important;
    background: #262626 !important;
    color: #fff !important;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    font-size: 12px;
}
</style>

<style scoped>
.three-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style> 