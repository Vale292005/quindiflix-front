<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

// 1. Instancias
const authStore = useAuthStore();
const router = useRouter();

// 2. VARIABLES REACTIVAS (Esto es lo que te faltaba)
const mostrarFormulario = ref(false); // Controla si se ve la lista o el formulario
const nuevoNombre = ref('');          // Almacena el nombre del nuevo perfil
const loading = ref(true);            // Estado de carga

// 3. FUNCIONES
const seleccionarPerfil = (perfil) => {
  localStorage.setItem('perfil_activo', JSON.stringify(perfil));
  router.push('/dashboard');
};

const guardarNuevoPerfil = async () => {
  if (!nuevoNombre.value.trim()) return;

  try {
    const payload = {
      nombre: nuevoNombre.value,
      avatar: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
    };

    // Llamamos a la función que creamos en el Store
    await authStore.crearPerfil(payload);
    
    // Resetear y volver a la lista
    nuevoNombre.value = '';
    mostrarFormulario.value = false;
  } catch (error) {
    alert("No se pudo crear el perfil. Revisa la consola.");
  }
};

onMounted(async () => {
  try {
    await authStore.cargarPerfiles();
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
      <div v-for="perfil in authStore.perfiles" :key="perfil.idPerfil" 
           class="profile-item text-center" @click="seleccionarPerfil(perfil)">
        <div class="avatar-wrapper mb-2">
          <img :src="perfil.avatar || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'" class="img-fluid rounded shadow">
        </div>
        <span class="text-secondary fs-5">{{ perfil.nombre }}</span>
      </div>

      <div class="profile-item text-center" @click="mostrarFormulario = true">
        <div class="avatar-wrapper mb-2 add-profile d-flex align-items-center justify-content-center border border-secondary">
          <span class="text-secondary display-1">+</span>
        </div>
        <span class="text-secondary fs-5">Añadir perfil</span>
      </div>
    </div>

    <div v-else class="text-center w-100" style="max-width: 500px;">
      <div class="d-flex align-items-center gap-4 mb-4 bg-secondary p-4 rounded shadow">
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" width="100" class="rounded">
        <input v-model="nuevoNombre" type="text" class="form-control form-control-lg bg-dark text-white border-0" placeholder="Nombre del perfil" autofocus>
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