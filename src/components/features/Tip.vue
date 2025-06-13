<template>
    <div class="svg-container" :class="type == 'tip' ? '' : 'no-event'">
      <img :src="getBKImg(sensor.status)" alt="Small SVG" class="svg-background" />
      <img :src="getTypeImg(sensor)" alt="Medium SVG" class="svg-type" :class="type == 'tip' ? 'svg-type-tooltip' : ''" />
      <div class="tip-info">
        <div class="tip-type">{{ sensor.type }}</div>
        <div class="row">
          <div class="tip-value">{{ sensor.value || sensor.name }}</div>
          <div class="tip-unit">{{ sensor.unit }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { mainStore } from '@/store/model';
  const store = mainStore();
  const startPadding = `${store.rootPath}src/${store.monitoring.rootPath}`;
  const props = defineProps({
    sensor: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: 'tip'
    }
  });
  
  const getImg = (src) => {
    return store.getImg(`${startPadding}/${src}`);
  };
  const getBKImg = (curStatus) => {
    const status = revertStatus(curStatus);
    switch (status) {
      case 'normal':
        return getImg('tips/BG_Primary.png');
      case 'warning':
        return getImg('tips/BG_Warning.png');
      case 'error':
        return getImg('tips/BG_Danger.png');
      case 'success':
        return getImg('tips/BG_Success.png');
      default:
        return getImg('tips/BG_Primary.png');
    }
  };
  
  const revertStatus = (status) => {
    return status;
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
  
  const getTypeImg = (node) => {
    const status = revertStatus(node.status);
    const padding = `tip_types/${status}`;
    const typeImages = {
      co2: `${padding}/co2.svg`,
      temperature: `${padding}/temperature.svg`,
      humidity: `${padding}/humidity.svg`,
      pressure: `${padding}/pressure.svg`,
      light: `${padding}/light.svg`,
      tvoc: `${padding}/tvoc.svg`,
      pm2_5: `${padding}/pm2_5.svg`,
      pm10: `${padding}/pm10.svg`,
      hcho: `${padding}/hcho.svg`,
      leakage_status: `${padding}/leakage_status.svg`,
      am319: 'devices/am319.svg',
      ct310: 'devices/ct310.svg',
      em500_pp: 'devices/em500pp.svg',
      gs301: 'devices/gs301.svg',
      ws303: 'devices/ws303.svg'
    };
  
    const data = getImg(typeImages[node.type] || null); // 如果类型不匹配，返回 null
  
    return data;
  };
  </script>
  
  <style scoped lang="scss">
  .svg-container {
    position: relative;
  }
  
  .svg-background {
    width: 300px;
    height: 104px;
    border-radius: 10px 0px 0px 0px;
    border: 1px 0px 0px 0px;
  }
  
  .no-event {
    pointer-events: none;
  }
  
  .svg-type {
    position: absolute;
    width: 48px;
    height: 48px;
    top: 24px;
    right: 40px;
  }
  
  .svg-type-tooltip {
    width: 32px;
    height: 32px;
  }
  
  .svg-large {
    width: 150px; /* Adjust as needed */
    height: auto;
  }
  
  .tip-info {
    position: absolute;
    top: 20px;
    left: 30px;
    color: #ffffff;
  
    .tip-type {
      font-size: 16px;
      font-weight: 600;
      line-height: 28px;
      text-align: left;
    }
  
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  
    .tip-value {
      font-size: 20px;
      font-weight: 500;
      line-height: 41.69px;
      text-align: left;
      text-underline-position: from-font;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  
    .tip-unit {
      font-size: 16px;
      font-weight: 500;
      line-height: 22.58px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
    }
  }
  </style>
  