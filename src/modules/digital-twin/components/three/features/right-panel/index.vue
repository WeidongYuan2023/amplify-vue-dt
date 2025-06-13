<template>
    <div class="module-content">
      <!-- 右侧面板 -->
      <div class="right" v-if="currentModule === 99">
        <RightPanelTop />
        <RightPanelMiddle />
        <RightPanelBottom />
      </div>
  
      <!-- 基本信息 -->
      <div class="basic-info h-full" v-if="currentModule === 0">
        <BuildingInfo />
      </div>
  
      <!-- 楼层信息 -->
      <div class="floor-info" v-if="currentModule === 88">
        <FloorInfo />
        <FloorDetail />
      </div>
  
      <!-- 传感器信息 -->
      <div class="sensors-info h-full" v-if="currentModule === 2">
        <SensorInfo />
      </div>
  
      <!-- 机器人信息 -->
      <div class="robots-info h-full" v-if="currentModule === 3">
        <RobotInfo />
      </div>
  
      <!-- 机器人详情 -->
      <div class="robots-info" v-if="currentModule === 66">
        <RobotDetail />
      </div>
  
      <!-- 传感器详情 -->
      <div class="sensors-details" v-if="currentModule === 77">
        <SensorDetail />
      </div>
  
      <!-- 表面分析 -->
      <div class="surface h-full" v-if="currentModule === 1">
        <SurfaceDetail />
      </div>
    </div>
  </template>
  
  <script setup>
  import RightPanelTop from './RightPanelTop.vue';
  import RightPanelMiddle from './RightPanelMiddle.vue';
  import RightPanelBottom from './RightPanelBottom.vue';
  import BuildingInfo from '../basic-info/BuildingInfo.vue';
  import FloorInfo from '../floor-info/FloorInfo.vue';
  import FloorDetail from '../floor-info/FloorDetail.vue';
  import SurfaceDetail from '../surface-analysis/SurfaceDetail.vue';
  import SensorInfo from '../sensor-info/SensorInfo.vue';
  import SensorDetail from '../sensor-info/SensorDetail.vue';
  import RobotInfo from '../robot-info/RobotInfo.vue';
  import RobotDetail from '../robot-info/RobotDetail.vue';
  
  // 接收当前模块作为属性
  const props = defineProps({
    currentModule: {
      type: Number,
      required: true
    }
  });
  </script>
  
  <style scoped>
  .module-content {
    position: relative;
    height: 100%;
  }

  .h-full {
    height: 100%;
  }
  
  .right {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }
  </style> 