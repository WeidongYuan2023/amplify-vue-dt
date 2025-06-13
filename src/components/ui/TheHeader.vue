<template>
    <header class="vr-header">
        <div class="logo-container">
            <div class="flex flex-row h-full items-center mr-8 node-icons">
                <SvgIcon v-show="showLogo" name="hamburger" @click="toggleLogo" />
                <div v-show="!showLogo" class="control-item shadow pr-4 exit pl-2" @click="toggleLogo">
                    <SvgIcon name="exit" />
                    <span class="title">{{ title }}</span>
                </div>
            </div>
        </div>
        <div class="node-icons mt-8">
            <SvgIcon v-show="showMore" name="more" @click="showMore = false" class="cursor-pointer" />
            <div v-show="!showMore" class="control-item shadow pr-4 exit" @click="showMore = true">
                <span class="title pl-4 pr-2">{{ moreTitle }}</span>
                <SvgIcon name="exit" class="cursor-pointer" />
            </div>
        </div>
        <transition name="fade">
            <div class="control-panel" v-if="!showMore">
                <div class="control-item control-group gap-2">
                    <div class="flex flex-col gap-2">
                        <div class="control-item currentTime gap-0" title="Museum Time">
                            <div class="pos-icon">
                                <SvgIcon name="building" />
                            </div>
                            <div v-if="showFullCurrentTime" class="time-container">
                                <div class="date-row text-shadow flex flex-row gap-4">
                                    <span class="w-30">{{ currentDate }}</span>
                                    <span class="w-16">{{ currentTime }}</span>
                                    <span>{{ currentWeekday }}</span>
                                </div>
                                <div class="time-label">Museum Time</div>
                            </div>
                        </div>
                        <div class="control-item buildingTime gap-0" title="Local Time">
                            <div class="pos-icon">
                                <SvgIcon name="location" />
                            </div>
                            <div v-if="showFullBuildingTime" class="time-container">
                                <div class="date-row text-shadow flex flex-row gap-4">
                                    <span class="w-30">{{ currentDate }}</span>
                                    <span class="w-16">{{ currentTime }}</span>
                                    <span>{{ currentWeekday }}</span>
                                </div>
                                <div class="time-label">Local Time</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="control-item weather" :title="getCurrentWeather.label">
                            <!-- <img :src="getCurrentWeather.icon" :alt="getCurrentWeather.label" class="control-icon" /> -->
                            <svgIcon :name="getCurrentWeather.icon" />
                            <div v-if="showFullWhether" class="whether-container pr-4 w-24">
                                <div class="temperature text-shadow">{{ getCurrentWeather.temperature }}°C</div>
                                <div class="weather-text">{{ getCurrentWeather.weatherText }}</div>
                            </div>
                        </div>
                        <div class="control-item weather" :title="getBuildingWeather.label">
                            <svgIcon :name="getBuildingWeather.icon" />
                            <div v-if="showFullWhether" class="whether-container pr-4 w-24">
                                <div class="temperature text-shadow">{{ getBuildingWeather.temperature }}°C</div>
                                <div class="weather-text">{{ getBuildingWeather.weatherText }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </header>
    <transition name="fade">
        <div class="navigation-menu" v-if="!showLogo">
            <div class="menu-container shadow">
                <div class="menu-item" @click="change('museum')"
                    :class="{ 'active': model.currentScene.name == 'museum' }">
                    <SvgIcon name="tree-node" class="menu-icon" />
                    <span>The Museum of Art</span>
                </div>
                <div class="menu-item" @click="change('morningRoom')"
                    :class="{ 'active': model.currentScene.name == 'morningRoom' }">
                    <SvgIcon name="tree-node" class="menu-icon" />
                    <span>Morning Room</span>
                </div>
                <div class="menu-item" @click="change('drawingRoom')"
                    :class="{ 'active': model.currentScene.name == 'drawingRoom' }">
                    <SvgIcon name="tree-node" class="menu-icon" />
                    <span>Great Drawing Room</span>
                </div>
                <div class="menu-item" @click="change('office')"
                    :class="{ 'active': model.currentScene.name == 'office' }">
                    <SvgIcon name="tree-node" class="menu-icon" />
                    <span>Office</span>
                </div>

            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useTime } from '@/composables/useTime'
import SvgIcon from '@/components/features/SvgIcon.vue';
import { modelStore } from '@/store/index';
const model = modelStore();

interface WeatherInfo {
    temperature: number
    weatherText: string
    icon: string
    label: string
}

