<template>
  <div class="weather-card" :class="positionClass">
    <i class="weather-icon">{{ weatherIcon }}</i>
    <div class="weather-info">
      <span class="temperature">{{ temperature }}°C</span>
      <span class="weather-text">{{ weatherText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  temperature: number
  weatherText: string
  weatherType?: 'sunny' | 'rainy' | 'cloudy',
  position?:'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const props = withDefaults(defineProps<Props>(), {
  weatherType: 'sunny'
})
const positionClass = computed(() => props.position)

const weatherIcon = computed<string>(() => {
  switch (props.weatherType) {
    case 'rainy': return '🌧️'
    case 'cloudy': return '☁️'
    default: return '☀️'
  }
})
</script>

<style scoped>
.weather-card {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  /* backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
  background-color: transparent;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  z-index: 100;
  height: 4.5rem;
}

.weather-icon {
  font-size: 24px;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.temperature {
  font-size: 16px;
  font-weight: bold;
}

.weather-text {
  font-size: 14px;
  opacity: 0.8;
}

.top-left {
  top: 20px;
  left: 20px;
}

.top-right {
  top: 20px;
  right: 20px;
}

.bottom-left {
  bottom: 20px;
  left: 20px;
}

.bottom-right {
  bottom: 20px;
  right: 20px;
}
</style>