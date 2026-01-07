<template>
  <div class="auth-wrapper">
    <section class="hero">
      <p class="eyebrow">AIYA 安全登录</p>
      <h2>欢迎回来</h2>
      <p class="desc">使用用户名或手机号快速登录，畅享智能认证体验。</p>
      <ul class="bullets">
        <li>· 支持手机号 / 用户名双通道</li>
        <li>· 保障密码安全与数据加密</li>
        <li>· 登录后可查看个人资料信息</li>
      </ul>
    </section>

    <div class="content">
      <el-card class="form-card" shadow="hover">
        <div class="card-header">
          <div>
            <p class="eyebrow">LOGIN</p>
            <h3>账号登录</h3>
            <p class="hint">输入用户名或手机号与密码完成登录</p>
          </div>
          <el-button type="primary" text @click="goRegister">还没有账号？去注册</el-button>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          size="large"
          @submit.prevent="onSubmit"
        >
          <el-form-item label="用户名 / 手机号" prop="identifier">
            <el-input
              v-model="loginForm.identifier"
              placeholder="请输入用户名或手机号"
              clearable
              autofocus
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" native-type="submit" class="full" @click="onSubmit">
              {{ loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card v-if="userInfo" class="info-card" shadow="never">
        <div class="info-header">
          <div>
            <p class="eyebrow">WELCOME</p>
            <h4>登录成功</h4>
          </div>
          <el-tag type="success">已验证</el-tag>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ genderLabel(userInfo.gender) }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ userInfo.birthDate }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ userInfo.age }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginUser } from '../services/auth'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const userInfo = ref(null)

const loginForm = reactive({
  identifier: '',
  password: ''
})

const rules = {
  identifier: [{ required: true, message: '请输入用户名或手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const genderLabel = (value) => {
  if (value === 'MALE') return '男'
  if (value === 'FEMALE') return '女'
  return '其他'
}

const goRegister = () => router.push('/register')

const onSubmit = () => {
  loginFormRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await loginUser({ ...loginForm })
      userInfo.value = res.user || null
      ElMessage.success(res.message || '登录成功')
      if (res.user) {
        localStorage.setItem('aiya-user', JSON.stringify(res.user))
      }
      router.push('/home')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '登录失败'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-wrapper {
  max-width: 1100px;
  margin: 20px auto 40px;
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.hero {
  background: linear-gradient(150deg, #4a90e2 0%, #6b5ae2 70%, #7b6df0 100%);
  color: #fff;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(74, 144, 226, 0.25);
  display: grid;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 13px;
  opacity: 0.85;
}

.desc {
  margin: 0;
  opacity: 0.9;
}

.bullets {
  margin: 6px 0 0;
  padding-left: 0;
  list-style: none;
  opacity: 0.92;
  line-height: 1.8;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card {
  border-radius: 16px;
  border: 1px solid #eef2f7;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
}

.card-header h3 {
  margin: 6px 0 4px;
}

.hint {
  margin: 0;
  color: #6c7a9c;
}

.full {
  width: 100%;
}

.info-card {
  border-radius: 14px;
  border: 1px solid #eef2f7;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
</style>
