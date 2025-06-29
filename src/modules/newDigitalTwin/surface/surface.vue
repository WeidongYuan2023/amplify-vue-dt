<template>
  <div class="page-detail">
    <div class="aside-3D-title">Details & WDO</div>
    <div ref="detailContent" class="page-detail-content">
      <div class="list">
        <div v-for="item in list" :key="item.img" class="list-item">
          <div class="one">
            <img :src="getAssetImage(item.img)" alt />
          </div>
          <div class="two">
            {{ item.name }}
          </div>
          <div class="three">{{ item.count }}</div>
        </div>
      </div>

      <div class="too">
        <div class="too-item">
          <div class="point">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #e04c53"></div>
          </div>
          <div class="text">Door</div>
          <div class="num">{{ door }}</div>
        </div>
        <div class="too-item" style="margin-left: 10px">
          <div class="point">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #5a98f7"></div>
          </div>
          <div class="text">Window</div>
          <div class="num">{{ window }}</div>
        </div>
      </div>
      <div v-if="showDetail" class="photos">
        <div v-for="photo in photos" :key="photo.id" class="photos-item">
          <img :src="photo.src" alt="detail" />
        </div>
      </div>
      <teleport v-if="showPannellum" to="body">
        <el-dialog v-model="showPannellum" title width="900" @close="close">
          <Pannellum width="850" height="680" :path="src"></Pannellum>
        </el-dialog>
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,watchEffect } from 'vue';
import { mainStore } from '@/store/newmodel';
import * as XLSX from 'xlsx';
import axios from 'axios';
import Pannellum from './pannellum';

const store = mainStore();
const detailContent = ref(null);
const showDetail = ref(false);
const showPannellum = ref(false);
const props = defineProps({
  surface: {
    type: Object,
    required: true
  }
});
let areaInfoData = [];
const orgData = JSON.parse(JSON.stringify(store.surface.info.list));
const list = ref(orgData);
const door = ref(store.surface.info.detail.door);
const window = ref(store.surface.info.detail.window);
const photos = ref([]);
const src = ref('');

const startPadding = `${store.rootPath}/${store.surface.rootPath}/`;

const getImgList = (images) => {
  return images.map((d, i) => {
    return {
      id: i,
      src: getAssetImage(`${d}.jpg`),
      name: d
    };
  });
};

const getAssetImage = (imgPath) => {
  return new URL(`/src/assets/surface-analysis/${imgPath}`, import.meta.url).href;
};

const getAreaData = async () => {
    const url = new URL('@/assets/surface.xlsx', import.meta.url).href;
    axios.get(url, { responseType: 'arraybuffer' }).then((res) => {
    const data = new Uint8Array(res.data);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    areaInfoData = jsonData;
  });
};

// 表面分析点击事件处理
const surfaceAnalysis = (mesh) => {
  const data = areaInfoData.find((d) => d.name.toLowerCase() === mesh.name.toLowerCase());

  if (data == null) return null;

  return {
    name: data.name,
    gross: data.GrossSQFT.toFixed(3),
    cleanable: data.CleanableSQFT.toFixed(3),
    robotCleanable: data.RobotCleanableSQFT.toFixed(3),
    door: data.Door,
    window: data.Window
  };
};

const handleGalleryClick = (node) => {
  src.value = 'surface-analysis/' + node.name + '.jpg';
  console.log('src', src.value);
  showPannellum.value = true;
};

const reset = () => {
  list.value = JSON.parse(JSON.stringify(store.surface.info.list));
  door.value = store.surface.info.detail.door;
  window.value = store.surface.info.detail.window;
  photos.value = [];
};

const close = () => {
  showPannellum.value = false;
};

watchEffect(() => {
  if (props.surface?.name) {
    const data = store.surface.imagePaths.find((d) => d.name === props.surface?.name)?.imgs || [];

    showDetail.value = true;
    photos.value = getImgList(data);

    const info = surfaceAnalysis(props.surface);

    if (!info) return;

    door.value = info.door;
    window.value = info.window;

    list.value.forEach((d) => {
      d.count = info[d.type];
    });
  }
});

onMounted(async () => {
  await getAreaData();
});

defineExpose({
  reset
});
</script>
<style scoped lang="scss">
.page-detail {
  height: 100%;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
  font-size: 14px;

  &-content {
    flex: 1;
    height: calc(100% - 2rem);
    padding-right: 8px;
    .back-btn {
      width: 96px;
      height: 32px;
      background: url('@/assets/backBtn.png') no-repeat;
      cursor: pointer;
      margin-left: 28px;
    }
    .list {
      height: 192px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
      padding: 0 12px 24px 0;
      &-item {
        width: 32%;
        background: #f2f5f9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        .one {
          height: 40px;
          margin: 25px 34px 16px 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 40px;
            height: 40px;
            object-fit: cover;
          }
        }
        .two {
          flex: 1.5;
          font-size: 14px;
          color: #11191e;
          display: flex;
          align-items: start;
          justify-content: center;
          text-align: center;
        }
        .three {
          flex: 1;
          color: #0099ff;
          display: flex;

          justify-content: center;
          font-size: 18px;
          font-weight: 700;
        }
      }
    }
    .too {
      width: 100%;
      height: 100px;
      margin: auto;
      padding-top: 20px;
      display: flex;
      flex-wrap: wrap;

      &-item {
        height: 36px;
        min-width: 120px;
        display: flex;
        background: #e6eaeb;
        border-radius: 18px;
        .point {
          width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .text {
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 400;
        }
        .num {
          width: 40px;

          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      }
    }

    .photos {
      height: calc(100% - 300px);
      overflow: auto;
      .photos-item img {
        width: 300px;
        height: 250px;
        object-fit: cover;
      }
    }
  }
}
</style>
