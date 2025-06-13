<template>
    <div class="chat-container">
        <div class="ai-header">
            <div class='flex flex-column items-center gap-2'>
                <div>
                    <SvgIcon name="ai-avatar" />
                </div>
                <div class="header-area">
                    <div class="header-title">AI Agent</div>
                    <p class="account">@foxxnexus.io</p>
                </div>
            </div>
        </div>
        <div class="chat-messages" ref="chatMsg">
            <div v-for="(message, index) in messages" :key="index"
                :class="['message', message.sender === 'ai' ? 'ai-message' : 'user-message']">

                <div class="message-content">
                    <div class='flex flex-row items-center gap-3'>
                        <div class="message-avatar" v-if="message.sender === 'ai'">
                            <SvgIcon name="ai-avatar" />
                            <!-- <img src="@/assets/ai-avatar.png" alt="AI" class="avatar-img" /> -->
                        </div>
                        <div class="message-sender">{{ message.sender === 'ai' ? 'AI Agent' : '' }}</div>
                    </div>
                    <div class="message-text">{{ message.text }}</div>
                    <SurfaceAnalysis v-if="message.component === 'SurfaceAnalysis'" class="message-component" />
                    <RobotDetail v-if="message.component === 'RobotDetail'" class="message-component" />
                    <Sensors v-if="message.component === 'Sensor'" class="message-component" />
                    <div v-if="message.component === 'Tip'" class="message-component">
                        <div v-for="item in message.data">
                            <Tip v-if="message.component === 'Tip'" :sensor="item" class="message-component" />
                        </div>
                    </div>
                    <!-- <Tip v-if="message.component === 'Tip'" :sensor="message.data" class="message-component" /> -->
                </div>
                <!-- <div class="message-avatar" v-if="message.sender === 'user'">
                    <SvgIcon name="user-avatar" />
                </div> -->
            </div>
        </div>

        <div class="connection-status" v-if="connectionStatus !== 'connected'">
            <div :class="['status-indicator', connectionStatus]"></div>
            <span>{{ connectionStatusMessage }}</span>
        </div>

        <div class="quick-responses" v-if="showQuickResponses">
            <div v-for="(response, index) in quickResponses" :key="index" class="quick-response-item bg-white"
                @click="sendMessage(response)">
                <div class="quick-response-text"> {{ response }}</div>
            </div>
        </div>

        <div class="chat-input">
            <input type="text" v-model="newMessage" placeholder="Type your message here..."
                @keyup.enter="sendMessage(newMessage)" />
            <SvgIcon name="file" @click="uploadFile" />
            <SvgIcon name="emojis" @click="emojisFile" />
            <SvgIcon name="send" @click="sendMessage(newMessage)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import SvgIcon from '@/components/features/SvgIcon.vue';
import SurfaceAnalysis from '@/components/features/SurfaceAnalysis.vue';
import RobotDetail from '@/components/features/RobotDetail.vue';
import Sensors from '@/components/features/Sensor.vue';
import Tip from '@/components/features/Tip.vue';
import { Sensor, SensorChild } from '@/types/sensor';
import { modelStore } from '@/store/index';
const model = modelStore();

const chatMsg = ref<HTMLDivElement | null>(null);

// WebSocket相关状态
const socket = ref<WebSocket | null>(null);
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
const connectionStatusMessage = ref('未连接');

// 重连参数
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectDelay = 2000;
let reconnectTimer: number | null = null;

interface Message {
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    component?: string;
    data?: any;
}

const messages = ref<Message[]>([]);

const uploadFile = () => {
    console.log('uploadFile');
};

const scrollToBottom = () => {
    if (chatMsg.value) {
        chatMsg.value.scrollTop = chatMsg.value.scrollHeight;
    }
};
const emojisFile = () => {
    console.log('emojisFile');
}
const newMessage = ref('');
const showQuickResponses = ref(true);

const quickResponses = [
    'Room',
    'Artifact',
    'History',
    'Story',
    'Author'
];

