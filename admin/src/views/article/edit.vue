<template>
  <div class="article-edit">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑文章' : '新增文章' }}</span>
          <div>
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
          </div>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
        </el-form-item>
        
        <el-form-item label="封面">
          <el-input v-model="form.cover_url" placeholder="请输入封面图片URL（可选）" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.excerpt"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要（可选，不填则自动截取内容前200字）"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或创建标签"
            style="width: 100%"
          >
            <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <Toolbar
              :editor="editorRef"
              v-bind="editorConfig"
              mode="default"
            />
            <Editor
              v-model="form.content"
              v-bind="editorConfig"
              mode="default"
              @onCreated="handleEditorCreated"
            />
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { getArticleDetail, createArticle, updateArticle, getAllTags } from '@/api/article'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const editorRef = shallowRef<any>()
const saving = ref(false)
const tags = ref<string[]>([])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  content: '',
  excerpt: '',
  cover_url: '',
  tags: [] as string[],
  publish_date: new Date().toISOString().split('T')[0]
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

const editorConfig = {
  placeholder: '请输入文章内容...',
  MENU_CONF: {
    uploadImage: {
      fieldName: 'file',
      server: '/api/upload',
      maxFileSize: 5 * 1024 * 1024
    }
  }
}

const handleEditorCreated = (editor: any) => {
  editorRef.value = editor
}

const loadTags = async () => {
  try {
    const res: any = await getAllTags()
    tags.value = res.data
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const loadArticle = async () => {
  if (!route.params.id) return
  
  try {
    const res: any = await getArticleDetail(route.params.id as string)
    const article = res.data
    form.title = article.title
    form.content = article.content
    form.excerpt = article.excerpt || ''
    form.cover_url = article.cover_url || ''
    form.tags = article.tags || []
    form.publish_date = article.publish_date || new Date().toISOString().split('T')[0]
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
    router.back()
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const data = {
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          cover_url: form.cover_url,
          tags: form.tags,
          publish_date: form.publish_date
        }
        
        if (isEdit.value) {
          await updateArticle(route.params.id as string, data)
          ElMessage.success('更新成功')
        } else {
          await createArticle(data)
          ElMessage.success('创建成功')
        }
        
        router.push('/article')
      } catch (error) {
        console.error('保存失败:', error)
      } finally {
        saving.value = false
      }
    }
  })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadTags()
  if (isEdit.value) {
    loadArticle()
  }
})

onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
  }
})
</script>

<style scoped lang="scss">
.article-edit {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .editor-container {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;

    :deep(.w-e-text-container) {
      min-height: 400px;
    }
  }
}
</style>
