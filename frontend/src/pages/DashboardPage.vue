<template>
  <div class="page">
    <section class="surface-card section-block">
      <div class="section-head">
        <h3 class="section-title">个人中心 / 学习仪表板</h3>
        <el-tag type="success" effect="light">学习概览 / 我的课程 / 练习记录 / 作品集 / 收藏 / 设置</el-tag>
      </div>

      <el-skeleton v-if="loading" :rows="7" animated />
      <el-row v-else :gutter="14">
        <el-col :xs="24" :lg="8">
          <el-card class="panel" shadow="never">
            <template #header>
              <div class="panel-title">账号信息</div>
            </template>
            <div class="user-head">
              <el-avatar :src="overview.user.avatarUrl" :size="72">{{ overview.user.name?.slice(0, 1) }}</el-avatar>
              <div>
                <div class="user-name">{{ overview.user.name }}</div>
                <div class="muted">{{ overview.user.email }}</div>
                <el-tag style="margin-top: 6px">{{ overview.user.role }}</el-tag>
              </div>
            </div>

            <AvatarUploader v-model="avatarValue" @uploaded="uploadAvatar" />
          </el-card>

          <el-card class="panel" shadow="never" style="margin-top: 12px">
            <template #header>
              <div class="panel-title">学习概览仪表板</div>
            </template>
            <div class="metrics">
              <div class="metric">
                <div class="value">{{ overview.user.learningMinutes }}</div>
                <div class="label">学习时长（分钟）</div>
              </div>
              <div class="metric">
                <div class="value">{{ overview.user.progressPercent }}%</div>
                <div class="label">学习进度</div>
              </div>
              <div class="metric">
                <div class="value">{{ overview.user.achievementCount }}</div>
                <div class="label">成就</div>
              </div>
              <div class="metric">
                <div class="value">{{ overview.user.streakDays }}</div>
                <div class="label">连续学习天数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="16">
          <el-card class="panel" shadow="never">
            <template #header>
              <div class="panel-title">我的课程 / 学习路径</div>
            </template>

            <el-table :data="overview.learningPaths" :row-class-name="rowClassName">
              <el-table-column label="课程" min-width="220">
                <template #default="{ row }">{{ row.course?.title }}</template>
              </el-table-column>
              <el-table-column label="状态" width="130">
                <template #default="{ row }">
                  <el-tag>{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="进度" width="220">
                <template #default="{ row }">
                  <el-progress :percentage="row.progressPercent" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <el-card class="panel" shadow="never" style="margin-top: 12px">
            <template #header>
              <div class="panel-title">代码练习记录</div>
            </template>
            <el-table :data="submissions" max-height="260" :row-class-name="rowClassName">
              <el-table-column label="挑战" min-width="200">
                <template #default="{ row }">{{ row.challenge?.title || '-' }}</template>
              </el-table-column>
              <el-table-column prop="language" label="语言" width="110" />
              <el-table-column prop="score" label="分数" width="90" />
              <el-table-column prop="runtimeMs" label="耗时(ms)" width="110" />
              <el-table-column label="时间" width="170">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <el-row :gutter="12">
      <el-col :xs="24" :lg="12">
        <section class="surface-card section-block">
          <div class="section-head">
            <h3 class="section-title">项目作品集</h3>
            <el-button type="primary" @click="portfolioDialogVisible = true">新增作品</el-button>
          </div>

          <el-table :data="portfolio" max-height="280" :row-class-name="rowClassName">
            <el-table-column prop="title" label="标题" min-width="160" />
            <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
          </el-table>
        </section>
      </el-col>

      <el-col :xs="24" :lg="12">
        <section class="surface-card section-block">
          <div class="section-head">
            <h3 class="section-title">收藏的知识点</h3>
            <el-button type="success" @click="favoriteDialogVisible = true">新增收藏</el-button>
          </div>

          <el-table :data="favorites" max-height="280" :row-class-name="rowClassName">
            <el-table-column prop="title" label="标题" min-width="160" />
            <el-table-column prop="tag" label="标签" width="120" />
            <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip />
          </el-table>
        </section>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :xs="24" :lg="12">
        <section class="surface-card section-block">
          <h3 class="section-title">学习报告与分析</h3>
          <el-timeline style="margin-top: 12px">
            <el-timeline-item v-for="item in reports" :key="item.id" :timestamp="item.dateKey">
              学习 {{ item.minutes }} 分钟，完成 {{ item.solvedCount }} 道练习题
            </el-timeline-item>
          </el-timeline>
        </section>
      </el-col>

      <el-col :xs="24" :lg="12">
        <section class="surface-card section-block">
          <h3 class="section-title">账户设置与偏好</h3>
          <el-form :model="settingsForm" label-position="top" style="margin-top: 8px">
            <el-form-item label="主题">
              <el-radio-group v-model="settingsForm.theme">
                <el-radio-button label="light">亮色</el-radio-button>
                <el-radio-button label="dark">暗色</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="界面语言">
              <el-select v-model="settingsForm.language" style="width: 100%">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>

            <el-form-item label="编辑器字号">
              <el-slider v-model="settingsForm.editorFontSize" :min="12" :max="20" />
            </el-form-item>

            <el-button type="primary" :loading="savingSettings" @click="saveSettings">保存设置</el-button>
          </el-form>
        </section>
      </el-col>
    </el-row>

    <InteractionToolkit title="仪表板交互效果区" @avatar-change="onToolkitAvatar" />

    <el-dialog v-model="portfolioDialogVisible" width="620px" align-center>
      <template #header>
        <h3 class="section-title">新增项目作品</h3>
      </template>
      <el-form :model="portfolioForm" label-position="top">
        <el-form-item label="标题"><el-input v-model="portfolioForm.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="portfolioForm.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="仓库链接"><el-input v-model="portfolioForm.repoUrl" /></el-form-item>
        <el-form-item label="演示链接"><el-input v-model="portfolioForm.demoUrl" /></el-form-item>
        <el-form-item label="封面链接"><el-input v-model="portfolioForm.imageUrl" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="portfolioDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingPortfolio" @click="addPortfolio">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="favoriteDialogVisible" width="560px" align-center>
      <template #header>
        <h3 class="section-title">新增收藏知识点</h3>
      </template>
      <el-form :model="favoriteForm" label-position="top">
        <el-form-item label="标题"><el-input v-model="favoriteForm.title" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="favoriteForm.tag" /></el-form-item>
        <el-form-item label="摘要"><el-input v-model="favoriteForm.summary" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="favoriteDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingFavorite" @click="addFavorite">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElNotification } from 'element-plus'
