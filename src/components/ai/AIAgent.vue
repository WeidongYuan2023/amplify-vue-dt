<template>
    <aside class="ai-agent">
        <div v-if="activeTab === 'agent'" class="ai-agent-main flex-1">
            <div class="ai-header">
                <h2 class="agent-title">AI Agent</h2>
            </div>

            <div class="p-4 bg-white rounded-2xl">
                <div class="search-box">
                    <input type="text" placeholder="Search Helps" />
                    <button class="search-btn">
                        <img src="@/assets/search.png" alt="arrow" class="arrow-icon" />
                    </button>
                </div>

                <div class="problem-list">
                    <div v-for="(item, index) in problemList" :key="index" @click="openProblem(item)"
                        class="problem-item">
                        {{ item }}
                        <img src="@/assets/Droplist.png" alt="arrow" class="arrow-icon" />
                    </div>
                </div>
            </div>

            <div class="connect-us">
                <div class="connect-content">
                    <h3>Connect to Us</h3>
                    <p>We are always by your side</p>
                </div>
                <div class="connect-arrow">
                    <SvgIcon name="rightArrow" />
                </div>
            </div>

            <div class="other-faqs">
                <h3>Other FAQs</h3>
                <div class="external-link-icon">
                    <SvgIcon name="open" />
                </div>
            </div>
        </div>

        <template v-else>
            <AIChat />
        </template>

        <div class="agent-footer">
            <div class="agent-btn" :class="{ 'active': activeTab === 'agent' }" @click="switchTab('agent')">
                <i class="agent-icon">
                    <SvgIcon v-show="activeTab === 'chat'" name="footer-ai" />
                    <SvgIcon v-show="activeTab === 'agent'" name="footer-ai-active" />
                </i>
                <span>Agent</span>
            </div>
            <div class="chat-btn" :class="{ 'active': activeTab === 'chat' }" @click="switchTab('chat')">
                <i class="chat-icon">
                    <SvgIcon v-show="activeTab === 'chat'" name="footer-chat-active" />
                    <SvgIcon v-show="activeTab === 'agent'" name="footer-chat" />
                </i>
                <span>Chat</span>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '@/components/features/SvgIcon.vue';
import AIChat from '@/components/ai/AIChat.vue';

const activeTab = ref('chat') // 添加状态控制

const switchTab = (tab: string) => {
    activeTab.value = tab
}
const problemList = [
    'Here is a standardized problem name',
    'Here is a standardized problem name',
    'Here is a standardized problem name',
    'Here is a standardized problem name',
    'Here is a standardized problem name',
    'Here is a standardized problem name'
]

const openProblem = (problem: string) => {
    // 处理打开问题的逻辑
    console.log('Opening problem:', problem)
}


</script>

<style scoped lang="scss">
.ai-agent {
    z-index: 1;
    background: #F5F5F5;
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
    border: 1px solid var(--layout-bg_TextSelection, #FFF);
    // background: var(--layout-White-Flat80, rgba(255, 255, 255, 0.80));
    // backdrop-filter: blur(10px);

    .ai-agent-main {
        background: #F5F5F5;
        padding: 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 16px;
        // background: var(--layout-White-Flat80, rgba(255, 255, 255, 0.80));
        backdrop-filter: blur(10px);
    }

    .ai-header {
        display: flex;
        padding: 24px 24px 16px 24px;
        flex-direction: column;
        align-items: flex-start;
        align-self: stretch;

        h2 {

            font-size: 24px;
            font-style: normal;
            font-weight: 700;
            line-height: 30px;
            /* 125% */
            letter-spacing: 0.113px;
            background: var(--Styles-Grad-DarkFore, linear-gradient(90deg, var(--VI-GradientVI-GD_0, #0099ff) 7.76%, var(--VI-GradientVI-GD_15, #4677BA) 21.59%, var(--VI-GradientVI-GD_34, #415DA8) 39.1%, var(--VI-GradientVI-GD_53, #3D4B9B) 56.61%, var(--VI-GradientVI-GD_74, #3A4093) 75.96%, var(--VI-GradientVI-GD_97, #3A3D91) 97.16%, var(--VI-GradientVI-GD_100, #3A3D91) 99.93%));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
}

.agent-title {
    color: #4285f4;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: bold;
}

.search-box {
    position: relative;
    display: flex;
    padding: 8px 4px;
    align-items: center;
    background: #F8F9FC;
    border-radius: 16px;
    border: 1px solid var(--Styles-GradFlat-DarkFore10, #0099ff);
    background: var(--Styles-GradFlat-DarkFore10, linear-gradient(90deg, var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.10)) 0.1%, var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.10)) 15.06%, var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.10)) 34.01%, var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.10)) 52.96%, var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.10)) 73.9%, var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.10)) 96.83%, var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.10)) 99.82%));
}

.search-box input {
    width: 100%;
    border-radius: 8px;
    border: none;
    background: transparent;
    display: flex;
    height: 36px;
    padding: 10px 8px 10px 4px;
    align-items: flex-start;
    flex-shrink: 0;
    align-self: stretch;

    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
}

.search-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #4285f4;
}

.problem-list {
    flex: 1;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    padding: 8px 0;
}

.problem-item {
    padding: 8px 16px;
    padding-right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
    overflow: hidden;
    color: var(--VI-text-B12, #11191E);
    text-overflow: ellipsis;
    // white-space: nowrap;

    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
}

.problem-item:last-child {
    border-bottom: none;
}

.arrow-icon {
    font-size: 10px;
    color: #4285f4;
}

.connect-us,
.other-faqs {
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    align-self: stretch;
    cursor: pointer;
    border-radius: 16px;
    border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.40));
    background: var(--layout-White-Flat60, rgba(255, 255, 255));
}

.connect-content {
    h3 {
        color: var(--VI-text-B12, #11191E);
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 16px;
        margin-bottom: 2px;
    }

    p {
        color: var(--VI-text-B49, #71797E);
        font-family: Montserrat;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
    }

    .connect-arrow,
    .external-link-icon {
        color: #4285f4;
        font-size: 16px;
    }
}

.other-faqs {
    h3 {
        color: var(--VI-text-B12, #11191E);
        font-family: Montserrat;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
    }

    .external-link-icon {
        width: 24px;
        height: 24px;
    }
}

.agent-btn,
.chat-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    font-size: 12px;
    color: #71797E;
    transition: color 0.3s ease;

    &.active {
        color: var(--VI-text-Primary, #4285f4); // 选中时的蓝色
    }
}

.agent-footer {
    display: flex;
    border-top: 1px solid #eee;
    padding-top: 8px;
    background: #F5F5F5;
    margin-top: auto;
}

.agent-btn,
.chat-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    font-size: 12px;
}

.active {
    color: #4285f4;
}

.agent-icon,
.chat-icon {
    font-size: 18px;
    margin-bottom: 4px;

    svg {
        transition: opacity 0.3s ease;
    }
}
</style>