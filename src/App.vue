<template>
  <div>
    <template v-if="isAuthenticated">
      <div class="authenticated-container">
        <router-view />
      </div>
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
                <button @click="goToMuseum" class="app-button digital-twin-button">Museum</button>
                <button @click="goToDigitalTwin" class="app-button digital-twin-button">Digital Twin</button>
                <button @click="signOut" class="app-button logout-button">Logout</button>
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
import { getCurrentUser, signOut } from 'aws-amplify/auth'; 
import { useRouter } from 'vue-router';
import { Authenticator } from '@aws-amplify/ui-vue';

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

const goToMuseum = () => {
  isAuthenticated.value = true;
  router.push('/museum');
};

const goToDigitalTwin = () => {
  isAuthenticated.value = true;
  router.push('/digital-twin');
};
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
</style>