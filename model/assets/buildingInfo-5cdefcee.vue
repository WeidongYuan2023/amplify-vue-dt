<template>
  <div class="page-building-info aside-3D-node">
    <div class="page-building-info-title aside-3D-title">Building Info</div>
    <div ref="buildingInfoContent" class="page-building-info-content">
      <div v-if="!showCarousel && !store.dialogVisible" class="photos">
        <div v-for="photo in photos" :key="photo.id" class="photos-item" @click="showCarousel = !showCarousel">
          <img :src="photo.src" alt="info" :class="{ 'full-image': photos.length < 3 }" />
        </div>
        <div v-if="photos.length > 4" class="mask" @click="showCarousel = !showCarousel">
          <h3>View gallery</h3>
        </div>
      </div>
      <el-carousel v-if="showCarousel" id="photo-carousel" indicator-position="outside">
        <el-carousel-item v-for="photo in photos" :key="photo.id">
          <img :src="photo.src" alt="carousel" />
        </el-carousel-item>
      </el-carousel>
      <div v-if="store.dialogVisible" class="pannellum">
        <Pannellum ref="pannellumRef" width="320" height="228" :path="getPannellum()"></Pannellum>
      </div>
      <div class="address-info">
        <div class="address">
          <div class="address-icon"></div>
          <div class="address-text">{{ store.buildingInfo.address }}</div>
          <div class="address-line" @click="triggerMap"></div>
        </div>
        <div class="open">
          <div class="open-icon"></div>
          <div class="open-text">{{ store.buildingInfo.time }}</div>
          <div class="open-line"></div>
        </div>
        <div class="telephone">
          <div class="telephone-icon"></div>
          <div class="telephone-text">{{ store.buildingInfo.iphone }}</div>
        </div>
        <div class="website">
          <div class="website-icon"></div>
          <div class="website-text">{{ store.buildingInfo.website }}</div>
        </div>
      </div>

      <div class="page-detail">
        <div ref="detailContent" class="page-detail-content aside-3D-node">
          <img src="@/assets/basic-info/detail.jpg" alt="" @click="clickDetails" />
        </div>
      </div>
    </div>
    <teleport v-if="showDetail" to="#model-3D-node">
      <el-dialog v-model="showDetail" title="View Details" width="800">
        <el-carousel :interval="0" arrow="always">
          <el-carousel-item v-for="(img, index) in detailList" :key="index">
            <img :src="'/assets/basic-info/' + img + '.jpg'" class="imgshow" :alt="'/assets/basic-info/' + img + '.jpg'" />
          </el-carousel-item>
        </el-carousel>
      </el-dialog>
    </teleport>
    <teleport v-if="showMap" to="#model-3D-node">
      <el-dialog v-model="showMap" title="Google Map" width="900" @close="showMap = false">
        <GoogleMap />
      </el-dialog>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted,watchEffect } from 'vue';
import Pannellum from '$/surface/pannellum';
import GoogleMap from '$/basicInfo/googleMap';

const props = defineProps({
  areaImages: {
    type: Array,
    default: () => []
  },
  carouselKey: {
    type: [String, Number],
    default: () => {
      return new Date().getTime();
    }
  },
  areaFocus: {
    type: String,
    default: ''
  }
});

const detailContent = ref(null);
let buildingInfoContent = ref(null);
import { mainStore } from '@/store/model';
const store = mainStore();
const showCarousel = ref(false);
const showDetail = ref(false);
const detailList = ref([]);
const showMap = ref(false);
const pannellumRef = ref(null);
const src = ref('');
const startPadding = `${store.rootPath}/${store.basicInfo.rootPath}`;
const getBuildingImgs = () => {
  return store.basicInfo.outsideImages.map((d, i) => {
    return {
      id: i,
      src: getAssetImage(d)
    };
  });
};

const getAssetImage = (imgPath) => {
  return new URL(`/src/${store.basicInfo.rootPath}/${imgPath}`, import.meta.url).href;
};

const getPannellum = () => {
  return getAssetImage(`${props.areaImages[0]}.jpg`);
};

const getBuildingPath = (path) => {
  returngetAssetImage(`${path}.jpg`);
};

const outsideImages = getBuildingImgs();
const photos = ref(outsideImages);

const clickDetails = () => {
  showDetail.value = true;
  detailList.value = ['detail'];
};

const triggerMap = () => {
  showMap.value = true;
  console.log('triggerMap');
};

const refreshPannellum = () => {};

const close = () => {
  store.dialogVisible = false;
};

onMounted(() => {});

watch(
  () => props.areaImages,
  (newVal) => {
    const path = store.getImg(`${startPadding}/${newVal[0]}.jpg`);
    pannellumRef.value?.updateTexture(path);
  }
);

watchEffect(() => {
  if (!props.areaFocus) return;

  showCarousel.value = false;

  if (props.areaFocus === 'overview-default') {
    photos.value = outsideImages;
    return;
  }

  const images = store.basicInfo.imagePaths[props.areaFocus].map((d) => {
    return {
      src: store.getImg(`/assets/basic-info/${d}.jpg`),
      id: d
    };
  });

  photos.value = images;
});

