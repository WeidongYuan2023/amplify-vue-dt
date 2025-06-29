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
                        <img src="@/assets/surface-analysis/icon-gross.png" alt />
                    </div>
                    <div class="two">
                        Gross
                        <br />SQ.FT
                    </div>
                    <div class="three">{{ store.gross }}</div>
                </div>
                <div class="list-item">
                    <div class="one">
                        <img src="@/assets/surface-analysis/icon-cleanable.png" alt />
                    </div>
                    <div class="two">
                        Cleanable
                        <br />SQ.FT
                    </div>
                    <div class="three">{{ store.cleanable }}</div>
                </div>
                <div class="list-item">
                    <div class="one">
                        <img src="@/assets/surface-analysis/icon-robot.png" alt />
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
            <img style="width: 100%; height: auto;" src="@/assets/surface-analysis/0734550094239771.jpg" />
            <img style="width: 100%; height: auto;" src="@/assets/surface-analysis/0734550393617694.jpg" />
            <img style="width: 100%; height: auto;" src="@/assets/surface-analysis/0734550483510973.jpg" />

        </div>

    </div>
</template>




<script setup>
import { ref, onMounted, watchEffect, defineExpose } from "vue";
let detailContent = ref(null);

import { mainStore } from "@/store/store";
let store = mainStore();

onMounted(() => { });
</script>




<style scoped lang="less">
.page-detail {
    // height: 45%;
    width: 100%;
    overflow: auto;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
    font-size: 14px;

    &-title {
        flex: 1;
        position: relative;
        color: #3f3f8c;
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;

        .border {
            position: absolute;
            bottom: 23%;
            left: 0%;
            height: 1px;
            width: 28%;
            background: #3f3f8c;
        }
    }

    &-content {
        flex: 5;
        margin-top: 5px;

        .back-btn {
            width: 96px;
            height: 32px;
            background: url("/assets/backBtn.png") no-repeat;
            cursor: pointer;
            margin-left: 28px;
        }

        .list {
            width: 344px;
            height: 192px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;

            &-item {
                width: 32%;
                background: #f2f5f9;
                border-radius: 8px;
                display: flex;
                flex-direction: column;

                .one {
                    flex: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    img {
                        width: 40px;
                        height: 40px;
                    }
                }

                .two {
                    flex: 1.5;
                    font-size: 14px;
                    color: #11191e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
            width: 340px;
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
    }

    &-images {
        flex: 5;
        width: 100%;
        height: auto;

    }
}
</style>