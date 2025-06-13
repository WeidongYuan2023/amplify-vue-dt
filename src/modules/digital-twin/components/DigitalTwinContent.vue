<template>
  <div class="index">
    <div class="layout-container">
      <div class="layout-left">
        <LeftPanel @on-click="handleNodeClickView" @on-hide="floorHide1" @on-hide1="floorHide2" @on-hide2="floorHide3"
          @on-show="floorShow" />
      </div>
      <div class="layout-middle">
        <div class="middle-top">
          <SearchBar @search="handleSearch" />
        </div>
        <div class="middle-center">
          <ThreeScene ref="threeScene" :model-path="modelPath" @model-loaded="handleModelLoaded" @error="handleError" />
          <div class="compass"></div>
        </div>
        <div class="middle-bottom">
          <ModuleSelector :current-module="currentModule" @module-change="handleModuleChange" />
        </div>
      </div>
      <div class="layout-right">
        <RightContent :current-module="currentModule" />
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

    <el-dialog v-model="dialogVisibleRobot" title="" width="900">
      <img style="width: 60%; height:60%" src="/assets/gaussian-task-report.png" alt />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ThreeScene from './three/core/ThreeScene.vue';
import ModuleSelector from './three/ui/ModuleSelector.vue';
import SearchBar from './three/ui/SearchBar.vue';
import TimeDisplay from './three/features/time-display/TimeDisplay.vue';
import LeftPanel from './three/features/left-panel/LeftPanel.vue';
import RightContent from './three/features/right-panel/index.vue';
import { useVisualizationStore } from '../store/visualization';

const store = useVisualizationStore();
const threeScene = ref(null);
const currentModule = ref(0);
const dialogVisible = ref(false);
const dialogVisibleRobot = ref(false);
const carouselKey = ref(0);
const areaImagePaths = ref([]);
const modelPath = ref('/irvine-office.glb');

const handleModelLoaded = (model) => {
  // Handle model loaded event
  console.log(model);
};

const handleError = (error) => {
  // Handle error event
};

const handleModuleChange = (index) => {
  currentModule.value = index;
  console.log('Current Module:', index);
  store.setModuleIndex(index);
  threeScene.value?.triggerModule(index);
  if (threeScene.value?.controls) {
    threeScene.value.controls.target.set(0, 0, 0);
  }
};

const handleSearch = (searchText) => {
  // Implement search functionality
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

onMounted(() => {
  // Initialize any necessary data or setup
});
</script>

<style scoped>
.index {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 80px 65px 8px 65px;
  overflow: hidden;
  background: url("/assets/bg.png") no-repeat;
  background-size: 100% 100%;
}

/* 整体布局容器 */
.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 左侧区域 - 占2份 */
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

/* 中间区域 - 占6份 */
.layout-middle {
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 右侧区域 - 占2份 */
.layout-right {
  width: 20%;
  height: 100%;
  padding: 10px;
  padding-top: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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