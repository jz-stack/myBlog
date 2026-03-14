<template>
  <div class="article-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增文章
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索标题或内容" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部标签" clearable>
            <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="articleList" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publish_date" label="发布日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.publish_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadArticles"
          @current-change="loadArticles"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleList, deleteArticle, getAllTags, type Article } from '@/api/article'

const router = useRouter()

const loading = ref(false)
const articleList = ref<Article[]>([])
const tags = ref<string[]>([])

const searchForm = reactive({
  keyword: '',
  tag: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date: string) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loadArticles = async () => {
  loading.value = true
  try {
    const res: any = await getArticleList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      tag: searchForm.tag || undefined
    })
    articleList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  try {
    const res: any = await getAllTags()
    tags.value = res.data
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadArticles()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.tag = ''
  pagination.page = 1
  loadArticles()
}

const handleAdd = () => {
  router.push('/article/add')
}

const handleEdit = (row: Article) => {
  router.push(`/article/edit/${row.id}`)
}

const handleDelete = async (row: Article) => {
  try {
    await ElMessageBox.confirm('确定要删除该文章吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteArticle(row.id)
    ElMessage.success('删除成功')
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadArticles()
  loadTags()
})
</script>

<style scoped lang="scss">
.article-list {
  .card-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .search-form {
    margin-bottom: 20px;
  }

  .tag-item {
    margin-right: 5px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
