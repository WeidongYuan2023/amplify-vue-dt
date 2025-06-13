<template>
  <div v-if="show" class="vr-tooltip" :style="tooltipStyle">
    <div class="vr-tooltip-content">
      <button class="close-btn" @click="handleClose">×</button>
      <div class="tooltip-header">
        <h3>{{ detail.title || title }}</h3>
      </div>
      <div class="location-indicator">
        <SvgIcon name="navigation" />
        <span class="location-text pl-1">{{ detail.location || 'Copy Center · W · Level2 · Exhibit_#000' }}</span>
      </div>
      <div class="tooltip-image">
        <img :src="detail.image || imageUrl" alt="Detail Image">
      </div>
      <div class="tooltip-description">
        <p>{{ detail.description || content }}</p>
        <p v-if="detail.additionalInfo" class="additional-info">{{ detail.additionalInfo }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TooltipStyle } from '@/types';
import SvgIcon from '@/components/features/SvgIcon.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Panorama Information Point'
  },
  content: {
    type: String,
    default: 'This is an information point in a panoramic scene. You can click to view detailed information. Panoramic technology allows you to immerse yourself in a virtual environment and explore more exciting content.'
  },
  imageUrl: {
    type: String,
    default: 'https://img.freepik.com/free-photo/empty-modern-room-with-furniture_23-2149178879.jpg'
  },
  detail: {
    type: Object,
    default: () => ({
      title: 'Panorama Information Point',
      direction: 'forward',
      location: 'Copy Center · W · Level2 · Exhibit_#000',
      image: 'https://img.freepik.com/free-photo/empty-modern-room-with-furniture_23-2149178879.jpg',
      description: 'This is an information point in a panoramic scene. You can click to view detailed information. Panoramic technology allows you to immerse yourself in a virtual environment and explore more exciting content.',
      additionalInfo: 'The room is bathed in soft white lighting that highlights each piece, creating a serene atmosphere.'
    })
  },
  style: {
    type: Object as () => TooltipStyle,
    default: () => ({
      left: '0px',
      top: '0px'
    })
  },
  index: {
    type: Number,
    default: -1
  }
});

const emit = defineEmits(['close']);

// Calculate final style, merge default style with passed style
const tooltipStyle = computed(() => {
  return {
    position: 'absolute',
    zIndex: '1001',
    pointerEvents: 'auto',
    ...props.style
  };
});

// Handle close button click event
const handleClose = () => {
  emit('close', props.index);
};
</script>

<style lang="scss" scoped>
.linear-gradient {
  background: linear-gradient(90deg, #4C90CD 7.76%, #4677BA 21.59%, #415DA8 39.1%, #3D4B9B 56.61%, #3A4093 75.96%, #3A3D91 97.16%, #3A3D91 99.93%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.vr-tooltip {
  position: relative; 
  transform: translate(10px, -50%);
  word-break: break-word;
  max-width: 360px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  height: 600px;
  max-height: 90%;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
   z-index: 9999;
  align-self: stretch;
  background: var(--layout-White-Flat80, #FFFFFFCC);
  border: 1px solid var(--layout-bg_TextSelection, #FFFFFF);

  backdrop-filter: blur(20px) &-content {
    position: relative;
    background-color: rgba(255, 255, 255, 0.95);
    color: #333;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.tooltip-header {
  @extend .linear-gradient;
  height: 64px;
  width: 90%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-top: 24px;
  padding-right: 24px;
  padding-bottom: 16px;
  padding-left: 24px;

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    letter-spacing: 0.3px;
  }
}

.location-indicator {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(0deg, var(--layout-bg_Element, #FFFFFF), var(--layout-bg_Element, #FFFFFF)),
    linear-gradient(90deg, rgba(76, 144, 205, 0.08) 7.76%, rgba(70, 119, 186, 0.08) 21.59%, rgba(65, 93, 168, 0.08) 39.1%, rgba(61, 75, 155, 0.08) 56.61%, rgba(58, 64, 147, 0.08) 75.96%, rgba(58, 61, 145, 0.08) 97.16%, rgba(58, 61, 145, 0.08) 99.93%);
  margin: 16px;

  .location-dot {
    width: 12px;
    height: 12px;
    background-color: #2196f3;
    border-radius: 50%;
    margin-right: 8px;
    display: inline-block;
  }

  .location-text {
    font-size: 13px;
    color: #11191E;
    font-weight: 500;
  }
}

.tooltip-image {
  width: 100%;
  height: 276px;
  padding: 1rem 2rem;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0.2) 100%);
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.tooltip-description {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  padding: 1rem 2rem;
  color: #71797E;
  overflow-y: auto;
  max-height: 160px;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    background-color: transparent; /* 透明背景 */
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
    margin: 4px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2); /* 半透明灰色 */
    border-radius: 10px;
    border: 2px solid transparent; /* 创建内边距效果 */
    background-clip: content-box;
    min-height: 30px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.4); /* 悬停时加深 */
  }
  
  /* 滚动条在非滚动状态下隐藏 */
  &:not(:hover)::-webkit-scrollbar-thumb {
    background-color: transparent;
  }
  
  p {
    margin: 0 0 12px;
    letter-spacing: 0.2px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .additional-info {
    @extend .linear-gradient;
    font-style: italic;
    margin-top: 8px;
    font-size: 14px;
    line-height: 16px;
  }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #415DA8;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  line-height: 26px;
  text-align: center;
  border-radius: 50%;
  z-index: 100;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    transform: rotate(90deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .vr-tooltip {
    max-width: 320px;
  }

  .tooltip-header {
    padding: 14px 16px 10px;

    h3 {
      font-size: 16px;
    }
  }

  .tooltip-image {
    height: 180px;
  }

  .tooltip-description {
    font-size: 13px;
    padding: 14px 16px;
  }
}

/* Animation effects */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(10px, -50%) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translate(10px, -50%) scale(1);
  }
}

.vr-tooltip {
  animation: fadeIn 0.3s ease forwards;
}
</style>