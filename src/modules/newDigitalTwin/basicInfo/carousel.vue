<template>
  <div class="image-carousel-container">
    <!-- 左箭头 -->
    <div v-if="showArrows" class="arrow left" @click="scrollLeft">&#10094;</div>
    <!-- 图片容器 -->
    <div ref="carousel" class="carousel">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="image-item"
        :class="{ active: index === activeIndex, hover: hoverIndex === index }" @mouseenter="hoverIndex = index"
        @mouseleave="hoverIndex = -1"
        @click="setActiveIndex(index)"
      >
        <img v-if="image.isVisible" :src="image.src" alt="carousel" :title="image.id" />
      </div>
    </div>

    <!-- 右箭头 -->
    <div v-if="showArrows" class="arrow right" @click="scrollRight">&#10095;</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import eventBus from '@/utils/eventBus';
import { mainStore } from '@/store/newmodel';

const emit = defineEmits(['updateCamera']);
const images = ref([]);
const store = mainStore();
const getImages = () => {
  const pics = store.basicInfo.imagePaths;
  const keys = Object.keys(pics);
  return keys.map((d) => {
    return {
      src: store.getImg(`${store.rootPath}/${store.basicInfo.rootPath}/${pics[d]}.jpg`),
      id: d,
      isVisible: false // 初始状态为不可见
    };
  });
};

images.value = getImages();
// 图片数据
// 当前选中的图片索引
const activeIndex = ref(0);

// 当前 hover 的图片索引
const hoverIndex = ref(-1);

// 图片容器引用
const carousel = ref(null);

// 是否显示箭头
const showArrows = ref(false);

// 图片宽度（固定大小）
const imageWidth = 150;

// 懒加载逻辑
const lazyLoadImages = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imgIndex = entry.target.dataset.index;
          images.value[imgIndex].isVisible = true; // 设置为可见
          observer.unobserve(entry.target); // 停止观察
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0.1 // 当图片进入可视区域 10% 时触发
    }
  );

  // 观察所有图片容器
  const imageItems = document.querySelectorAll('.image-item');
  imageItems.forEach((item, index) => {
    item.dataset.index = index; // 设置索引
    observer.observe(item); // 开始观察
  });
};

// 计算当前页面宽度下能显示的图片数量
const visibleImageCount = computed(() => {
  const containerWidth = carousel.value?.clientWidth || 0;
  return Math.floor(containerWidth / imageWidth);
});

// 更新是否显示箭头
const updateArrowsVisibility = () => {
  showArrows.value = images.value.length > visibleImageCount.value;
};

// 左箭头点击事件
const scrollLeft = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--;
    scrollToImage(activeIndex.value);
  }
};

// 右箭头点击事件
const scrollRight = () => {
  if (activeIndex.value < images.value.length - 1) {
    activeIndex.value++;
    scrollToImage(activeIndex.value);
  }
};

// 滚动到指定图片
const scrollToImage = (index) => {
  if (carousel.value) {
    const scrollPosition = index * imageWidth;
    carousel.value.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }
};

// 设置当前选中的图片
const setActiveIndex = (index) => {
  activeIndex.value = index;
  const img = images.value[index];
  eventBus.emit('updatePannellum', img.src);
  emit('updateCamera', img.id);
};

// 监听窗口大小变化
const handleResize = () => {
  updateArrowsVisibility();
};

// 组件挂载时初始化
onMounted(() => {
  lazyLoadImages();
  updateArrowsVisibility();
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.image-carousel-container {
  position: fixed;
  z-index: 11;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  box-sizing: border-box;
}

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 10px;
  padding: 0 10px;
}

.carousel::-webkit-scrollbar {
  display: none;
  /* 隐藏滚动条 */
}

.image-item {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0s ease;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-item.active {
  border: 2px white solid;
  border-radius: 8px;
}

.image-item.hover {
  border: 2px white solid;
  border-radius: 8px;
  /* transform: scale(1.05); */
  /* 放大效果 */
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.arrow.left {
  left: 10px;
}

.arrow.right {
  right: 10px;
}
</style>