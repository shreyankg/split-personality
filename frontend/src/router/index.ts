import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Home from '@/views/Home.vue';
import Onboarding from '@/views/Onboarding.vue';
import Dashboard from '@/views/Dashboard.vue';
import Chores from '@/views/Chores.vue';
import Settings from '@/views/Settings.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: Onboarding,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresHousehold: true },
    },
    {
      path: '/chores',
      name: 'chores',
      component: Chores,
      meta: { requiresHousehold: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresHousehold: true },
    },
  ],
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresHousehold && !userStore.currentHousehold) {
    return { name: 'onboarding' };
  }
  
  if (to.name === 'home' && userStore.currentHousehold) {
    return { name: 'dashboard' };
  }
});

export default router;