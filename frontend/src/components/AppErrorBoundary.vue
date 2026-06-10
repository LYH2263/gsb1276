<template>
  <section>
    <el-result
      v-if="errorInfo"
      icon="error"
      title="页面渲染异常"
      :sub-title="errorInfo"
    >
      <template #extra>
        <el-button type="primary" @click="reset">重新渲染</el-button>
      </template>
    </el-result>
    <slot v-else />
  </section>
</template>

<script setup>
import { onErrorCaptured, ref } from 'vue'

const errorInfo = ref('')

onErrorCaptured((error) => {
  errorInfo.value = error?.message || '未知异常'
  return false
})

function reset() {
  errorInfo.value = ''
}
</script>