import { api } from '../lib/api'
import { getToken, getTheme, setAuth, setTheme } from '../lib/auth'
import AvatarUploader from '../components/AvatarUploader.vue'
import InteractionToolkit from '../components/InteractionToolkit.vue'

const router = useRouter()

const loading = ref(true)
const savingSettings = ref(false)
const savingPortfolio = ref(false)
const savingFavorite = ref(false)

const portfolioDialogVisible = ref(false)
const favoriteDialogVisible = ref(false)

const avatarValue = ref('')

const overview = reactive({
  user: {
    name: '',
    email: '',
    role: '',
    avatarUrl: '',
    learningMinutes: 0,
    progressPercent: 0,
    achievementCount: 0,
    streakDays: 0,
    settings: {},
  },
  learningPaths: [],
})

const submissions = ref([])
const portfolio = ref([])
const favorites = ref([])
const reports = ref([])

const settingsForm = reactive({
  theme: getTheme(),
  language: 'zh-CN',
  editorFontSize: 14,
})

const portfolioForm = reactive({
  title: '',
  description: '',
  repoUrl: '',
  demoUrl: '',
  imageUrl: '',
})

const favoriteForm = reactive({
  title: '',
  tag: '',
  summary: '',
})

function rowClassName({ rowIndex }) {
  return rowIndex % 2 === 1 ? 'row-alt-light' : ''
}

function formatDate(value) {
  return dayjs(value).format('YYYY-MM-DD HH:mm')
}

