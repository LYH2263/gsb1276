<template>
  <div class="page">
    <section class="auth-hero glass-card">
      <div class="code-rain">
        <span v-for="(line, idx) in codeLines" :key="idx" :style="lineStyle(idx)">{{ line }}</span>
      </div>
      <div class="hero-content">
        <h1>Code Orbit 编程教学互动网站</h1>
        <p class="muted">
          支持学生/教师/企业用户登录，内置邮箱验证码注册、密码重置与新手引导。暗色/亮色主题可随时切换。
        </p>
        <el-space wrap>
          <el-tag type="primary">Vue 3</el-tag>
          <el-tag type="success">多语言代码实验室</el-tag>
          <el-tag type="warning">实时协作编辑</el-tag>
        </el-space>
      </div>
    </section>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card class="surface-card" shadow="never">
          <template #header>
            <h3 class="section-title">账号入口</h3>
          </template>

          <el-tabs v-model="activeTab" stretch>
            <el-tab-pane label="登录" name="login">
              <el-form :model="loginForm" label-position="top">
                <el-form-item label="邮箱">
                  <el-input v-model="loginForm.email" clearable placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="密码">
                  <el-input v-model="loginForm.password" type="password" show-password placeholder="请输入密码" />
                </el-form-item>
                <div class="form-actions">
                  <el-button type="primary" :loading="loginLoading" @click="onLogin">登录</el-button>
                  <el-button link type="warning" @click="forgotDialogVisible = true">忘记密码</el-button>
                </div>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="注册" name="register">
              <el-form :model="registerForm" label-position="top">
                <el-form-item label="邮箱">
                  <el-input v-model="registerForm.email" clearable placeholder="用于接收验证码" />
                </el-form-item>

                <el-form-item label="邮箱验证码">
                  <el-input v-model="registerForm.code" placeholder="输入 6 位验证码">
                    <template #append>
                      <el-button :disabled="registerCount > 0" @click="sendRegisterCode">
                        {{ registerCount > 0 ? `${registerCount}s` : '发送验证码' }}
                      </el-button>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label="用户名">
                  <el-input v-model="registerForm.name" clearable placeholder="2-30 位" />
                </el-form-item>

                <el-form-item label="角色选择">
                  <el-radio-group v-model="registerForm.role">
                    <el-radio-button label="student">学生</el-radio-button>
                    <el-radio-button label="teacher">教师</el-radio-button>
                    <el-radio-button label="enterprise">企业用户</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <el-row :gutter="10">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="密码">
                      <el-input v-model="registerForm.password" type="password" show-password />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="确认密码">
                      <el-input v-model="registerForm.confirmPassword" type="password" show-password />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item>
                  <el-checkbox v-model="registerForm.agree">我同意学习社区规范并接受平台消息提醒</el-checkbox>
                </el-form-item>

                <el-button type="primary" :loading="registerLoading" @click="onRegister">注册并进入</el-button>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="surface-card" shadow="never">
          <template #header>
            <h3 class="section-title">新手路径引导</h3>
          </template>

          <el-timeline>
            <el-timeline-item timestamp="1" type="primary">注册并完成邮箱验证</el-timeline-item>
            <el-timeline-item timestamp="2" type="success">进入首页查看学习路径推荐与挑战赛</el-timeline-item>
            <el-timeline-item timestamp="3" type="warning">在代码实验室执行代码并保存版本</el-timeline-item>
            <el-timeline-item timestamp="4" type="info">到个人中心查看学习报告和作品集</el-timeline-item>
          </el-timeline>

          <el-alert
            :closable="false"
            type="success"
            show-icon
            title="测试账号"
            description="admin@example.com / 123456"
          />
        </el-card>
      </el-col>
    </el-row>

    <InteractionToolkit title="登录页交互效果区" @avatar-change="onAvatarChange" />

    <el-dialog v-model="forgotDialogVisible" width="620px" align-center>
      <template #header>
        <h3 class="section-title">忘记密码 / 重置密码</h3>
      </template>

      <el-form :model="forgotForm" label-position="top">
        <el-form-item label="邮箱">
          <el-input v-model="forgotForm.email" clearable />
        </el-form-item>

        <el-form-item label="验证码">
          <el-input v-model="forgotForm.code" placeholder="输入 6 位验证码">
            <template #append>
              <el-button :disabled="forgotCount > 0" @click="sendForgotCode">
                {{ forgotCount > 0 ? `${forgotCount}s` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="新密码">
          <el-input v-model="forgotForm.newPassword" type="password" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="forgotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="resetLoading" @click="onResetPassword">重置密码</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="onboardingVisible" width="700px" align-center :close-on-click-modal="false">
      <template #header>
        <h3 class="section-title">首次使用引导</h3>
      </template>

      <el-steps :active="2" finish-status="success">
        <el-step title="首页浏览" description="查看个性化推荐和热门课程" />
        <el-step title="实验室练习" description="多语言编辑、运行、保存版本" />
        <el-step title="仪表板复盘" description="追踪时长、进度与成就" />
      </el-steps>

      <div style="height: 14px" />
      <el-alert :closable="false" type="primary" show-icon>
        建议先进入“结构化学习”选择一门课程，再到“代码实验室”完成章节练习。
      </el-alert>

      <template #footer>
        <el-button @click="skipOnboarding">稍后再看</el-button>
        <el-button type="primary" :loading="onboardingLoading" @click="finishOnboarding">完成并进入首页</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { z } from 'zod'
import { api } from '../lib/api'
import { setAuth } from '../lib/auth'
import InteractionToolkit from '../components/InteractionToolkit.vue'

const router = useRouter()

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const resetLoading = ref(false)
const onboardingLoading = ref(false)

const forgotDialogVisible = ref(false)
const onboardingVisible = ref(false)

const registerCount = ref(0)
const forgotCount = ref(0)

let registerTimer = null
let forgotTimer = null

const codeLines = [
  'const skill = evolve(experience)',
  'function compileFuture() { return innovation; }',
  'if (teamwork) success++;',
  'type Path = "student" | "teacher" | "enterprise"',
  'while (learning) { levelUp(); }',
  'python => automate(tasks)',
  'java => build(stableSystem)',
]

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  email: '',
  code: '',
  name: '',
  role: 'student',
  password: '',
  confirmPassword: '',
  agree: false,
})

