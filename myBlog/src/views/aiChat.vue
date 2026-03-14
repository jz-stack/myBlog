<template>
    <div class="ai-chat">
        <div class="container">
            <div class="chat-header">
                <h1 class="chat-title">AI助手</h1>
            </div>
            <div class="welcome-section" v-show="isWelcome">
                <h1 class="welcome-title">有什么可以帮忙的？</h1>
            </div>
            <div class="messages-container" v-show="!isWelcome">
                <div v-for="message in messages" class="message">
                    <div class="message-content" :class="{'user-message': message.type === 'user', 'assistant-message': message.type === 'assistant'}">
                        <el-avatar>{{ message.type === 'user' ? '用户' : 'AI' }}</el-avatar>
                        <div class="message-text">{{ message.payload.content }}</div>
                    </div>
                </div>
            </div>
            <div class="input-container">
                <el-input
                    v-model="inputText"
                    placeholder="尽管问..."
                    autosize
                    type="textarea"
                    resize="none"
                    class="chat-input"
                    @keyup.enter="sendMessage"
                />
                <div class="send-btn-wrapper">
                    <el-button
                        class="send-btn"
                        :loading="isLoading"
                        :icon="ArrowUp"
                        circle
                        @click="sendMessage"
                    />
                    <el-button
                        v-show="isReplying || isLoading"
                        class="end-btn"
                        :icon="Remove"
                        circle
                        @click="sendMessage"
                    >
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowUp, Remove } from '@element-plus/icons-vue'
import { ssePost, getHistory } from '@/api/aiChat'
import { AIChatMessage } from '@/types/aiChatTypes'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const messages = ref<Array<AIChatMessage>>([])
const isConnecting = ref(false)
const isLoading = ref(false)
const isReplying = ref(false)
const abortControllerRef = ref<AbortController>();
const isWelcome = computed(() => messages.value.length === 0)

const sendMessage = async () => {
    if(isConnecting.value) {
        abortControllerRef.value?.abort();
        return
    }

    if(isReplying.value) {
        abortControllerRef.value?.abort();
        return;
    }

    if (inputText.value.trim() === '') {
        ElMessage.warning('问题不能为空')
        return
    }

    try{
        isConnecting.value = true
        abortControllerRef.value = new AbortController();

        const stream = await ssePost({
            params: {
                query: inputText.value.trim()
            },
            signal: abortControllerRef.value.signal
        })

        messages.value.push({
            type: 'user',
            partial: false,
            payload: {
                content: inputText.value.trim()
            }
        })

        inputText.value = ''
        isLoading.value = true
        isReplying.value = true

        for await (const message of stream) {
            // 检查是否被中止
            if (abortControllerRef.value?.signal.aborted) {
                break
            }
            
            const lastMessage = messages.value[messages.value.length - 1];
            // 合并不完全消息
            if ((message as AIChatMessage).partial && lastMessage?.partial) {
                lastMessage.payload.content += (message as AIChatMessage).payload?.content;
                continue;
            }

            // 其他类型的消息
            messages.value.push(message as AIChatMessage);
        }
    }catch(error) {
        // 检查是否是用户主动中断
        if ((error as any).name === 'AbortError') {
            return
        }
        ElMessage.error('发送消息失败:' + error)
    }finally {
        isConnecting.value = false
        isLoading.value = false
        isReplying.value = false
    }
}

onMounted(async () => {
    try {
        const response = await getHistory()
        messages.value = response.data || []
    } catch (error) {
        ElMessage.error('获取历史记录失败:' + error)
    }
})
</script>

<style scoped>
.ai-chat {
    padding: 20px 0;
    min-height: 90dvh;
    display: flex;
    align-items: center;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    width: 100%;
}

.welcome-section {
    margin-bottom: 60px;
}

.welcome-title {
    font-size: 48px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.2;
}

.chat-header {
    margin-bottom: 30px;
}

.chat-title {
    font-size: 36px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.2;
}

.messages-container {
    height: 80dvh;
    overflow-y: auto;
    margin-bottom: 60px;
}

.message-content {
    font-size: 18px;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.message-content :deep(.el-avatar) {
    flex-shrink: 0;
}

.message{
    margin:20px 0;
}

.message-text {
    padding: 12px 24px;
    border-radius: 24px;
}

.user-message {
    flex-direction: row-reverse;
}

.user-message .message-text {
    background-color: #409eff;
    color: #ffffff;
}

.assistant-message .message-text {
    background-color: #dcdcdc;
    color: #1f2937;
}

.input-container {
    position: relative;
}

.chat-input :deep(.el-textarea__inner) {
    padding: 24px 80px 24px 24px;
    border-radius: 24px;
    font-size: 18px;
    line-height: 1.5;
}

.send-btn-wrapper {
    position: absolute;
    right: 20px;
    bottom: 16px;
}

.send-btn {
    background-color: #1f2937;
    border-color: #1f2937;
    color: #ffffff;
    width: 48px;
    height: 48px;
}

.end-btn {
    background-color: #f56c6c;
    color: #ffffff;
    width: 48px;
    height: 48px;
}

.send-btn:hover {
    background-color: #374151 !important;
    border-color: #374151 !important;
}

.send-btn.is-loading {
    background-color: #1f2937;
}
</style>
