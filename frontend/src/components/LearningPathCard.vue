<template>
  <el-card class="path-card" shadow="hover">
    <div class="cover" :style="{ backgroundImage: `url(${course.coverUrl})` }" />
    <div class="body">
      <div class="title">{{ course.title }}</div>
      <div class="muted">{{ course.summary }}</div>
      <div class="meta">
        <span class="tech-pill" v-for="tag in course.techStack" :key="tag">{{ tag }}</span>
      </div>
      <el-progress :percentage="progressPercent" :stroke-width="10" />
      <el-button type="primary" plain @click="onStart">继续学习</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['start'])

const progressPercent = computed(() => Math.max(0, Math.min(100, Number(props.progress || 0))))

function onStart() {
  emit('start', props.course)
}
</script>

<style scoped>
.path-card {
  border-radius: 16px;
}

.cover {
  height: 124px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  margin-bottom: 10px;
}

.title {
  font-weight: 700;
  margin-bottom: 6px;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
