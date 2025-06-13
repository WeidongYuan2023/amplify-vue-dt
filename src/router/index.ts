import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MuseumView from '../components/index.vue';

// Routes configuration
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Museum',
    component: MuseumView
  },
  {
    path: '/digital-twin',
    name: 'DigitalTwin',
    component: () => import('../modules/digital-twin/DigitalTwin.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 