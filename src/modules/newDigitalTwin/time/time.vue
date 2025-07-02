<template>
  <div class="page-time">
    <div class="icon"></div>
    <div class="content">Time: {{ date + ',' }} {{ month }} {{ day + ',' }} {{ year }} {{ time }}</div>
    <div class="homer "  @click="gohome">Home</div>
    <div class="logouter  " @click="logout">Logout</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useLoadingStore } from '@/store/loading';
import { signOut } from '@aws-amplify/auth';
const loadingStore = useLoadingStore();
let day = ref('');
let time = ref('');
let date = ref('');
let month = ref('');
let year = ref('');

let dateArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

const logout = async () => {
  try {
    loadingStore.showLoading('Logging out...');
    await signOut();
    setTimeout(() => { window.location.href='/'; }, 2000);
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
	loadingStore.hideLoading(); // 出错时隐藏遮罩
  }
};

const gohome = async () => {
  try {
    setTimeout(() => { window.location.replace('/'); }, 1000);
  } catch (error) {
    console.error('Home failed:', error);
    alert('Home failed. Please try again.');
  }
};

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
<style scoped lang="less">
.page-time {
  width: 100%;
  height: 100%;
  display: flex;
  .icon {
    width: 24px;
    height: 24px;
    background: url('@/assets/Clock.png') no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .content {
    height: 100%;
    white-space: nowrap;
    display: flex;
    background: var(--gradient-color);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-left: 10px;
    font-size: 14px;
    color: #bde8fe;
    line-height: 24px;
    width: 300px;
  }
  .homer{
    cursor: pointer;
    
    &:hover{
      color: #bde8fe;
      background: var(--gradient-color);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  .logouter{
    cursor: pointer;
    margin-left: 20px;
    &:hover{
      background: var(--gradient-color);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}
</style>
