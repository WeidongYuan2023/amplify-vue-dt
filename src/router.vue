<template>
  <div class="p-2 building-tag">
    <el-tag type="primary" @click="open">Extranet model site</el-tag>
    <el-tag type="success" @click="trigger">Foxx 3D</el-tag>
  </div>
</template>

<script lang="ts" setup>
const url = 'https://ec2-3-238-162-71.compute-1.amazonaws.com:9004';
const open = () => {
  window.open(url, '_blank', 'noopener');
};

const apiBaseUrl = import.meta.env.VITE_APP_CONTEXT_PATH;

const trigger = () => {
  const padding = apiBaseUrl === '/' ? '' : apiBaseUrl;
  window.open(`${window.location.origin}${padding}/3D/model`, '_blank', 'noopener');
};
</script>

<style scoped lang="scss">
.building-tag {
  display: flex;
  gap: 8px;
  cursor: pointer;
}
</style>
