<template>
  <div class="search">
    <div class="search-input">
      <div class="search-input-text">
        <input 
          type="text" 
          v-model="searchText" 
          placeholder="Search..."
          @keyup.enter="handleSearch"
        />
      </div>
    </div>
    <div class="search-button" @click="handleSearch">
      <div class="search-button-text">
        <i class="el-icon-search"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['search']);

const searchText = ref('');

const handleSearch = () => {
  emit('search', searchText.value);
};
</script>

<style scoped>
.search {
  top: 20px;
  margin: auto;
  width: 880px;
  height: 60px;
  display: flex;
  gap: 10px;
  z-index: 2;
}

.search-input {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px 0;
  backdrop-filter: blur(10px);
  flex: 3;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-input-text {
  width: 100%;
  height: 60px;
  background: #9cadde;
  display: flex;
  align-items: center;
}

.search-input-text input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  height: 80%;
  width: 80%;
  background: #9cadde;
  outline: none;
  border: none;
  margin-left: 1%;
  font-size: 20px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 3px;
}

.search-input-text input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-button {
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-button-text {
    width: 80%;
    height: 60px;
    background: url("/assets/Search.png") no-repeat;
    background-size: 100% 100%;
}

.search-button:hover {
  background: #357ABD;
}

.search-button-text {
  color: #fff;
  font-size: 14px;
}
</style> 