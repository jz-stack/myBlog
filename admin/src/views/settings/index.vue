<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <template #header>
            <span>个人信息</span>
          </template>
          <el-form :model="profileForm" label-width="100px" class="settings-form">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="头像">
              <el-input v-model="profileForm.avatar" placeholder="请输入头像URL" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile" :loading="profileLoading">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <template #header>
            <span>修改密码</span>
          </template>
          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" class="settings-form">
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getProfile, updateProfile, changePassword } from '@/api/auth'

const profileLoading = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref<FormInstance>()

const profileForm = reactive({
  username: '',
  nickname: '',
  avatar: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const loadProfile = async () => {
  try {
    const res: any = await getProfile()
    profileForm.username = res.data.username
    profileForm.nickname = res.data.nickname || ''
    profileForm.avatar = res.data.avatar || ''
  } catch (error) {
    console.error('加载个人信息失败:', error)
  }
}

const handleUpdateProfile = async () => {
  profileLoading.value = true
  try {
    await updateProfile({ 
      nickname: profileForm.nickname,
      avatar: profileForm.avatar 
    })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    profileLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        console.error('修改密码失败:', error)
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped lang="scss">
.settings-page {
  .settings-form {
    max-width: 500px;
    margin-top: 20px;
  }
}
</style>
