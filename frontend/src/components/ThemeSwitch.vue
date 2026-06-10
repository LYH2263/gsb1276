<template>
  <el-switch
    :model-value="isDark"
    inline-prompt
    :active-icon="Moon"
    :inactive-icon="Sunny"
    @update:model-value="onToggle"
  />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { getTheme, setTheme } from '../lib/auth'

const emit = defineEmits(['change'])
const isDark = ref(getTheme() === 'dark')

function syncTheme(event) {
  const theme = event?.detail?.theme || getTheme()
  isDark.value = theme === 'dark'
}

function onToggle(value) {
  const theme = value ? 'dark' : 'light'
  isDark.value = value
  setTheme(theme)
  emit('change', theme)
}

onMounted(() => {
  window.addEventListener('orbit:theme', syncTheme)
})

onBeforeUnmount(() => {
  window.removeEventListener('orbit:theme', syncTheme)
})
</script>
