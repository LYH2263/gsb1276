<template>
  <div class="avatar-uploader">
    <el-upload
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      accept="image/*"
      @change="onChange"
    >
      <el-button type="primary" plain>上传头像</el-button>
    </el-upload>
    <el-image
      v-if="preview"
      :src="preview"
      fit="cover"
      class="avatar-preview"
      :preview-src-list="[preview]"
      preview-teleported
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElNotification } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const preview = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    preview.value = value || ''
  },
)

function onChange(file) {
  const raw = file.raw
  if (!raw) return

  const isImage = raw.type.startsWith('image/')
  if (!isImage) {
    ElNotification({ title: '提示', message: '仅支持图片文件', type: 'warning' })
    return
  }

  if (raw.size > 2 * 1024 * 1024) {
    ElNotification({ title: '提示', message: '头像大小请控制在 2MB 内', type: 'warning' })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const value = String(reader.result || '')
    preview.value = value
    emit('update:modelValue', value)
    emit('uploaded', value)
  }
  reader.readAsDataURL(raw)
}
</script>

<style scoped>
.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid var(--line);
}
</style>
