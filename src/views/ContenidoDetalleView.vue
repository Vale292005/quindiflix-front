<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const contenido = ref(null);
const loading = ref(true);

// --- ESTADO DE FAVORITOS ---
const isFavorito = ref(false);
const idFavoritoActual = ref(null); // Guardamos el ID del favorito para poder borrarlo fácilmente

// TODO: Ajusta esto según cómo guardes tu perfil activo (ej: localStorage o authStore)
const idPerfil = localStorage.getItem('perfilId') || 53; 

onMounted(async () => {
  try {
    // 1. Llamamos al backend para el detalle del contenido
    const responseContenido = await axios.get(`http://localhost:8080/api/contenidos/${route.params.id}`);
    contenido.value = responseContenido.data;

    // 2. Verificamos inmediatamente si ya está en favoritos
    await verificarSiEsFavorito();

  } catch (error) {
    console.error("Error obteniendo el detalle o favoritos:", error);
  } finally {
    loading.value = false;
  }
});

// Función para comprobar si este contenido ya es favorito del perfil
const verificarSiEsFavorito = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/favoritos/perfil/${idPerfil}`);
    const listaFavoritos = response.data;

    // Buscamos directamente en la raíz del DTO que nos acabas de mostrar
    const favoritoEncontrado = listaFavoritos.find(fav => 
      fav.idContenido === parseInt(route.params.id)
    );

    if (favoritoEncontrado) {
      isFavorito.value = true;
      // Truco: Como el DTO no trae el id_favorito, guardamos el idContenido temporalmente
      idFavoritoActual.value = favoritoEncontrado.idContenido; 
    } else {
      isFavorito.value = false;
      idFavoritoActual.value = null;
    }
  } catch (error) {
    console.error("Error verificando estado de favorito:", error);
  }
};

// Función dinámica que agrega o quita dependiendo del estado actual (Toggle)
const toggleFavorito = async () => {
  try {
    if (isFavorito.value) {
      // SI YA ES FAVORITO -> LO ELIMINAMOS
      await axios.delete(`http://localhost:8080/api/favoritos/${idFavoritoActual.value}`);
      
      isFavorito.value = false;
      idFavoritoActual.value = null;
      console.log("Eliminado de favoritos con éxito");
} else {
      // NO ES FAVORITO -> LO AGREGAMOS
      
      // PAYLOAD COMPLETAMENTE PLANO:
      // Colocamos el idPerfil en la raíz exacta del JSON junto a los datos del contenido.
      // Esto saciará el apetito del DTO de entrada de Spring Boot.
      const payload = {
        idPerfil: parseInt(idPerfil), // <--- En la raíz para mapear directo a un Integer/Long en Java
        idContenido: contenido.value.idContenido || contenido.value.id_contenido || parseInt(route.params.id),
        titulo: contenido.value.titulo,
        tipoContenido: contenido.value.tipoContenido || contenido.value.tipo_contenido,
        esOriginal: contenido.value.esOriginal || contenido.value.es_original || false,
        urlImagen: contenido.value.urlImagen || contenido.value.url_imagen || ''
      };

      // Hacemos el POST limpio, enviando el objeto plano sin corchetes ni anidaciones
      await axios.post(`http://localhost:8080/api/favoritos`, payload);
      
      isFavorito.value = true;
      idFavoritoActual.value = payload.idContenido;
      console.log("Agregado a favoritos con éxito");
      
      // Sincronizamos el estado de la vista llamando al GET
      await verificarSiEsFavorito();
    }
  } catch (error) {
    console.error("Error al procesar el cambio en favoritos:", error);
    alert("Hubo un problema al guardar. Revisa que el ID del perfil exista en la base de datos.");
  }
};
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