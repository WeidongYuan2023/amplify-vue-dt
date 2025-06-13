<template>
  <div class="page-right-bottom">
    <div class="page-right-bottom-title">
      Central AC & Lighting Recommendations
      <div class="border"></div>
    </div>
    <div class="page-right-bottom-content" ref="rightBottomContent">
      <div class="table-header">
        <div class="table-header-icon"></div>
        <div class="table-header-point">Point</div>
        <div class="table-header-trend">Trend</div>
        <div class="table-header-illumination">Illumination</div>
        <div class="table-header-gear">Gear</div>
      </div>
      <div class="table-body">
        <div class="table-row">
          <div class="table-row-icon">
            <div class="table-row-icon-line"></div>
            <div class="table-row-icon-block"></div>
          </div>
          <div class="table-row-point">
            East
            <br />Finger
            <br />Corridor
          </div>
          <div class="table-row-trend">
            <div class="table-row-trend-icon"></div>
          </div>
          <div class="table-row-illumination">113Lux</div>
          <div class="table-row-gear">Fourth</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup >
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
let myChart = null;

let rightBottomContent = ref(null);

const init = () => {};
onMounted(() => {
  // init();
});
</script>
<style scoped>
.page-right-bottom {
  flex: 1;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
}

.page-right-bottom-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.page-right-bottom-title .border {
  position: absolute;
  bottom: 20%;
  left: 0%;
  height: 1px;
  width: 73%;
  background: #3f3f8c;
}

.page-right-bottom-content {
  flex: 5;
}

.table-header {
  width: 100%;
  height: 19px;
  display: flex;
  color: #556dae;
  font-weight: 700;
  background: url("/assets/Mouse.png") no-repeat;
  background-size: 100% 100%;
}

.table-header-icon {
  flex: 0.3;
}

.table-header-point {
  flex: 1;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-header-trend {
  flex: 3;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-header-illumination {
  flex: 1;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-header-gear {
  flex: 1;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-body {
  width: 100%;
  height: 185px;
  margin-top: 10px;
}

.table-row {
  width: 100%;
  height: 37px;
  display: flex;
}

.table-row-icon {
  flex: 0.3;
  display: flex;
  position: relative;
}

.table-row-icon-line {
  width: 1px;
  height: 100%;
  background: #e9f5fe;
  float: left;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.table-row-icon-block {
  width: 4px;
  height: 13px;
  background: #e68a35;
  border-radius: 2px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.table-row-point {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #49569d;
}

.table-row-trend {
  flex: 3;
  display: flex;
  align-items: center;
  background: #fbf3e8;
}

.table-row-trend-icon {
  width: 50%;
  height: 10px;
  background: linear-gradient(
    to left,
    #fbf3e8 10%,
    #e68a35 28%,
    #e68a35 67%,
    #fbf3e8 25%
  );
  background-size: 6px 2px;
}

.table-row-illumination {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e68a35;
  font-weight: 700;
  font-size: 8px;
}

.table-row-gear {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #49569d;
}
</style> 