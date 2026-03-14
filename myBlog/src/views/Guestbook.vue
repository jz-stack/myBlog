<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getGuestbookList, createGuestbook } from '@/api/guestbook'
import type { GuestbookMessage, GuestbookForm } from '@/types/guestbookTypes'

const messages = ref<GuestbookMessage[]>([])
const loading = ref(false)
const submitting = ref(false)
const page = ref(1)
const pageSize = ref(10)
const messageForm = ref<GuestbookForm>({
  author_name: '',
  mail: '',
  content: ''
})

const fetchMessages = async () => {
  loading.value = true
  try {
    const res: any = await getGuestbookList({ page: page.value, pageSize: pageSize.value })
    if (res.success) {
      messages.value = res.data.list
    }
  } catch (error) {
    console.error('获取留言列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!messageForm.value.author_name || !messageForm.value.content) {
    return
  }
  
  submitting.value = true
  try {
    const res: any = await createGuestbook({
      author_name: messageForm.value.author_name,
      mail: messageForm.value.mail || undefined,
      content: messageForm.value.content
    })
    if (res.success) {
      messageForm.value.content = ''
      fetchMessages()
    }
  } catch (error) {
    console.error('发表留言失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="guestbook-page">
    <div class="container">
      <h1 class="page-title">留言板</h1>
      
      <div class="message-form">
        <el-card>
          <template #header>
            <span>发表留言</span>
          </template>
          <el-form :model="messageForm" label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="昵称" required>
                  <el-input v-model="messageForm.author_name" placeholder="请输入昵称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="messageForm.mail" placeholder="请输入邮箱（选填）" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="留言内容" required>
              <el-input 
                v-model="messageForm.content" 
                type="textarea"
                :rows="4"
                resize='none'
                placeholder="请输入留言内容"
              />
            </el-form-item>
            <el-button 
              type="primary" 
              @click="handleSubmit"
              :loading="submitting"
            >
              发表留言
            </el-button>
          </el-form>
        </el-card>
      </div>

      <div class="message-list">
        <el-skeleton :loading="loading" animated :rows="5" :count="3">
          <template #default>
            <div class="message-item" v-for="msg in messages" :key="msg.id">
              <div class="avatar">
                <el-avatar>{{ msg.author_name.charAt(0) }}</el-avatar>
              </div>
              <div class="content">
                <div class="header">
                  <span class="nickname">{{ msg.author_name }}</span>
                  <span class="time">{{ msg.created_at.split('T')[0]+' '+msg.created_at.split('T')[1].split('.')[0] }}</span>
                </div>
                <p class="text">{{ msg.content }}</p>
              </div>
            </div>
            <el-empty v-if="messages.length === 0" description="暂无留言" />
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
 </template>

<style lang="scss" scoped>
.guestbook-page {
  padding: 40px 0;
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: 32px;
    text-align: center;
    margin-bottom: 40px;
    color: #333;
  }

  .message-form {
    margin-bottom: 40px;
  }

  .message-list {
    .message-item {
      display: flex;
      gap: 15px;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .content {
        flex: 1;

        .header {
          margin-bottom: 10px;

          .nickname {
            font-weight: 500;
            color: #333;
            margin-right: 10px;
          }

          .time {
            color: #999;
            font-size: 12px;
          }
        }

        .text {
          color: #666;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
