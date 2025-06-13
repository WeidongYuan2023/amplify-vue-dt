<template>
    <div class="loading">
      <div class="atom-spinner">
        <div class="spinner-inner">
          <div class="spinner-line"></div>
          <div class="spinner-line"></div>
          <div class="spinner-line"></div>
          <!--Chrome renders little circles malformed :(-->
          <div class="spinner-circle">&#9679;</div>
        </div>
      </div>
      <div v-if="process" class="loading-text">loading... {{ process }}%</div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    process: {
        type: String,
        default: ''
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 75%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to bottom,
        rgba(255, 255, 255, 0.9),
        rgba(255, 255, 255, 0.7));
    backdrop-filter: blur(5px);
    z-index: 9999;
  }
  
  .atom-spinner, .atom-spinner * {
    box-sizing: border-box;
  }
  
  .atom-spinner {
    height: 60px;
    width: 60px;
    overflow: hidden;
  }
  
  .atom-spinner .spinner-inner {
    position: relative;
    display: block;
    height: 100%;
    width: 100%;
  }
  
  .atom-spinner .spinner-circle {
    display: block;
    position: absolute;
    color: #0099ff;
    font-size: calc(60px * 0.24);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .atom-spinner .spinner-line {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border-left-width: calc(60px / 25);
    border-top-width: calc(60px / 25);
    border-left-color: #0099ff;
    border-left-style: solid;
    border-top-style: solid;
    border-top-color: transparent;
  }
  
  .atom-spinner .spinner-line:nth-child(1) {
    animation: atom-spinner-animation-1 1s linear infinite;
    transform: rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
  }
  
  .atom-spinner .spinner-line:nth-child(2) {
    animation: atom-spinner-animation-2 1s linear infinite;
    transform: rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
  }
  
  .atom-spinner .spinner-line:nth-child(3) {
    animation: atom-spinner-animation-3 1s linear infinite;
    transform: rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
  }
  
  @keyframes atom-spinner-animation-1 {
    100% {
      transform: rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
    }
  }
  
  @keyframes atom-spinner-animation-2 {
    100% {
      transform: rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
    }
  }
  
  @keyframes atom-spinner-animation-3 {
    100% {
      transform: rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
    }
  }

  .loading-text {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
  }
  </style>