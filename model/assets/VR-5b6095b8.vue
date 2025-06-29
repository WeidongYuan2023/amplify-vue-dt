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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { mainStore } from '@/store/model';
import eventBus from '@/utils/eventBus';

const emit = defineEmits(['updateCamera']);
const pananomas = ref([]);
const store = mainStore();
const getImages = () => {
  const pics = store.basicInfo.imagePaths;
  const keys = Object.keys(pics);
  const images = keys.map((d) => {
    return {
      src: store.getImg(`${store.rootPath}/${store.basicInfo.rootPath}/${pics[d]}.jpg`),
      id: d
    };
  });

  pananomas.value = images;
};

getImages();
// 使用 Vue 的 ref 来引用 DOM 元素
const panoramaContainer = ref(null);
const loading = ref(true);
const container = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let sphere = null;
let controls = null;
const props = defineProps({
  width: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    default: ''
  },
  basicNode: {
    type: String,
    default: ''
  }
});

const onResize = () => {
  const node = getNode();
  const width = props.width ? Number(props.width) : node.clientWidth;
  const height = props.height ? Number(props.height) : node.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
const onMouseWheel = (event) => {
  // 根据滚轮方向调整 fov
  const delta = event.deltaY; // 滚轮滚动量
  const fov = camera.fov; // 当前 fov

  // 调整 fov
  const newFov = fov + delta * 0.1; // 缩放速度
  camera.fov = THREE.MathUtils.clamp(newFov, 10, 120); // 限制 fov 范围

  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
};

// 初始化 Three.js 场景、相机、渲染器
const initScene = () => {
  const node = getNode();
  const width = props.width ? Number(props.width) : node.clientWidth;
  const height = props.height ? Number(props.height) : node.clientHeight;
  const src = store.getImg(props.path || pananomas.value[0].src);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0); // 设置背景为透明
  panoramaContainer.value.appendChild(renderer.domElement);

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 创建球体并加载全景图纹理
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1); // 球体反转，将全景图像显示在内侧
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(src, () => {
    // 完成加载后更新 loading 状态
    loading.value = false;
  });
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  sphere = new THREE.Mesh(geometry, material);

  // 将球体添加到场景中
  scene.add(sphere);

  // 相机放置在球体中心
  camera.position.set(0, 0, 0.1);

  bind();

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    renderer?.render(scene, camera);
    controls.update();
    if (camera) {
      emit('updateCamera', camera.position, camera.rotation);
    }
  };
  animate();
};

const bind = () => {
  // 窗口尺寸变化时更新
  window.addEventListener('resize', onResize);

  window.addEventListener('wheel', onMouseWheel);
  eventBus.on('updatePannellum', (path) => {
    updateTexture(path);
  });
};

const unbind = () => {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('wheel', onMouseWheel);
};

const getNode = () => {
  return document.querySelector(props.basicNode ? `.${props.basicNode}` : '#panorama-container-3D');
};

// Vue 生命周期钩子
onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  // 清理 Three.js 渲染器
  if (renderer) {
    renderer.dispose();
  }
  scene.remove(sphere);
  scene = null;
  camera = null;
  renderer = null;
  unbind();
});

const updateTexture = (newPath) => {
  const textureLoader = new THREE.TextureLoader();

  // 淡出当前纹理
  gsap.to(sphere.material, {
    opacity: 0, // 将透明度降到 0
    duration: 1, // 淡出持续时间
    ease: 'power2.inOut',
    onComplete: () => {
      // 加载新纹理
      textureLoader.load(newPath, (newTexture) => {
        // 释放旧纹理
        if (sphere.material.map) {
          sphere.material.map.dispose();
        }

        // 设置新纹理
        sphere.material.map = newTexture;
        sphere.material.needsUpdate = true;

        // 淡入新纹理
        gsap.to(sphere.material, {
          opacity: 1, // 将透明度升到 1
          duration: 1, // 淡入持续时间
          ease: 'power2.inOut',
          onComplete: () => {
            loading.value = false; // 加载完成
            console.log('Texture update complete');
          }
        });
      });
    }
  });
};

defineExpose({ updateTexture });
</script>

<style scoped>
#panorama-container-3D {
  border-radius: 15px;
}
.panorama-container {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  position: relative;
  cursor: grab;
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
