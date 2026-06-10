<template>
  <div class="page">
    <section class="surface-card section-block">
      <div class="section-head">
        <h3 class="section-title">核心页面 - 代码编辑与执行环境</h3>
        <el-tag type="success" effect="light">实时代码编辑 / 多语言运行 / 版本管理 / 协作编辑</el-tag>
      </div>

      <el-row :gutter="12">
        <el-col :xs="24" :md="8">
          <el-form-item label="挑战题目">
            <el-select v-model="selectedChallengeId" style="width: 100%" placeholder="选择挑战题目">
              <el-option
                v-for="item in challenges"
                :key="item.id"
                :label="`${item.title} (${item.difficulty})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="4">
          <el-form-item label="语言">
            <el-select v-model="language" style="width: 100%">
              <el-option v-for="item in languageOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="4">
          <el-form-item label="字号">
            <el-slider v-model="fontSize" :min="12" :max="20" :step="1" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="8">
          <el-form-item label="协作房间 ID">
            <el-input v-model="roomId" placeholder="如：team-a-room" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="tool-actions">
        <el-switch v-model="collabEnabled" active-text="实时协作" />
        <el-tag :type="socketConnected ? 'success' : 'info'" effect="light">
          {{ socketConnected ? '已连接协作频道' : '未连接协作频道' }}
        </el-tag>
        <el-button type="primary" :loading="running" @click="runCurrentCode">运行代码</el-button>
        <el-button type="success" :loading="saving" @click="openSaveDialog">保存版本</el-button>
      </div>
    </section>

    <el-row :gutter="14">
      <el-col :xs="24" :lg="15">
        <section class="surface-card section-block">
          <CodeEditor v-model="code" :language="language" :font-size="fontSize" />
          <el-form-item label="标准输入" style="margin-top: 10px">
            <el-input v-model="stdinText" type="textarea" :rows="3" placeholder="可选：输入运行参数" />
          </el-form-item>
        </section>
      </el-col>

      <el-col :xs="24" :lg="9">
        <section class="surface-card section-block right-panel">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="运行结果" name="result">
              <el-skeleton v-if="running" :rows="6" animated />
              <div v-else class="console-box">
                <pre>{{ outputText || '点击“运行代码”后查看输出' }}</pre>
              </div>
              <div class="muted">运行耗时：{{ runtimeMs }} ms</div>
            </el-tab-pane>

            <el-tab-pane label="题目说明" name="problem">
              <h4>{{ currentChallenge?.title || '请选择一道挑战题' }}</h4>
              <div class="muted">{{ currentChallenge?.description || '暂无说明' }}</div>
              <el-divider />
              <el-space wrap>
                <el-tag v-if="currentChallenge" type="warning">难度 {{ currentChallenge.difficulty }}</el-tag>
                <el-tag v-if="currentChallenge" type="success">奖励 {{ currentChallenge.reward }}</el-tag>
                <el-tag v-if="currentChallenge">截止 {{ formatDate(currentChallenge?.deadline) }}</el-tag>
              </el-space>
            </el-tab-pane>

            <el-tab-pane label="版本管理" name="versions">
              <el-form-item label="我的代码片段">
                <el-select v-model="selectedSnippetId" style="width: 100%" @change="onSnippetChange">
                  <el-option
                    v-for="item in snippets"
                    :key="item.id"
                    :label="`${item.title} (${item.language})`"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>

              <el-table :data="versions" max-height="260" :row-class-name="rowClassName">
                <el-table-column prop="versionNo" label="版本" width="80" />
                <el-table-column prop="message" label="说明" />
                <el-table-column label="操作" width="110">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="restoreVersion(row)">恢复</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </section>
      </el-col>
    </el-row>

    <InteractionToolkit title="实验室交互效果区" @row-click="onToolkitRowClick" />

    <el-dialog v-model="saveDialogVisible" width="560px" align-center>
      <template #header>
        <h3 class="section-title">保存代码版本</h3>
      </template>
      <el-form :model="saveForm" label-position="top">
        <el-form-item label="片段标题">
          <el-input v-model="saveForm.title" placeholder="例如：数组去重优化版" />
        </el-form-item>
        <el-form-item label="版本说明">
          <el-input v-model="saveForm.message" placeholder="例如：优化排序逻辑" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveSnippet">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { io } from 'socket.io-client'
