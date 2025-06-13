<template>
    <div class="page-sensors">
      <div class="aside-3D-title">Sensors Info</div>
      <div v-if="!showDetail" class="page-sensors-content">
        <div v-for="(item, index) in sensors" :key="index" class="page-sensors-content-item" @click="handleClick(item)">
          <div class="icon">
            <img :src="item.icon" alt />
          </div>
          <div class="text">
            <div class="sensorName" :title="item.name">{{ item.name }}</div>
            <div style="font-size: 14px; font-weight: 400; color: #000">{{ item.type }}</div>
          </div>
          <div class="num">
            <div class="num-fault">{{ item.fault }}</div>
            <div class="num-outline">{{ item.outline }}</div>
            <div class="num-online">{{ item.online }}</div>
          </div>
        </div>
      </div>
      <div v-if="showDetail" class="device-list">
        <div v-for="(sensor, index) in sensorsDetails" :key="index" class="page-sensors-details-content-item">
          <Tip :sensor="sensor" />
        </div>
        <div class="page-sensors-details-content-item">
          <div class="back-btn" @click="close"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { mainStore } from '@/store/model';
  import { modelStore } from '@/store/index';

  import Tip from '@/components/features/Tip.vue';
//   import { getSensorList, getSensor } from '@/api/model';
  
  const store = mainStore();
  const model = modelStore();
  const props = defineProps({
    sensorName: {
      type: String,
      default: ''
    }
  });
  const emit = defineEmits(['updateIcon']);
  
  const showDetail = ref(false);
  const sensorsDetails = ref([]);
  const startPadding = `${store.rootPath}/${store.monitoring.rootPath}/`;
  const getIcon = (node) => {
    let icon = '';
    switch (node.type.toLowerCase()) {
      case 'am319':
        icon = getImage(`am319.svg`);
        break;
      case 'ct310':
        icon = getImage(`ct310.svg`);
        break;
      case 'em500pp':
        icon = getImage(`em500pp.svg`);
        break;
      case 'gs301':
        icon = getImage(`gs301.svg`);
        break;
      case 'ws303':
        icon = getImage(`ws303.svg`);
        break;
      default:
        icon = ' ';
    }
    return icon;
  };
  
//   const getSvg = (node) => {
//     return getImage(`${node.type}.png`);
//   };
  
  const getDevices = (node) => {
    let icon = '';
    const status = revertStatus(node.status);
    switch (node.type.toLowerCase()) {
      case 'am319':
        icon = getImage(`am319-${status}.png`);
        break;
      case 'ct310':
        icon = getImage(`ct310-${status}.png`);
        break;
      case 'em500pp':
        icon = getImage(`em500pp-${status}.png`);
        break;
      case 'gs301':
        icon = getImage(`gs301-${status}.png`);
        break;
      case 'ws303':
        icon = getImage(`ws303-${status}.png`);
        break;
      default:
        icon = ' ';
    }
    return icon;
  };
  
  const getImage = (imgPath) => {
    return new URL(`/src/assets/monitoring/devices/${imgPath}`, import.meta.url).href;
  };
  
  const revertStatus = (status) => {
    return status
    switch (status) {
      case '0':
        return 'normal';
      case '1':
        return 'error';
      case '2':
        return 'warning';
      case '3':
        return 'warning';
      default:
        return 'normal';
    }
  };
  
  const getData = (sensors) => {
    return sensors
      .filter((d) => d.areaId != null)
      .map((d) => {
        d.icon = getIcon(d);
        const status = revertStatus(d.status);
        // d.online = status === 'normal' ? d.sensorCount : 0;
        // d.outline = status === 'warning' ? d.sensorCount : 0;
        // d.fault = status === 'error' ? d.sensorCount : 0;
        const count = d.children.length;
        d.online = status === 'normal' ? count : 0;
        d.outline = status === 'warning' ? count : 0;
        d.fault = status === 'error' ? count : 0;
  
        return d;
      });
  };
  
  let sensors = ref([]);
  
  const handleClick = async (item) => {
    model.setSensor(item);
    // const details = await getSensor(item.id);
    // showDetail.value = true;
    // details.data.forEach((d) => {
    //   d.icon = getSvg(d);
    // });
    // sensorsDetails.value = details.data;
  };
  
  // get sensor info list
