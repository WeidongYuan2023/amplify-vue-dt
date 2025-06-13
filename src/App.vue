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
            <h2>认证成功！</h2>
            <div class="app-buttons">
              <button @click="goToHome" class="app-button">Museum</button>
              <button @click="goToDigitalTwin" class="app-button">Digital Twin</button>
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
}

.auth-success h2 {
  margin-bottom: 20px;
}

.app-buttons {
  display: flex;
  gap: 20px;
}

.app-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.app-button:hover {
  background-color: #45a049;
}
</style>
