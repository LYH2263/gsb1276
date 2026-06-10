<template>
  <div class="page">
    <section class="surface-card section-block">
      <div class="section-head">
        <h3 class="section-title">核心页面 - 结构化学习</h3>
        <el-tag type="primary" effect="light">课程章节导航 / 视频教程 + 实时编码 / 笔记与讨论区</el-tag>
      </div>

      <el-row :gutter="12">
        <el-col :xs="24" :md="8" :lg="6">
          <el-card class="panel" shadow="never">
            <template #header>
              <div class="panel-title">课程导航</div>
            </template>
            <el-menu :default-active="String(selectedCourseId || '')" @select="onCourseSelect">
              <el-menu-item v-for="course in courses" :key="course.id" :index="String(course.id)">
                {{ course.title }}
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="16" :lg="18">
          <el-skeleton v-if="loading" :rows="8" animated />
          <template v-else>
            <el-card class="panel" shadow="never">
              <template #header>
                <div class="panel-title">{{ selectedCourse?.title || '请选择课程' }}</div>
              </template>

              <div class="muted">{{ selectedCourse?.summary }}</div>

              <el-divider />
              <el-form-item label="章节导航">
                <el-select v-model="selectedChapterId" style="width: 100%">
                  <el-option
                    v-for="chapter in selectedCourse?.chapters || []"
                    :key="chapter.id"
                    :label="`第${chapter.chapterNo}章 · ${chapter.title}`"
                    :value="chapter.id"
                  />
                </el-select>
              </el-form-item>

              <el-row :gutter="12">
                <el-col :xs="24" :lg="14">
                  <div class="video-wrap">
                    <iframe
                      v-if="selectedChapter"
                      class="video-frame"
                      :src="selectedChapter.videoUrl"
                      title="课程视频"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    />
                  </div>
                </el-col>
                <el-col :xs="24" :lg="10">
                  <el-card class="example-card" shadow="never">
                    <template #header>
                      <div class="panel-title">知识点卡片与示例</div>
                    </template>
                    <div class="muted">{{ selectedChapter?.content }}</div>
                    <el-divider />
                    <pre class="sample-code">{{ selectedChapter?.sampleCode }}</pre>
                  </el-card>
                </el-col>
              </el-row>
            </el-card>
          </template>
        </el-col>
      </el-row>
    </section>

    <el-row :gutter="12">
      <el-col :xs="24" :lg="12">
        <section class="surface-card section-block">
          <h3 class="section-title">章节练习与学习进度</h3>
          <ul class="exercise-list">
            <li v-for="item in exerciseList" :key="item.title">
              <span>{{ item.title }}</span>
              <el-tag :type="item.done ? 'success' : 'info'" effect="light">{{ item.done ? '已完成' : '待练习' }}</el-tag>
            </li>
          </ul>

          <el-form-item label="当前课程进度">
            <el-slider v-model="pathProgress" :min="0" :max="100" />
          </el-form-item>
          <el-button type="primary" :loading="savingPath" @click="savePath">保存学习进度</el-button>
        </section>
      </el-col>

      <el-col :xs="24" :lg="12">
        <section class="surface-card section-block">
          <h3 class="section-title">学习笔记</h3>
          <el-input
            v-model="noteText"
            type="textarea"
            :rows="4"
            placeholder="记录关键知识点、调试思路或复盘结论"
          />
          <div class="list-actions">
            <el-button type="success" :loading="savingNote" @click="saveNote">保存笔记</el-button>
          </div>

          <el-table :data="notes" max-height="240" :row-class-name="rowClassName" style="margin-top: 10px">
            <el-table-column label="章节" min-width="140">
              <template #default="{ row }">{{ row.chapter?.title || '-' }}</template>
            </el-table-column>
            <el-table-column prop="content" label="内容" min-width="220" />
          </el-table>
        </section>
      </el-col>
    </el-row>

    <section class="surface-card section-block">
      <div class="section-head">
        <h3 class="section-title">讨论区（每节课对应）</h3>
        <span class="muted">当前章节：{{ selectedChapter?.title || '-' }}</span>
      </div>

      <el-input
        v-model="discussionText"
        type="textarea"
        :rows="3"
        placeholder="发表你的问题、答疑或学习心得"
      />
      <div class="list-actions">
        <el-button type="primary" :loading="savingDiscussion" @click="postDiscussion">发布讨论</el-button>
      </div>

      <el-table :data="discussions" max-height="280" :row-class-name="rowClassName" style="margin-top: 10px">
        <el-table-column label="用户" width="140">
          <template #default="{ row }">{{ row.user?.name || '匿名' }}</template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="260" />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </section>

    <InteractionToolkit title="学习页交互效果区" @avatar-change="onAvatarChange" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'
import InteractionToolkit from '../components/InteractionToolkit.vue'

const loading = ref(true)
const savingNote = ref(false)
const savingDiscussion = ref(false)
const savingPath = ref(false)

const courses = ref([])
const selectedCourseId = ref(null)
const selectedChapterId = ref(null)

