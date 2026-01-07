<template>
  <div class="home-shell">
    <el-container class="chat-layout">
      <!-- 移动端遮罩层 -->
      <div v-if="isMobile && isSidebarOpen" class="mobile-overlay" @click="closeSidebar"></div>

      <el-aside
        :width="asideWidth"
        class="aside"
        :class="{ 'mobile-aside': isMobile, 'mobile-open': isMobile && isSidebarOpen }"
      >
        <div class="aside-header">
          <div>
            <h3>历史对话</h3>
          </div>
          <!-- 移动端显示的关闭按钮 -->
          <el-button v-if="isMobile" text icon="Close" @click="closeSidebar">✕</el-button>
          <el-button v-else type="primary" size="small" @click="startNewConversation">新对话</el-button>
        </div>
        <el-scrollbar class="conversation-list">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            :class="['conversation-item', { active: conv.id === activeConversationId }]"
            @click="handleSelectConversation(conv.id)"
          >
            <div class="conversation-title-row">
              <div class="conversation-title" >{{ formatTitle(conv.title, 10) || '新对话' }}</div>
              <el-button
                text
                type="danger"
                size="small"
                @click.stop="deleteConversation(conv.id)"
              >
                删除
              </el-button>
            </div>
            <p class="conversation-preview">{{ preview(conv) }}</p>
            <span class="conversation-time">{{ formatTime(conv.createdAt) }}</span>
          </div>
        </el-scrollbar>
      </el-aside>

      <el-container>
        <el-header class="main-header" height="72px">
          <div class="header-left-group">
            <!-- 侧边栏切换按钮 -->
            <div class="toggle-btn" @click="toggleSidebar">
              <span v-if="!isSidebarOpen || isMobile">☰</span>
              <span v-else>◀</span>
            </div>
            <div>
              <p class="eyebrow">当前对话</p>
              <h2>{{ currentConversation?.title || '新对话' }}</h2>
            </div>
          </div>
          <div class="header-actions">
            <el-button text @click="startNewConversation">新建</el-button>
            <el-button text @click="clearCurrent">清屏</el-button>
          </div>
        </el-header>

        <el-main class="main-body">
          <el-card class="chat-card" shadow="never">
            <el-scrollbar class="message-scroll">
              <div v-for="msg in currentMessages" :key="msg.id" :class="['bubble', msg.role]">
                <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
                <div class="bubble-body">
                  <div class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
                  <span class="bubble-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
              </div>
              <div v-if="isStreaming" class="typing-row">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </el-scrollbar>

            <div class="input-box">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="3"
                resize="none"
                placeholder="输入问题，按 Enter 发送，Shift + Enter 换行"
                @keydown.enter.prevent="handleEnter"
              />
              <div class="input-actions">
                <el-button @click="startNewConversation">新对话</el-button>
                <el-button type="primary" :loading="isStreaming" :disabled="sendDisabled" @click="sendMessage">
                  {{ isStreaming ? '生成中...' : '发送' }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onUnmounted } from 'vue' // update imports
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import { getStreamChat } from '../services/api'

const md = new MarkdownIt({ linkify: true, breaks: true })
const conversations = ref([createConversation()])
const activeConversationId = ref(conversations.value[0].id)
const userInput = ref('')
const isStreaming = ref(false)

// 新增：侧边栏状态控制
const isSidebarOpen = ref(window.innerWidth > 768)
const isMobile = ref(window.innerWidth <= 768)

const asideWidth = computed(() => {
  // 移动端时，占据流文档空间为0（改为绝对定位显示），桌面端则响应开关
  if (isMobile.value) return '0px'
  return isSidebarOpen.value ? '280px' : '0px'
})

