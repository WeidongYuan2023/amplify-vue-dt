<template>
  <div class="page-floor-info">
    <div class="page-floor-info-title">
      Area Info
      <div class="border"></div>
    </div>
    <div class="page-floor-info-content" ref="buildingInfoContent">
      <div class="photos"  @click="store.dialogVisible = true">
        <img src="/assets/Group 591.png" alt />
        <div class="mask">
          <h3>View gallery</h3>
        </div>
      </div>

      <div class="photos-b"  @click="store.dialogVisible = true">
        <img src="/assets/Group 591.png" alt />
        <div class="mask">
          <h3>View gallery</h3>
        </div>
      </div>
      <div class="more-btn" ></div>
    </div>
  </div>
</template>
    
<script setup>
import { ref, onMounted } from "vue";
import { mainStore } from "@/store/store";
let store = mainStore();
let buildingInfoContent = ref(null);

onMounted(() => {});
</script>

<style scoped>
.page-floor-info {
  flex: 2;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  position: relative;
}

.page-floor-info-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.page-floor-info-title .border {
  position: absolute;
  bottom: 23%;
  left: 0%;
  height: 1px;
  width: 18%;
  background: #3f3f8c;
}

.page-floor-info-content {
  flex: 10;
}

.page-floor-info-content .photos-title {
  font-size: 9px;
  color: #4c90cd;
}

.page-floor-info-content .photos {
  width: 343px;
  height: 220px;
  position: absolute;
  top: 86px;
  left: 29px;
  display: flex;
  cursor: pointer;
}

.page-floor-info-content .photos img {
  width: 100%;
  height: 100%;
}

.page-floor-info-content .photos .mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  border-radius: 10px;
}

.page-floor-info-content .photos:hover .mask {
  opacity: 1;
}

.page-floor-info-content .photos-b {
  width: 343px;
  height: 220px;
  position: absolute;
  top: 322px;
  left: 29px;
  display: flex;
  cursor: pointer;
}

.page-floor-info-content .photos-b img {
  width: 100%;
  height: 100%;
}

.page-floor-info-content .photos-b .mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  border-radius: 10px;
}

.page-floor-info-content .photos-b:hover .mask {
  opacity: 1;
}

.page-floor-info-content .more-btn {
  position: absolute;
  top: 546px;
  right: 31px;
  width: 72px;
  height: 48px;
  background: url("/assets/Frame 527.png") no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
</style> 