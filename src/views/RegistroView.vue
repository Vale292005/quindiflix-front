<template>
  <div class="registro-container">
    <h2>Crear Cuenta en Quindiflix</h2>

    <form @submit.prevent="handleRegistro">
      <div class="form-group">
        <label>Nombre Completo:</label>
        <input v-model="usuario.nombreCompleto" type="text" required placeholder="Ej: Valeria Quindiflix" />
      </div>

      <div class="form-group">
        <label>Correo Electrónico:</label>
        <input v-model="usuario.correoElectronico" type="email" required placeholder="correo@ejemplo.com" />
      </div>

      <div class="form-group">
        <label>Contraseña:</label>
        <input v-model="usuario.password" type="password" required placeholder="Mínimo 8 caracteres" />
      </div>

      <div class="form-group">
        <label>Teléfono:</label>
        <input v-model="usuario.telefono" type="text" required placeholder="Ej: 3101234567" />
      </div>

      <div class="form-group">
        <label>Ciudad de Residencia:</label>
        <input v-model="usuario.ciudadResidencia" type="text" required placeholder="Ej: Armenia" />
      </div>

      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Registrando...' : 'Registrarme' }}
      </button>
    </form>

    <p v-if="mensaje" :class="{ 'error': esError, 'success': !esError }">
      {{ mensaje }}
    </p>

    <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const cargando = ref(false);
const mensaje = ref('');
const esError = ref(false);

// --- ESTO ES LO QUE FALTA ---
const usuario = ref({
  nombreCompleto: '',
  correoElectronico: '',
  password: '',
  telefono: '',
  ciudadResidencia: '',
  fechaNacimiento: '2000-01-01'
});
// -----------------------------

const handleRegistro = async () => {
  cargando.value = true;
  mensaje.value = '';

  try {
    const payload = {
      datosUsuario: {
        nombreCompleto: usuario.value.nombreCompleto,
        correoElectronico: usuario.value.correoElectronico,
        telefono: usuario.value.telefono,
        ciudadResidencia: usuario.value.ciudadResidencia,
        fechaNacimiento: usuario.value.fechaNacimiento
      },
      password: usuario.value.password
    };

    const response = await api.post('http://localhost:8080/api/usuarios/registro', payload);
    
    esError.value = false;
    mensaje.value = "¡Usuario creado con éxito!";
    
    setTimeout(() => router.push('/login'), 2000);

  } catch (error) {
    esError.value = true;
    mensaje.value = error.response?.data?.message || "Error al registrar";
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.registro-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #e50914;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}
</style>