import CodeEditor from '../components/CodeEditor.vue'
import InteractionToolkit from '../components/InteractionToolkit.vue'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'

const languageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
]

const templates = {
  javascript: "function solve() {\n  console.log('Hello JavaScript')\n}\nsolve()",
  typescript: "type User = { name: string }\nconst user: User = { name: 'Code Orbit' }\nconsole.log(user.name)",
  python: "def solve():\n    print('Hello Python')\n\nsolve()",
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Java");\n  }\n}',
}

const language = ref('javascript')
const code = ref(templates.javascript)
const stdinText = ref('')
const outputText = ref('')
const runtimeMs = ref(0)
const running = ref(false)
const saving = ref(false)
const fontSize = ref(14)

const challenges = ref([])
const selectedChallengeId = ref(null)

const snippets = ref([])
const selectedSnippetId = ref(null)
const versions = ref([])

const activeTab = ref('result')

const saveDialogVisible = ref(false)
const saveForm = reactive({
  title: '未命名代码片段',
  message: '手动保存',
})

const collabEnabled = ref(false)
const roomId = ref('public-lab-room')
const socketConnected = ref(false)
let socket = null
let localCodeTimer = null
let ignoreRemoteUpdate = false

const currentChallenge = computed(() => challenges.value.find((item) => item.id === selectedChallengeId.value) || null)

watch(
  () => selectedChallengeId.value,
  (id) => {
    const challenge = challenges.value.find((item) => item.id === id)
    if (!challenge) return

    const starter = challenge?.starterCode?.[language.value]
    if (starter) {
      code.value = starter
    }
  },
)

watch(
  () => language.value,
  (value) => {
    if (code.value.trim().length > 0) return
    code.value = templates[value]
  },
)

watch(
  () => collabEnabled.value,
  (enabled) => {
    if (enabled) {
      connectSocket()
      return
    }
    disconnectSocket()
  },
)

watch(
  () => code.value,
  (value) => {
    if (!socket || !socketConnected.value || ignoreRemoteUpdate) return
    if (localCodeTimer) clearTimeout(localCodeTimer)

    localCodeTimer = setTimeout(() => {
      socket.emit('code-change', {
        roomId: roomId.value,
        code: value,
      })
    }, 180)
  },
)

watch(
  () => roomId.value,
  (value) => {
    if (!socket || !socketConnected.value) return
    if (!value) return
    socket.emit('join-room', { roomId: value })
  },
)

async function fetchChallenges() {
  const res = await api.get('/lab/challenges')
  challenges.value = res?.data?.data?.challenges || []

  const fromSession = Number(sessionStorage.getItem('label1276_active_challenge_id') || 0)
  if (fromSession && challenges.value.some((item) => item.id === fromSession)) {
    selectedChallengeId.value = fromSession
    sessionStorage.removeItem('label1276_active_challenge_id')
    return
  }

  selectedChallengeId.value = challenges.value[0]?.id || null
}

async function fetchSnippets() {
  if (!getToken()) return
  const res = await api.get('/lab/snippets')
  snippets.value = res?.data?.data?.snippets || []
  if (snippets.value.length > 0 && !selectedSnippetId.value) {
    selectedSnippetId.value = snippets.value[0].id
    await onSnippetChange(selectedSnippetId.value)
  }
}

async function fetchVersions(snippetId) {
  if (!snippetId) {
    versions.value = []
    return
  }
  const res = await api.get(`/lab/snippets/${snippetId}/versions`)
  versions.value = res?.data?.data?.versions || []
}

async function runCurrentCode() {
  running.value = true
  outputText.value = ''
  runtimeMs.value = 0

  try {
    const res = await api.post('/lab/run', {
      language: language.value,
      code: code.value,
      input: stdinText.value,
      challengeId: selectedChallengeId.value || undefined,
    }, { silent: true })

    const data = res?.data?.data || {}
    outputText.value = `${data.stdout || ''}${data.stderr ? `\n${data.stderr}` : ''}`.trim()
    runtimeMs.value = data.runtimeMs || 0
    activeTab.value = 'result'
  } catch (err) {
    const message = err?.response?.data?.error?.message || err?.message || '请求失败'
    outputText.value = message
    activeTab.value = 'result'
  } finally {
    running.value = false
  }
}

