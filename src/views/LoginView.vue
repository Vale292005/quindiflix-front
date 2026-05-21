<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card bg-dark text-white p-4 shadow-lg" style="width: 100%; max-width: 400px; border-radius: 10px;">
      <div class="card-body">
        <h2 class="text-center mb-4 fw-bold">Iniciar Sesión</h2>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label text-secondary small">Correo Electrónico</label>
            <input v-model="email" type="email" class="form-control bg-secondary text-white border-0"
              placeholder="ejemplo@correo.com" required>
          </div>

          <div class="mb-4">
            <label class="form-label text-secondary small">Contraseña</label>
            <input v-model="password" type="password" class="form-control bg-secondary text-white border-0"
              placeholder="••••••••" required>
          </div>

          <button :disabled="cargando" type="submit" class="btn btn-danger w-100 fw-bold py-2">
            {{ cargando ? 'Cargando...' : 'Entrar' }}
          </button>

          <div v-if="error" class="alert alert-danger mt-3 small p-2 text-center">
            {{ error }}
          </div>
        </form>

        <div class="mt-4 text-center">
          <span class="text-secondary small">¿Nuevo en Quindiflix? </span>
          <router-link to="/register" class="text-white text-decoration-none small fw-bold">Suscríbete
            ahora.</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref(null);
const cargando = ref(false);

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  console.log("-> Iniciando handleLogin");
  cargando.value = true;
  error.value = null;

  try {
    const esEmpleado = email.value.toLowerCase().includes('@quindiflix.com');
    // Llamamos al store
    if (esEmpleado) {
      // Llama al flujo plano de empleado
      await authStore.iniciarSesionEmpleado(email.value, password.value);
    } else {
      // Llama a tu flujo tradicional de clientes
      await authStore.iniciarSesion(email.value, password.value);
    }

    await router.push('/profiles');

  } catch (err) {
    console.error("-> Error capturado en vista:", err);
    // Si el error tiene respuesta del servidor, mostrarla, si no, error genérico
    error.value = err.response?.data?.mensaje || "Credenciales incorrectas o error de servidor";
  } finally {
    cargando.value = false;
    console.log("-> Proceso finalizado");
  }
};
</script>

<style scoped>
/* Estilo para que se parezca más a los inputs de Netflix */
.form-control:focus {
  background-color: #454545 !important;
  box-shadow: none;
  color: white;
}

.bg-secondary {
  background-color: #333333 !important;
}
</style>