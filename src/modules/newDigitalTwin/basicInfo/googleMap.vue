<template>
  <div>
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GoogleMapsApiLoader from 'google-maps-api-loader';

const mapContainer = ref(null); // 地图容器
const map = ref(null); // 地图实例
const GOOGLE_MAPS_API_KEY = 'AIzaSyDFU-qpBSp61iriyMuvj--sqBtxjLRgmFY';
const prop = defineProps({
  lat: {
    type: Number,
    default: 37.7749
  },
  lng: {
    type: Number,
    default: -122.4194
  }
});

// 初始化地图
const initMap = async () => {
  try {
    // 加载谷歌地图 API
    const google = await GoogleMapsApiLoader({
      apiKey: GOOGLE_MAPS_API_KEY // 替换为你的 API 密钥
    });

    // 初始化地图
    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: prop.lat, lng: prop.lng }, // 初始中心点（旧金山）
      zoom: 12 // 缩放级别
    });

    // 添加标记
    new google.maps.Marker({
      position: { lat: prop.lat, lng: prop.lng },
      map: map.value,
      title: 'San Francisco'
    });
  } catch (error) {
    console.error('Failed to load google map:', error);
  }
};

// 在组件挂载后初始化地图
onMounted(() => {
  initMap();
});
</script>

<style>
.map-container {
  width: 100%;
  height: 500px; /* 设置地图容器高度 */
  border: 1px solid #ccc;
}
</style>