defineExpose({
  getBuildingPath
});
</script>
<style scoped lang="scss">
#photo-carousel {
  height: 228px;
  img {
    width: 100%;
    height: 228px;
    border-radius: 8px;
    transition: transform 0.3s ease;
    object-fit: cover;
  }
}
.page-building-info {
  &-content {
    flex: 1;
    padding-right: 8px;
    .photos-title {
      font-size: 12px;
      color: #4c90cd;
    }

    .photos_carousel {
      width: 343px;
      height: 228px;
      position: relative;
    }
    .pannellum {
      width: 343px;
      height: 228px;
    }
    .photos {
      width: 343px;
      height: 228px;

      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      overflow: hidden;
      position: relative;
      .photos-item {
        display: flex;
        justify-content: center;
        position: relative;
        cursor: pointer;
        img {
          width: 128px;
          height: 112px;
          border-radius: 8px;
          transition: transform 0.3s ease;
          object-fit: cover;

          &:hover {
            transform: scale(1.05);
            z-index: 2;
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
          }
        }
        .full-image {
          height: 190px;
        }
      }
      .photos-item:hover .mask {
        opacity: 1;
      }
      .mask {
        position: absolute;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        width: 164px;
        height: 112px;
        border-radius: 8px;
        right: 10px;
        bottom: 0;
        z-index: 1;
      }
    }
    .address {
      width: 240px;
      height: 40px;
      margin-top: 24px;
      display: flex;

      &-icon {
        width: 60px;
        height: 40px;
        background: url('@/assets/04.svg');
        float: left;
      }
      &-text {
        height: 40px;
        width: 263px;
        font-weight: 600;
        font-size: 12px;
        color: #4c90cd;
        background: linear-gradient(
          90deg,
          #4c90cd 7.76%,
          #4677ba 21.59%,
          #415da8 39.1%,
          #3d4b9b 56.61%,
          #3a4093 75.96%,
          #3a3d91 97.16%,
          #3a3d91 99.93%
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        float: left;
        line-height: 40px;
        text-indent: 16px;
      }
      &-line {
        width: 60px;
        height: 40px;
        background: url('@/assets/05+.svg');
        float: left;
        cursor: pointer;
      }
    }
    .open {
      width: 240px;
      height: 40px;
      display: flex;

      &-icon {
        width: 60px;
        height: 40px;
        background: url('@/assets/03.svg');
        float: left;
      }
      &-text {
        height: 40px;
        width: 263px;
        font-weight: 600;
        font-size: 12px;
        color: #4c90cd;
        float: left;
        line-height: 40px;
        text-indent: 16px;
        background: linear-gradient(
          90deg,
          #4c90cd 7.76%,
          #4677ba 21.59%,
          #415da8 39.1%,
          #3d4b9b 56.61%,
          #3a4093 75.96%,
          #3a3d91 97.16%,
          #3a3d91 99.93%
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      &-line {
        width: 60px;
        height: 40px;
        background: url('@/assets/Droplist.svg');
        float: left;
        cursor: pointer;
      }
    }
    .telephone {
      width: 240px;
      height: 40px;
      display: flex;

      &-icon {
        width: 50px;
        height: 40px;
        background: url('@/assets/02.svg');
        float: left;
      }
      &-text {
        height: 50px;
        width: 263px;
        font-weight: 600;
        font-size: 12px;
        color: #4c90cd;
        float: left;
        line-height: 40px;
        text-indent: 16px;
        background: linear-gradient(
          90deg,
          #4c90cd 7.76%,
          #4677ba 21.59%,
          #415da8 39.1%,
          #3d4b9b 56.61%,
          #3a4093 75.96%,
          #3a3d91 97.16%,
          #3a3d91 99.93%
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      &-line {
        width: 60px;
        height: 40px;
        background: url('@/assets/Droplist.svg');
        float: left;
      }
    }
    .website {
      width: 240px;
      height: 40px;
      display: flex;

      &-icon {
        width: 50px;
        height: 40px;
        background: url('@/assets/01.svg');
        float: left;
      }
      &-text {
        height: 40px;
        width: 263px;
        font-weight: 600;
        font-size: 12px;
        color: #4c90cd;
        float: left;
        line-height: 40px;
        text-indent: 16px;
        background: var(--gradient-color);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      &-line {
        width: 60px;
        height: 40px;
        background: url('@/assets/Droplist.svg');
        float: left;
      }
    }
  }
}

.page-detail {
  &-content {
    flex: 5;
    overflow: auto;
    padding-top: 24px;

    img {
      width: 300;
      height: 240px;
      object-fit: cover;
      cursor: pointer;
    }

    &-title {
      font-size: 12px;
      color: #4c90cd;
    }

    &-item {
      font-size: 15px;
      color: #4c90cd;
      width: 370px;
      height: 192px;
      margin-top: 27px;
    }

    .back-btn {
      width: 134px;
      height: 32px;
      background: url('@/assets/BTN.png') no-repeat;
      cursor: pointer;
    }
  }
}
</style>
