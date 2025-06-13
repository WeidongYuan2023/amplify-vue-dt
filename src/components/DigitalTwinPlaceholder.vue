<template>
  <div class="digital-twin-placeholder">
    <h1>数字孪生模块</h1>
    <p>这是数字孪生模块的占位页面。在代码合并后，此页面将被实际的数字孪生模块内容替换。</p>
    <router-link to="/" class="back-button">返回博物馆模块</router-link>
  </div>
</template>

<script setup lang="ts">
// No specific logic needed for the placeholder
</script>

<style scoped>
.digital-twin-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f8ff;
  color: #333;
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

p {
  font-size: 1.2rem;
  max-width: 600px;
  margin-bottom: 30px;
}

.back-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #45a049;
}
</style> 