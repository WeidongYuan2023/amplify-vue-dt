<template>
  <vue-slick-carousel ref="carousel" class="carousel-container" v-bind="settings" @init="onCarouselInit" @beforeChange="onBeforeChange">
    <div
      v-for="(photo, index) in pananomas"
      :key="photo.id"
      class="image-item"
      :class="{ active: index === activeIndex }"
      @click="setActiveIndex(index)"
    >
      <img :src="photo.src" alt="carousel" />
    </div>
  </vue-slick-carousel>
</template>

<script setup>
import { ref } from 'vue';
import { mainStore } from '@/store/model';
import eventBus from '@/utils/eventBus';
const carousel = ref(null);
const emit = defineEmits(['selectImage']);

// 图片数据
const pananomas = ref([]);
const store = mainStore();
const getImages = () => {
  const pics = store.basicInfo.imagePaths;
  const keys = Object.keys(pics);
  const images = keys.map((d) => {
    return {
      src: store.getImg(`${store.rootPath}/${store.basicInfo.rootPath}/${pics[d]}.jpg`),
      id: d
    };
  });

  pananomas.value = images;
};

getImages();

// 当前选中的图片索引
const activeIndex = ref(0);

// 设置当前选中的图片
const setActiveIndex = (index) => {
  activeIndex.value = index;
  // emit('selectImage', pananomas.value[index].src);
  eventBus.emit('updatePannellum', pananomas.value[index].src);
};

// 容器宽度
const carouselContainer = ref(null);
const containerWidth = ref(0);

// 监听容器宽度变化
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    containerWidth.value = entry.contentRect.width;
    updateSlidesToShow();
  }
});

// 根据容器宽度动态设置 slidesToShow
const updateSlidesToShow = () => {
  if (containerWidth.value >= 1200) {
    settings.slidesToShow = 4;
  } else if (containerWidth.value >= 992) {
    settings.slidesToShow = 3;
  } else if (containerWidth.value >= 768) {
    settings.slidesToShow = 2;
  } else {
    settings.slidesToShow = 1;
  }
};

// vue-slick-carousel 配置
const settings = {
  dots: false, // 不显示指示器
  arrows: true, // 显示左右箭头
  infinite: true, // 无限循环
  speed: 500, // 切换速度
  slidesToShow: 4, // 默认显示 4 张图片
  slidesToScroll: 1 // 每次滚动 1 张图片
};

// 初始化回调
const onCarouselInit = () => {
  console.log('Carousel initialized');
};

// 切换前的回调
const onBeforeChange = (currentIndex, nextIndex) => {
  activeIndex.value = nextIndex;
};

// 组件挂载时监听容器宽度
onMounted(() => {
  if (carouselContainer.value) {
    resizeObserver.observe(carouselContainer.value);
  }
});

// 组件卸载时停止监听
onUnmounted(() => {
  if (carouselContainer.value) {
    resizeObserver.unobserve(carouselContainer.value);
  }
});
</script>

<style scoped>
.carousel-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px 0;
  position: fixed;
  bottom: 20px;
  left: 0;
  height: 100px;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100px;
    height: 100px;
    display: block;
    border-radius: 8px;
    transition: transform 0.1s ease;
    object-fit: cover;
  }
}

.image-item {
  padding: 5px;
  cursor: pointer;
  transition: transform 0.1s ease;
  /* 平滑放大效果 */
}

.image-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.image-item.active,
.image-item:hover {
  transform: scale(1.1);
  /* hover 或点击时放大 */
  z-index: 2;
  /* 确保放大图片在顶层 */
}

/* 覆盖 vue-slick-carousel 的默认箭头样式 */
:deep(.slick-prev),
:deep(.slick-next) {
  width: 30px;
  height: 30px;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.slick-prev:before),
:deep(.slick-next:before) {
  font-size: 20px;
  color: #000;
}

:deep(.slick-prev) {
  left: -40px;
}

:deep(.slick-next) {
  right: -40px;
}
</style>
