<template>
    <div class="page-robots">
      <div class="aside-3D-title">Robots Info</div>
      <div class="page-robots-content">
        <div v-for="(item, index) in robotInfo" :key="index" class="page-robots-content-item">
          <div class="top">
            <img src="@/assets/cleaning-robots/robot.png" alt />
            <div class="title">
              <div class="title-name">{{ item.name }}</div>
              <div class="title-type">{{ item.type }}</div>
            </div>
            <div class="robot-status">{{ item.status }}</div>
          </div>
          <div class="middle">
            <div class="middle-item">
              <div class="middle-item-title">Battery life</div>
              <div class="middle-item-content">{{ item.batteryLife }}</div>
            </div>
            <div class="middle-item">
              <div class="middle-item-title">Scope of Resp</div>
              <div class="middle-item-content">{{ item.scopeResp }}</div>
            </div>
            <div class="middle-item">
              <div class="middle-item-title">State</div>
              <div class="middle-item-content">
                <img :src="item.stateIcon" alt />
                <div class="middle-item-content-text">{{ item.state }}</div>
              </div>
            </div>
          </div>
          <div class="bottom">
            <div class="bottom-item1">
              <div class="bottom-item1-btn">
                <img :src="item.batteryIcon" alt />
                <div class="bottom-item1-btn-text">{{ item.battery }}</div>
              </div>
            </div>
            <div class="bottom-item2">
              <div class="bottom-item2-btn">
                <img src="@/assets/cleaning-robots/startContent.png" alt />
                <div class="bottom-item2-btn-text">View cleaningSQFT</div>
              </div>
            </div>
            <div class="bottom-item3">
              <div class="bottom-item3-btn">
               <SvgIcon name="more" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="showDetail" class="page-robots-content-details">
          <div class="page-robots-content-details-title">task report</div>
          <div class="erwei">
            <img src="@/assets/cleaning-robots/taskReport.png" alt="" />
            <div class="more-btn"></div>
            <div class="back-btn" @click="handleClick"></div>
          </div>
        </div>
      </div>
      <teleport to="body">
        <el-dialog v-model="showDialog" title width="900" @close="closeDialog">
          <img style="width: 800px; height: 270px" src="@/assets/cleaning-robots/ysg.png" alt />
        </el-dialog>
      </teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watchEffect, defineExpose } from 'vue';
  import SvgIcon from '@/components/features/SvgIcon.vue';
  import { mainStore } from '@/store/model';
  
  const props = defineProps({
    robotName: {
      type: String,
      default: ''
    }
  });
  
  let store = mainStore();
  const showDetail = ref(false);
  const showDialog = ref(false);
  
  const handleClick = () => {
    store.rightIndex = 3;
    showDetail.value = false;
  };
  const getTypeIcon = async (type) => {
    const iconMap = {
      maintenance: () => import('@/assets/cleaning-robots/maintenance.png'),
      stops: () => import('@/assets/cleaning-robots/stops.png'),
      'In Fleet': () => import('@/assets/cleaning-robots/inFleet.png'),
      inFleet: () => import('@/assets/cleaning-robots/inFleet.png')
    };
  
    const module = await(iconMap[type] || iconMap.inFleet)();
    console.log('getTypeIcon', module.default);
    return module.default;
  };
  
  const getValueIcon = async (value) => {
    const percentageMap = {
      '100%': () => import('@/assets/cleaning-robots/p100.png'),
      '90%': () => import('@/assets/cleaning-robots/p90.png'),
      '75%': () => import('@/assets/cleaning-robots/p75.png')
    };
  
    const module = await(percentageMap[value.trim()] || percentageMap['75%'])();
    console.log('getValueIcon', module.default);
    return module.default;
  };
  
  const getDevices = (node) => {
    const robots = {
      'Area6': 'robotImg.png',
      'Area8': 'robotImg.png'
    };
    return robots[node];
  };
  
  const loadRobotData = async () => {
    const data = [];
  
    for (const d of store.robots.info) {
      data.push({
        ...d,
        stateIcon: await getTypeIcon(d.state),
        batteryIcon: await getValueIcon(d.battery)
      });
    }
  
    return data;
  };
  
  const robotInfo = ref([]);
  
  const closeDialog = () => {
    showDialog.value = false;
  };
  
  const close = () => {
    showDetail.value = false;
    showDialog.value = false;
  };
  
  const triggerDialog = () => {
    showDialog.value = true;
  };
  
  onMounted(async () => {
    robotInfo.value = await loadRobotData();
  });
  
  watchEffect(() => {
    console.log('props.robotName', props.robotName);
  
    if (!props.robotName) return;
  
    showDetail.value = true;
    showDialog.value = true;
  });
  
  defineExpose({
    showDetail,
    triggerDialog,
    close
  });
  </script>
  <style scoped lang="scss">
  .page-robots {
    min-width: 20rem;
    height: 100%;
    padding: 0 8px 0 8px;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
  
    .page-robots-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 8px;
  
      .page-robots-content-item:nth-child(n + 2) {
        margin-top: 16px;
      }
  
      .page-robots-content-item {
        width: 20rem;
        height: 192px;
        border-radius: 10px;
        background: var(--layout-bg_Panel, #ffffff);
  
        .top {
          width: 100%;
          height: 40%;
          display: flex;
          padding-top: 1rem;
          padding-left: 1rem;
          box-sizing: border-box;
  
          img {
            width: 40px;
            height: 40px;
            object-fit: cover;
          }
  
          .title {
            margin-left: 16px;
  
            &-name {
              font-size: 16px;
              font-weight: 600;
            }
  
            &-type {
              font-size: 8px;
              color: #71797e;
              font-weight: 600;
            }
          }
  
          .robot-status {
            width: 56px;
            height: 24px;
            border-radius: 12px;
            background: #ebf8ee;
            margin-left: 1.5rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00ba4a;
            font-size: 12px;
          }
        }
  
        .middle {
          width: 100%;
          height: 30%;
          display: flex;
          padding: 0 0.5rem 0 1rem;
          box-sizing: border-box;
          gap: 1rem;
  
          .middle-item {
            .middle-item-title {
              width: 100%;
              font-size: 12px;
              height: 50%;
              color: #71797e;
              display: flex;
              align-items: center;
            }
  
            .middle-item-content {
              width: 100%;
              height: 50%;
              color: #11191e;
              font-weight: 600;
              font-size: 12px;
              display: flex;
  
              img {
                width: 22px;
                height: 16px;
                object-fit: cover;
              }
  
              &-text {
                margin-left: 0.5rem;
              }
            }
          }
        }
  
        .bottom {
          width: 100%;
          height: 30%;
          display: flex;
          padding: 0 14px 0 14px;
          box-sizing: border-box;
          border-top: 1px solid #ced5d7;
  
          .bottom-item1 {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 0.5rem;
  
            .bottom-item1-btn {
              width: 60px;
              height: 32px;
              border-radius: 5px;
              border: 1px solid #ced5d7;
              display: flex;
              align-items: center;
              justify-content: center;
  
              img {
                width: 16px;
                height: 16px;
                object-fit: cover;
              }
  
              &-text {
                color: #71797e;
                font-size: 12px;
                font-weight: 600;
                margin-left: 8px;
              }
            }
          }
  
          .bottom-item2 {
            flex: 3;
            display: flex;
            align-items: center;
            justify-content: center;
  
            .bottom-item2-btn {
              width: 148px;
              height: 32px;
              border-radius: 5px;
              border: 1px solid #ced5d7;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0 0.5rem;
              gap: 8px;
  
              img {
                width: 16px;
                height: 16px;
                object-fit: cover;
              }
  
              &-text {
                color: #71797e;
                font-size: 12px;
                line-height: 16px;
                font-weight: 600;
                white-space: nowrap;
              }
            }
          }
  
          &-item3 {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
  
            &-btn {
              width: 32px;
              height: 32px;
              border-radius: 5px;
              border: 1px solid #ced5d7;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
  
      .page-robots-content-details {
        width: 270px;
        height: 598px;
        background: #f4f6f9;
        border-radius: 10px;
        margin-top: 10px;
        padding: 8px;
        box-sizing: border-box;
  
        .page-robots-content-details-title {
          font-size: 14px;
          font-weight: 600;
          width: 100%;
          height: 56px;
          background: #fff;
          border-radius: 5px;
          color: #000;
          display: flex;
          align-items: center;
          text-indent: 10px;
        }
  
        .robots-img {
          width: 100%;
          height: 216px;
          margin-top: 16px;
          object-fit: cover;
  
          &-title {
            width: 100%;
            height: 24px;
            display: flex;
            line-height: 24px;
  
            img {
              width: 24px;
              height: 24px;
              object-fit: cover;
            }
  
            &-text {
              font-size: 14px;
              font-weight: 400;
              margin-left: 8px;
            }
          }
  
          &-content {
            width: 100%;
            height: 176px;
            margin-top: 16px;
            :deep(.el-carousel) {
              width: 100%;
              height: 100%;
              text-align: center;
  
              img {
                width: 144px;
                height: 144px;
                margin-top: 20px;
                margin-left: auto;
                margin-right: auto;
                object-fit: cover;
              }
            }
          }
        }
  
        .erwei {
          width: 100%;
          height: auto;
          position: relative;
  
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
  
          .more-btn {
            right: 10px;
            bottom: 10px;
            background: url('@/assets/moreBtn.png') no-repeat;
            background-size: 100% 100%;
            height: 24px;
            width: 50px;
          }
  
          .back-btn {
            left: 10px;
            bottom: -20px;
            background: url('@/assets/backBtn.png') no-repeat;
            background-size: 100% 100%;
            height: 32px;
            width: 96px;
            cursor: pointer;
          }
        }
      }
    }
  }
  </style>
  