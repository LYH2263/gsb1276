<template>
  <div class="app-shell">
    <TopNav />
    <main class="app-main">
      <AppErrorBoundary>
        <router-view />
      </AppErrorBoundary>
      <el-backtop :right="24" :bottom="24" />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import TopNav from './components/TopNav.vue'
import AppFooter from './components/AppFooter.vue'
import AppErrorBoundary from './components/AppErrorBoundary.vue'
</script>
