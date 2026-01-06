<template>
  <div class="page">
    <header class="header">
      <div>
        <p class="subtitle">AIYA 认证中心</p>
        <h2>用户名 / 手机号登录与注册</h2>
      </div>
    </header>

    <div class="grid">
      <section class="card">
        <h3>注册账号</h3>
        <p class="hint">填写信息，系统会根据出生日期自动计算年龄。</p>
        <form class="form" @submit.prevent="handleRegister">
          <div class="form-row">
            <label>姓名</label>
            <input v-model="registerForm.name" type="text" required maxlength="64" />
          </div>
          <div class="form-row">
            <label>性别</label>
            <select v-model="registerForm.gender" required>
              <option value="MALE">男</option>
              <option value="FEMALE">女</option>
              <option value="OTHER">其他</option>
            </select>
          </div>
          <div class="form-row">
            <label>用户名</label>
            <input v-model="registerForm.username" type="text" required minlength="4" maxlength="64" />
          </div>
          <div class="form-row">
            <label>手机号</label>
            <input v-model="registerForm.phone" type="tel" required pattern="\\d{6,20}" />
          </div>
          <div class="form-row">
            <label>密码</label>
            <input v-model="registerForm.password" type="password" required minlength="6" maxlength="128" />
          </div>
          <div class="form-row">
            <label>出生年月日</label>
            <input v-model="registerForm.birthDate" type="date" required />
          </div>
          <button class="primary" type="submit" :disabled="registering">
            {{ registering ? '提交中...' : '注册' }}
          </button>
        </form>
        <p v-if="registerResult" class="success">注册成功：{{ registerResult }}</p>
        <p v-if="registerError" class="error">注册失败：{{ registerError }}</p>
      </section>

      <section class="card">
        <h3>登录</h3>
        <p class="hint">支持用户名或手机号 + 密码登录。</p>
        <form class="form" @submit.prevent="handleLogin">
          <div class="form-row">
            <label>用户名 / 手机号</label>
            <input v-model="loginForm.identifier" type="text" required />
          </div>
          <div class="form-row">
            <label>密码</label>
            <input v-model="loginForm.password" type="password" required minlength="6" />
          </div>
          <button class="primary" type="submit" :disabled="loggingIn">
            {{ loggingIn ? '登录中...' : '登录' }}
          </button>
        </form>
        <p v-if="loginResult" class="success">登录成功：{{ loginResult }}</p>
        <p v-if="loginError" class="error">登录失败：{{ loginError }}</p>
      </section>
    </div>

    <section v-if="userInfo" class="card full">
      <h3>最新账号信息</h3>
      <ul class="info">
        <li><strong>姓名：</strong>{{ userInfo.name }}</li>
        <li><strong>性别：</strong>{{ genderLabel(userInfo.gender) }}</li>
        <li><strong>用户名：</strong>{{ userInfo.username }}</li>
        <li><strong>手机号：</strong>{{ userInfo.phone }}</li>
        <li><strong>出生年月日：</strong>{{ userInfo.birthDate }}</li>
        <li><strong>年龄：</strong>{{ userInfo.age }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { loginUser, registerUser } from '../services/auth'

const registerForm = reactive({
  name: '',
  gender: 'MALE',
  username: '',
  phone: '',
  password: '',
  birthDate: ''
})

const loginForm = reactive({
  identifier: '',
  password: ''
})

const registering = ref(false)
const loggingIn = ref(false)
const registerResult = ref('')
const registerError = ref('')
const loginResult = ref('')
const loginError = ref('')
const userInfo = ref(null)

const genderLabel = (value) => {
  if (value === 'MALE') return '男'
  if (value === 'FEMALE') return '女'
  return '其他'
}

const handleRegister = async () => {
  registerResult.value = ''
  registerError.value = ''
  userInfo.value = null
  registering.value = true
  try {
    const payload = { ...registerForm }
    const res = await registerUser(payload)
    registerResult.value = res.message
    userInfo.value = res.user
  } catch (err) {
    registerError.value = err?.response?.data?.message || err?.message || '注册失败'
  } finally {
    registering.value = false
  }
}

const handleLogin = async () => {
  loginResult.value = ''
  loginError.value = ''
  loggingIn.value = true
  try {
    const payload = { ...loginForm }
    const res = await loginUser(payload)
    loginResult.value = res.message
    userInfo.value = res.user
  } catch (err) {
    loginError.value = err?.response?.data?.message || err?.message || '登录失败'
  } finally {
    loggingIn.value = false
  }
}
</script>

<style scoped>
.page {
  max-width: 1080px;
  margin: 40px auto;
  padding: 0 20px 40px;
  color: #1f2a44;
}

.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtitle {
  margin: 0;
  letter-spacing: 0.2em;
  color: #4a5fa5;
  font-size: 13px;
  text-transform: uppercase;
}

h2 {
  margin: 6px 0 0;
  font-size: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef2f7;
}

.card.full {
  margin-top: 16px;
}

.hint {
  color: #6c7a9c;
  margin: 4px 0 12px;
  font-size: 13px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #2e3a59;
}

input,
select {
  padding: 10px 12px;
  border: 1px solid #d8deea;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
}

button.primary {
  background: linear-gradient(135deg, #4a90e2, #5671c1);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}

button.primary:hover:not(:disabled) {
  box-shadow: 0 10px 24px rgba(74, 144, 226, 0.25);
  transform: translateY(-1px);
}

button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  margin-top: 10px;
  color: #1a7f38;
  font-weight: 600;
}

.error {
  margin-top: 10px;
  color: #c0392b;
  font-weight: 600;
}

.info {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px 20px;
}
</style>
