<template>
  <div id="panorama-container-3D" ref="panoramaContainer" class="panorama-container">
    <div v-if="loading" class="loading-overlay">
      <p>Loading the panorama...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';

// 使用 Vue 的 ref 来引用 DOM 元素
const panoramaContainer = ref(null);
const loading = ref(true);
let renderer = null;
let scene = null;
let camera = null;
let sphere = null;
const props = defineProps({
  width: {
    type: String,
    default: '0'
  },
  height: {
    type: String,
    default: '1'
  },
  path: {
    type: String,
    default: ''
  }
});

// 鼠标拖动交互控制
let isMouseDown = false;
let prevMouseX = 0,
  prevMouseY = 0;
let rotationX = 0,
  rotationY = 0;
const onMouseDown = (event) => {
  isMouseDown = true;
  prevMouseX = event.clientX;
  prevMouseY = event.clientY;
};
const onMouseUp = (event) => {
  isMouseDown = false;
  prevMouseX = 0;
  prevMouseY = 0;
};
const onMouseMove = (event) => {
  if (isMouseDown) {
    let deltaX = prevMouseX - event.clientX;
    let deltaY = prevMouseY - event.clientY;

    rotationX += deltaY * 0.005;
    rotationY += deltaX * 0.005;

    sphere.rotation.set(rotationX, rotationY, 0);

    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
  }
};
const onResize = () => {
  renderer.setSize(Number(props.width), Number(props.height));
  camera.aspect = Number(props.width) / Number(props.height);
  camera.updateProjectionMatrix();
};

// 初始化 Three.js 场景、相机、渲染器
const initScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, Number(props.width) / Number(props.height), 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(Number(props.width), Number(props.height));
  panoramaContainer.value.appendChild(renderer.domElement);
  const node = document.getElementById('panorama-container-3D');

  // 创建球体并加载全景图纹理
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1); // 球体反转，将全景图像显示在内侧
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(props.path, () => {
    // 完成加载后更新 loading 状态
    loading.value = false;
  });
  const material = new THREE.MeshBasicMaterial({ map: texture });
  sphere = new THREE.Mesh(geometry, material);

  // 将球体添加到场景中
  scene.add(sphere);

  // 相机放置在球体中心
  camera.position.set(0, 0, 0.1);

  // 鼠标按下事件
  node.addEventListener('mousedown', onMouseDown);

  // 鼠标移动事件
  node.addEventListener('mousemove', onMouseMove);

  // 鼠标松开事件
  node.addEventListener('mouseup', onMouseUp);

  // 窗口尺寸变化时更新
  window.addEventListener('resize', onResize);

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    renderer?.render(scene, camera);
  };
  animate();
};

// Vue 生命周期钩子
onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  const node = document.getElementById('panorama-container-3D');

  // 清理 Three.js 渲染器
  if (renderer) {
    renderer.dispose();
  }
  scene.remove(sphere);
  scene = null;
  camera = null;
  renderer = null;
  node.removeEventListener('mousedown', onMouseDown);
  node.removeEventListener('mousemove', onMouseMove);
  node.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('resize', onResize);
});

const updateTexture = (newPath) => {
  loading.value = true;
  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(newPath, (newTexture) => {
    sphere.material.map = newTexture;
    sphere.material.needsUpdate = true;
    loading.value = false;
  });
};

defineExpose({ updateTexture });
</script>

<style scoped>
.panorama-container {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  position: relative;
}
/* 加载中样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d3dbe0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  line-height: 22px;
  font-weight: bold;
  color: #11191e;
}
</style>
