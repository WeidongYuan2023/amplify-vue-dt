<template>
    <div class="page-left-top2">
        <div class="page-left-top2-title">
            Floor guides
            <div class="border"></div>
        </div>
        <div class="page-left-top2-content" @mouseleave="handleMouseLeave">
            <el-tree :data="store.model" :props="defaultProps" @node-click="handleNodeClick"
                :default-expanded-keys="[1]" node-key="id">
                <template #default="{ node }">
                    <span class="custom-tree-node">
                        <span>{{ node.label }}</span>
                    </span>
                </template>
            </el-tree>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import hoverImg from "/assets/Nor=Hover.png";
import selectImg from "/assets/Nor=Sel.png";
import { mainStore } from "@/store/store";
let store = mainStore();

const defaultProps = {
    children: "children",
    label: "label"
};

let floorArray = ref([]);

let chooseNum = ref(99);
let hoverNum = ref(99);

const choose = index => {
    chooseNum.value = index;
};

const handleMouseOver = index => {
    hoverNum.value = index;
};
const handleMouseLeave = () => {
    hoverNum.value = 99;
};

const emit = defineEmits([
    "on-click",
    "on-hide",
    "on-hide1",
    "on-hide2",
    "on-show"
]);
const handleNodeClick = (data) => {
    console.log(data);

    if (data.children.length == 0) {
        if (data.label == "Overview") {
            emit("on-show");
            store.moduleIndex = 0;
        } else {
            store.roomName = data.label;
            store.currentArea = data;
            emit("on-click", data.label);
            // store.moduleIndex = 88;
        }
    } else {
        if (data.label == "Level 1") {
            emit("on-hide");
        }
    }
};

onMounted(() => { });
</script>

<style>
.el-tree-node:focus>.el-tree-node__content {
    background: url("/assets/Menu.png") no-repeat !important;
    background-size: 95% 100% !important;
}
</style>
<style scoped>
.select {
    background: url("/assets/Nor=Sel.png") no-repeat !important;
    background-size: 100% 100% !important;
}

.unselect {
    background: none;
}

.hover {
    background: url("/assets/Nor=Hover.png") no-repeat;
    background-size: 100% 100%;
}

.unhover {
    background: none;
}

.page-left-top2 {
    width: 100%;
    height: 100%;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
}

.page-left-top2-title {
    flex: 1;
    position: relative;
    color: #3f3f8c;
    font-weight: 700;
    display: flex;
    align-items: center;
    font-size: 18px;
}

.page-left-top2-title .border {
    position: absolute;
    bottom: 23%;
    left: 0%;
    height: 1px;
    width: 31%;
    background: #3f3f8c;
}

.page-left-top2-content {
    flex: 12;
    overflow: auto;
}

.page-left-top2-content :deep(.el-tree) {
    height: 100%;
    background: transparent;
}

.page-left-top2-content :deep(.el-tree) .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-left: 10px;
}

.page-left-top2-content :deep(.el-tree) .el-tree-node__content {
    height: 60px;
    width: 100%;
    font-size: 18px;
    color: #3f3f8c;
    font-weight: 700;
    background: url("/assets/3D_BTNCascader.png") no-repeat;
    background-size: 95% 100%;
}

.page-left-top2-content :deep(.el-tree) .el-tree-node__content:hover {
    background: url("/assets/3D_BTNCascader1.png") no-repeat;
    background-size: 95% 100%;
}

.page-left-top2-content :deep(.el-tree) .el-tree-node__content:focus {
    background: url("/assets/Menu.png") no-repeat;
    background-size: 95% 100%;
}

.page-left-top2-content :deep(.el-tree) .el-icon {
    display: none;
}

.page-left-top2-content-item {
    flex: 1;
    display: flex;
    width: 85%;
    box-sizing: border-box;
    border-top: 1px solid #fff;
    border-image: linear-gradient(to right,
        #fff 1%,
        #588bf5 40%,
        rgba(0, 0, 0, 0) 45%) 1;
    font-size: 18px;
    color: #3f3f8c;
    font-weight: 700;
    align-items: center;
    text-indent: 15px;
    cursor: pointer;
    padding: 0;
}
</style> 