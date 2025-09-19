import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CafeteriaDetail from '@/pages/CafeteriaDetail.vue'
import StallDetail from '@/pages/StallDetail.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
