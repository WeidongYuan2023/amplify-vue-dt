<template>
    <div class="page-detail">
        <div class="page-detail-title">
            Details & WDO
            <div class="border"></div>
        </div>
        <div class="page-detail-content" ref="detailContent">
            <div class="list">
                <div class="list-item">
                    <div class="one">
                        <img src="/assets/surface-analysis/icon-gross.png" alt />
                    </div>
                    <div class="two">
                        Gross
                        <br />SQ.FT
                    </div>
                    <div class="three">{{ store.gross }}</div>
                </div>
                <div class="list-item">
                    <div class="one">
                        <img src="/assets/surface-analysis/icon-cleanable.png" alt />
                    </div>
                    <div class="two">
                        Cleanable
                        <br />SQ.FT
                    </div>
                    <div class="three">{{ store.cleanable }}</div>
                </div>
                <div class="list-item">
                    <div class="one">
                        <img src="/assets/surface-analysis/icon-robot.png" alt />
                    </div>
                    <div class="two">
                        Robot
                        <br />Cleanable
                        <br />SQ.FT
                    </div>
                    <div class="three">{{ store.robotCleanable }}</div>
                </div>
            </div>

            <div class="too">
                <div class="too-item">
                    <div class="point">
                        <div style="width: 6px;height:6px;border-radius:50%;background:#e04c53"></div>
                    </div>
                    <div class="text">Door and Opening</div>
                    <div class="num">{{ store.door }}</div>
                </div>
                <div class="too-item" style="margin-left: 10px;">
                    <div class="point">
                        <div style="width: 6px;height:6px;border-radius:50%;background:#5a98f7"></div>
                    </div>
                    <div class="text">Window</div>
                    <div class="num">{{ store.window }}</div>
                </div>

            </div>
            <!-- <div class="back-btn"></div> -->
        </div>
        <div class="page-detail-title">
            AI Processed Images
            <div class="border"></div>
        </div>
        <div class="page-detail-images">
            <img style="width: 100%; height: auto;" src="/assets/surface-analysis/0734550094239771.jpg" />
            <img style="width: 100%; height: auto;" src="/assets/surface-analysis/0734550393617694.jpg" />
            <img style="width: 100%; height: auto;" src="/assets/surface-analysis/0734550483510973.jpg" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { mainStore } from "@/store/store";
let store = mainStore();
let detailContent = ref(null);

onMounted(() => {
    console.log('surface analysis detail');
 });

 watch(() => store.currentSurface, newValue => {
    console.log('surface analysis detail', newValue);
 });
  
</script>

<style scoped>
.page-detail {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
    font-size: 14px;
}

.page-detail-title {
    flex: 1;
    position: relative;
    color: #3f3f8c;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
}

.page-detail-title .border {
    position: absolute;
    bottom: 23%;
    left: 0%;
    height: 1px;
    width: 50%;
    background: #3f3f8c;
}

.page-detail-content {
    flex: 5;
    margin-top: 5px;
}

.page-detail-content .back-btn {
    width: 96px;
    height: 32px;
    background: url("/assets/backBtn.png") no-repeat;
    cursor: pointer;
    margin-left: 28px;
}

.page-detail-content .list {
    width: 344px;
    height: 192px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
}

.page-detail-content .list-item {
    width: 32%;
    background: #f2f5f9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.page-detail-content .list-item .one {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-detail-content .list-item .one img {
    width: 40px;
    height: 40px;
}

.page-detail-content .list-item .two {
    flex: 1.5;
    font-size: 14px;
    color: #11191e;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-detail-content .list-item .three {
    flex: 1;
    color: #0099ff;
    display: flex;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
}

.page-detail-content .too {
    width: 340px;
    height: 100px;
    margin: auto;
    padding-top: 20px;
    display: flex;
    flex-wrap: wrap;
}

.page-detail-content .too-item {
    height: 36px;
    min-width: 120px;
    display: flex;
    background: #e6eaeb;
    border-radius: 18px;
}

.page-detail-content .too-item .point {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-detail-content .too-item .text {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
}

.page-detail-content .too-item .num {
    width: 40px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.page-detail-images {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    padding-bottom: 20px;
}
</style> 