<template>
    <div class="page-robots">
        <div class="page-robots-title">
            Robots Info
            <div class="border"></div>
        </div>
        <div class="page-robots-content">
            <div class="page-robots-content-item" v-for="(item, index) in robotInfo" :key="index">
                <div class="top">
                    <img src="/assets/robot.png" alt />
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
                            <div class="middle-item-content-text">{{ item.State }}</div>
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
                            <img src="/assets/startContent1.png" alt />
                            <div class="bottom-item1-btn-text">View cleaningSQFT</div>
                        </div>
                    </div>
                    <div class="bottom-item3">
                        <div class="bottom-item3-btn">
                            <el-icon style="transform: rotateZ(90deg);">
                                <MoreFilled />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page-robots-content-details">
                <div class="page-robots-content-details-title">Task Report</div>
                <div class="erwei">
                    <img src="/assets/cleaning-robots/TaskReport_GS142-0120-21N-5000_20230210050625.png" alt="">
                    <div class="more-btn"></div>
                    <div class="back-btn" @click="handleClick"> </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { MoreFilled } from "@element-plus/icons-vue";
import { mainStore } from "@/store/store";

let store = mainStore();

import inFeet from "/assets/0.png";
import battery100 from "/assets/startContent.png";

let robotInfo = ref([
    {
        name: "NEXUS-F1-CR201",
        type: "Robot T800-FX100",
        status: "Online",
        batteryLife: " 2h 80min",
        scopeResp: "39,527 SQFT",
        State: "In Fleet",
        battery: " 100%",
        stateIcon: inFeet,
        batteryIcon: battery100
    }
]);


const handleClick = () => {
    store.moduleIndex = 3
    store.dialogVisibleRobot = false
};

onMounted(() => { });
</script>

<style scoped>
.page-robots {
    overflow: auto;
    width: 100%;
    height: 100%;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
}

.page-robots-title {
    flex: 1;
    position: relative;
    color: #3f3f8c;
    font-weight: 700;
    display: flex;
    align-items: center;
    font-size: 18px;
}

.page-robots-title .border {
    position: absolute;
    bottom: 23%;
    left: 0%;
    height: 1px;
    width: 28%;
    background: #3f3f8c;
}

.page-robots-content {
    flex: 12;
}

.page-robots-content-item:nth-child(n + 2) {
    margin-top: 16px;
}

.page-robots-content-item {
    width: 344px;
    height: 192px;
    border-radius: 10px;
    background: #f5f7f9;
}

.page-robots-content-item .top {
    width: 100%;
    height: 40%;
    display: flex;
    padding-top: 24px;
    padding-left: 24px;
    box-sizing: border-box;
}

.page-robots-content-item .top img {
    width: 40px;
    height: 40px;
}

.page-robots-content-item .top .title {
    margin-left: 16px;
}

.page-robots-content-item .top .title-name {
    font-size: 16px;
    font-weight: 600;
}

.page-robots-content-item .top .title-type {
    font-size: 8px;
    color: #71797e;
    font-weight: 600;
}

.page-robots-content-item .top .robot-status {
    width: 56px;
    height: 24px;
    border-radius: 12px;
    background: #ebf8ee;
    margin-left: 44px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00ba4a;
    font-size: 12px;
}

.page-robots-content-item .middle {
    width: 100%;
    height: 30%;
    display: flex;
    padding: 0 24px 0 24px;
    box-sizing: border-box;
}

.page-robots-content-item .middle-item {
    flex: 1;
}

.page-robots-content-item .middle-item-title {
    width: 100%;
    font-size: 12px;
    height: 50%;
    color: #71797e;
    display: flex;
    align-items: center;
}

.page-robots-content-item .middle-item-content {
    width: 100%;
    height: 50%;
    color: #11191e;
    font-weight: 600;
    font-size: 12px;
    display: flex;
}

.page-robots-content-item .middle-item-content img {
    width: 22px;
    height: 16px;
}

.page-robots-content-item .middle-item-content-text {
    margin-left: 12px;
}

.page-robots-content-item .bottom {
    width: 100%;
    height: 30%;
    display: flex;
    padding: 0 14px 0 14px;
    box-sizing: border-box;
    border-top: 1px solid #ced5d7;
}

.page-robots-content-item .bottom-item1 {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-robots-content-item .bottom-item1-btn {
    width: 80px;
    height: 32px;
    border-radius: 5px;
    border: 1px solid #ced5d7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-robots-content-item .bottom-item1-btn img {
    width: 16px;
    height: 16px;
}

.page-robots-content-item .bottom-item1-btn-text {
    color: #71797e;
    font-size: 12px;
    font-weight: 600;
    margin-left: 8px;
}

.page-robots-content-item .bottom-item2 {
    flex: 3;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-robots-content-item .bottom-item2-btn {
    width: 168px;
    height: 32px;
    border-radius: 5px;
    border: 1px solid #ced5d7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-robots-content-item .bottom-item2-btn img {
    width: 16px;
    height: 16px;
}

.page-robots-content-item .bottom-item3 {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-robots-content-item .bottom-item3-btn {
    width: 32px;
    height: 32px;
    border-radius: 5px;
    border: 1px solid #ced5d7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-robots-content-details {
    margin-top: 16px;
    width: 344px;
    height: 340px;
    border-radius: 10px;
    background: #f5f7f9;
    padding: 24px;
    box-sizing: border-box;
}

.page-robots-content-details-title {
    font-size: 16px;
    font-weight: 600;
}

.erwei {
    width: 100%;
    height: 260px;
    position: relative;
}

.erwei img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.erwei .more-btn {
    position: absolute;
    top: 230px;
    right: 0px;
    width: 72px;
    height: 48px;
    background: url("/assets/Frame 527.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
}

.erwei .back-btn {
    width: 96px;
    height: 32px;
    background: url("/assets/backBtn.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    position: absolute;
    left: 0;
    top: 239px;
}
</style> 