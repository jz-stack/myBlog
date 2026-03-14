<template>
  <div class="stats-page">
    <el-row :gutter="20" class="overview-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>数据概览</span>
          </template>
          <div class="overview-content">
            <div class="overview-item">
              <span class="label">总访问量</span>
              <span class="value">{{ overview.totalVisits }}</span>
            </div>
            <div class="overview-item">
              <span class="label">独立访客</span>
              <span class="value">{{ overview.uniqueVisitors }}</span>
            </div>
            <div class="overview-item">
              <span class="label">今日访客</span>
              <span class="value">{{ overview.todayVisitors }}</span>
            </div>
            <div class="overview-item">
              <span class="label">文章总数</span>
              <span class="value">{{ overview.totalArticles }}</span>
            </div>
            <div class="overview-item">
              <span class="label">评论总数</span>
              <span class="value">{{ overview.totalComments }}</span>
            </div>
            <div class="overview-item">
              <span class="label">留言总数</span>
              <span class="value">{{ overview.totalGuestbook }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="ip-card">
      <template #header>
        <span>IP访问统计</span>
      </template>
      <el-table :data="ipList" v-loading="ipLoading" stripe>
        <el-table-column prop="ip" label="IP地址" width="180" />
        <el-table-column prop="visit_count" label="访问次数" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.visit_count }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="first_visit_time" label="首次访问" width="180">
          <template #default="{ row }">
            {{ formatDate(row.first_visit_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="last_visit_time" label="最后访问" width="180">
          <template #default="{ row }">
            {{ formatDate(row.last_visit_time) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="ipPagination.page"
          v-model:page-size="ipPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="ipPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadIpList"
          @current-change="loadIpList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getOverview, getIpList } from '@/api/stats'

const overview = ref({
  totalVisits: 0,
  uniqueVisitors: 0,
  todayVisitors: 0,
  totalArticles: 0,
  totalComments: 0,
  totalGuestbook: 0
})

const ipList = ref<any[]>([])
const ipLoading = ref(false)

const ipPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadOverview = async () => {
  try {
    const res: any = await getOverview()
    overview.value = res.data
  } catch (error) {
    console.error('加载概览数据失败:', error)
  }
}

const loadIpList = async () => {
  ipLoading.value = true
  try {
    const res: any = await getIpList({
      page: ipPagination.page,
      pageSize: ipPagination.pageSize,
      orderBy: 'visit_count',
      order: 'DESC'
    })
    ipList.value = res.data.list
    ipPagination.total = res.data.total
  } catch (error) {
    console.error('加载IP列表失败:', error)
  } finally {
    ipLoading.value = false
  }
}

onMounted(() => {
  loadOverview()
  loadIpList()
})
</script>

<style scoped lang="scss">
.stats-page {
  .overview-row {
    margin-bottom: 20px;
  }

  .overview-content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    .overview-item {
      flex: 1;
      min-width: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .ip-card {
    margin-top: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
