<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useCuentaStore } from '../stores/cuentaStore';

const authStore = useAuthStore();
const cuentaStore = useCuentaStore();
const router = useRouter();

const errorMessage = ref('');
const mostrarFormulario = ref(false); // Controla si se ve la lista o el formulario
const tipoSeleccionado = ref('Adulto');
const nuevoNombre = ref('');          // Almacena el nombre del nuevo perfil
const loading = ref(true);            // Estado de carga

// 3. FUNCIONES
const seleccionarPerfil = (perfil) => {
  localStorage.setItem('perfil_activo', JSON.stringify(perfil));
  localStorage.setItem('tipo_perfil',perfil.tipoPerfil);
  router.push('/dashboard');
};

const guardarNuevoPerfil = async () => {
  if (!nuevoNombre.value.trim()) return;

  try {
    // 1. Sacamos el ID del store de cuenta que ya creamos
    const idCuentaFinal = cuentaStore.idCuentaActiva;

    if (!idCuentaFinal) {
      alert("No se encontró ID de cuenta. ¿Cargaste la cuenta en onMounted?");
      return;
    }

    // 2. Armamos el objeto limpio
    const payload = {
      nombre: nuevoNombre.value,
      avatar: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
      idCuenta: idCuentaFinal, // Un número real
      tipoPerfil: tipoSeleccionado.value
    };

    // 3. Llamamos al store de auth (que a su vez usará el service corregido)
    await authStore.crearPerfil(payload);

    // 4. Limpiamos
    nuevoNombre.value = '';
    tipoSeleccionado.value = 'Adulto';
    mostrarFormulario.value = false;
    alert("¡Perfil creado con éxito!");

  } catch (error) {
    console.error("Fallo total:", error);
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "Ocurrió un error inesperado al crear el perfil.";
    }
  }
};

onMounted(async () => { // <--- Agrega 'async' aquí
  try {
    console.log("Iniciando carga de perfiles y cuenta...");

    await authStore.cargarPerfiles();
    console.log("Perfiles cargados con éxito");

    await cuentaStore.cargarCuentaUsuario();
    console.log("Cuenta cargada:", cuentaStore.idCuentaActiva);

  } catch (error) {
    console.error("Error en la carga inicial:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="profile-container bg-dark min-vh-100 d-flex flex-column align-items-center justify-content-center">

    <h1 class="text-white mb-5 fw-normal">
      {{ mostrarFormulario ? 'Añadir perfil' : '¿Quién está viendo?' }}
    </h1>

    <div v-if="!mostrarFormulario" class="d-flex flex-wrap justify-content-center gap-4">
      <div v-for="perfil in authStore.perfiles" :key="perfil.idPerfil" class="profile-item text-center"
        @click="seleccionarPerfil(perfil)">
        <div class="avatar-wrapper mb-2">
          <img :src="perfil.avatar || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'"
            class="img-fluid rounded shadow">
        </div>
        <span class="text-secondary fs-5">{{ perfil.nombre }}</span>
      </div>

      <div class="profile-item text-center" @click="mostrarFormulario = true">
        <div
          class="avatar-wrapper mb-2 add-profile d-flex align-items-center justify-content-center border border-secondary">
          <span class="text-secondary display-1">+</span>
        </div>
        <span class="text-secondary fs-5">Añadir perfil</span>
      </div>
    </div>

    <div v-else class="text-center w-100" style="max-width: 500px;">
      <div v-if="errorMessage"
        class="alert alert-danger border-0 bg-danger text-white mb-4 animate__animated animate__fadeIn">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ errorMessage }}
      </div>
      <div class="bg-secondary p-4 rounded shadow mb-4">
        <div class="d-flex align-items-center gap-4 mb-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" width="100" class="rounded">
          <input v-model="nuevoNombre" type="text" class="form-control form-control-lg bg-dark text-white border-0"
            placeholder="Nombre del perfil" autofocus>
        </div>

        <div class="text-start">
          <label class="text-white-50 small mb-2">Tipo de Perfil</label>
          <select v-model="tipoSeleccionado" class="form-select bg-dark text-white border-0">
            <option value="Adulto">Adulto (Todo el contenido)</option>
            <option value="Infantil">Infantil (Solo niños)</option>
          </select>
        </div>
      </div>

      <div class="d-flex gap-3 justify-content-center">
        <button @click="guardarNuevoPerfil" class="btn btn-light px-4 fw-bold">Continuar</button>
        <button @click="mostrarFormulario = false" class="btn btn-outline-secondary px-4 text-white">Cancelar</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.profile-container {
  background-color: #141414 !important;
}

.profile-item {
  width: 150px;
  cursor: pointer;
}

.avatar-wrapper {
  width: 150px;
  height: 150px;
  overflow: hidden;
  transition: transform 0.2s;
}

.profile-item:hover .avatar-wrapper {
  transform: scale(1.05);
  border: 3px solid white !important;
}

.add-profile:hover {
  background-color: #333;
}
</style>