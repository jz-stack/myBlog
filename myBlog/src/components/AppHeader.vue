<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Articles', query: { keyword: searchKeyword.value } })
  }
}
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="logo" @click="router.push('/')">
        <span class="logo-text">My Blog</span>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/articles" class="nav-item">文章</router-link>
        <router-link to="/guestbook" class="nav-item">留言板</router-link>
        <router-link to="/about" class="nav-item">关于</router-link>
        <router-link to="/ai-chat" class="nav-item">AI对话</router-link>
      </nav>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          @keyup.enter="handleSearch"
          clearable
        >
          <template #append>
            <el-button @click="handleSearch" :icon="Search" />
          </template>
        </el-input>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  background: #409eff;
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    cursor: pointer;
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
    }
  }

  .nav-menu {
    display: flex;
    gap: 30px;

    .nav-item {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-size: 16px;
      transition: color 0.3s;

      &:hover,
      &.router-link-active {
        color: #fff;
        font-weight: 500;
      }
    }
  }

  .search-box {
    width: 250px;
  }
}
</style>
