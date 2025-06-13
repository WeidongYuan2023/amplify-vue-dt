<template>
  <div class="page-detail">
    <div class="page-detail-title">
      Details
      <div class="border"></div>
    </div>
    <div class="page-detail-content" ref="detailContent">
      <div class="page-detail-content-title">Generated from the website</div>
      <div class="page-detail-content-item">
        This building is an office of Foxx Development Inc. Foxx, a global brand founded in the United States, has performed well in the fields of IoT, 5G and smartphones, and has strong product design and supply chain capabilities.
        15375 BARRANCA PKWY STE C104 IRVINE CA 92618-2206
        <br />9 AM – 5 PM Weekdays
        <br />+1 855-515-3699, service@foxxusa.com
        <br />www.foxxusa.com
      <img src="/assets/C104.png" alt="">

      </div>
    </div>
  </div>
</template>
  
  <script setup >
import { ref, onMounted } from "vue";
let detailContent = ref(null);

import { mainStore } from "@/store/store";
let store = mainStore();

onMounted(() => {});
</script>
  <style scoped lang="less">
.page-detail {
  flex: 1;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
  font-size: 14px;

  &-title {
    flex: 1;
    position: relative;
    color: #3f3f8c;
    font-weight: 700;
    display: flex;
    align-items: center;
    .border {
      position: absolute;
      bottom: 23%;
      left: 0%;
      height: 1px;
      width: 13%;
      background: #3f3f8c;
    }
  }
  &-content {
    flex: 5;
    overflow: auto;
    img{
      width: 100%;
      height: 100%;
      margin-top: 20px;
    }
    &-title {
      font-size: 12px;
      color: #4c90cd;
    }
    &-item {
      font-size: 15px;
      color: #4c90cd;
      width: 370px;
      height: 192px;
      margin-top: 27px;
    }
    .back-btn {
      width: 134px;
      height: 32px;
      background: url("/assets/BTN.png") no-repeat;
      cursor: pointer;
    }
  }
}
</style>