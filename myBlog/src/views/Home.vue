<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFeaturedArticles } from '@/api/article'
import ArticleCard from '@/components/ArticleCard.vue'
import { getWallpaper, getStats } from '@/api/home'
import type { Wallpaper, Stats } from '@/types/homeTypes'
import type { Article } from '@/types/articleTypes'
import { ElMessage } from 'element-plus'

const articles = ref<Article[]>([])
const wallpaper = ref<Wallpaper>()
const stats = ref<Stats>()
const loading = ref(false)

onMounted(async () => {
  try {
    const [featuredArticlesRes, wallpaperRes, statsRes] = await Promise.all([
      getFeaturedArticles(),
      getWallpaper(),
      getStats()
    ])
    articles.value = featuredArticlesRes.data
    wallpaper.value = wallpaperRes.data
    stats.value = statsRes.data
  } catch (error) {
    ElMessage.error('获取数据失败:' + error)
  }
})
</script>

<template>
  <div class="home">
    <section class="hero" :style="wallpaper?.url ? `background-image: url(${wallpaper.url}); background-size: cover; background-position: center;` : 'background-color: #409eff'">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到我的博客</h1>
        <p class="hero-subtitle">记录生活，分享技术</p>
        <el-button type="primary" size="large" @click="$router.push('/articles')">
          浏览文章
        </el-button>
      </div>
    </section>

    <section class="data">
      <div class="data-container">
        <div class="data-item">
          <div class="data-value">{{ stats?.article_count }}</div>
          <div class="data-label">文章数</div>
        </div>
        <div class="data-item">
          <div class="data-value">{{ stats?.guestbook_count }}</div>
          <div class="data-label">留言数</div>
        </div>
        <div class="data-item">
          <div class="data-value">{{ stats?.visitor_count }}</div>
          <div class="data-label">访问量</div>
        </div>
      </div>
    </section>

    <section class="latest-articles">
      <div class="container">
        <h2 class="section-title">最新文章</h2>
        <el-skeleton :loading="loading" animated :rows="5" :count="3">
          <template #default>
            <div class="article-grid" v-if="articles.length > 0">
              <ArticleCard
                v-for="article in articles" 
                :key="article.id" 
                :article="article"
              />
            </div>
            <el-empty v-else description="暂无文章" />
          </template>
        </el-skeleton>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  .hero {
    height: 90dvh;
    text-align: center;
    color: #fff;
    display: flex;
    align-items: center;

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .hero-subtitle {
      font-size: 20px;
      margin-bottom: 30px;
      opacity: 0.9;
    }
  }
  
  .data {
    background-color: #409eff;
      &-container {
      display: flex;
      justify-content: space-evenly;
      gap: 40px;
      padding: 40px 60px;
      .data-item {
        text-align: center;
        color: #fff;
        .data-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }
      }
    }
  }

  .latest-articles {
    padding: 60px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .section-title {
      font-size: 36px;
      text-align: center;
      margin-bottom: 40px;
      color: #333;
    }

    .article-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;

      @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 576px) {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