// 建立WebSocket连接
const setupWebSocket = () => {
    if (socket.value && (socket.value.readyState === WebSocket.OPEN || socket.value.readyState === WebSocket.CONNECTING)) {
        return;
    }

    connectionStatus.value = 'connecting';
    connectionStatusMessage.value = 'connecting...';

    try {
        const wsPath = import.meta.env.VITE_WS_BASE_API
        socket.value = new WebSocket(`${wsPath}/ws/chat`);

        socket.value.onopen = () => {
            connectionStatus.value = 'connected';
            connectionStatusMessage.value = 'Connected';
            reconnectAttempts.value = 0;
            console.log('WebSocket connection established');

            // 发送初始消息，例如欢迎语
            const welcomeMessage = {
                type: 'system_connect',
                data: {
                    client_id: 'web_client_' + Date.now()
                }
            };
            sendToWebSocket(welcomeMessage);
        };

        socket.value.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        socket.value.onclose = (event) => {
            connectionStatus.value = 'disconnected';
            connectionStatusMessage.value = 'Connection lost';
            console.log('WebSocket closed:', event);

            // 尝试重新连接
            if (reconnectAttempts.value < maxReconnectAttempts) {
                reconnectAttempts.value += 1;
                connectionStatusMessage.value = `Connection lost, attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`;

                reconnectTimer = window.setTimeout(() => {
                    setupWebSocket();
                }, reconnectDelay);
            } else {
                connectionStatusMessage.value = 'Connection failed, please refresh the page to retry';
            }
        };

        socket.value.onerror = (error) => {
            connectionStatus.value = 'error';
            connectionStatusMessage.value = 'Connection error';
            console.error('WebSocket error:', error);
        };
    } catch (error) {
        connectionStatus.value = 'error';
        connectionStatusMessage.value = 'Connection error';
        console.error('Failed to establish WebSocket connection:', error);
    }
};

function speak(text) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US' // you can change to other language codes
    utterance.pitch = 0.9;  // Slightly higher pitch
    utterance.rate = 0.9;  // Slightly slower for clarity
    speechSynthesis.speak(utterance)
}

// 处理从WebSocket接收到的消息
const handleWebSocketMessage = (data: any) => {
    if (data.type === 'agent_response') {
        // 处理聊天消息
        messages.value.push({
            text: data.message,
            sender: 'ai',
            timestamp: new Date()
        });

        // 语音播报
        speak(data.message)

        setTimeout(scrollToBottom, 50);
    } else if (data.type === 'component_data') {
        // 处理带有组件数据的消息
        messages.value.push({
            text: data.message || 'Here is the component data:',
            sender: 'ai',
            timestamp: new Date(),
            component: data.component,
            data: data.data
        });
        setTimeout(scrollToBottom, 50);
    } else if (data.type === 'welcome') {
        // 处理欢迎消息
        messages.value.push({
            text: data.message || 'Hello! I am an AI assistant. How can I help you?',
            sender: 'ai',
            timestamp: new Date()
        });
        setTimeout(scrollToBottom, 50);
    }
};

// 向WebSocket发送消息
const sendToWebSocket = (data: any) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify(data));
    } else {
        console.error('WebSocket not connected, cannot send message');
        setupWebSocket(); // 尝试重新连接
    }
};

// 发送用户消息
const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // 添加用户消息到界面
    if (text.startsWith('annotation')) {
        messages.value.push({
            text: 'select an artifact',
            sender: 'user',
            timestamp: new Date()
        });
    } else {
        messages.value.push({
            text: text,
            sender: 'user',
            timestamp: new Date()
        });
    }

    // 清空输入框
    newMessage.value = '';
    setTimeout(scrollToBottom, 50);

    // 向WebSocket发送消息
    const messageData = {
        type: 'chat_message',
        message: text
    };
    sendToWebSocket(messageData);

    // 如果WebSocket未连接，则使用本地模拟响应作为后备
    if (connectionStatus.value !== 'connected') {
        handleLocalResponse(text);
    }
};

// 本地模拟响应（在WebSocket连接失败时使用）
const handleLocalResponse = (text: string) => {
    if (text === 'Space Area Dimensions') {
        setTimeout(() => {
            messages.value.push({
                text: 'Here are the space area dimension analysis results:',
                sender: 'ai',
                timestamp: new Date(),
                component: 'SurfaceAnalysis'
            });
            setTimeout(scrollToBottom, 50);
        }, 1000);
    } else if (text === 'Robot') {
        setTimeout(() => {
            messages.value.push({
                text: 'Here are the robot detail analysis results:',
                sender: 'ai',
                timestamp: new Date(),
                component: 'RobotDetail'
            });
            setTimeout(scrollToBottom, 50);
        }, 1000);
    } else if (text === 'Sensor Info') {
        setTimeout(() => {
            messages.value.push({
                text: 'Here are the sensor analysis results:',
                sender: 'ai',
                timestamp: new Date(),
                component: 'Sensor'
            });
            setTimeout(scrollToBottom, 50);
        }, 1000);
    } else {
        setTimeout(() => {
            messages.value.push({
                text: `I received your message: "${text}". I'm processing it...`,
                sender: 'ai',
                timestamp: new Date()
            });
            setTimeout(scrollToBottom, 50);
        }, 1000);
    }
};

// 清理WebSocket连接
const cleanupWebSocket = () => {
    if (socket.value) {
        socket.value.close();
        socket.value = null;
    }

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
};

