<template>
  <div>
    <template v-if="isAuthenticated">
      <div class="authenticated-container">
		AUTH
        <router-view />
      </div>
    </template>
    <template v-else>
	  UN-AUTH
	  <div class="auth-wrapper">
      <Authenticator 
        :sign-up-attributes="['email', 'name', 'given_name', 'family_name']"
      >
        <template v-slot="{ user }">
          <div class="authenticated-container">
            <router-view />
          </div>
        </template>
      </Authenticator>
	  </div>
    </template>
	<div v-if="loadingStore.isLoading" class="loading-overlay">
	  <div class="spinner"></div>
	  <p class="loading-text">{{ loadingStore.loadingMessage }}</p>
	</div>
  </div>
</template>

<script setup  lang="ts">
import { ref, onMounted } from 'vue';
import { getCurrentUser, signOut } from 'aws-amplify/auth'; 
import { useRouter } from 'vue-router';
import { Authenticator } from '@aws-amplify/ui-vue';
import { useLoadingStore } from '@/store/loading';
const loadingStore = useLoadingStore();

const router = useRouter();
const isAuthenticated = ref(false);

// Check authentication status
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
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}
[data-amplify-authenticator] [data-amplify-router]{
border:0px!important;
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
  background-color: rgba(255, 255, 255, 0.85); /* Semi-transparent white background */
  border-radius: 12px; /* Rounded corners */
  padding: 30px; /* Padding */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Shadow effect */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Space between text and buttons */
}

.welcome-text {
  color: #333; /* Dark text for white background */
  font-size: 24px; /* Larger font size */
  font-weight: bold; /* Bold */
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

.digital-twin-button {
  background-color: rgba(33, 150, 243, 0.9);
}

.digital-twin-button:hover {
  background-color: rgba(33, 150, 243, 1);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.7);
}

.authenticated-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.header {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
}

.logout-button {
  background-color: rgba(244, 67, 54, 0.9);
}

.logout-button:hover {
  background-color: rgba(244, 67, 54, 1);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.7);
}
/* Global overlay styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: white;
  font-size: 18px;
  margin-top: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/*****Login****/

/* 背景层 */
.auth-wrapper {
  background-image: url('/public/assets/loginback.jpg'); /* ✅ 替换成你自己的背景图路径 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录框美化 */
.amplify-flex.amplify-authenticator__container {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  background-color: white;
  padding: 32px;
  width: 400px;
  max-width: 90vw;
}

/* 按钮优化 */
.amplify-button,amplify-field-group__control {
  background-color: #409eff !important;
  border-radius: 4px!important;
  padding: 10px 16px;
  font-weight: bold;
  color:#fff !important;
}
button{
}
/* 输入框样式 */
.amplify-field__control {
  border-radius: 5px;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
}

/* 标题样式 */
.amplify-heading {
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}
.amplify-tabs__item--active {
    color:#409EFF !important;
border-color:#409EFF !important;
}
[data-amplify-router] {
    border-radius:10px!important;
}
.amplify-tabs__list--top{
border-top:0px!important;
}
.amplify-tabs__item--active, .amplify-tabs__item{
border-top:0px!important;
border-bottom:2px!important;
margin-top:10px!important;
}
.amplify-tabs__panel--active {
    padding-top: 0px!important;
}
[data-amplify-form]{
padding-top:10px !important;
}
.amplify-field__show-password{
border-radius: 0px 4px 4px 0px!important;
}
.amplify-field-group__control{
border-radius: 4px!important;
}
</style>