<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const contenido = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // Llamamos al backend usando el ID que viaja en la URL
    const response = await axios.get(`http://localhost:8080/api/contenidos/${route.params.id}`);
    contenido.value = response.data;
  } catch (error) {
    console.error("Error obteniendo el detalle:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="bg-dark min-vh-100 text-white p-4 p-md-5 d-flex flex-column align-items-center justify-content-center">
    
    <button class="btn btn-outline-danger mb-4 px-4 fw-bold align-self-start" @click="router.back()">
      <i class="bi bi-arrow-left me-2"></i>Volver al Dashboard
    </button>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></div>
    </div>

    <div v-else-if="contenido" class="container bg-secondary bg-opacity-10 p-4 rounded-4 shadow-lg border border-secondary border-opacity-25" style="max-width: 800px;">
      <div class="row align-items-center g-4">
        
        <div class="col-10 col-sm-6 col-md-5 mx-auto">
          <div class="ratio ratio-2x3 bg-dark rounded-3 shadow overflow-hidden d-flex align-items-center justify-content-center border border-secondary" style="min-height: 350px;">
            
            <img 
              v-if="contenido.urlImagen || contenido.url_imagen" 
              :src="contenido.urlImagen || contenido.url_imagen" 
              referrerpolicy="no-referrer"
              class="w-100 h-100 object-fit-cover"
              @error="(e) => e.target.style.display = 'none'"
            />
            
            <div class="position-absolute text-center text-white-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-play-circle-fill text-danger mb-2" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
              </svg>
              <div class="small fw-bold">Quindiflix Player</div>
            </div>

          </div>
        </div>

        <div class="col-md-7 text-center text-md-start">
          <span class="badge bg-danger px-3 py-2 fs-6 fw-bold text-uppercase mb-2">{{ contenido.tipoContenido }}</span>
          <h1 class="display-5 fw-extrabold m-0 text-white tracking-tight">{{ contenido.titulo }}</h1>
          
          <p class="text-white-50 fs-5 mt-3">
            {{ contenido.descripcion || 'Disfruta de esta increíble producción ahora mismo en Quindiflix. Acceso premium ilimitado.' }}
          </p>
          
          <div class="mt-4 pt-2">
            <button class="btn btn-danger btn-lg px-5 py-3 fw-bold shadow w-100 w-md-auto">
              <i class="bi bi-play-fill me-2 fs-4"></i>Reproducir Ahora
            </button>
            <button 
              class="btn btn-lg px-4 py-3 fw-bold shadow w-100 w-md-auto transition"
              :class="isFavorito ? 'btn-warning text-dark' : 'btn-outline-light'"
              @click="toggleFavorito"
            >
              <i class="bi me-2 fs-4" :class="isFavorito ? 'bi-star-fill' : 'bi-star'"></i>
              {{ isFavorito ? 'En Mis Favoritos' : 'Añadir a Favoritos' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>