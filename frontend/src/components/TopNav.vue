<template>
  <header class="nav-wrap">
    <div class="nav-inner">
      <div class="brand" @click="go('/home')">
        <div class="mark" />
        <div>
          <div class="brand-title">Code Orbit</div>
          <div class="muted inline-date">{{ todayText }}</div>
        </div>
      </div>

      <el-menu
        mode="horizontal"
        :default-active="activePath"
        :ellipsis="false"
        class="nav-menu"
        @select="onSelect"
      >
        <el-menu-item index="/auth">登录/注册</el-menu-item>
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/lab">代码实验室</el-menu-item>
        <el-menu-item index="/learning">结构化学习</el-menu-item>
        <el-menu-item index="/dashboard">学习仪表板</el-menu-item>
      </el-menu>

      <div class="actions">
        <ThemeSwitch />
        <el-dropdown @command="onCommand">
          <el-button type="primary" plain>
            {{ user ? user.name : '立即开始' }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="dashboard">个人中心</el-dropdown-item>
              <el-dropdown-item command="auth">登录/注册</el-dropdown-item>
              <el-dropdown-item command="lab">快速练习</el-dropdown-item>
              <el-dropdown-item v-if="user" command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import ThemeSwitch from './ThemeSwitch.vue'
import { clearAuth, getUser } from '../lib/auth'

const route = useRoute()
const router = useRouter()

const activePath = ref('/home')
const user = ref(getUser())

watchEffect(() => {
  activePath.value = route.path
})

const todayText = computed(() => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}年${mm}月${dd}日`
})

function syncUser() {
  user.value = getUser()
}

onMounted(() => {
  window.addEventListener('orbit:auth', syncUser)
})

onBeforeUnmount(() => {
  window.removeEventListener('orbit:auth', syncUser)
})

function go(path) {
  router.push(path)
}

function onSelect(path) {
  go(path)
}

function onCommand(command) {
  if (command === 'logout') {
    clearAuth()
    ElNotification({ title: '成功', message: '已退出登录', type: 'success' })
    go('/auth')
    return
  }
  go(`/${command}`)
}
</script>

<style scoped>
.nav-wrap {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg) 72%, transparent);
  border-bottom: 1px solid var(--line);
}

.nav-inner {
  width: min(1260px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 182px;
}

.mark {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: conic-gradient(from 120deg, #0095d9, #37c7ff, #00b981, #0095d9);
  box-shadow: 0 12px 24px rgba(0, 149, 217, 0.35);
}

.brand-title {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.nav-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 1000px) {
  .nav-inner {
    flex-wrap: wrap;
  }

  .nav-menu {
    order: 3;
    width: 100%;
  }
}
</style>
