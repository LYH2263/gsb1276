import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/auth', name: 'auth', component: () => import('../pages/AuthPage.vue') },
  { path: '/home', name: 'home', component: () => import('../pages/HomePage.vue') },
  { path: '/lab', name: 'lab', component: () => import('../pages/LabPage.vue') },
  { path: '/learning', name: 'learning', component: () => import('../pages/LearningPage.vue') },
  { path: '/dashboard', name: 'dashboard', component: () => import('../pages/DashboardPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
