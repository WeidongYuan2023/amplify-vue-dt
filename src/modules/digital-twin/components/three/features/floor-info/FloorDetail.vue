<template>
  <div class="page-detail">
    <div class="page-detail-title">
      Details
      <div class="border"></div>
    </div>
    <div class="page-detail-content" ref="detailContent">
      <div class="page-detail-content-item">
        <img src="/assets/cad.png" alt />
      </div>
      <div class="back-btn" @click="toBack"></div>
      <div class="more-btn"></div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from "vue";
import { mainStore } from "@/store/store";
let store = mainStore();
let detailContent = ref(null);

const toBack = () => {
  store.moduleIndex = 0;
};

onMounted(() => {});
</script>

<style scoped>
.page-detail {
  flex: 1;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.page-detail-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.page-detail-title .border {
  position: absolute;
  bottom: 23%;
  left: 0%;
  height: 1px;
  width: 13%;
  background: #3f3f8c;
}

.page-detail-content {
  flex: 5;
}

.page-detail-content-item {
  font-size: 12px;
  color: #4c90cd;
  width: 370px;
  height: 192px;
}

.page-detail-content-item img {
  width: 100%;
  height: 113px;
}

.page-detail-content .back-btn {
  width: 96px;
  height: 32px;
  background: url("/assets/backBtn.png") no-repeat;
  cursor: pointer;
}

.page-detail-content .more-btn {
  position: absolute;
  top: 821px;
  right: 31px;
  width: 72px;
  height: 48px;
  background: url("/assets/Frame 527.png") no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
</style> 