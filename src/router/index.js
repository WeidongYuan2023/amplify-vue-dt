import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/index.vue')
  },
  {
    path: '/digital-twin',
    name: 'DigitalTwin',
    component: () => import('../modules/digital-twin/DigitalTwin.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 