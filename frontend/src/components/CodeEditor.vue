<template>
  <div ref="containerRef" class="editor-container" />
</template>

<script setup>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

if (!globalThis.MonacoEnvironment) {
  globalThis.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    },
  }
}

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'javascript',
  },
  fontSize: {
    type: Number,
    default: 14,
  },
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
let editor = null

const monacoLangMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
}

onMounted(() => {
  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: monacoLangMap[props.language] || 'javascript',
    automaticLayout: true,
    minimap: { enabled: false },
    smoothScrolling: true,
    tabSize: 2,
    fontSize: props.fontSize,
    roundedSelection: true,
    scrollBeyondLastLine: false,
    glyphMargin: true,
    lineNumbersMinChars: 3,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
  })

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    emit('update:modelValue', value)
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) return
    if (value === editor.getValue()) return
    editor.setValue(value)
  },
)

watch(
  () => props.language,
  (lang) => {
    if (!editor) return
    const model = editor.getModel()
    if (!model) return
    monaco.editor.setModelLanguage(model, monacoLangMap[lang] || 'javascript')
  },
)

watch(
  () => props.fontSize,
  (size) => {
    if (!editor) return
    editor.updateOptions({ fontSize: size })
  },
)

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 520px;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 900px) {
  .editor-container {
    height: 360px;
  }
}
</style>
