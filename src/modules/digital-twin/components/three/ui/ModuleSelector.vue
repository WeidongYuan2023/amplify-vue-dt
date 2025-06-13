<template>
  <div class="module">
    <div 
      v-for="(item, index) in modules" 
      :key="index" 
      class="module-item"
      @click="handleClick(index)"
    >
      <div 
        class="module-item-text"
        :class="{ 
          select: currentModule === index, 
          unselect: currentModule !== index 
        }"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  currentModule: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['moduleChange']);

const modules = ref([
  { name: 'Basic Info' },
  { name: 'Surface Analysis' },
  { name: 'Monitoring' },
  { name: 'Cleaning Robots' }
]);

const handleClick = (index) => {
  emit('moduleChange', index);
};
</script>

<style scoped>
.module {
  position: absolute;
  bottom: 8px;
  height: 60px;
  margin: auto;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 2;
}

.module-item {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.module-item-text {
  font-size: 18px;
  color: white;
  line-height: 3rem;
  height: 3rem;
  font-weight: 700;
  transition: all 0.3s ease;
  padding: 0 32px;
}

.select {
  color: #4C90CD;
  background: url('/assets/Rectangle1.png') no-repeat;
  background-size: 100% 46px;
}

.unselect {
  background: url('/assets/Rectangle.png') no-repeat;
  background-size: 100% 46px;
}

.unselect:hover {
  color: #4C90CD;
}
</style> 