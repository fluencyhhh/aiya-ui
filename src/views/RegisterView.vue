<template>
  <div class="register-wrapper">
    <div class="intro">
      <p class="eyebrow">AIYA 注册</p>
      <h2>创建你的账号</h2>
      <p class="desc">完善个人信息，系统会根据出生日期自动计算年龄。</p>
      <el-button type="primary" text @click="goLogin">已有账号？去登录</el-button>
    </div>

    <el-card class="form-card" shadow="hover">
      <div class="card-header">
        <div>
          <p class="eyebrow">SIGN UP</p>
          <h3>注册信息</h3>
          <p class="hint">请填写真实信息，方便账号安全校验</p>
        </div>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="onSubmit"
        class="form-grid"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="registerForm.gender">
            <el-radio-button label="MALE">男</el-radio-button>
            <el-radio-button label="FEMALE">女</el-radio-button>
            <el-radio-button label="OTHER">其他</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            clearable
          />
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="registerForm.birthDate"
            type="date"
            placeholder="选择出生日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item class="full-row">
          <el-button class="full" type="primary" :loading="loading" native-type="submit" @click="onSubmit">
            {{ loading ? '提交中...' : '提交注册' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="userInfo" class="info-card" shadow="never">
      <div class="info-header">
        <div>
          <p class="eyebrow">SUCCESS</p>
          <h4>注册成功</h4>
        </div>
        <el-tag type="success">已创建</el-tag>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderLabel(userInfo.gender) }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ userInfo.birthDate }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ userInfo.age }}</el-descriptions-item>
      </el-descriptions>
      <div class="after-actions">
        <el-button type="primary" @click="goLogin">返回登录</el-button>
        <el-button text type="primary" @click="resetForm">继续创建新账号</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerUser } from '../services/auth'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)
const userInfo = ref(null)

const registerForm = reactive({
  name: '',
  gender: 'MALE',
  username: '',
  phone: '',
  password: '',
  birthDate: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }]
}

const genderLabel = (value) => {
  if (value === 'MALE') return '男'
  if (value === 'FEMALE') return '女'
  return '其他'
}

const goLogin = () => router.push('/login')

const resetForm = () => {
  registerFormRef.value?.resetFields()
  userInfo.value = null
}

const onSubmit = () => {
  registerFormRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await registerUser({ ...registerForm })
      userInfo.value = res.user || null
      ElMessage.success(res.message || '注册成功')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '注册失败'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-wrapper {
  max-width: 1080px;
  margin: 20px auto 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.intro {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #eef2f7;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 13px;
  color: #6c7a9c;
}

.desc {
  margin: 4px 0 0;
  color: #4a5fa5;
}

.form-card {
  border-radius: 16px;
  border: 1px solid #eef2f7;
}

.card-header h3 {
  margin: 6px 0 4px;
}

.hint {
  margin: 0;
  color: #6c7a9c;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px 18px;
}

.full-row {
  grid-column: 1 / -1;
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

.after-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
