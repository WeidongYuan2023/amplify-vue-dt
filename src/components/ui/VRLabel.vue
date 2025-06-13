<template>
    <div class="surface-areaLabel-container">
      <div class="surface-areaLabel">{{ text }}</div>
      <div :class="['surface-areaLabel-arrow', `arrow-${direction}`]"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import * as THREE from 'three';
  
  const props = defineProps({
    text: {
      type: String,
      required: true
    },
    direction: {
      type: String,
      default: 'right',
      validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    infoPoint: {
      type: Object,
      required: true
    },
    camera: {
      type: Object,
      required: true
    },
    sphereRadius: {
      type: Number,
      required: true
    }
  });
  
  const emit = defineEmits(['positionUpdated']);
  
  // 计算标签位置
  const calculateLabelPosition = () => {
    if (!props.infoPoint || !props.camera) return;
  
    // 获取信息点在屏幕上的位置
    const pointPosition = props.infoPoint.position.clone();
    const screenPosition = pointPosition.clone().project(props.camera);
  
    // 使用固定的屏幕空间偏移量，不受FOV影响
    const screenOffset = 0.05; // 在标准化设备坐标中的固定偏移
    
    // 计算标签在屏幕空间中的偏移方向
    let offsetX = 0;
    let offsetY = 0;
  
    switch (props.direction) {
      case 'top':
        offsetY = screenOffset;
        break;
      case 'bottom':
        offsetY = -screenOffset;
        break;
      case 'left':
        offsetX = -screenOffset;
        break;
      case 'right':
      default:
        offsetX = screenOffset;
        break;
    }
  
    // 在屏幕空间中应用偏移
    screenPosition.x += offsetX;
    screenPosition.y += offsetY;
  
    // 将屏幕坐标转回世界坐标
    screenPosition.unproject(props.camera);
  
    // 计算从相机到新位置的射线
    const dir = screenPosition.sub(props.camera.position).normalize();
  
    // 计算射线与球面的交点
    const distance = props.sphereRadius;
    const newPosition = props.camera.position.clone().add(dir.multiplyScalar(distance));
  
    // 发送位置更新事件
    emit('positionUpdated', newPosition);
  };
  
  // 监听相关属性变化，重新计算位置
  watch(() => [props.camera.position, props.camera.rotation, props.infoPoint.position], calculateLabelPosition, { deep: true });
  
  onMounted(() => {
    calculateLabelPosition();
  });
  </script>
  
  <style scoped>
  .surface-areaLabel-container {
    position: relative;
    pointer-events: none;
  }
  
  .surface-areaLabel {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .surface-areaLabel-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
  }
  
  .arrow-right {
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: rgba(255, 255, 255, 0.9);
  }
  
  .arrow-left {
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: rgba(255, 255, 255, 0.9);
  }
  
  .arrow-top {
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: rgba(255, 255, 255, 0.9);
  }
  
  .arrow-bottom {
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: rgba(255, 255, 255, 0.9);
  }
  </style>