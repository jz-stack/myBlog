import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '主页', icon: 'House' }
      },
      {
        path: 'article',
        name: 'Article',
        component: () => import('@/views/article/list.vue'),
        meta: { title: '文章管理', icon: 'Document' }
      },
      {
        path: 'article/add',
        name: 'ArticleAdd',
        component: () => import('@/views/article/edit.vue'),
        meta: { title: '新增文章', hidden: true }
      },
      {
        path: 'article/edit/:id',
        name: 'ArticleEdit',
        component: () => import('@/views/article/edit.vue'),
        meta: { title: '编辑文章', hidden: true }
      },
      {
        path: 'comment',
        name: 'Comment',
        component: () => import('@/views/comment/index.vue'),
        meta: { title: '评论管理', icon: 'ChatDotSquare' }
      },
      {
        path: 'guestbook',
        name: 'Guestbook',
        component: () => import('@/views/guestbook/index.vue'),
        meta: { title: '留言管理', icon: 'Message' }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('@/views/stats/index.vue'),
        meta: { title: '统计分析', icon: 'DataLine' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - 博客管理系统`
  }

  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')

  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