//   const sensorClick = async (areaId) => {
//     const id = sensors.value.find((item) => item.areaId === areaId)?.id;
//     const details = await getSensor(id);
  
//     if (details) {
//       showDetail.value = true;
//       details.data.forEach((d) => {
//         d.icon = getSvg(d);
//       });
//       sensorsDetails.value = details.data;
//     }
//   };
  
  // name: Area10
  const getModelIconPath = (name) => {
    const modelAreaID = name.replace(/(\D)(\d)/, '$1-$2');
    const node = sensors.value.find((d) => d.areaId.toLowerCase() === modelAreaID.toLowerCase());
    return node ? getDevices(node) : '';
  };
  
  const getModelIcon = (id) => {
    const node = sensors.value.find((d) => d.areaId.toLowerCase() === id.toLowerCase()) || {};
    return node;
  };
  
  const close = () => {
    showDetail.value = false;
  };
  
//   const showIcon = async () => {
//     const values = await getSensorList(store.activeId);
//     const data = values.rows;
  
//     sensors.value = getData(data);
//     emit('updateIcon', 2);
//   };
  // 监听父组件传递的 modelValue 变化
  // watchEffect(() => {
  //   const data = store.monitoring.info.find((d) => d.areaId === props.sensorName);
  
  //   if (data) {
  //     showDetail.value = true;
  //     sensorsDetails.value = data.children;
  //   }
  // });
  sensors.value = getData(store.monitoring.info);
  onMounted(async () => {
    // const values = await getSensorList(store.activeId);
    // const data = values?.rows;
  
    // sensors.value = getData(data);
  });
  
  defineExpose({
    getDevices,
    // showDetail,
    close,
    // sensorClick,
    // sensors,
    // showIcon,
    getModelIconPath,
    getModelIcon
  });
  </script>
  <style scoped lang="scss">
  .page-sensors {
    width: 376px;
    height: 100%;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
    &-title {
      position: relative;
      height: 28px;
      color: #3f3f8c;
      font-weight: 700;
      display: flex;
      align-items: center;
      margin: 16px 0;
      font-size: 18px;
      line-height: 22px;
      .border {
        position: absolute;
        left: 0%;
        height: 1px;
        width: 30%;
        bottom: 0;
      }
    }
    &-content {
      flex: 1;
      overflow: auto;
      padding-right: 16px;
      &-item {
        width: 100%;
        height: 64px;
        display: flex;
        cursor: pointer;
        background: var(--layout-bg_divider, #d3dbe066);
        margin-top: 8px;
        border-radius: 8px;
        .icon {
          flex: 1.3;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 40px;
            height: 40px;
            object-fit: cover;
          }
        }
        .text {
          flex: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .sensorName {
            font-size: 18px;
            font-weight: 700;
            color: #0099ff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .num {
          flex: 3;
          display: flex;
          justify-content: flex-end;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          padding-right: 12px;
          gap: 6px;
  
          .btn {
            box-shadow: 2px 6px 10px rgba(0, 0, 0, 0.25);
            cursor: pointer;
            transition:
              transform 0.2s ease-in-out,
              box-shadow 0.3s ease;
          }
  
          &-online {
            width: 32px;
            height: 16px;
            background: linear-gradient(135deg, #005bcde5, #003e90eb);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            margin-top: 10px;
            border-radius: 10px;
            text-align: center;
            line-height: 16px;
          }
          &-outline {
            width: 32px;
            height: 16px;
            background: linear-gradient(135deg, #edb601e5, #997501eb);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            margin-top: 10px;
            border-radius: 10px;
            text-align: center;
            line-height: 16px;
          }
          &-fault {
            width: 32px;
            height: 16px;
            background: linear-gradient(135deg, #ff384ce5, #99222eeb);
  
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            margin-top: 10px;
            border-radius: 10px;
            text-align: center;
            line-height: 16px;
          }
        }
      }
    }
  
    .device-list {
      overflow: auto;
      img {
        width: 324px;
        height: 104px;
        object-fit: cover;
      }
      .back-btn {
        width: 96px;
        height: 32px;
        margin-top: 32px;
        background: url('@/assets/backBtn.png');
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
  }
  </style>
  