const pathProgress = ref(0)

const noteText = ref('')
const notes = ref([])

const discussionText = ref('')
const discussions = ref([])

const selectedCourse = computed(() => courses.value.find((item) => item.id === selectedCourseId.value) || null)
const selectedChapter = computed(() =>
  selectedCourse.value?.chapters?.find((item) => item.id === selectedChapterId.value) || null,
)

const exerciseList = computed(() => {
  if (!selectedChapter.value) return []
  return [
    { title: `完成「${selectedChapter.value.title}」课后题 1`, done: false },
    { title: `实现并运行示例代码`, done: true },
    { title: '复盘关键知识点并记录笔记', done: notes.value.length > 0 },
  ]
})

watch(
  () => selectedCourseId.value,
  (courseId) => {
    const course = courses.value.find((item) => item.id === courseId)
    selectedChapterId.value = course?.chapters?.[0]?.id || null
    pathProgress.value = 0
  },
)

watch(
  () => [selectedCourseId.value, selectedChapterId.value],
  async () => {
    if (!selectedCourseId.value) return
    await fetchDiscussions()
    if (getToken()) {
      await fetchNotes()
    }
  },
)

function formatDate(value) {
  return dayjs(value).format('YYYY-MM-DD HH:mm')
}

function rowClassName({ rowIndex }) {
  return rowIndex % 2 === 1 ? 'row-alt-light' : ''
}

async function fetchCourses() {
  loading.value = true
  try {
    const res = await api.get('/learning/courses')
    courses.value = res?.data?.data?.courses || []

    selectedCourseId.value = courses.value[0]?.id || null
    selectedChapterId.value = courses.value[0]?.chapters?.[0]?.id || null
  } finally {
    loading.value = false
  }
}

async function fetchDiscussions() {
  if (!selectedCourseId.value) return

  const res = await api.get('/learning/discussions', {
    params: {
      courseId: selectedCourseId.value,
      chapterId: selectedChapterId.value || undefined,
    },
  })
  discussions.value = res?.data?.data?.discussions || []
}

async function fetchNotes() {
  if (!selectedChapterId.value) return

  const res = await api.get('/learning/notes', {
    params: {
      chapterId: selectedChapterId.value,
    },
  })
  notes.value = res?.data?.data?.notes || []
}

async function saveNote() {
  if (!getToken()) {
    ElNotification({ title: '提示', message: '请先登录后再保存笔记', type: 'warning' })
    return
  }
  if (!selectedChapterId.value || !noteText.value.trim()) {
    ElNotification({ title: '提示', message: '请选择章节并填写笔记内容', type: 'warning' })
    return
  }

  savingNote.value = true
  try {
    await api.post('/learning/notes', {
      chapterId: selectedChapterId.value,
      content: noteText.value,
    })
    noteText.value = ''
    await fetchNotes()
    ElNotification({ title: '成功', message: '笔记已保存', type: 'success' })
  } finally {
    savingNote.value = false
  }
}

async function postDiscussion() {
  if (!getToken()) {
    ElNotification({ title: '提示', message: '请先登录后再发布讨论', type: 'warning' })
    return
  }
  if (!selectedCourseId.value || !discussionText.value.trim()) {
    ElNotification({ title: '提示', message: '请输入讨论内容', type: 'warning' })
    return
  }

  savingDiscussion.value = true
  try {
    await api.post('/learning/discussions', {
      courseId: selectedCourseId.value,
      chapterId: selectedChapterId.value || null,
      content: discussionText.value,
    })
    discussionText.value = ''
    await fetchDiscussions()
    ElNotification({ title: '成功', message: '讨论已发布', type: 'success' })
  } finally {
    savingDiscussion.value = false
  }
}

async function savePath() {
  if (!getToken()) {
    ElNotification({ title: '提示', message: '请先登录后保存进度', type: 'warning' })
    return
  }
  if (!selectedCourseId.value) return

  savingPath.value = true
  try {
    await api.post('/learning/path', {
      courseId: selectedCourseId.value,
      progressPercent: pathProgress.value,
      status: pathProgress.value >= 100 ? 'completed' : pathProgress.value > 0 ? 'learning' : 'not_started',
    })
    ElNotification({ title: '成功', message: '学习进度已更新', type: 'success' })
  } finally {
    savingPath.value = false
  }
}

function onCourseSelect(value) {
  selectedCourseId.value = Number(value)
}

function onAvatarChange() {
  ElNotification({ title: '学习页交互', message: '已触发头像上传交互事件', type: 'info' })
}

onMounted(async () => {
  await fetchCourses()
  await fetchDiscussions()
  if (getToken()) {
    await fetchNotes()
  }
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

.video-wrap {
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.video-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.example-card {
  border: 1px solid var(--line);
  border-radius: 12px;
}

.sample-code {
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: #0d1622;
  color: #c8e8ff;
  white-space: pre-wrap;
  word-break: break-word;
}

.exercise-list {
  margin: 10px 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-list li {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.list-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
