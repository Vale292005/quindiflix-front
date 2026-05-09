<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useContentStore } from '../stores/content';

const contentStore = useContentStore();
const contenidos = ref([]);
const loading = ref(true);
const perfilActivo = ref(JSON.parse(localStorage.getItem('perfil_activo')));

const peliculas = computed(() => {
  return Array.isArray(contenidos.value)
    ? contenidos.value.filter(c => {
      const texto = (c.tipoContenido || "").toLowerCase().trim();
      const tipoLimpio = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return tipoLimpio.includes('pelicula');
    })
    : [];
});

const series = computed(() => {
  return Array.isArray(contenidos.value)
    ? contenidos.value.filter(c => c.tipoContenido === 'Serie')
    : [];
});

const podcasts = computed(() => {
  return Array.isArray(contenidos.value)
    ? contenidos.value.filter(c => c.tipoContenido === 'Podcast')
    : [];
});
const cargarContenidos = async () => {
  try {
    loading.value = true;
    await contentStore.cargarTodoElContenido();
    const todosLosDatos = contentStore.peliculas; 
    if (perfilActivo.value.tipoPerfil === 'Adulto') {
      contenidos.value = todosLosDatos;
    } else {
      contenidos.value = todosLosDatos.filter(c => c.esInfantil === true || c.esInfantil === 1);
    }

    console.log("Perfil actual:", perfilActivo.value.tipoPerfil);
    console.log("Contenidos finales a mostrar:", contenidos.value.length);

  } catch (error) {
    console.error("Error cargando contenidos:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(cargarContenidos);
</script>
<template>
  <div class="dashboard bg-dark min-vh-100 text-white pb-5">

    <header class="p-4 d-flex justify-content-between align-items-center">
      <h1 class="text-danger fw-bold m-0">QUINDIFLIX</h1>
      <div class="d-flex align-items-center gap-3">
        <span>Viendo ahora: <strong>{{ perfilActivo?.nombre }}</strong></span>
        <div class="badge bg-primary">{{ perfilActivo?.tipoPerfil }}</div>
      </div>
    </header>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <main v-else class="px-4">

      <section class="mt-4" v-if="peliculas.length">
        <h3 class="mb-3 fs-4">Películas que te encantarán</h3>
        <div class="row-scroll">
          <div v-for="item in peliculas" :key="item.idContenido" class="content-card">
            <div class="card-image rounded"
              :style="{ backgroundImage: `url(${item?.urlImagen || 'https://via.placeholder.com/220x125'})` }">
              <span class="original-tag" v-if="item?.esOriginal">Original</span>
              <p class="title-overlay">{{ item?.titulo }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5" v-if="series.length">
        <h3 class="mb-3 fs-4">Series más vistas</h3>
        <div class="row-scroll">
          <div v-for="item in series" :key="item.idContenido" class="content-card">
            <div class="card-image rounded"
              :style="{ backgroundImage: `url(${item.urlImagen || 'https://via.placeholder.com/220x125'})` }">
              <span class="original-tag" v-if="item.esOriginal">Original</span>
              <p class="title-overlay">{{ item.titulo }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5" v-if="podcasts.length">
        <h3 class="mb-3 fs-4">Podcasts destacados</h3>
        <div class="row-scroll">
          <div v-for="item in podcasts" :key="item.idContenido" class="content-card">
            <div class="card-image rounded"
              :style="{ backgroundImage: `url(${item.urlImagen || 'https://via.placeholder.com/220x125'})` }">
              <p class="title-overlay text-info">{{ item.titulo }}</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>
<style scoped>
/* Contenedor del scroll lateral */
.row-scroll {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding: 10px 0 20px 0;
  scrollbar-width: none;
  /* Ocultar scroll en Firefox */
}

.row-scroll::-webkit-scrollbar {
  display: none;
  /* Ocultar scroll en Chrome/Safari */
}

/* Tarjeta de contenido */
.content-card {
  min-width: 220px;
  max-width: 220px;
  height: 125px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.content-card:hover {
  transform: scale(1.1);
  z-index: 10;
}

.card-image {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.bg-gradient-series {
  background: linear-gradient(45deg, #2c3e50, #000000);
}

.original-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #e50914;
  font-size: 0.6rem;
  padding: 2px 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.title-overlay {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.card-image {
  width: 220px;
  /* Ancho de la tarjeta */
  height: 125px;
  /* ¡ESTO ES LO MÁS IMPORTANTE! */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #222;
  /* Color gris oscuro por si la imagen falla */
  display: flex;
  align-items: flex-end;
  border-radius: 8px;
}
</style>