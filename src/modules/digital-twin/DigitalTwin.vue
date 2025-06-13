<template>
  <div class="index">
    <div class="header">
    </div>
    <div class="layout-container">
      <div class="layout-left">
        <LeftPanel 
          @on-click="handleNodeClickView" 
          @on-hide="floorHide1" 
          @on-hide1="floorHide2" 
          @on-hide2="floorHide3"
          @on-show="floorShow" 
        />
      </div>
      <div class="layout-middle">
        <div class="middle-top">
          <SearchBar @search="handleSearch" />
        </div>
        <div class="middle-center">
          <ThreeScene 
            ref="threeScene"
            :modelPath="modelPath" 
            @modelLoaded="handleModelLoaded"
            @error="handleError" 
          />
          <div class="compass"></div>
        </div>
        <div class="middle-bottom">
          <ModuleSelector 
            :currentModule="currentModule" 
            @moduleChange="handleModuleChange" 
          />
        </div>
      </div>
      <div class="layout-right">
        <RightContent :currentModule="currentModule" />
      </div>
    </div>

    <div class="timer">
      <TimeDisplay />
    </div>

    <el-dialog v-model="dialogVisible" title="View gallery" width="800">
      <el-carousel :key="carouselKey" :interval="0" arrow="always">
        <el-carousel-item v-for="(img, index) in areaImagePaths" :key="index">
          <img :src="'/assets/basic-info/' + img + '.jpg'" class="imgshow" alt="Gallery Image">
        </el-carousel-item>
      </el-carousel>
    </el-dialog>

    <el-dialog v-model="dialogVisibleRobot" title width="900">
      <img style="width: 60%; height:60%" src="/assets/gaussian-task-report.png" alt />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ThreeScene from './components/three/core/ThreeScene.vue';
import LeftPanel from './components/three/features/left-panel/LeftPanel.vue';
import ModuleSelector from './components/three/ui/ModuleSelector.vue';
import SearchBar from './components/three/ui/SearchBar.vue';
import TimeDisplay from './components/three/features/time-display/TimeDisplay.vue';
import RightContent from './components/three/features/right-panel/index.vue';
import { useVisualizationStore } from '@/store/modules/visualization';

const visualStore = useVisualizationStore();
const threeScene = ref(null);
const modelPath = ref('/irvine-office.glb');
const currentModule = ref(0);
const dialogVisible = computed({
  get: () => visualStore.dialogVisible,
  set: (val) => visualStore.dialogVisible = val
});
const dialogVisibleRobot = computed({
  get: () => visualStore.dialogVisibleRobot,
  set: (val) => visualStore.dialogVisibleRobot = val
});
const carouselKey = computed(() => visualStore.carouselKey);
const areaImagePaths = computed(() => visualStore.areaImagePaths);

const handleModelLoaded = (model) => {
  console.log('Model loaded successfully', model);
};

const handleError = (error) => {
  console.error('Error loading model:', error);
};

const handleSearch = (searchText) => {
  // Implement search functionality
  console.log('Search for:', searchText);
};

const handleNodeClickView = () => {
  // Handle node click view
};

const floorHide1 = () => {
  // Handle floor hide 1
};

const floorHide2 = () => {
  // Handle floor hide 2
};

const floorHide3 = () => {
  // Handle floor hide 3
};

const floorShow = () => {
  // Handle floor show
};

const handleModuleChange = (index) => {
  currentModule.value = index;
  visualStore.setModuleIndex(index);
  console.log('Module changed to:', index);
  
  // 触发模型的模块切换
  if (threeScene.value) {
    threeScene.value.triggerModule(index);
  }
};

onMounted(() => {
  // Initialize any necessary data or setup
});
</script>

<style scoped>
.index {
  position: relative;
  width: 100%;
  height: 100vh;
  padding: 80px 65px 8px 65px;
  overflow: hidden;
  background: url('/assets/bg.png') no-repeat;
  background-size: 100% 100%;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: url('/assets/leftBg.png') no-repeat;
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.logo-area {
  color: white;
  font-size: 28px;
  font-weight: bold;
}

/* 整体布局容器 */
.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 左侧区域 */
.layout-left {
  width: 20%;
  height: 100%;
  padding: 10px;
  padding-top: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 中间区域 */
.layout-middle {
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 右侧区域 */
.layout-right {
  width: 20%;
  height: 100%;
  padding: 10px;
  padding-top: 60px;
  box-sizing: border-box;
}

/* 中间区域的上部分 */
.middle-top {
  height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 中间区域的中间部分 */
.middle-center {
  flex: 1;
  position: relative;
  width: 100%;
}

/* 中间区域的下部分 */
.middle-bottom {
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 2;
  width: 50px;
  height: 50px;
  background: url('/assets/NorthCompass.svg') no-repeat center;
  background-size: contain;
}

.timer {
  position: fixed;
  top: 80px;
  right: 65px;
  z-index: 2;
}

.imgshow {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style> 