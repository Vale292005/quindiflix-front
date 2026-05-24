<template>
  <div class="registro-container">
    <h2>Crear Cuenta en Quindiflix</h2>

    <form @submit.prevent="handleRegistro">
      <div class="form-group">
        <label>Nombre Completo:</label>
        <input v-model="formulario.nombreCompleto" type="text" required placeholder="Ej: Valeria Quindio" />
      </div>

      <div class="form-group">
        <label>Correo Electrónico:</label>
        <input v-model="formulario.correo" type="email" required placeholder="correo@ejemplo.com" />
      </div>

      <div class="form-group">
        <label>Contraseña:</label>
        <input v-model="formulario.password" type="password" required placeholder="Mínimo 8 caracteres" />
      </div>

      <div class="form-group">
        <label>Teléfono:</label>
        <input v-model="formulario.telefono" type="text" required placeholder="Ej: 3101234567" />
      </div>

      <div v-if="!esEmpleado" class="form-group animate-fade">
        <label>Ciudad de Residencia:</label>
        <input v-model="formulario.ciudadResidencia" type="text" :required="!esEmpleado" placeholder="Ej: Armenia" />
      </div>

      <div v-else class="form-group-corporativo animate-fade">
        <div class="alert alert-info py-1 small text-center mb-2">💼 Registro Corporativo Detectado</div>
        
        <div class="form-group">
          <label>Cargo / Puesto:</label>
          <input v-model="formulario.cargo" type="text" :required="esEmpleado" placeholder="Ej: Desarrollador Backend" />
        </div>

        <div class="form-group">
          <label>ID Departamento (Oracle):</label>
          <input v-model.number="formulario.idDepartamento" type="number" :required="esEmpleado" placeholder="Ej: 1" />
        </div>

        <div class="form-group">
          <label>ID Supervisor (Opcional):</label>
          <input v-model.number="formulario.idSupervisor" type="number" placeholder="Ej: 2" />
        </div>
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
import { ref, computed } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const cargando = ref(false);
const mensaje = ref('');
const esError = ref(false);

// Unificamos todas las variables posibles en un solo estado base
const formulario = ref({
  nombreCompleto: '',
  correo: '',
  password: '',
  telefono: '',
  // Campos Cliente
  ciudadResidencia: '',
  fechaNacimiento: '2000-01-01',
  // Campos Empleado
  cargo: '',
  idDepartamento: null,
  idSupervisor: null
});

// 🔎 Propiedad computada reactiva que detecta en tiempo real el tipo de cuenta
const esEmpleado = computed(() => {
  return formulario.value.correo.toLowerCase().trim().includes('@quindioflix.com');
});

const handleRegistro = async () => {
  cargando.value = true;
  mensaje.value = '';

  try {
    let endpoint = '';
    let payload = {};

    if (esEmpleado.value) {
      console.log("-> Procesando registro de Empleado");
      endpoint = 'http://localhost:8080/api/empleados/registrar';
      
      payload = {
        datosEmpleado: {
          nombreCompleto: formulario.value.nombreCompleto,
          correo: formulario.value.correo.trim().toLowerCase(),
          telefono: formulario.value.telefono,
          cargo: formulario.value.cargo,
          idDepartamento: formulario.value.idDepartamento,
          idSupervisor: formulario.value.idSupervisor || null
        },
        password: formulario.value.password
      };
    } else {
      console.log("-> Procesando registro de Cliente");
      endpoint = 'http://localhost:8080/api/usuarios/registro';
      
      payload = {
        datosUsuario: {
          nombreCompleto: formulario.value.nombreCompleto,
          correoElectronico: formulario.value.correo.trim().toLowerCase(), // Ajustado al DTO original de tu cliente
          telefono: formulario.value.telefono,
          ciudadResidencia: formulario.value.ciudadResidencia,
          fechaNacimiento: formulario.value.fechaNacimiento
        },
        password: formulario.value.password
      };
    }

    console.log("🚀 Enviando Payload a:", endpoint, payload);
    
    // Ejecutamos la petición al endpoint determinado dinámicamente
    await api.post(endpoint, payload);
    
    esError.value = false;
    mensaje.value = esEmpleado.value 
      ? "¡Empleado registrado con éxito en Oracle!" 
      : "¡Usuario creado con éxito!";
    
    setTimeout(() => router.push('/login'), 2000);

  } catch (error) {
    esError.value = true;
    mensaje.value = error.response?.data?.mensaje || error.response?.data?.message || "Error al procesar el registro";
    console.error("❌ Error en registro unificado:", error);
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
  background-color: #141414;
  color: white;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: #aaa;
}

input {
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
}

input:focus {
  outline: none;
  border-color: #e50914;
}

.alert-info {
  background-color: #1e293b;
  border: 1px solid #38bdf8;
  color: #38bdf8;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #e50914;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  margin-top: 10px;
}

button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

a {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #aaa;
  text-decoration: none;
}

.error { color: #ff4a4a; margin-top: 10px; text-align: center; font-size: 0.9rem;}
.success { color: #2ed573; margin-top: 10px; text-align: center; font-size: 0.9rem;}
</style>