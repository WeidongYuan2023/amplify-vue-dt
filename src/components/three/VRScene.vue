<template>
  <div ref="container" class="vr-container"></div>
  <loadingComp v-if="showLoading" />
  <!-- VR 提示框 -->
  <VRTooltip v-for="(tooltip, index) in tooltipStates" :key="index" :show="tooltip.show" :content="tooltip.content"
    :detail="tooltip.detail" :style="tooltip.style" :index="index" @close="handleCloseTooltip" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { convertFromTopLeft } from '@/utils/coordinateConverter';
import { useVRScene } from '@/composables/useVRScene'
import { vrSceneConfig } from '@/config/vrSceneConfig'
import VRTooltip from '@/components/ui/VRTooltip.vue';
import loadingComp from '@/components/ui/Loading.vue';
import { modelStore } from '@/store/index';
const store = modelStore();
const container = ref<HTMLElement>()
// 定义全景图像尺寸
const panoramaSize = { width: 7380, height: 3668 };
const data = JSON.parse(JSON.stringify(vrSceneConfig));
const getData = () => {
  const convertedInfoPoints = data.infoPointList.map((item) => {
    const point3D = convertFromTopLeft({ x: item.x, y: item.y }, panoramaSize);

    return {
      ...item,
      x: point3D.x,
      y: point3D.y,
      z: point3D.z
    };
  })

  const convertedViewPoints = data.viewPointList.map((item) => {
    const point3D = convertFromTopLeft({ x: item.x, y: item.y }, panoramaSize);
    return {
      ...item,
      x: point3D.x,
      y: point3D.y,
      z: point3D.z
    };
  })

  const convertedHotspots = data.hotspotsList.map((item) => {
    const point3D = convertFromTopLeft({ x: item.x, y: item.y }, panoramaSize);
    console.log('point3D', point3D, { x: item.x, y: item.y });
    return {
      ...item,
      x: point3D.x,
      y: point3D.y,
      z: point3D.z
    };
  })

  data.infoPoints = convertedInfoPoints;
  data.viewPoints = convertedViewPoints;
  data.hotspots = convertedHotspots;
}
getData()

const { tooltipStates, tooltipState, handleCloseTooltip,
  isLoading, loadingProgress, pauseRendering, fadeOutScene,
  resumeRendering } = useVRScene(container, data)

const showLoading = computed(() => {
  return isLoading.value
})

// onMounted(() => {
//   if (store.mode === 'vr') {
//     resumeRendering()
//   }
// })
// // 监听模式变化，控制渲染循环
// watch(() => store.mode, (newMode) => {
//   if (newMode === 'vr') {
//     resumeRendering()
//   } else {
//     pauseRendering()
//   }
// }, { immediate: true })

defineExpose({
  fadeOutScene
});
</script>
<style scoped lang="scss">
.vr-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: white;
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 4px;
  max-width: 300px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  pointer-events: none;
  z-index: 50;
}
</style>

<style lang="scss">
.surface-areaLabel-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  transform-style: preserve-3d;

  .surface-areaLabel {
    background-color: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    font-size: 14px;
    font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
    text-align: center;
    min-width: 120px;
    max-width: 180px;
    height: 38px;
    position: relative;
    padding: 4px 12px;
    z-index: 20;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    font-weight: 500;
    line-height: 26px;
    backdrop-filter: blur(4px);
    
    // 添加活跃状态样式
    &.active-label {
      background-color: rgba(255, 255, 255, 0.5);
      color: #000000;
      border: 1px solid rgba(0, 0, 0, 0.3);
    }
  }

  .surface-areaLabel-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    z-index: 10;

    &.arrow-left {
      border-width: 6px 0 6px 6px;
      border-color: transparent transparent transparent rgba(0, 0, 0, 0.5);
      left: calc(100% - 1px);
      top: 50%;
      transform: translateY(-50%);
      
      &.active-arrow {
        border-color: transparent transparent transparent rgba(255, 255, 255, 0.5);
      }
    }

    &.arrow-right {
      border-width: 6px 6px 6px 0;
      border-color: transparent rgba(0, 0, 0, 0.5) transparent transparent;
      right: calc(100% - 1px);
      top: 50%;
      transform: translateY(-50%);
      
      &.active-arrow {
        border-color: transparent rgba(255, 255, 255, 0.5) transparent transparent;
      }
    }

    &.arrow-top {
      border-width: 0 6px 6px 6px;
      border-color: transparent transparent rgba(0, 0, 0, 0.5) transparent;
      bottom: calc(100% - 1px);
      left: 50%;
      transform: translateX(-50%);
      
      &.active-arrow {
        border-color: transparent transparent rgba(255, 255, 255, 0.5) transparent;
      }
    }

    &.arrow-bottom {
      border-width: 6px 6px 0 6px;
      border-color: rgba(0, 0, 0, 0.5) transparent transparent transparent;
      top: calc(100% - 1px);
      left: 50%;
      transform: translateX(-50%);
      
      &.active-arrow {
        border-color: rgba(255, 255, 255, 0.5) transparent transparent transparent;
      }
    }
  }
}
</style>