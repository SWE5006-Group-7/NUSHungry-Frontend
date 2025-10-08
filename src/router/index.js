import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CafeteriaDetail from '@/pages/CafeteriaDetail.vue'
import StallDetail from '@/pages/StallDetail.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import authService from '@/services/authService'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/canteens/:id',
    name: 'CafeteriaDetail',
    component: CafeteriaDetail
  },
  {
    path: '/stalls/:id',
    name: 'StallDetail',
    component: StallDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  console.log('Router guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 保存当前路径,登录后可以重定向回来
    console.log('Redirecting to login - auth required')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  // 已登录用户不能访问登录/注册页面
  else if (to.meta.requiresGuest && isAuthenticated) {
    console.log('Redirecting to home - already authenticated')
    next('/')
  }
  // 正常放行
  else {
    console.log('Navigation allowed')
    next()
  }
})

export default router
