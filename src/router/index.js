import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue';
import RegistroView from '../views/RegistroView.vue';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegistroView },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: () => import('../views/ProfileSelectionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Si la ruta pide estar logueado y NO lo estás
  if (to.meta.requiresAuth && !authStore.estaAutenticado) {
    // Te manda al login
    return { path: '/login' }
  }

  // Si ya estás logueado e intentas ir al login, te mando al home
  if (to.path === '/login' && authStore.estaAutenticado) {
    return { path: '/' }
  }

  // En cualquier otro caso, permite la navegación (no hace falta devolver nada)
})

export default router;