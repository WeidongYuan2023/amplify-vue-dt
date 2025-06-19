<template>
  <div class="app-container">
    <div class="main-section">
      <TheHeader class="header" />

      <main class="main-content">
        <!-- <keep-alive>
          <component :is="model.mode === 'vr' ? VRScene : ThreeSceneVue" :key="model.mode" class="view-component"
            :model-path="model.mode === 'model' ? modelPath : undefined" />
        </keep-alive> -->
        <ThreeSceneVue :model-path="modelPath" />
        <!-- <WeatherCard
            :temperature="24"
            weather-text="Thin Rain"
            weather-type="rainy"
            position='bottom-left'
          /> -->
      </main>
    </div>

    <AIAgent class="ai-section" :style="{ width: aiSectionWidth + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import VRScene from '@/components/three/VRScene.vue'
import ThreeSceneVue from '@/components/three/ThreeScene.vue'
import AIAgent from '@/components/ai/AIAgent.vue'
import TheHeader from '@/components/ui/TheHeader.vue'
import { modelStore } from '@/store/index';
const model = modelStore();
const modelPath = ref('irvine-office.glb');

const aiSectionWidth = ref(window.innerWidth / 4)

const updateAIWidth = () => {
  aiSectionWidth.value = window.innerWidth / 4
}

onMounted(() => {
  window.addEventListener('resize', updateAIWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateAIWidth)
})

// 监听模式变化，触发视图更新
watch(() => model.mode, (newMode) => {
  console.log('视图模式切换为:', newMode)
  // 这里可以添加模式切换时的过渡效果
})
</script>

<style>
body {
  overflow: hidden;
}

.app-container {
  display: flex;
  height: 100vh;
  background: #000;
  min-width: 800px;
  user-select: none;
}

.main-section {
  position: relative;
  width: 75%;
  display: grid;
  /* grid-template-rows: 60px 1fr; */
  min-width: 600px;
  height: 100vh;
  overflow: hidden;
}

.ai-section {
  width: 25%;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s ease;
  /* 添加过渡效果使宽度变化更平滑 */
}

.main-content {
  /* position: relative; */
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #add8e6;
}

.view-component {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease;
}

.weather {
  display: flex;
  align-items: center;
  gap: 10px;
}

.weather-icon {
  font-size: 20px;
}
</style>