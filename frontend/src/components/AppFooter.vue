<template>
  <footer class="footer">
    <div class="footer-inner">
      <div>Code Orbit · Programming Learning Hub</div>
      <div class="muted">多语言实验室 · 结构化课程 · 学习仪表板</div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  margin-top: 12px;
}

.footer-inner {
  width: min(1260px, 100%);
  margin: 0 auto;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
}
</style>
