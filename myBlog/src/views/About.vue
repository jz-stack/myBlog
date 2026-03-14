<script setup lang="ts">
</script>

<template>
  <div class="about-page">
    <div class="container">
      <h1 class="page-title">关于我</h1>
      
      <el-card class="about-card">
        <div class="about-content">
          <div class="avatar-section">
            <el-avatar :size="120">User</el-avatar>
          </div>
          
          <div class="info-section">
            <h2>博主信息</h2>
            <p>欢迎来到我的博客！</p>
            <p>这里是我的个人博客，记录生活点滴和技术分享。</p>
            
            <el-divider />
            
            <h3>技术栈</h3>
            <div class="tech-tags">
              <el-tag>Vue 3</el-tag>
              <el-tag>TypeScript</el-tag>
              <el-tag>Node.js</el-tag>
              <el-tag>Express</el-tag>
              <el-tag>MySQL</el-tag>
              <el-tag>Element Plus</el-tag>
            </div>
            
            <el-divider />
            
            <h3>联系方式</h3>
            <div class="contact-info">
              <p><strong>邮箱：</strong>chen_jd25@email.com</p>
              <p><strong>GitHub：</strong>github.com/jz-stack</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
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

  .about-card {
    .about-content {
      text-align: center;

      .avatar-section {
        margin-bottom: 30px;
      }

      .info-section {
        text-align: left;

        h2 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #333;
        }

        h3 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
        }

        p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 10px;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .contact-info {
          p {
            margin-bottom: 8px;
          }
        }
      }
    }
  }
}
</style>
