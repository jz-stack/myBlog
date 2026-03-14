<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from '@/types/articleTypes'

const props = defineProps<{
  article: Article
}>()

const tagsArray = computed(() => {
  if (!props.article.tags) return []
  return props.article.tags
})

const date = computed(() => {
    if (!props.article.date) return ''
    return props.article.date.split('T')[0] + ' ' + props.article.date.split('T')[1].split('.')[0]
  }
)
</script>

<template>
  <div class="article-card" @click="$router.push(`/article/${article.id}`)">
    <div class="cover" v-if="article.cover">
      <img :src="article.cover" :alt="article.title" />
    </div>
    <div class="content">
      <h3 class="title">{{ article.title }}</h3>
      <p class="excerpt">{{ article.excerpt }}</p>
      <div class="meta">
        <span class="date" v-if="date">{{ date }}</span>
        <div class="tags" v-if="tagsArray.length > 0">
          <el-tag 
            v-for="tag in tagsArray" 
            :key="tag" 
            size="small" 
            type="info"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .cover {
    width: 100%;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .content {
    padding: 20px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .excerpt {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 15px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .date {
        color: #999;
        font-size: 12px;
      }

      .tags {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