// 添加天气信息方法
const getCurrentWeather = computed((): WeatherInfo => {
    return {
        temperature: 20,
        weatherText: 'Sunny',
        icon: 'Sunny',
        label: 'Sunny'
    }
})

const getBuildingWeather = computed((): WeatherInfo => {
    return {
        temperature: 16,
        weatherText: 'Thin Rain',
        icon: 'ThinRain',
        label: 'Thin Rain'
    }
})
const { timeInfo } = useTime()
const props = defineProps({
    title: {
        type: String,
        default: 'Collapse List'
    }
});

// 控制 logo 显示状态
const showLogo = ref(true)
const showFullWhether = ref(true)
const showFullCurrentTime = ref(true)
const showFullBuildingTime = ref(true)
const showMore = ref(true)
const moreTitle = ref('More Detail')
// 切换 logo 显示状态（点击时）
const toggleLogo = () => {
    showLogo.value = !showLogo.value
    // if (showLogo.value) {
    //     model.setCurrentScene('morningRoom')
    // }
};

const change = (scene: string) => {
    // model.currentScene = scene
    model.setCurrentScene(scene)
    console.log('show current Scene:', scene)
}

// 添加日期和星期的响应式引用
const currentDate = ref('')
const currentWeekday = ref('')
const currentTime = ref('')

// 更新时间函数修改
const updateTime = () => {
    currentTime.value = timeInfo.value.currentTime
    currentDate.value = timeInfo.value.currentDate
    currentWeekday.value = timeInfo.value.currentWeekday
}

onMounted(() => {
    updateTime();
});

watch(timeInfo, () => {
    updateTime()
}, { immediate: true })

onUnmounted(() => {

});
</script>

<style scoped lang="scss">
.vr-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: transparent;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 100;

    .node-icons {
        .exit {
            height: 60px;
        }
    }
}

.shadow {
    border-radius: 100px;
    background: var(--layout-White-Flat20, #FFFFFF33);
    backdrop-filter: blur(150px);
    box-shadow: 0px 17.53px 21.91px 0px var(--colorsflatB12-flat05);
    box-shadow: -0.73px 0.73px 0.73px -1.46px var(--layoutWhite-Flat30) inset;
    box-shadow: 0px 0.73px 5.84px 0px var(--layoutWhite-Flat30) inset;
}

.logo-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 50px;

    // svg {
    //     height: 40px;
    //     width: 40px;
    //     fill: white;
    //     margin-top: -8px;
    // }

    .node-icons {
        position: absolute;
        top: 1.5rem;
        height: 50px;
        width: 50px;
        cursor: pointer;
    }
}

.logo,
.logo-full {
    height: 100%;
    /* 使用容器的高度 */
    width: auto;
    object-fit: contain;
    /* 确保图片比例正确 */
}

.logo-full {
    height: 50px;
    width: 50px;
    padding: 8px;
}

.title {
    white-space: nowrap;
    color: var(--layout-White-Flat100, #FFF);
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0%;
    vertical-align: middle;
}

.back {
    height: 3.125rem;
    width: 3.125rem;
    padding: 0.5rem;

    svg {
        height: 32px;
        width: 32px;
        fill: white;
        stroke-width: 2px;

        path {
            fill: white;
            stroke: white;
        }
    }
}

.subtitle {
    color: var(--layout-White-Flat100, #FFF);
    text-shadow: 0px 1px 3px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.10)), 0px 1px 2px var(--colors-flat-B12-flat05, rgba(17, 25, 30, 0.05));
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
}

.controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.control-panel,
.control-item {
    display: flex;
    align-items: center;
}

.control-panel {
    position: relative;
}

.selected {
    background: #D0D0D080;
    background-blend-mode: luminosity;
    background: #0000001A;
}

.more {
    cursor: pointer;

    &:hover {
        backdrop-filter: blur(150px);
        box-shadow: 0px 17.53px 21.91px 0px var(--colorsflatB12-flat05);
        box-shadow: -0.73px 0.73px 0.73px -1.46px var(--layoutWhite-Flat30) inset;
        box-shadow: 0px 0.73px 5.84px 0px var(--layoutWhite-Flat30) inset;

    }

    &:focus,
    &:active {
        @extend .selected;
    }
}

.control-icon {
    height: 50px;
    width: 50px;
    padding: 8px;
    object-fit: contain;
}

.time {
    font-size: 16px;
    font-weight: 500;
}

