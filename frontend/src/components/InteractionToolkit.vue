<template>
  <el-card class="surface-card toolkit" shadow="never">
    <template #header>
      <div class="toolkit-header">
        <div>
          <h3 class="section-title">{{ title }}</h3>
          <div class="muted">互动组件集合：列表/搜索/弹窗/时间轴/图片预览/头像上传</div>
        </div>
        <div class="header-actions">
          <el-tag type="warning" effect="light">倒计时 {{ countdownText }}</el-tag>
          <el-button @click="shuffleImage">随机切换图片</el-button>
        </div>
      </div>
    </template>

    <el-row :gutter="14" class="mb14">
      <el-col :xs="24" :md="11">
        <div class="mix-card">
          <el-image
            :src="activeImage"
            fit="cover"
            :preview-src-list="imagePool"
            preview-teleported
            class="mix-image"
          />
          <div class="mix-text">
            <div class="mix-title">图文混排效果</div>
            <div class="muted">点击“随机切换图片”可触发不同封面，支持放大预览。</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :md="13">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="技术方向">
              <el-select v-model="primaryCategory" style="width: 100%">
                <el-option v-for="item in categoryOptions" :key="item.label" :label="item.label" :value="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="子分类联动">
              <el-select v-model="secondaryCategory" style="width: 100%">
                <el-option v-for="item in secondaryOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-input v-model="keyword" clearable placeholder="列表搜索效果：输入关键词过滤" />
      </el-col>
    </el-row>

    <el-table :data="visibleRows" :row-class-name="rowClassName" @row-click="openDetail">
      <el-table-column label="名称" prop="name" width="180" />
      <el-table-column label="标签">
        <template #default="{ row }">
          <el-space wrap>
            <el-tag v-for="tag in row.tags" :key="tag" round effect="light">{{ tag }}</el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column label="说明" prop="desc" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" link @click.stop="openDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="toolkit-actions">
      <el-button v-if="canShowMore" @click="showMore">显示更多</el-button>
      <el-button v-else plain @click="collapseRows">收起列表</el-button>
      <el-button type="success" plain @click="expandVisible = !expandVisible">
        {{ expandVisible ? '收起扩展区' : '展开扩展区' }}
      </el-button>
    </div>

    <el-collapse-transition>
      <section v-if="expandVisible" class="expand-area">
        <el-row :gutter="12">
          <el-col :xs="24" :md="12">
            <el-timeline>
              <el-timeline-item v-for="node in timelineNodes" :key="node.title" :timestamp="node.time">
                {{ node.title }}
              </el-timeline-item>
            </el-timeline>
          </el-col>
          <el-col :xs="24" :md="12">
            <AvatarUploader v-model="avatarValue" @uploaded="onAvatarUploaded" />
            <div class="muted" style="margin-top: 8px">上传头像效果：可在父组件接收并持久化。</div>
          </el-col>
        </el-row>
      </section>
    </el-collapse-transition>

    <el-dialog v-model="dialogVisible" width="680px" align-center>
      <template #header>
        <div class="section-title">{{ activeRow?.name }}</div>
      </template>
      <div class="muted">{{ activeRow?.desc }}</div>
      <el-divider />
      <el-space wrap>
        <el-tag v-for="tag in activeRow?.tags || []" :key="tag">{{ tag }}</el-tag>
      </el-space>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AvatarUploader from './AvatarUploader.vue'

const props = defineProps({
  title: {
    type: String,
    default: '交互效果演示区',
  },
  rows: {
    type: Array,
    default: () => [
      {
        name: '语法训练营',
        tags: ['JavaScript', '基础'],
        desc: '通过短练习巩固语法和代码风格。',
      },
      {
        name: '类型挑战日',
        tags: ['TypeScript', '泛型'],
        desc: '围绕类型推导和泛型约束完成挑战。',
      },
      {
        name: '算法冲刺班',
        tags: ['算法', '刷题'],
        desc: '每周限时挑战，支持排行和复盘。',
      },
      {
        name: '后端接口实战',
        tags: ['Node.js', 'API'],
        desc: '学习接口设计与异常处理。',
      },
      {
        name: '性能优化工坊',
        tags: ['Performance', '前端'],
        desc: '定位瓶颈并优化加载与渲染性能。',
      },
    ],
  },
})

const emit = defineEmits(['avatar-change', 'row-click'])

const imagePool = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
]

const activeImage = ref(imagePool[0])
const keyword = ref('')
const showCount = ref(3)
const expandVisible = ref(false)
const dialogVisible = ref(false)
const activeRow = ref(null)
const avatarValue = ref('')

const categoryOptions = [
  { label: '前端', children: ['Vue', 'React', '性能优化'] },
  { label: '后端', children: ['Node.js', 'Java', 'Python'] },
  { label: '算法', children: ['数组', '动态规划', '图论'] },
]

const primaryCategory = ref(categoryOptions[0].label)
const secondaryCategory = ref(categoryOptions[0].children[0])

const targetTime = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000)
const countdownText = ref('')
let timer = null

watch(primaryCategory, (value) => {
  const item = categoryOptions.find((entry) => entry.label === value)
  secondaryCategory.value = item?.children?.[0] || ''
})

const secondaryOptions = computed(() => {
  const item = categoryOptions.find((entry) => entry.label === primaryCategory.value)
  return item?.children || []
})

const filteredRows = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  if (!key) return props.rows
  return props.rows.filter((item) => {
    const source = `${item.name}${item.desc}${(item.tags || []).join('')}`.toLowerCase()
    return source.includes(key)
  })
})

const visibleRows = computed(() => filteredRows.value.slice(0, showCount.value))
const canShowMore = computed(() => showCount.value < filteredRows.value.length)

const timelineNodes = computed(() => [
  { time: '阶段 1', title: `${primaryCategory.value}方向学习路径已生成` },
  { time: '阶段 2', title: `${secondaryCategory.value}章节练习已解锁` },
  { time: '阶段 3', title: '完成挑战后自动刷新学习报告' },
])

function updateCountdown() {
  const delta = targetTime.getTime() - Date.now()
  if (delta <= 0) {
    countdownText.value = '00天 00:00:00'
    return
  }
  const day = Math.floor(delta / 86400000)
  const hour = Math.floor((delta % 86400000) / 3600000)
  const minute = Math.floor((delta % 3600000) / 60000)
  const second = Math.floor((delta % 60000) / 1000)
  countdownText.value = `${String(day).padStart(2, '0')}天 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

function shuffleImage() {
  const next = imagePool[Math.floor(Math.random() * imagePool.length)]
  activeImage.value = next
}

function showMore() {
  showCount.value += 2
}

function collapseRows() {
  showCount.value = 3
}

function rowClassName({ rowIndex }) {
  return rowIndex % 2 === 1 ? 'row-alt-light' : ''
}

function openDetail(row) {
  activeRow.value = row
  dialogVisible.value = true
  emit('row-click', row)
}

function onAvatarUploaded(value) {
  emit('avatar-change', value)
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.toolkit {
  border-radius: 18px;
}

.toolkit-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mb14 {
  margin-bottom: 14px;
}

.mix-card {
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  background: var(--surface-strong);
}

.mix-image {
  width: 100%;
  height: 170px;
  display: block;
}

.mix-text {
  padding: 10px;
}

.mix-title {
  font-weight: 700;
  margin-bottom: 4px;
}

.toolkit-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.expand-area {
  margin-top: 12px;
  border: 1px dashed var(--line);
  border-radius: 14px;
  padding: 12px;
}
</style>
