<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { getArticleDetail } from '@/api/article'
import { getCommentList, createComment } from '@/api/comment'

const route = useRoute()
const article = ref<any>(null)
const comments = ref<any[]>([])
const loading = ref(true)
const commentForm = ref({
  name: '',
  content: ''
})
const submitting = ref(false)

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked(article.value.content)
})

const tagsArray = computed(() => {
  if (!article.value?.tags) return []
  return article.value.tags
})

const fetchArticle = async () => {
  try {
    const res: any = await getArticleDetail(route.params.id as string)
    if (res.success) {
      article.value = res.data
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  }
}

const fetchComments = async () => {
  try {
    const res: any = await getCommentList(route.params.id as string, {
      page: 1,
      pageSize: 100
    })
    if (res.success) {
      comments.value = res.data
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmitComment = async () => {
  if (!commentForm.value.name || !commentForm.value.content) {
    return
  }
  
  submitting.value = true
  try {
    const res: any = await createComment({
      article_id: route.params.id as string,
      name: commentForm.value.name,
      content: commentForm.value.content
    })
    if (res.success) {
      commentForm.value.content = ''
      fetchComments()
    }
  } catch (error) {
    console.error('发表评论失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchArticle()
  fetchComments()
})
</script>

<template>
  <div class="article-detail">
    <div class="container">
      <el-skeleton :loading="loading" animated :rows="10">
        <template #default>
          <article v-if="article" class="article">
            <header class="article-header">
              <h1 class="title">{{ article.title }}</h1>
              <div class="meta">
                <span class="date">{{ article.date.split('T')[0]+' '+article.date.split('T')[1].split('.')[0] }}</span>
                <div class="tags" v-if="tagsArray.length > 0">
                  <el-tag 
                    v-for="tag in tagsArray" 
                    :key="tag" 
                    size="small"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </header>
            
            <div class="cover" v-if="article.cover_url">
              <img :src="article.cover_url" :alt="article.title" />
            </div>

            <div class="content markdown-body" v-html="renderedContent"></div>
          </article>
          <el-empty v-else description="文章不存在" />
        </template>
      </el-skeleton>

      <section class="comments-section" v-if="article">
        <h3>评论 ({{ comments.length }})</h3>
        
        <div class="comment-form">
          <el-form :model="commentForm" label-position="top">
            <el-form-item label="昵称" required>
              <el-input v-model="commentForm.name" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="评论内容" required>
              <el-input 
                v-model="commentForm.content" 
                type="textarea" 
                :rows="4"
                resize="none"
                placeholder="请输入评论内容"
              />
            </el-form-item>
            <el-button 
              type="primary" 
              @click="handleSubmitComment"
              :loading="submitting"
            >
              发表评论
            </el-button>
          </el-form>
        </div>

        <div class="comment-list">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <div class="comment-avatar">
              <el-avatar>{{ comment.author_name.charAt(0) }}</el-avatar>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="nickname">{{ comment.author_name }}</span>
                <span class="time">{{ comment.created_at.split('T')[0]+' '+comment.created_at.split('T')[1].split('.')[0] }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
          <el-empty v-if="comments.length === 0" description="暂无评论" :image-size="60" />
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-detail {
  padding: 40px 0;

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .article {
    background: #fff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .article-header {
      margin-bottom: 30px;

      .title {
        font-size: 32px;
        color: #333;
        margin-bottom: 15px;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: 20px;
        color: #999;
        font-size: 14px;

        .tags {
          display: flex;
          gap: 5px;
        }
      }
    }

    .cover {
      margin-bottom: 30px;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        display: block;
      }
    }

    .content {
      line-height: 1.8;
      font-size: 16px;
      color: #333;
    }
  }

  .comments-section {
    margin-top: 40px;
    background: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    h3 {
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .comment-form {
      margin-bottom: 30px;
    }

    .comment-list {
      .comment-item {
        display: flex;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .comment-content {
          flex: 1;

          .comment-header {
            margin-bottom: 8px;

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

          .comment-text {
            color: #666;
            line-height: 1.6;
          }
        }
      }
    }
  }
}
</style>
