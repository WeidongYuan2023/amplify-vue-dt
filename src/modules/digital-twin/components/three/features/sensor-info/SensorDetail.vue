<template>
  <div class="page-sensors-details">
    <div class="page-sensors-details-title">
      Sensors Info
      <div class="border"></div>
    </div>
    <div class="page-sensors-details-content">
      <div class="page-sensors-details-content-item">
        <img src="/assets/Sensor01.png" alt="">
      </div>
      <div class="page-sensors-details-content-item">
        <img src="/assets/Sensor01.png" alt="">
      </div>
      <div class="page-sensors-details-content-item">
        <img src="/assets/Sensor01.png" alt="">
      </div>
      <div class="page-sensors-details-content-item">
        <img src="/assets/Sensor01.png" alt="">
      </div>
      <div class="page-sensors-details-content-item">
        <img src="/assets/Sensor01.png" alt="">
      </div>
      <div class="page-sensors-details-content-item">
        <div class="back-btn" @click="handleClick"></div>
      </div>
    </div>
  </div>
</template>
    
<script setup>
import { ref, onMounted } from "vue";
import { mainStore } from "@/store/store";
let store = mainStore();

const handleClick = () => {
  store.moduleIndex = 2
};

onMounted(() => {});
</script>

<style scoped>
.page-sensors-details {
  width: 100%;
  height: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
}

.page-sensors-details-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.page-sensors-details-title .border {
  position: absolute;
  bottom: 23%;
  left: 0%;
  height: 1px;
  width: 25%;
  background: #3f3f8c;
}

.page-sensors-details-content {
  flex: 12;
  display: flex;
  flex-direction: column;
}

.page-sensors-details-content-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.page-sensors-details-content-item img {
  width: 100%;
  height: 100%;
}

.page-sensors-details-content-item .back-btn {
  width: 96px;
  height: 32px;
  background: url("/assets/backBtn.png");
  background-size: 100% 100%;
  cursor: pointer;
}
</style> 