watch(() => model.currentSensor, (newSensor: Sensor | null) => {
    if (newSensor) {
        messages.value.push({
            text: `传感器 ${newSensor.id || newSensor.areaId} 的详细信息如下：`,
            sender: 'ai',
            timestamp: new Date(),
            component: 'Tip',
            data: newSensor.children
        });
        console.log(newSensor);
    }
}, { deep: true });

watch(() => model.wsStatus, (newVal) => {
    console.log('message', newVal);
    sendMessage(newVal.message);
}, { deep: true })

onMounted(() => {
    // 初始化逻辑
    if (chatMsg.value) {
        // const height = chatMsg.value.clientHeight || 400; // 使用当前高度或默认值
        // chatMsg.value.style.height = `${height}px`;
        // chatMsg.value.style.maxHeight = `${height}px`;

        // 确保新消息出现时自动滚动到底部
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }

    // 建立WebSocket连接
    setupWebSocket();
});

onBeforeUnmount(() => {
    // 组件卸载前清理WebSocket连接
    cleanupWebSocket();
});
</script>

<style scoped lang="scss">
.text-color {
    background: var(--Styles-Grad-DarkFore, linear-gradient(90deg, var(--VI-GradientVI-GD_0, #4C90CD) 7.76%, var(--VI-GradientVI-GD_15, #4677BA) 21.59%, var(--VI-GradientVI-GD_34, #415DA8) 39.1%, var(--VI-GradientVI-GD_53, #3D4B9B) 56.61%, var(--VI-GradientVI-GD_74, #3A4093) 75.96%, var(--VI-GradientVI-GD_97, #3A3D91) 97.16%, var(--VI-GradientVI-GD_100, #3A3D91) 99.93%));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
}

.ai-header {
    height: 60px;
    padding: 18px 24px 12px 24px;


    .header-area {
        height: 42px;

        .header-title {
            color: var(--VI-text-B12, #11191E);
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
            line-height: 16px;
        }

        .account {
            color: var(--colors-base-01-primary, #09F);

            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
        }


    }
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: white;
    border-radius: 16px;
}

.message {
    display: flex;
    gap: 8px;
    max-width: 100%;

    &.ai-message {
        align-self: flex-start;
    }

    &.user-message {
        align-self: flex-end;
        flex-direction: row-reverse;
    }
}

.message-avatar {
    overflow: hidden;
    flex-shrink: 0;

    svg {
        width: 54px;
        height: 54px;
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.message-content {
    background: #F5F5F5;
    padding: 8px 12px;
    border-radius: 12px;

    .ai-message & {
        background: #E3F2FD;
        border-radius: 16px;
        padding: 16px;
        background: linear-gradient(90deg, var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.08)) 7.76%, var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.08)) 21.59%, var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.08)) 39.1%, var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.08)) 56.61%, var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.08)) 75.96%, var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.08)) 97.16%, var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.08)) 99.93%), var(--layout-bg_Element, #FFF);

        .message-text {
            @extend .text-color;

        }
    }

    .user-message & {
        display: flex;
        max-width: 300px;
        padding: 16px 12px;
        justify-content: center;
        align-items: center;
        flex: 1 0 0;
        border-radius: 16px;
        background: var(--layout-bg_focus, #09F);


        .message-text {
            color: white;
        }
    }
}

.message-sender {
    margin-bottom: 4px;
    color: var(--VI-text-B12, #11191E);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
}

.message-text {
    font-size: 14px;
    line-height: 1.4;
}

.connection-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 12px;
    color: #666;
    justify-content: center;

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.connecting {
            background-color: #FFA500;
        }

        &.connected {
            background-color: #00C853;
        }

        &.disconnected {
            background-color: #9E9E9E;
        }

        &.error {
            background-color: #F44336;
        }
    }
}

.quick-responses {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 16px;
    // background: white;

}

.quick-response-item {
    padding: 8px 12px;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #E3F2FD;
    }

    .quick-response-text {
        @extend .text-color;
    }
}

.chat-input {
    display: flex;
    padding: 8px 16px;
    gap: 8px;
    background: white;
    border-radius: 16px;
    margin: 1rem 1rem 0 1rem;
    display: flex;
    align-items: center;
    border-radius: 16px;
    border: 2px solid var(--VI-text-B12, #11191E);
    background: var(--layout-bg_Panel, #FFF);
    box-shadow: 0px 0.191px 0.573px 0px rgba(0, 0, 0, 0.11), 0px 1.018px 2.291px 0px rgba(0, 0, 0, 0.13);

    input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        padding: 8px 0;
    }

    svg {
        cursor: pointer;
    }
}
</style>