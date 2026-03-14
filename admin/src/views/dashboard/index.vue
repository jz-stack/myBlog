<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #409EFF;">
              <el-icon><View /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ overview.totalVisits }}</div>
              <div class="stats-label">总访问量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #67C23A;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ overview.uniqueVisitors }}</div>
              <div class="stats-label">独立访客</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #E6A23C;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ overview.totalArticles }}</div>
              <div class="stats-label">文章总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #f56c6c;">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ overview.totalComments }}</div>
              <div class="stats-label">评论总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>访客趋势</span>
              <el-radio-group v-model="chartDays" size="small" @change="loadTrendData">
                <el-radio-button :value="7">近7天</el-radio-button>
                <el-radio-button :value="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <span>热门文章</span>
          </template>
          <div class="popular-list">
            <div v-for="(article, index) in popularArticles" :key="article.id" class="popular-item">
              <span class="rank" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
              <span class="title">{{ article.title }}</span>
              <span class="views">{{ article.views }} 阅读</span>
            </div>
            <el-empty v-if="popularArticles.length === 0" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="comment-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>最新评论</span>
          </template>
          <el-table :data="recentComments" stripe>
            <el-table-column prop="author_name" label="评论者" width="120" />
            <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
            <el-table-column prop="article_title" label="所属文章" width="200" show-overflow-tooltip />
            <el-table-column prop="created_at" label="评论时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getOverview, getVisitTrend, getPopularArticles } from '@/api/stats'
import { getRecentComments } from '@/api/comment'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const overview = ref({
  totalVisits: 0,
  uniqueVisitors: 0,
  todayVisitors: 0,
  totalArticles: 0,
  totalComments: 0,
  totalGuestbook: 0
})

const chartDays = ref(7)
const popularArticles = ref<any[]>([])
const recentComments = ref<any[]>([])

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

const loadTrendData = async () => {
  try {
    const res: any = await getVisitTrend(chartDays.value)
    updateChart(res.data)
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  }
}

const loadPopularArticles = async () => {
  try {
    const res: any = await getPopularArticles(5)
    popularArticles.value = res.data
  } catch (error) {
    console.error('加载热门文章失败:', error)
  }
}

const loadRecentComments = async () => {
  try {
    const res: any = await getRecentComments(5)
    recentComments.value = res.data
  } catch (error) {
    console.error('加载最新评论失败:', error)
  }
}

const updateChart = (data: any) => {
  if (!chartInstance) return

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['访问人数', '新访客']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问人数',
        type: 'line',
        smooth: true,
        data: data.visits,
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      },
      {
        name: '新访客',
        type: 'line',
        smooth: true,
        data: data.uniqueVisitors,
        itemStyle: { color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    loadTrendData()
  }
}

onMounted(() => {
  loadOverview()
  loadPopularArticles()
  loadRecentComments()
  initChart()

  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', () => {
    chartInstance?.resize()
  })
})
</script>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    margin-bottom: 20px;
  }

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;

      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 28px;
      }

      .stats-info {
        margin-left: 15px;

        .stats-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }

        .stats-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 350px;
    }

    .popular-list {
      .popular-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
          border-bottom: none;
        }

        .rank {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background-color: #E4E7ED;
          color: #909399;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          margin-right: 10px;

          &.top-three {
            background-color: #409EFF;
            color: #fff;
          }
        }

        .title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #303133;
        }

        .views {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
