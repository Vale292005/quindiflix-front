<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios'; // Tu instancia configurada de Axios

const router = useRouter();

// 1. Traemos el perfil activo actual de la sesión
const perfilActivo = ref(JSON.parse(localStorage.getItem('perfil_activo')) || {});
const loading = ref(false);
const errorMsg = ref('');

// 2. Banco de avatares disponibles (puedes cambiar estas URLs por las imágenes reales que prefieras)
const avatares = ref([
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
  "https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfo8WVDswPXiZpllSwasQb1jzkHuVUFW31YA&s",
  "https://static.wikia.nocookie.net/horadeaventura/images/9/9c/MantecadeMarPose1.png/revision/latest?cb=20150114172328&path-prefix=es",
  "https://m.media-amazon.com/images/I/71xHh6f9YgL._AC_UF1000,1000_QL80_.jpg"

]);

// 3. Función para guardar el nuevo avatar seleccionado
const seleccionarAvatar = async (urlAvatar) => {
  const idPerfil = perfilActivo.value?.idPerfil || perfilActivo.value?.id_perfil;
  
  if (!idPerfil) {
    errorMsg.value = "No se detectó un perfil activo.";
    return;
  }

  try {
    loading.value = true;
    errorMsg.value = '';

    // Clonamos el perfil actual y le modificamos la URL del avatar
    const perfilActualizado = { 
      ...perfilActivo.value, 
      avatar: urlAvatar 
    };

    // Petición PUT al backend de Spring Boot para actualizar el perfil en la base de datos
    // Ajusta la URL según la estructura exacta de tu controlador de Perfiles
    await api.put(`http://localhost:8080/api/perfiles/${idPerfil}`, perfilActualizado);

    // Guardamos los cambios localmente para que el Dashboard se actualice al instante
    localStorage.setItem('perfil_activo', JSON.stringify(perfilActualizado));

    // Regresamos triunfantes al Dashboard
    router.push('/dashboard');

  } catch (err) {
    console.error("Error actualizando el avatar:", err);
    errorMsg.value = "No se pudo guardar el avatar. Inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="cambiar-avatar bg-dark min-vh-100 text-white d-flex flex-column align-items-center justify-content-center p-4">
    
    <div class="text-center mb-5">
      <h1 class="display-5 fw-bold text-danger mb-2">QUINDIFLIX</h1>
      <h2 class="fs-3 text-secondary">Elige un avatar para <span class="text-white">{{ perfilActivo?.nombre }}</span></h2>
      <p class="text-muted small">Haz clic sobre la imagen que más te guste</p>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="mt-2 text-secondary">Guardando tu nuevo estilo...</p>
    </div>

    <div v-if="errorMsg" class="alert alert-danger border-0 bg-danger text-white px-4 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
    </div>

    <div v-else class="avatar-grid d-flex flex-wrap justify-content-center gap-4 max-width-container">
      <div 
        v-for="(url, index) in avatares" 
        :key="index" 
        class="avatar-wrapper position-relative"
        @click="seleccionarAvatar(url)"
      >
        <img 
          :src="url" 
          alt="Opción de Avatar" 
          class="img-fluid rounded border-avatar"
          :class="{ 'current-avatar-border': url === perfilActivo?.avatar }"
        />
        
        <span v-if="url === perfilActivo?.avatar" class="badge bg-warning text-dark position-absolute top-0 start-50 translate-middle-x mt-2 shadow">
          Actual
        </span>
      </div>
    </div>

    <button 
      class="btn btn-outline-secondary mt-5 px-4 py-2 fw-bold text-uppercase" 
      :disabled="loading"
      @click="router.push('/dashboard')"
    >
      Cancelar
    </button>

  </div>
</template>

<style scoped>
.cambiar-avatar {
  background-color: #141414 !important; /* El color oscuro original de Netflix */
}

.max-width-container {
  max-width: 800px;
}

.avatar-wrapper {
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  width: 130px;
  height: 130px;
}

.avatar-wrapper:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.border-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 4px solid transparent;
  transition: border-color 0.3s ease;
}

.avatar-wrapper:hover .border-avatar {
  border-color: #ffffff;
}

/* Resalta el avatar actual del usuario */
.current-avatar-border {
  border-color: #ffc107 !important;
}
</style>