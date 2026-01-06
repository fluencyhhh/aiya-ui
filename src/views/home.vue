<template>
  <!-- 模板部分保持不变 -->
  <div class="ai-chat-container">
    <div class="chat-header">
      <h2>AI 对话助手</h2>
      <p class="subtitle">智能问答，随时为您服务</p>
    </div>

    <div class="chat-messages">
      <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.type, { 'error-message': message.isError }]"
      >
        <div class="avatar">
          {{ message.type === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <div class="markdown-body" v-html="renderMarkdown(message.content)"></div>
          <span class="message-time">{{ new Date(message.timestamp).toLocaleTimeString() }}</span>
        </div>
      </div>
      <div v-if="isLoading" class="loading-indicator">
        <div class="typing">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <textarea
          v-model="userInput"
          @keypress="handleKeyPress"
          placeholder="输入您的问题..."
          rows="2"
          :disabled="isLoading"
      ></textarea>
      <button
          @click="sendMessage"
          :disabled="!canSend"
          class="send-button"
      >
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, nextTick} from 'vue'
import MarkdownIt from 'markdown-it'
import {postStreamChat, getStreamChat} from "../services/api";

// 对话消息列表
const messages = ref([])
// 用户输入内容
const userInput = ref('')
// 加载状态
const isLoading = ref(false)
// 错误消息
const errorMessage = ref('')

// 初始化 markdown-it
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

// Markdown 渲染
const renderMarkdown = (text = '') => md.render(text)

// 计算属性：判断输入框是否可发送
const canSend = computed(() => {
  return userInput.value.trim().length > 0 && !isLoading.value
})

// 发送消息
const sendMessage = async () => {
  if (!canSend.value) return

  const text = userInput.value.trim()
  // 清空输入框
  userInput.value = ''
  // 清空错误消息
  errorMessage.value = ''

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    type: 'user',
    content: text,
    timestamp: new Date()
  })

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 占位AI消息，流式累加内容
  const aiMessage = {
    id: Date.now() + 1,
    type: 'ai',
    content: '',
    timestamp: new Date()
  }
  messages.value.push(aiMessage)
  let lastIndex=messages.value.length -1
  isLoading.value = true
  let fullText = ""
  getStreamChat(
      {question:text},
    async (chunk) => {
        isLoading.value = false
      console.log("Received chunk:", chunk);
      aiMessage.content += chunk.data
      let newArr=[...messages.value]
      newArr[lastIndex].content=aiMessage.content
      messages.value=newArr
    },
    (err) => {
      errorMessage.value = '获取AI回复失败，请稍后重试'
      aiMessage.content = '抱歉，我暂时无法回答您的问题，请稍后重试。'
      aiMessage.isError = true
    },
    () => {
      isLoading.value = false
      nextTick(() => scrollToBottom())
    }
  )
}

// 滚动到底部
const scrollToBottom = () => {
  const chatContainer = document.querySelector('.chat-messages')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}

// 处理键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 组件挂载时添加欢迎消息
onMounted(() => {
  messages.value.push({
    id: 1,
    type: 'ai',
    content: '您好！我是AI助手，很高兴为您提供帮助。请问有什么我可以协助您的吗？',
    timestamp: new Date()
  })
})
</script>


<style scoped>
/* 重置容器样式，确保全屏显示且无滚动条 */
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

.chat-header {
  background-color: #4a90e2;
  color: white;
  padding: 15px 20px;
  text-align: center;
  flex-shrink: 0;
}

.chat-header h2 {
  margin: 0;
  font-size: 24px;
}

.subtitle {
  margin: 5px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 消息区域可以滚动，但整个页面不滚动 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
  scrollbar-width: thin; /* Firefox */
}

/* 自定义滚动条样式，使其更美观 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  margin: 0 10px;
  position: relative;
}

.message.user .message-content {
  background-color: #4a90e2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai .message-content {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content p {
  margin: 0;
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  opacity: 0.6;
  position: absolute;
  bottom: 0px;
  right: 10px;
}

.loading-indicator {
  display: flex;
  justify-content: flex-start;
  padding: 0 10px;
}

.typing {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px 15px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4a90e2;
  margin: 0 3px;
  animation: typing 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input {
  display: flex;
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #eaeaea;
  gap: 10px;
  flex-shrink: 0;
}

textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

textarea:focus {
  border-color: #4a90e2;
}

.send-button {
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  align-self: flex-end;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #357abd;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 移除响应式媒体查询中的额外滚动条 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
}

.markdown-body {
  word-wrap: break-word;
  line-height: 1.6;
}

.markdown-body code {
  background: #f2f2f2;
  padding: 2px 4px;
  border-radius: 4px;
}

.markdown-body pre {
  background: #f2f2f2;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body ul, .markdown-body ol {
  padding-left: 18px;
  margin: 6px 0;
}
</style>

<!-- 添加全局样式重置，确保整个页面没有滚动条 -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden; /* 禁止整个页面滚动 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
}

#app {
  height: 100vh;
  overflow: hidden;
}


/* 错误消息样式 */
.error-message .message-content {
  background-color: #ffebee !important;
  color: #c62828 !important;
}

.error-notification {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 8px;
  margin: 10px;
  text-align: center;
  font-size: 14px;
}
</style>