async function fetchAll() {
  loading.value = true
  try {
    const [overviewRes, portfolioRes, favoritesRes, reportsRes, submissionsRes] = await Promise.all([
      api.get('/dashboard/overview'),
      api.get('/dashboard/portfolio'),
      api.get('/dashboard/favorites'),
      api.get('/dashboard/reports'),
      api.get('/dashboard/submissions'),
    ])

    const overviewData = overviewRes?.data?.data || {}
    overview.user = overviewData.user || overview.user
    overview.learningPaths = overviewData.learningPaths || []

    submissions.value = submissionsRes?.data?.data?.submissions || []
    portfolio.value = portfolioRes?.data?.data?.items || []
    favorites.value = favoritesRes?.data?.data?.items || []
    reports.value = reportsRes?.data?.data?.reports || []

    avatarValue.value = overview.user.avatarUrl || ''
    settingsForm.theme = overview.user.settings?.theme || getTheme()
    settingsForm.language = overview.user.settings?.language || 'zh-CN'
    settingsForm.editorFontSize = overview.user.settings?.editorFontSize || 14
  } finally {
    loading.value = false
  }
}

async function uploadAvatar(value) {
  if (!value) return
  await api.post('/dashboard/avatar', { avatarUrl: value })
  overview.user.avatarUrl = value

  const token = localStorage.getItem('label1276_token')
  const user = localStorage.getItem('label1276_user')
  if (token && user) {
    const parsed = JSON.parse(user)
    parsed.avatarUrl = value
    setAuth({ token, user: parsed })
  }

  ElNotification({ title: '成功', message: '头像已更新', type: 'success' })
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await api.post('/dashboard/settings', {
      settings: {
        theme: settingsForm.theme,
        language: settingsForm.language,
        editorFontSize: settingsForm.editorFontSize,
      },
    })
    setTheme(settingsForm.theme)
    ElNotification({ title: '成功', message: '设置已保存', type: 'success' })
  } finally {
    savingSettings.value = false
  }
}

async function addPortfolio() {
  savingPortfolio.value = true
  try {
    await api.post('/dashboard/portfolio', {
      title: portfolioForm.title,
      description: portfolioForm.description,
      repoUrl: portfolioForm.repoUrl,
      demoUrl: portfolioForm.demoUrl,
      imageUrl: portfolioForm.imageUrl,
    })

    portfolioDialogVisible.value = false
    portfolioForm.title = ''
    portfolioForm.description = ''
    portfolioForm.repoUrl = ''
    portfolioForm.demoUrl = ''
    portfolioForm.imageUrl = ''
    await fetchAll()
    ElNotification({ title: '成功', message: '作品已添加', type: 'success' })
  } finally {
    savingPortfolio.value = false
  }
}

async function addFavorite() {
  savingFavorite.value = true
  try {
    await api.post('/dashboard/favorites', {
      title: favoriteForm.title,
      tag: favoriteForm.tag,
      summary: favoriteForm.summary,
    })

    favoriteDialogVisible.value = false
    favoriteForm.title = ''
    favoriteForm.tag = ''
    favoriteForm.summary = ''
    await fetchAll()
    ElNotification({ title: '成功', message: '收藏已添加', type: 'success' })
  } finally {
    savingFavorite.value = false
  }
}

function onToolkitAvatar() {
  ElNotification({ title: '仪表板交互', message: '已触发交互区头像上传事件', type: 'info' })
}

onMounted(async () => {
  if (!getToken()) {
    ElNotification({ title: '请先登录', message: '登录后可查看学习仪表板', type: 'warning' })
    router.push('/auth')
    return
  }
  await fetchAll()
})
</script>

<style scoped>
.section-block {
  padding: 14px;
  border-radius: 18px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.panel {
  border-radius: 14px;
  border: 1px solid var(--line);
}

.panel-title {
  font-weight: 700;
}

.user-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  border: 1px solid var(--line);
  background: var(--surface-strong);
  border-radius: 12px;
  padding: 10px;
}

.metric .value {
  font-size: 24px;
  font-weight: 700;
}

.metric .label {
  color: var(--text-soft);
  font-size: 12px;
}
</style>