function handleResize() {
  const mobile = window.innerWidth <= 768
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    // 切换到桌面时默认展开，切换到移动端时默认收起
    isSidebarOpen.value = !mobile
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

function handleSelectConversation(id) {
  selectConversation(id)
  // 移动端选择对话后自动收起侧边栏
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const currentConversation = computed(() =>
  conversations.value.find((c) => c.id === activeConversationId.value)
)
const currentMessages = computed(() => currentConversation.value?.messages || [])
const sendDisabled = computed(() => !userInput.value.trim() || isStreaming.value)

function createConversation() {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title: '新对话',
    createdAt: Date.now(),
    messages: [
      {
        id: `sys-${Date.now()}`,
        role: 'ai',
        content: '您好，我是 AI 助手，很高兴为您提供帮助。',
        timestamp: Date.now()
      }
    ]
  }
}

function renderMarkdown(text = '') {
  return md.render(text)
}

function startNewConversation() {
  const conv = createConversation()
  conversations.value.unshift(conv)
  activeConversationId.value = conv.id
  userInput.value = ''
  // 移动端新建对话后自动收起侧边栏
  if (isMobile.value) isSidebarOpen.value = false
}

function selectConversation(id) {
  activeConversationId.value = id
  userInput.value = ''
}

function deleteConversation(id) {
  conversations.value = conversations.value.filter((c) => c.id !== id)
  if (!conversations.value.length) {
    const conv = createConversation()
    conversations.value = [conv]
    activeConversationId.value = conv.id
    return
  }
  if (activeConversationId.value === id) {
    activeConversationId.value = conversations.value[0].id
  }
}

function formatTime(ts) {
  return new Date(ts).toLocaleString()
}

function formatTitle(text, size) {
  return text?.slice(0, size) || '新对话'
}

function preview(conv) {
  const last = conv.messages[conv.messages.length - 1]
  return last?.content?.slice(0, 20) || '点击查看对话'
}

function updateTitle(conv, text) {
  if (conv && (!conv.title || conv.title === '新对话')) {
    conv.title = text.slice(0, 20) || '新对话'
  }
}

function scrollToBottom() {
  nextTick(() => {
    const el = document.querySelector('.message-scroll .el-scrollbar__wrap')
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

function clearCurrent() {
  const conv = currentConversation.value
  if (!conv) return
  conv.messages = [
    {
      id: `sys-${Date.now()}`,
      role: 'ai',
      content: '新的对话已开始，请输入问题。',
      timestamp: Date.now()
    }
  ]
  userInput.value = ''
}

function handleEnter(e) {
  if (e.shiftKey) return
  e.preventDefault()
  sendMessage()
}

function sendMessage() {
  const conv = currentConversation.value
  const text = userInput.value.trim()
  if (!conv || !text || isStreaming.value) return

  const userMsg = {
    id: `u-${Date.now()}`,
    role: 'user',
    content: text,
    timestamp: Date.now()
  }
  conv.messages.push(userMsg)
  updateTitle(conv, text)
  userInput.value = ''
  scrollToBottom()

  const aiMsg = {
    id: `ai-${Date.now()}`,
    role: 'ai',
    content: '',
    timestamp: Date.now()
  }
  conv.messages.push(aiMsg)
  isStreaming.value = true
  debugger
  let lastIndex=conv.messages.length -1
  getStreamChat(
    { question: text },
    (chunk) => {
      aiMsg.content += chunk?.data || ''
      let newArr=[...conv.messages]
      newArr[lastIndex].content=aiMsg.content
      conv.messages=newArr

      scrollToBottom()
    },
    () => {
      aiMsg.content = '抱歉，暂时无法获取回复，请稍后重试。'
      ElMessage.error('获取回复失败')
      isStreaming.value = false
    },
    () => {
      isStreaming.value = false
      scrollToBottom()
    }
  )
}
</script>

<style scoped>
.home-shell {
  padding: 12px;
}

/* 移动端全屏适配 */
@media (max-width: 768px) {
  .home-shell {
    padding: 0 !important;
  }
  .chat-layout {
    height: 100vh !important;
    border-radius: 0 !important;
  }
}

.chat-layout {
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 12px 40px rgba(31, 42, 68, 0.08);
  height: calc(100vh - 24px);
  position: relative; /* 为绝对定位元素提供锚点 */
}

.aside {
  background: linear-gradient(180deg, #f5f7ff 0%, #f9fbff 100%);
  border-right: 1px solid #e8edf5;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  overflow: hidden; /* 隐藏折叠时的内容 */
  white-space: nowrap;
}

/* 侧边栏展开/收起的平滑过渡处理 */
.aside > div {
  min-width: 280px; /* 保持内部内容宽度，防止挤压 */
}

/* 移动端侧边栏样式覆盖 */
.mobile-aside {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 2000;
  width: 280px !important; /* 强制覆盖 inline style 的 0px */
  background: #fff;
  box-shadow: 4px 0 16px rgba(0,0,0,0.1);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.mobile-aside.mobile-open {
  transform: translateX(0);
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1500;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  color: #6c7a9c;
  transition: background 0.2s;
  user-select: none;
}

.toggle-btn:hover {
  background: #f0f2f5;
  color: #4a90e2;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.aside-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8edf5;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.12em;
  font-size: 12px;
  color: #6c7a9c;
}

.conversation-list {
  padding: 10px;
  flex: 1;
}

.conversation-item {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversation-item.active {
  border-color: #4a90e2;
  box-shadow: 0 8px 24px rgba(74, 144, 226, 0.18);
}

.conversation-item:hover {
  transform: translateY(-1px);
}

.conversation-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: #1f2a44;
}

.conversation-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.conversation-preview {
  margin: 0;
  color: #6c7a9c;
  font-size: 13px;
}

.conversation-time {
  display: block;
  margin-top: 6px;
  color: #9aa6bf;
  font-size: 12px;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
  border-bottom: 1px solid #eef2f7;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-body {
  background: #f7f8fb;
  display: flex;
  flex-direction: column;
  height: calc(100% - 72px);
}

.chat-card {
  border-radius: 14px;
  border: 1px solid #eef2f7;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.message-scroll {
  flex: 1;
  min-height: 0;
  /* 去除固定高度限制，填满剩余空间 */
  max-height: calc(100% - 153px);
  padding-right: 8px;
  overflow-y: auto;
}

.bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.bubble.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #eef2f7;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.bubble-body {
  max-width: 70%;
  background: #f8f9fb;
  border-radius: 14px;
  padding: 12px 14px;
  position: relative;
  border: 1px solid #eef2f7;
}

.bubble.user .bubble-body {
  background: linear-gradient(135deg, #4a90e2, #6b5ae2);
  color: #fff;
  border-color: transparent;
}

.bubble-time {
  font-size: 12px;
  color: #9aa6bf;
  position: absolute;
  right: 10px;
  bottom: 0px;
}

.bubble.user .bubble-time {
  color: rgba(255, 255, 255, 0.75);
}

.typing-row {
  display: inline-flex;
  gap: 6px;
  margin: 6px 0;
}

.typing-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4a90e2;
  animation: blink 1.4s infinite both;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.input-box {
  margin-top: 12px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 12px;
  background: #fafbfe;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.markdown-body {
  word-wrap: break-word;
  line-height: 1.6;
}

.markdown-body code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
}

.markdown-body pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
}
</style>
