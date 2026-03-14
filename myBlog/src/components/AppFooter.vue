<script setup lang="ts">
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <p class="copyright">
        {{ new Date().getFullYear() }} My Blog.
      </p>
      <p class="tech-stack">
        Powered by Vue 3 + TypeScript + Element Plus
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  background: #f5f5f5;
  padding: 20px 0;
  border-top: 1px solid #e8e8e8;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }

  .copyright {
    color: #666;
    margin-bottom: 5px;
  }

  .tech-stack {
    color: #999;
    font-size: 12px;
  }
}
</style>
