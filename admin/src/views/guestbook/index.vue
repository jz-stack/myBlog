<template>
  <div class="guestbook-list">
    <el-card shadow="hover">
      <template #header>
        <span>留言管理</span>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="guestbookList" v-loading="loading" stripe>
        <el-table-column prop="author_name" label="昵称" width="120" />
        <el-table-column prop="mail" label="邮箱" width="200" />
        <el-table-column prop="content" label="留言内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) as any">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="留言时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link @click="handleApprove(row)" v-if="row.status === 0">通过</el-button>
            <el-button type="warning" link @click="handleReject(row)" v-if="row.status === 0">拒绝</el-button>
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
          @size-change="loadGuestbook"
          @current-change="loadGuestbook"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getGuestbookList, deleteGuestbook, updateGuestbookStatus } from '@/api/guestbook'

const loading = ref(false)
const guestbookList = ref<any[]>([])

const searchForm = reactive({
  status: undefined as number | undefined
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }
  return texts[status] || '未知'
}

const loadGuestbook = async () => {
  loading.value = true
  try {
    const res: any = await getGuestbookList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status
    })
    guestbookList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载留言列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadGuestbook()
}

const handleReset = () => {
  searchForm.status = undefined
  pagination.page = 1
  loadGuestbook()
}

const handleApprove = async (row: any) => {
  try {
    await updateGuestbookStatus(row.id, 1)
    ElMessage.success('已通过')
    loadGuestbook()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleReject = async (row: any) => {
  try {
    await updateGuestbookStatus(row.id, 2)
    ElMessage.success('已拒绝')
    loadGuestbook()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该留言吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteGuestbook(row.id)
    ElMessage.success('删除成功')
    loadGuestbook()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadGuestbook()
})
</script>

<style scoped lang="scss">
.guestbook-list {
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
