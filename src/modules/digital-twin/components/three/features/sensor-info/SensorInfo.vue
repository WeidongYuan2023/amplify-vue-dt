<template>
  <div class="page-sensors">
    <div class="page-sensors-title">
      Sensors Info
      <div class="border"></div>
    </div>
    <div class="page-sensors-content">
      <div class="page-sensors-content-item" v-for="(item,index) in sensors" :key="index">
        <div class="icon">
          <img :src="item.icon" alt />
        </div>
        <div class="text">
          <div style="font-size: 18px;font-weight:700;color:#62a3f7">{{ item.val }} {{ item.unit }}</div>
          <div style="font-size: 14px;font-weight:400;color:#000">{{ item.name }}</div>
        </div>
        <div class="num">
          <div class="num-online">{{ item.online }}</div>
          <div class="num-outline">{{ item.outline }}</div>
          <div class="num-fault">{{ item.fault }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from "vue";
import { mainStore } from "@/store/store";
let store = mainStore();

import tempIcon from "/assets/monitoring/temp.png";
import tempIcon1 from "/assets/monitoring/temp1.png";
import tempIcon2 from "/assets/monitoring/temp2.png";
import tempIcon3 from "/assets/monitoring/temp3.png";
import tempIcon4 from "/assets/monitoring/temp4.png";
import tempIcon5 from "/assets/monitoring/temp5.png";
import tempIcon6 from "/assets/monitoring/temp6.png";
import tempIcon7 from "/assets/monitoring/temp7.png";
import tempIcon8 from "/assets/monitoring/temp8.png";

let sensors = ref([
  {
    name: "Temperature",
    val: 24,
    unit: "degC",
    icon: tempIcon,
    online: 1,
    outline: 1,
    fault: 4
  },
  {
    name: "Humidity",
    val: 55,
    unit: "%",
    icon: tempIcon1,
    online: 8,
    outline: 8,
    fault: 8
  },
  {
    name: "CO2",
    val: 2000,
    unit: "ppm",
    icon: tempIcon2,
    online: 8,
    outline: 8,
    fault: 8
  },
  {
    name: "Illumination",
    val: 20000,
    unit: "Lux",
    icon: tempIcon3,
    online: 24,
    outline: 24,
    fault: 24
  },
  {
    name: "TVOC",
    val: 0.3,
    unit: "mg/m³",
    icon: tempIcon4,
    online: 24,
    outline: 24,
    fault: 24
  },
  {
    name: "Atm. pressure",
    val: 700,
    unit: "hPa",
    icon: tempIcon8,
    online: 40,
    outline: 40,
    fault: 40
  },
  {
    name: "HCHO",
    val: 24,
    unit: "mg/m³",
    icon: tempIcon5,
    online: 40,
    outline: 40,
    fault: 40
  },
  {
    name: "PM10",
    val: 3500,
    unit: "μg/m³",
    icon: tempIcon6,
    online: 40,
    outline: 40,
    fault: 40
  },
  {
    name: "PM2.5",
    val: 3500,
    unit: "μg/m³",
    icon: tempIcon7,
    online: 72,
    outline: 72,
    fault: 72
  }
]);

onMounted(() => {});
</script>

<style scoped>
.page-sensors {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
}

.page-sensors-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
  font-size: 18px;
}

.page-sensors-title .border {
  position: absolute;
  bottom: 23%;
  left: 0%;
  height: 1px;
  width: 25%;
  background: #3f3f8c;
}

.page-sensors-content {
  flex: 12;
}

.page-sensors-content-item {
  width: 90%;
  height: 64px;
  display: flex;
  background: #f4f7f9;
  margin-top: 8px;
}

.page-sensors-content-item .icon {
  flex: 1.3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-sensors-content-item .text {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-sensors-content-item .num {
  flex: 3;
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.page-sensors-content-item .num-online {
  width: 32px;
  height: 16px;
  background: #ba4b52;
  margin-top: 10px;
  border-radius: 10px;
  margin-right: 5px;
  text-align: center;
  line-height: 16px;
}

.page-sensors-content-item .num-outline {
  width: 32px;
  height: 16px;
  background: #b99837;
  margin-top: 10px;
  border-radius: 10px;
  margin-right: 5px;
  text-align: center;
  line-height: 16px;
}

.page-sensors-content-item .num-fault {
  width: 32px;
  height: 16px;
  background: #4777d2;
  margin-top: 10px;
  border-radius: 10px;
  margin-right: 10px;
  text-align: center;
  line-height: 16px;
}
</style> 