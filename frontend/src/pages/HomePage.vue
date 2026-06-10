<template>
  <div class="page">
    <section class="glass-card hero">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :lg="11">
          <div class="hero-left">
            <h2>个性化学习路径推荐</h2>
            <p class="muted">
              从热门课程、技术栈趋势与挑战赛入口快速开始。当前日期：
              <span class="inline-date">{{ dateText }}</span>
            </p>
            <el-space wrap>
              <el-button type="primary" @click="goLab">快速开始编码练习</el-button>
              <el-button plain @click="goLearning">进入结构化学习</el-button>
              <el-tag type="warning" effect="light">挑战赛倒计时 {{ challengeCountdown }}</el-tag>
            </el-space>
            <div class="progress-grid">
              <div class="metric">
                <div class="metric-value">{{ overview.progress.learningMinutes }}</div>
                <div class="metric-label">学习分钟</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ overview.progress.progressPercent }}%</div>
                <div class="metric-label">总体进度</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ overview.progress.achievementCount }}</div>
                <div class="metric-label">成就数量</div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="13">
          <el-skeleton v-if="loading" animated :rows="6" />
          <el-carousel v-else height="300px" indicator-position="outside" :interval="3500" :autoplay="true">
            <el-carousel-item v-for="(slide, idx) in heroSlides" :key="idx">
              <div class="hero-slide" :style="{ backgroundImage: `url(${slide.coverUrl})` }">
                <div class="slide-mask">
                  <h3>{{ slide.title }}</h3>
                  <p>{{ slide.summary }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </section>

    <section class="surface-card section-block">
      <div class="section-head">
        <h3 class="section-title">推荐学习路径</h3>
        <span class="muted">点击课程卡片可跳转到学习页</span>
      </div>
      <el-row :gutter="14">
        <el-col v-for="item in overview.recommendations" :key="item.id" :xs="24" :md="12" :xl="8">
          <LearningPathCard :course="item" :progress="overview.progress.progressPercent" @start="onStartCourse" />
        </el-col>
      </el-row>
    </section>

    <el-row :gutter="14">
      <el-col :xs="24" :lg="10">
        <section class="surface-card section-block">
          <div class="section-head">
            <h3 class="section-title">热门技术栈</h3>
          </div>
          <div class="stack-wrap">
            <span v-for="stack in overview.hotStacks" :key="stack.name" class="tech-pill">
              {{ stack.name }} · {{ stack.count }}
            </span>
          </div>

          <el-divider />
          <h4 style="margin: 0 0 8px">编程挑战赛入口</h4>
          <el-timeline>
            <el-timeline-item
              v-for="challenge in overview.challenges"
              :key="challenge.id"
              :timestamp="formatDate(challenge.deadline)"
            >
              <div class="timeline-title">{{ challenge.title }}</div>
              <div class="muted">{{ challenge.reward }}</div>
              <el-button link type="primary" @click="openChallenge(challenge)">去挑战</el-button>
            </el-timeline-item>
          </el-timeline>
        </section>
      </el-col>

      <el-col :xs="24" :lg="14">
        <section class="surface-card section-block">
          <div class="section-head">
            <h3 class="section-title">社区热门讨论</h3>
            <el-input v-model="communityKeyword" style="max-width: 260px" clearable placeholder="搜索讨论内容" />
          </div>

          <el-table :data="visiblePosts" :row-class-name="rowClassName">
            <el-table-column prop="title" label="讨论主题" min-width="220" />
            <el-table-column prop="topic" label="标签" width="120" />
            <el-table-column label="热度" width="90">
              <template #default="{ row }">{{ row.heat }}</template>
            </el-table-column>
            <el-table-column label="评论" width="90">
              <template #default="{ row }">{{ row.comments }}</template>
            </el-table-column>
          </el-table>

          <div class="list-actions">
            <el-button v-if="canShowMorePosts" @click="postLimit += 2">显示更多</el-button>
            <el-button v-else plain @click="postLimit = 4">收起</el-button>
          </div>
        </section>
      </el-col>
    </el-row>

    <InteractionToolkit
      title="首页互动效果集合"
      :rows="toolkitRows"
      @row-click="onToolkitRowClick"
      @avatar-change="onToolkitAvatar"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { api } from '../lib/api'
import LearningPathCard from '../components/LearningPathCard.vue'
import InteractionToolkit from '../components/InteractionToolkit.vue'

const router = useRouter()

const loading = ref(true)
const challengeCountdown = ref('--')
const communityKeyword = ref('')
const postLimit = ref(4)

const overview = reactive({
  progress: {
    learningMinutes: 0,
    progressPercent: 0,
    achievementCount: 0,
  },
  recommendations: [],
  featuredCourses: [],
  hotStacks: [],
  challenges: [],
  communityPosts: [],
})

let timer = null

const dateText = computed(() => dayjs().format('YYYY年MM月DD日'))

const heroSlides = computed(() => {
  if (overview.featuredCourses.length > 0) return overview.featuredCourses
  return [
    {
      title: '欢迎来到 Code Orbit',
      summary: '在项目化训练中提升编码能力',
      coverUrl:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80',
    },
  ]
})

const filteredPosts = computed(() => {
  const keyword = communityKeyword.value.trim().toLowerCase()
  if (!keyword) return overview.communityPosts
  return overview.communityPosts.filter((item) => {
    const source = `${item.title}${item.content}${item.topic}`.toLowerCase()
    return source.includes(keyword)
  })
})

const visiblePosts = computed(() => filteredPosts.value.slice(0, postLimit.value))
const canShowMorePosts = computed(() => postLimit.value < filteredPosts.value.length)

const toolkitRows = computed(() =>
  overview.featuredCourses.map((course) => ({
    name: course.title,
    tags: course.techStack || [],
    desc: course.summary,
  })),
)

function rowClassName({ rowIndex }) {
  return rowIndex % 2 === 1 ? 'row-alt-light' : ''
}

function formatDate(dateValue) {
  return dayjs(dateValue).format('YYYY-MM-DD HH:mm')
}

function updateCountdown() {
  if (!overview.challenges.length) {
    challengeCountdown.value = '--'
    return
  }

  const target = dayjs(overview.challenges[0].deadline).valueOf()
  const delta = target - Date.now()
  if (delta <= 0) {
    challengeCountdown.value = '00天 00:00:00'
    return
  }

  const day = Math.floor(delta / 86400000)
  const hour = Math.floor((delta % 86400000) / 3600000)
  const minute = Math.floor((delta % 3600000) / 60000)
  const second = Math.floor((delta % 60000) / 1000)
  challengeCountdown.value = `${String(day).padStart(2, '0')}天 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

async function fetchOverview() {
  loading.value = true
  try {
    const res = await api.get('/home/overview', { silent: true })
    const data = res?.data?.data || {}
    overview.progress = data.progress || overview.progress
    overview.recommendations = data.recommendations || []
    overview.featuredCourses = data.featuredCourses || []
    overview.hotStacks = data.hotStacks || []
    overview.challenges = data.challenges || []
    overview.communityPosts = data.communityPosts || []
    updateCountdown()
  } catch {
    ElNotification({ title: '提示', message: '正在使用默认首页数据', type: 'warning' })
  } finally {
    loading.value = false
  }
}

function goLab() {
  router.push('/lab')
}

function goLearning() {
  router.push('/learning')
}

function onStartCourse(course) {
  ElNotification({ title: '已选择课程', message: `即将进入 ${course.title}`, type: 'success' })
  router.push('/learning')
}

function openChallenge(challenge) {
  sessionStorage.setItem('label1276_active_challenge_id', String(challenge.id))
  router.push('/lab')
}

function onToolkitRowClick(row) {
  ElNotification({ title: '交互触发', message: `你查看了 ${row.name}`, type: 'info' })
}

function onToolkitAvatar() {
  ElNotification({ title: '交互触发', message: '首页已触发头像上传交互', type: 'success' })
}

onMounted(async () => {
  await fetchOverview()
  timer = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.hero {
  border-radius: 22px;
  padding: 18px;
}

.hero-left h2 {
  margin: 0 0 10px;
  font-size: clamp(1.25rem, 3vw, 1.8rem);
}

.progress-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
}

.metric-label {
  font-size: 12px;
  color: var(--text-soft);
}

.hero-slide {
  width: 100%;
  height: 300px;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.slide-mask {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(180deg, rgba(4, 16, 28, 0.1), rgba(4, 16, 28, 0.62));
}

.section-block {
  border-radius: 18px;
  padding: 14px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.stack-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.timeline-title {
  font-weight: 700;
  margin-bottom: 4px;
}

.list-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

@media (max-width: 900px) {
  .progress-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
