<template>
  <div class="page-right-middle">
    <div class="page-right-middle-title">
      People Flow Forecast
      <div class="border"></div>
    </div>
    <div class="page-right-middle-content" ref="rightMiddle">
      <div class="flow-forecast">
        <div class="flow-forecast-item">
          <div class="flow-forecast-item-title">
            East
            <br />Finger Corridor
          </div>
          <div class="green-num">
            <span class="green-num-one" style="">11.52K</span>
            <span class="green-num-two" style="">Persons</span>
          </div>
          <div class="describe">
            Compared with the
            <br />previous day
          </div>
          <div class="other-num">
            <span class="other-num-one" >234K</span>
            <span class="other-num-two" >Persons</span>
          </div>
        </div>
        <div class="flow-forecast-item">
          <div class="flow-forecast-item-title">
            East
            <br />Finger Corridor
          </div>
          <div class="green-num">
            <span class="green-num-one" style="">11.52K</span>
            <span class="green-num-two" style="">Persons</span>
          </div>
          <div class="describe">
            Compared with the
            <br />previous day
          </div>
          <div class="other-num">
            <span class="other-num-one" >234K</span>
            <span class="other-num-two" >Persons</span>
          </div>
        </div>
        <div class="flow-forecast-item">
          <div class="flow-forecast-item-title">
            East
            <br />Finger Corridor
          </div>
          <div class="green-num">
            <span class="green-num-one" style="">11.52K</span>
            <span class="green-num-two" style="">Persons</span>
          </div>
          <div class="describe">
            Compared with the
            <br />previous day
          </div>
          <div class="other-num">
            <span class="other-num-one" >234K</span>
            <span class="other-num-two" >Persons</span>
          </div>
        </div>
        <div class="flow-forecast-item">
          <div class="flow-forecast-item-title">
            East
            <br />Finger Corridor
          </div>
          <div class="green-num">
            <span class="green-num-one" style="">11.52K</span>
            <span class="green-num-two" style="">Persons</span>
          </div>
          <div class="describe">
            Compared with the
            <br />previous day
          </div>
          <div class="other-num">
            <span class="other-num-one" >234K</span>
            <span class="other-num-two" >Persons</span>
          </div>
        </div>
        <div class="flow-forecast-item">
          <div class="flow-forecast-item-title">
            East
            <br />Finger Corridor
          </div>
          <div class="green-num">
            <span class="green-num-one" style="">11.52K</span>
            <span class="green-num-two" style="">Persons</span>
          </div>
          <div class="describe">
            Compared with the
            <br />previous day
          </div>
          <div class="other-num">
            <span class="other-num-one" >234K</span>
            <span class="other-num-two" >Persons</span>
          </div>
        </div>
        <div class="flow-forecast-item">
          <div class="flow-forecast-item-title">
            East
            <br />Finger Corridor
          </div>
          <div class="green-num">
            <span class="green-num-one" style="">11.52K</span>
            <span class="green-num-two" style="">Persons</span>
          </div>
          <div class="describe">
            Compared with the
            <br />previous day
          </div>
          <div class="other-num">
            <span class="other-num-one" >234K</span>
            <span class="other-num-two" >Persons</span>
          </div>
        </div>  
      </div>
    </div>
  </div>
</template>

<script setup >
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
let myChart = null;
let rightMiddle = ref(null);

const init = () => {};

onMounted(() => {
  // init();
});
</script>
<style scoped>
.page-right-middle {
  flex: 1;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
}

.page-right-middle-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.page-right-middle-title .border {
  position: absolute;
  bottom: 23%;
  left: 0%;
  height: 1px;
  width: 38%;
  background: #3f3f8c;
}

.page-right-middle-content {
  flex: 5;
}

.flow-forecast {
  width: 356px;
  height: 221px;
  margin-top: 14px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.flow-forecast-item {
  width: 112px;
  height: 96px;
  position: relative;
  background: url("/assets/forecastDown.png") no-repeat;
  background-size: 100% 100%;
}

.flow-forecast-item-title {
  position: absolute;
  top: 2px;
  left: 14px;
  width: 78px;
  height: 26px;
  font-size: 8px;
  color: #fff;
  padding-left: 11px;
}

.green-num {
  position: absolute;
  top: 20px;
  left: 14px;
  color: #e68a35;
}

.green-num-one {
  font-size: 14px;
  font-weight: 700;
}

.green-num-two {
  font-size: 8px;
  margin-left: 4px;
}

.describe {
  position: absolute;
  top: 54px;
  left: 14px;
  color: #454b95;
  font-size: 7px;
}

.other-num {
  position: absolute;
  top: 60px;
  left: 14px;
  color: #454b95;
}

.other-num-one {
  font-size: 14px;
  font-weight: 500;
}

.other-num-two {
  font-size: 8px;
  margin-left: 4px;
}
</style> 