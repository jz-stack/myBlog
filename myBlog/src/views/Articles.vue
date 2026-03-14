<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleList } from '@/api/article'
import ArticleCard from '@/components/ArticleCard.vue'
import type { Article } from '@/types/articleTypes'

const route = useRoute()
const articles = ref<Article[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)
const keyword = ref('')

const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await getArticleList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    if (res.success) {
      articles.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles()
}

watch(() => route.query.keyword, (newKeyword) => {
  keyword.value = (newKeyword as string) || ''
  currentPage.value = 1
  fetchArticles()
}, { immediate: true })

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="articles-page">
    <div class="container">
      <h1 class="page-title">文章列表</h1>
      
      <el-skeleton :loading="loading" animated :rows="5" :count="6">
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

      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.articles-page {
  padding: 40px 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: 32px;
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

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
}
</style>
