import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MuseumView from '../components/index.vue';
import HomeView from '../components/home.vue';

// Routes configuration
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/museum',
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