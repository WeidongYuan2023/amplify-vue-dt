<template>
  <div class="page-left-top2">
    <div class="aside-3D-title">Floor guides</div>
    <div class="page-left-top2-content" @mouseleave="handleMouseLeave">
      <el-tree ref="treeRef" :data="store.areas" :props="defaultProps" :default-expanded-keys="expands" node-key="id" @node-click="handleNodeClick">
        <template #default="{ node }">
          <span class="custom-tree-node">
            <span :class="['bk-text-color', { 'active-status': !activeId }, { 'active-node': node.label.toLowerCase() === activeId.toLowerCase() }]">
              {{ node.label }}
            </span>
            <span> </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { mainStore } from '@/store/model';
const expands = ref([1]);
const treeRef = ref(null);
const activeId = ref('');
let store = mainStore();

const defaultProps = {
  children: 'children',
  label: 'treeName'
};

const props = defineProps({
  focusItem: {
    type: String,
    default: ''
  }
});

let floorArray = ref([]);

let chooseNum = ref(99);
let hoverNum = ref(99);

const choose = (index) => {
  chooseNum.value = index;
};

const handleMouseOver = (index) => {
  hoverNum.value = index;
};
const handleMouseLeave = () => {
  hoverNum.value = 99;
};

const emit = defineEmits(['click', 'on-hide', 'on-hide1', 'on-hide2', 'on-show']);
const handleNodeClick = (data) => {
  activeId.value = data.treeName;
  if (data.children.length == 0) {
    if (data.label == 'Overview') {
      emit('on-show', data);
    } else {
      store.roomName = data.label;
      emit('click', data);
    }
  } else if (data.label == 'Level 1') {
    emit('on-hide');
  }
};

const hasChildrenIds = store.areas.filter((d) => d.children.length > 0).map((d) => d.id);
let activeNode = '';

const findParentByTreeName = (data, targetTreeName) => {
  for (const item of data) {
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        if (child.treeName.toLowerCase() === targetTreeName.toLowerCase()) {
          return item;
        }
        // 递归处理子节点的子节点
        const result = findParentByTreeName([child], targetTreeName);
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
};

const setFocus = (label) => {
  const parent = findParentByTreeName(store.areas, label);
  const treeStore = treeRef.value?.store;

  if (parent && parent.id && parent.id != activeNode) {
    if (treeStore) {
      hasChildrenIds.forEach((d) => {
        const node = treeStore.getNode(d);
        if (node) {
          node.expanded = false;
        }
      });
      const node = treeStore.getNode(parent.id);
      if (node) {
        activeNode = parent.id;
        node.expanded = true;
      }
    }
  } else if (parent == null && activeNode) {
    const node = treeStore.getNode(activeNode);
    if (node) {
      node.expanded = false;
      activeNode = '';
    }
  }

  activeId.value = label;
};

onMounted(() => {});

defineExpose({
  setFocus
});
</script>

<style scoped lang="scss">
.el-tree-node:focus > .el-tree-node__content {
  background: url('@/assets/Menu.png') no-repeat !important;
  background-size: 95% 100% !important;
}

.select {
  background: url('@/assets/Nor=Sel.png') no-repeat !important;
  background-size: 100% 100% !important;
}

.unselect {
  background: none;
}

.hover {
  background: url('@/assets/Nor=Hover.png') no-repeat;
  background-size: 100% 100%;
}

.active-node {
  -webkit-text-fill-color: #000e33 !important;
  color: #000e33;
}

.unhover {
  background: none;
}

.bk-text-color {
  background: var(--gradient-color);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-left-top2 {
  // width: 100%;
  height: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
  background: url('@/assets/bg-left.png') no-repeat;
  background-size: 100% 100%;
  padding-left: 20px;
  padding-right: 24px;
  box-shadow:
    -10px 0px 40px rgba(211, 219, 224, 0.4),
    inset 0px 0px 24px rgba(0, 153, 255, 0.05);
  backdrop-filter: blur(5.25px);
  /* Note: backdrop-filter has minimal browser support */
  border-radius: 8px;

  .page-left-top2-title {
    flex: 1;
    position: relative;
    background: var(--gradient-color);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    font-size: 18px;

    .border {
      bottom: 24%;
      left: 0%;
      height: 1px;
      width: 29%;
      background: var(--gradient-color);
    }
  }

  .page-left-top2-content {
    flex: 12;
    overflow: auto;

    :deep(.el-tree) {
      height: 100%;
      background: transparent;

      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;

        span {
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
          padding-left: 24px;
        }
      }

      .el-tree-node__content {
        height: 60px;
        width: 100%;
        font-size: 18px;
        color: #3f3f8c;
        font-weight: 700;
        background: url('@/assets/3D_BTNCascader.png') no-repeat;
        background-size: 95% 100%;
      }

      .el-tree-node__content:hover {
        background: url('@/assets/3D_BTNCascader1.png') no-repeat;
        background-size: 95% 100%;
      }

      .el-tree-node__content:focus {
        background: url('@/assets/Menu.png') no-repeat;
        background-size: 95% 100%;
      }

      .el-icon {
        display: none;
      }
    }

    .page-left-top2-content-item {
      flex: 1;
      display: flex;
      width: 85%;
      box-sizing: border-box;
      border-top: 1px solid #fff;
      border-image: linear-gradient(to right, #fff 1%, #588bf5 40%, rgba(0, 0, 0, 0) 45%) 1;
      font-size: 18px;
      color: #3f3f8c;
      font-weight: 700;
      align-items: center;
      text-indent: 15px;
      cursor: pointer;
      padding: 0;
    }
  }
}
</style>