function openSaveDialog() {
  if (!getToken()) {
    ElNotification({ title: '提示', message: '请先登录后再保存代码版本', type: 'warning' })
    return
  }

  if (!saveForm.title) saveForm.title = currentChallenge.value?.title || '未命名代码片段'
  saveDialogVisible.value = true
}

async function saveSnippet() {
  if (!code.value.trim()) {
    ElNotification({ title: '提示', message: '代码为空，无法保存', type: 'warning' })
    return
  }

  saving.value = true
  try {
    const res = await api.post('/lab/snippets', {
      snippetId: selectedSnippetId.value || undefined,
      challengeId: selectedChallengeId.value,
      title: saveForm.title,
      language: language.value,
      content: code.value,
      message: saveForm.message,
      lastRunOutput: outputText.value,
    })

    const snippet = res?.data?.data?.snippet
    if (snippet) {
      selectedSnippetId.value = snippet.id
    }

    saveDialogVisible.value = false
    await fetchSnippets()
    await fetchVersions(selectedSnippetId.value)
    ElNotification({ title: '保存成功', message: '代码版本已更新', type: 'success' })
  } finally {
    saving.value = false
  }
}

async function onSnippetChange(snippetId) {
  const snippet = snippets.value.find((item) => item.id === snippetId)
  if (snippet) {
    language.value = snippet.language
    code.value = snippet.content
    selectedChallengeId.value = snippet.challengeId || selectedChallengeId.value
  }
  await fetchVersions(snippetId)
}

async function restoreVersion(version) {
  if (!selectedSnippetId.value) return

  await ElMessageBox.confirm(`确定恢复到版本 ${version.versionNo}？`, '恢复版本', {
    confirmButtonText: '恢复',
    cancelButtonText: '取消',
    type: 'warning',
  })

  await api.post(`/lab/snippets/${selectedSnippetId.value}/restore`, {
    versionId: version.id,
  })

  const res = await api.get('/lab/snippets')
  snippets.value = res?.data?.data?.snippets || []
  const snippet = snippets.value.find((item) => item.id === selectedSnippetId.value)
  if (snippet) {
    code.value = snippet.content
  }
  ElNotification({ title: '恢复成功', message: '已切换到历史版本', type: 'success' })
}

function formatDate(value) {
  return dayjs(value).format('YYYY-MM-DD HH:mm')
}

function rowClassName({ rowIndex }) {
  return rowIndex % 2 === 1 ? 'row-alt-light' : ''
}

function connectSocket() {
  if (socketConnected.value) return

  socket = io('/', {
    path: '/socket.io',
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    socketConnected.value = true
    socket.emit('join-room', { roomId: roomId.value })
  })

  socket.on('disconnect', () => {
    socketConnected.value = false
  })

  socket.on('sync-code', (payload) => {
    if (!payload?.code) return
    ignoreRemoteUpdate = true
    code.value = payload.code
    setTimeout(() => {
      ignoreRemoteUpdate = false
    }, 0)
  })

  socket.on('remote-code-change', (payload) => {
    if (typeof payload?.code !== 'string') return
    ignoreRemoteUpdate = true
    code.value = payload.code
    setTimeout(() => {
      ignoreRemoteUpdate = false
    }, 0)
  })
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  socketConnected.value = false
}

function onToolkitRowClick(row) {
  ElNotification({ title: '实验室交互', message: `已打开 ${row.name}`, type: 'info' })
}

onMounted(async () => {
  await fetchChallenges()
  await fetchSnippets()
})

onBeforeUnmount(() => {
  if (localCodeTimer) clearTimeout(localCodeTimer)
  disconnectSocket()
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
  margin-bottom: 8px;
}

.tool-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.right-panel {
  min-height: 100%;
}

.console-box {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #07121d;
  color: #d8f2ff;
  padding: 10px;
  min-height: 220px;
}

.console-box pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
</style>
