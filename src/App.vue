<template>
  <div>
    <template v-if="isAuthenticated">
      <router-view />
    </template>
    <template v-else>
      <Authenticator 
        :sign-up-attributes="['email', 'name', 'given_name', 'family_name']"
      >
        <template v-slot="{ user }">
          <div class="auth-success">
            <div class="content-box">
              <div class="welcome-text">Welcome to FOXX NEXUS Digital Twins</div>
              <div class="app-buttons">
                <button @click="goToHome" class="app-button digital-twin-button">Museum</button>
                <button @click="goToDigitalTwin" class="app-button digital-twin-button">Digital Twin</button>
              </div>
            </div>
          </div>
        </template>
      </Authenticator>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';
import { Authenticator } from '@aws-amplify/ui-vue';

const router = useRouter();
const isAuthenticated = ref(false);

// 检查认证状态
const checkAuth = async () => {
  try {
    await getCurrentUser();
    isAuthenticated.value = true;
  } catch (e) {
    console.log('Not authenticated', e);
    isAuthenticated.value = false;
  }
};

onMounted(() => {
  checkAuth();
});

const goToHome = () => {
  isAuthenticated.value = true;
  router.push('/');
};

const goToDigitalTwin = () => {
  isAuthenticated.value = true;
  router.push('/digital-twin');
};
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

.auth-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-image: url('@/assets/loginback.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

.content-box {
  background-color: rgba(255, 255, 255, 0.85); /* 白色半透明背景框 */
  border-radius: 12px; /* 圆角 */
  padding: 30px; /* 内边距 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* 阴影效果 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* 文字和按钮之间的间距 */
}

.welcome-text {
  color: #333; /* 深色文字以适应白色背景 */
  font-size: 24px; /* 稍大的字体 */
  font-weight: bold; /* 加粗 */
  text-align: center;
}

.app-buttons {
  display: flex;
  gap: 20px;
}

.app-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.museu-button {
  background-color: rgba(76, 175, 80, 0.9);
}

.museu-button:hover {
  background-color: rgba(76, 175, 80, 1);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.7);
}

.digital-twin-button {
  background-color: rgba(33, 150, 243, 0.9);
}

.digital-twin-button:hover {
  background-color: rgba(33, 150, 243, 1);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.7);
}
</style>