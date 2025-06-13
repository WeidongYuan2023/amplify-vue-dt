<template>
  <div class="digital-twin-view">
    <MainNav />
    <DigitalTwinContent />
  </div>
</template>

<script setup lang="ts">
import DigitalTwinContent from './components/DigitalTwinContent.vue';
import MainNav from '../../components/MainNav.vue';
</script>

<style scoped>
.digital-twin-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
</style> 