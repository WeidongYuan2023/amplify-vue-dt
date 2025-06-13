<template>
    <div class="page-building-info">
        <div class="page-building-info-title">
            Building Info
            <div class="border"></div>
        </div>

        <div class="page-building-info-content" ref="buildingInfoContent">
            <div class="page-building-info-content-text">
                This building is an office of Foxx Development Inc., which is a global brand founded in the United States.
                Foxx has business in the fields of AIoT, robotics, 5G and smartphones, and has strong product design and supply
                chain capabilities.
            </div>
            <div class="photos">
                <div class="photos-item">
                    <img src="/assets/basic-info/google-front-view.png" alt="Front View" />
                </div>

                <div class="photos-item">
                    <img src="/assets/basic-info/google-top-view.png" alt="Top View" />
                </div>

                <div class="photos-item">
                    <div class="floor-plan">Floor Plan</div>
                </div>
            </div>


            <div class="address">
                <div class="address-icon"></div>
                <div class="address-text">Foxx Development Inc.</div>
                <div class="address-line"></div>
            </div>
            <div class="open">
                <div class="open-icon"></div>
                <div class="open-text">9 AM to 5 PM</div>
                <div class="open-line"></div>
            </div>
            <div class="telephone">
                <div class="telephone-icon"></div>
                <div class="telephone-text">+1 855-515-3699</div>
            </div>
            <div class="website">
                <div class="website-icon"></div>
                <div class="website-text">https://foxxdevelopment.com</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { mainStore } from "@/store/store";

let buildingInfoContent = ref(null);
let store = mainStore();

onMounted(() => { });
</script>

<style scoped>
.page-building-info {
    flex: 2;
    width: 100%;
    height: 100%;
    z-index: 9 !important;
    display: flex;
    flex-direction: column;
    font-size: 18px;
    position: relative;
    overflow: auto;
}

.page-building-info-title {
    flex: 1;
    position: relative;
    color: #3f3f8c;
    font-weight: 700;
    display: flex;
    align-items: center;
}

.border {
    position: absolute;
    bottom: 23%;
    left: 0%;
    height: 1px;
    width: 30%;
    background: #3f3f8c;
}

.page-building-info-content {
    flex: 10;
}

.page-building-info-content-text {
    flex: 5;
    margin-bottom: 20px;
}

.photos {
    position: relative;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.photos-item {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: left;
    position: relative;
}

.photos-item img {
    width: 95%;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
}

.floor-plan {
    width: 95%;
    height: 150px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #666;
}

.address, .open, .telephone, .website {
    width: 100%;
    height: 40px;
    position: relative;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
}

.address-icon, .open-icon, .telephone-icon, .website-icon {
    width: 40px;
    height: 40px;
    background-color: #eee;
    border-radius: 50%;
}

.address-text, .open-text, .telephone-text, .website-text {
    height: 40px;
    font-weight: 600;
    font-size: 16px;
    color: #4c90cd;
    line-height: 40px;
    padding-left: 15px;
    flex: 1;
}

.address-line, .open-line {
    width: 40px;
    height: 40px;
    background-color: #eee;
    border-radius: 50%;
    cursor: pointer;
}

.address-icon {
    background: url("/assets/04.svg") no-repeat center;
    background-size: 24px;
}

.open-icon {
    background: url("/assets/03.svg") no-repeat center;
    background-size: 24px;
}

.telephone-icon {
    background: url("/assets/02.svg") no-repeat center;
    background-size: 24px;
}

.website-icon {
    background: url("/assets/01.svg") no-repeat center;
    background-size: 24px;
}

.address-line {
    background: url("/assets/05+.svg") no-repeat center;
    background-size: 24px;
}

.open-line {
    background: url("/assets/Droplist.svg") no-repeat center;
    background-size: 24px;
}
</style>