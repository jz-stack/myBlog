<template>
  <div class="comment-list">
    <el-card shadow="hover">
      <template #header>
        <span>评论管理</span>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="文章">
          <el-input v-model="searchForm.articleId" placeholder="文章ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="commentList" v-loading="loading" stripe>
        <el-table-column prop="author_name" label="评论者" width="120" />
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop="article_title" label="所属文章" width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="评论时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadComments"
          @current-change="loadComments"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommentList, deleteComment } from '@/api/comment'

const loading = ref(false)
const commentList = ref<any[]>([])

const searchForm = reactive({
  articleId: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadComments = async () => {
  loading.value = true
  try {
    const res: any = await getCommentList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      articleId: searchForm.articleId || undefined
    })
    commentList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadComments()
}

const handleReset = () => {
  searchForm.articleId = ''
  pagination.page = 1
  loadComments()
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(row.id)
    ElMessage.success('删除成功')
    loadComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped lang="scss">
.comment-list {
  .search-form {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