.navigation-menu {
    margin-top: 10px;
    position: absolute;
    top: 5.25rem;
    z-index: 101;
    left: 20px;

    .menu-container {
        display: flex;
        flex-direction: column;
        width: 277;
        border-radius: 34px;
        border-width: 2px;
        padding: 12px;
        background: var(--colors-flat-B12-flat40, #11191E66);
        background-blend-mode: luminosity;
        border: 2px solid;
        backdrop-filter: blur(100px);
        border-image-source: linear-gradient(173.83deg, rgba(255, 255, 255, 0.4) 4.82%, rgba(255, 255, 255, 0.0001) 38.08%, rgba(255, 255, 255, 0.0001) 56.68%, rgba(255, 255, 255, 0.1) 95.1%);
    }

    .menu-item {
        display: flex;
        align-items: center;
        font-size: 18px;
        cursor: pointer;
        height: 56px;
        border-radius: 100px;
        gap: 8px;
        padding-top: 8px;
        padding-right: 24px;
        padding-bottom: 8px;
        color: #FFFFFF66;

        span {
            font-size: 18px;
        }

        &.active {
            font-weight: 700;
            color: #FFFFFF;
        }

        .menu-icon {
            fill: white;
        }
    }
}

/* 保留原有样式 */
.control-panel,
.control-item {
    display: flex;
    align-items: center;
    justify-content: end;
}

.control-panel {
    position: absolute;
    top: 2.5rem;
    right: 10px;
    border-radius: 34px;
    border-width: 2px;
    margin-top: 50px;
    background: var(--colors-flat-B12-flat40, #11191E66);
    background-blend-mode: luminosity;
    border: 2px solid;
    border-image-source: linear-gradient(173.83deg, rgba(255, 255, 255, 0.4) 4.82%, rgba(255, 255, 255, 0.0001) 38.08%, rgba(255, 255, 255, 0.0001) 56.68%, rgba(255, 255, 255, 0.1) 95.1%);
}

.buildingTime,
.currentTime {
    svg {
        height: 60px;
    }

    .pos-icon {
        width: 60px;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 28px;
        margin-right: 1.5rem;
        width: 60;
        border-radius: 100px;
        gap: 8px;
        padding-top: 8px;
        padding-right: 16px;
        padding-bottom: 8px;
        padding-left: 16px;
        background: var(--layout-White-Flat20, #FFFFFF33);
    }

    .time-container {
        // padding: 8px;
        // padding-left: 0;
        margin-left: -8px;
        width: 17rem;
    }

    .time-info {
        display: flex;
        flex-direction: column;
        margin-left: 8px;
    }

    .time-label {
        color: var(--layout-White-Flat100, #FFF);
        text-shadow: 0px 1px 3px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.10)), 0px 1px 2px var(--colors-flat-B12-flat05, rgba(17, 25, 30, 0.05));
        font-family: Montserrat;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
    }
}

.weather {
    min-height: 50px;
    min-width: 50px;
    transition: all 0.3s ease;
}

.buildingTime {
    min-height: 50px;
    min-width: 50px;
    transition: all 0.3s ease;
}

.currentTime {
    min-height: 50px;
    min-width: 50px;
    transition: all 0.3s ease;
}


.text-shadow {
    color: var(--layout-White-Flat100, #FFF);
    text-shadow: -2.571px -2.571px 8.571px var(--layout-White-Flat40, rgba(255, 255, 255, 0.40)), 2.571px 2.571px 9.429px var(--colors-base-02-Event-1, #526FFF);
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 22px;

    span {
        font-size: 18px;
        font-style: normal;
        font-weight: 700;
    }
}

.whether {
    .whether-container {
        padding: 8px;
        padding-left: 0;
        margin-left: -8px;
    }

    .temperature {
        font-size: 18px;
        font-weight: 700;
        line-height: 22px;
    }

    .weather-text {
        color: var(--layout-White-Flat100, #FFF);
        text-shadow: 0px 1px 3px rgba(17, 25, 30, 0.10), 0px 1px 2px rgba(17, 25, 30, 0.05);
        font-family: Montserrat;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 1s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    /* 确保容器在过渡期间保持宽度变化平滑 */
    .weather,
    .currentTime,
    .buildingTime {
        transition: width 0.5s ease;
    }

    /* 确保内容容器的过渡效果 */
    .time-container,
    .whether-container {
        transition: opacity 0.5s ease;
    }

    /* 确保整个控制面板的过渡效果 */
    .control-panel,
    .navigation-menu {
        transition: opacity 1s ease;
    }
}
</style>