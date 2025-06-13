<template>
  <div class="page-time">
    <div class="icon"></div>
    <div class="content">Time: {{date + ','}} {{ month }} {{ day+',' }} {{ year }} {{ time }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
let day = ref("");
let time = ref("");
let date = ref("");
let month = ref("");
let year = ref("");

let dateArray = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

let monthArray = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec"
];

const getCurrentTimeInEnglish = () => {
  setInterval(() => {
    const now = new Date();
    date.value = dateArray[now.getDay()];
    month.value = monthArray[now.getMonth()];
    day.value = now.getDate();
    year.value = now.getFullYear();
    time.value = now.toLocaleTimeString();
  }, 1000);
};

const init = () => {};

onMounted(() => {
  getCurrentTimeInEnglish();
});
</script>
<style scoped>
.page-time {
  width: auto;
  height: 100%;
  display: flex;
}
.page-time .icon {
  width: 1.5rem;
  height: 1.5rem;
  background: url("/assets/Clock.png") no-repeat;
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-time .content {
  height: 100%;
  width: auto;
  display: flex;
  margin-left: 8px;
  font-size: 14px;
  color: #3f3f8c;
  line-height: 24px;
}
</style> 