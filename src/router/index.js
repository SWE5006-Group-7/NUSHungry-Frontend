import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CafeteriaDetail from '@/pages/CafeteriaDetail.vue'
import StallDetail from '@/pages/StallDetail.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import ForgotPassword from '@/pages/ForgotPassword.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import CafeteriaManagement from '@/views/admin/CafeteriaManagement.vue'
import StallManagement from '@/views/admin/StallManagement.vue'
import ContentModeration from '@/views/admin/ContentModeration.vue'
import ReviewManagement from '@/views/admin/ReviewManagement.vue'
import ChangePassword from '@/views/admin/ChangePassword.vue'
import TokenDebug from '@/views/admin/TokenDebug.vue'
import authService from '@/services/authService'
import { isAdmin, getCurrentUserRole } from '@/utils/role'

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
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
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
  },
  // 管理员路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { requiresGuest: true }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/cafeterias',
    name: 'CafeteriaManagement',
    component: CafeteriaManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stalls',
    name: 'StallManagement',
    component: StallManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/moderation',
    name: 'ContentModeration',
    component: ContentModeration,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/reviews',
    name: 'ReviewManagement',
    component: ReviewManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/token-debug',
    name: 'TokenDebug',
    component: TokenDebug
    // 不需要任何权限，用于调试
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const userIsAdmin = isAdmin()

  console.log('Router guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    userIsAdmin,
    requiresAuth: to.meta.requiresAuth,
    requiresAdmin: to.meta.requiresAdmin,
    requiresGuest: to.meta.requiresGuest
  })

  // 需要管理员权限的页面
  if (to.meta.requiresAdmin) {
    console.log('Admin check:', {
      requiresAdmin: to.meta.requiresAdmin,
      userIsAdmin: userIsAdmin,
      role: getCurrentUserRole(),
      token: localStorage.getItem('token')?.substring(0, 50) + '...'
    })

    if (!userIsAdmin) {
      console.log('Redirecting - admin required but user is not admin')
      next('/admin/login')
      return
    }
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 保存当前路径,登录后可以重定向回来
    console.log('Redirecting to login - auth required')
    // 如果是管理员页面，重定向到管理员登录
    const loginPath = to.path.startsWith('/admin') ? '/admin/login' : '/login'
    next({
      path: loginPath,
      query: { redirect: to.fullPath }
    })
    return
  }

  // 已登录用户不能访问登录/注册页面
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('Redirecting - already authenticated, isAdmin:', userIsAdmin)
    // 如果是管理员且访问管理员登录页，重定向到管理员首页
    if (to.path === '/admin/login' && userIsAdmin) {
      next('/admin/dashboard')
      return
    } else if (to.path === '/admin/login') {
      // 非管理员访问管理员登录页，不做限制，允许登录
      next()
      return
    } else {
      next('/')
      return
    }
  }

  // 正常放行
  console.log('Navigation allowed')
  next()
})

export default router
