<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-black px-4">
    <a class="navbar-brand text-danger fw-bold fs-3" href="#">QUINDIFLIX</a>
    
    <div class="navbar-nav ms-auto">
      <router-link to="/login" class="nav-link">Login</router-link>
      <router-link to="/register" class="nav-link">Registro</router-link>
      <button v-if="authStore.estaAutenticado" @click="handleLogout" class="btn btn-outline-light ms-3">
        Salir
      </button>
    </div>
  </nav>

  <main class="container-fluid bg-dark text-light min-vh-100 p-0">
    <router-view />
  </main>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    console.log("Cerrando sesión...");
    await authStore.cerrarSesion();
    router.push('/login');
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    router.push('/login');
  }
};

</script>

<style>
/* Un par de ajustes para el estilo tipo Netflix */
body {
  background-color: #141414; /* El negro clásico de Netflix */
}
.bg-black {
  background-color: #000000;
}
</style>