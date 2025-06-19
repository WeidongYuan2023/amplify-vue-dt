import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  const loadingMessage = ref('Loading...');

  function showLoading(message = 'Loading...') {
    isLoading.value = true;
    loadingMessage.value = message;
  }

  function hideLoading() {
    isLoading.value = false;
    loadingMessage.value = 'Loading...';
  }

  return { isLoading, loadingMessage, showLoading, hideLoading };
});