const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
})

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
})

const registerSchema = z
  .object({
    email: z.string().email('邮箱格式不正确'),
    code: z.string().length(6, '验证码必须为 6 位'),
    name: z.string().min(2, '用户名至少 2 位').max(30, '用户名过长'),
    role: z.enum(['student', 'teacher', 'enterprise']),
    password: z.string().min(6, '密码至少 6 位'),
    confirmPassword: z.string().min(6, '请确认密码'),
    agree: z.boolean().refine((value) => value === true, { message: '请先勾选协议' }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  })

const resetSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  code: z.string().length(6, '验证码必须为 6 位'),
  newPassword: z.string().min(6, '密码至少 6 位'),
})

function lineStyle(idx) {
  return {
    '--delay': `${idx * 0.7}s`,
    '--left': `${(idx * 13) % 72}%`,
  }
}

function startCountdown(targetRef, seconds, type) {
  targetRef.value = seconds
  const timer = setInterval(() => {
    targetRef.value -= 1
    if (targetRef.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  if (type === 'register') {
    registerTimer = timer
  } else {
    forgotTimer = timer
  }
}

async function sendRegisterCode() {
  if (!registerForm.email) {
    ElNotification({ title: '提示', message: '请先填写邮箱', type: 'warning' })
    return
  }

  try {
    const res = await api.post('/auth/send-email-code', {
      email: registerForm.email,
      purpose: 'register',
    })
    const demoCode = res?.data?.data?.demoCode
    ElNotification({ title: '验证码已发送', message: `演示验证码：${demoCode}`, type: 'success' })
    startCountdown(registerCount, 60, 'register')
  } catch {
    // handled in interceptor
  }
}

async function sendForgotCode() {
  if (!forgotForm.email) {
    ElNotification({ title: '提示', message: '请先填写邮箱', type: 'warning' })
    return
  }

  try {
    const res = await api.post('/auth/forgot-password', {
      email: forgotForm.email,
    })
    const demoCode = res?.data?.data?.demoCode
    ElNotification({ title: '验证码已发送', message: `演示验证码：${demoCode}`, type: 'success' })
    startCountdown(forgotCount, 60, 'forgot')
  } catch {
    // handled in interceptor
  }
}

async function onRegister() {
  const parsed = registerSchema.safeParse(registerForm)
  if (!parsed.success) {
    ElNotification({ title: '校验失败', message: parsed.error.issues[0]?.message || '请检查输入', type: 'warning' })
    return
  }

  registerLoading.value = true
  try {
    const res = await api.post('/auth/register', {
      email: registerForm.email,
      code: registerForm.code,
      name: registerForm.name,
      role: registerForm.role,
      password: registerForm.password,
    })

    const token = res?.data?.data?.token
    const user = res?.data?.data?.user
    if (token && user) {
      setAuth({ token, user })
      ElNotification({ title: '注册成功', message: '欢迎加入 Code Orbit', type: 'success' })
      onboardingVisible.value = !user.onboardingCompleted
      if (user.onboardingCompleted) router.push('/home')
    }
  } finally {
    registerLoading.value = false
  }
}

async function onLogin() {
  const parsed = loginSchema.safeParse(loginForm)
  if (!parsed.success) {
    ElNotification({ title: '校验失败', message: parsed.error.issues[0]?.message || '请检查输入', type: 'warning' })
    return
  }

  loginLoading.value = true
  try {
    const res = await api.post('/auth/login', {
      email: loginForm.email,
      password: loginForm.password,
    })

    const token = res?.data?.data?.token
    const user = res?.data?.data?.user
    if (token && user) {
      setAuth({ token, user })
      ElNotification({ title: '登录成功', message: `欢迎回来，${user.name}`, type: 'success' })
      onboardingVisible.value = !user.onboardingCompleted
      if (user.onboardingCompleted) router.push('/home')
    }
  } finally {
    loginLoading.value = false
  }
}

async function onResetPassword() {
  const parsed = resetSchema.safeParse(forgotForm)
  if (!parsed.success) {
    ElNotification({ title: '校验失败', message: parsed.error.issues[0]?.message || '请检查输入', type: 'warning' })
    return
  }

  resetLoading.value = true
  try {
    await api.post('/auth/reset-password', {
      email: forgotForm.email,
      code: forgotForm.code,
      newPassword: forgotForm.newPassword,
    })
    ElNotification({ title: '成功', message: '密码已重置，请重新登录', type: 'success' })
    forgotDialogVisible.value = false
    activeTab.value = 'login'
    loginForm.email = forgotForm.email
  } finally {
    resetLoading.value = false
  }
}

function skipOnboarding() {
  onboardingVisible.value = false
  router.push('/home')
}

async function finishOnboarding() {
  onboardingLoading.value = true
  try {
    const res = await api.post('/auth/onboarding/complete')
    const user = res?.data?.data?.user
    const token = localStorage.getItem('label1276_token')
    if (user && token) {
      setAuth({ token, user })
    }
    onboardingVisible.value = false
    router.push('/home')
  } finally {
    onboardingLoading.value = false
  }
}

function onAvatarChange() {
  ElNotification({ title: '提示', message: '登录页已触发上传头像交互事件', type: 'info' })
}

onBeforeUnmount(() => {
  if (registerTimer) clearInterval(registerTimer)
  if (forgotTimer) clearInterval(forgotTimer)
})
</script>

<style scoped>
.auth-hero {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  padding: 26px;
  border-radius: 20px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 760px;
}

.hero-content h1 {
  margin: 0 0 10px;
  font-size: clamp(1.4rem, 3vw, 2rem);
}

.code-rain {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.45;
}

.code-rain span {
  position: absolute;
  left: var(--left);
  top: -20%;
  white-space: nowrap;
  color: color-mix(in srgb, var(--brand) 85%, #fff 15%);
  font-family: 'Space Grotesk', monospace;
  animation: rain 8.4s linear infinite;
  animation-delay: var(--delay);
  font-size: 12px;
}

@keyframes rain {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(280px);
    opacity: 0;
  }
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
