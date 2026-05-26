<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '../stores/content';
import api from '../api/axios'

const router = useRouter();
const contentStore = useContentStore();
const generos = ref([]);

// Variables de estado
const contenidos = ref([]);
const favoritos = ref([]);
const loading = ref(true);
const perfilActivo = ref(JSON.parse(localStorage.getItem('perfil_activo')) || {});

// Filtros computados ultra-seguros
const peliculas = computed(() => {
  if (!Array.isArray(contenidos.value)) return [];
  return contenidos.value.filter(c => {
    const tipo = c?.tipoContenido || c?.tipo_contenido || "";
    const texto = tipo.toLowerCase().trim();
    const tipoLimpio = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return tipoLimpio.includes('pelicula');
  });
});

const series = computed(() => {
  if (!Array.isArray(contenidos.value)) return [];
  return contenidos.value.filter(c => c?.tipoContenido === 'Serie' || c?.tipo_contenido === 'Serie');
});

const podcasts = computed(() => {
  if (!Array.isArray(contenidos.value)) return [];
  return contenidos.value.filter(c => c?.tipoContenido === 'Podcast' || c?.tipo_contenido === 'Podcast');
});

// Permisos de empleado
const esEmpleado = computed(() => {
  return perfilActivo.value?.tipoPerfil === 'Empleado' || perfilActivo.value?.tipo_perfil === 'Empleado';
});

// Función de carga de datos
const cargarContenidos = async () => {
  try {
    loading.value = true;

    await contentStore.cargarTodoElContenido();
    const todosLosDatos = contentStore.peliculas || contentStore.contenidos || [];

    const tipoPerfil = perfilActivo.value?.tipoPerfil || perfilActivo.value?.tipo_perfil;
    if (tipoPerfil === 'Adulto' || tipoPerfil === 'Empleado') {
      contenidos.value = todosLosDatos;
    } else {
      contenidos.value = todosLosDatos.filter(c => c?.esInfantil === true || c?.esInfantil === 1 || c?.es_infantil === 1);
    }

    const idPerfilActual = perfilActivo.value?.idPerfil || perfilActivo.value?.id_perfil;
    if (idPerfilActual) {
      favoritos.value = [];
      const response = await api.get(`http://localhost:8080/api/favoritos/perfil/${idPerfilActual}`);
      favoritos.value = response.data || [];
    }

    const responseGeneros = await api.get('http://localhost:8080/api/generos');
    generos.value = responseGeneros.data || [];

  } catch (error) {
    console.error("Error cargando datos en el Dashboard:", error);
    favoritos.value = [];
  } finally {
    loading.value = false;
  }
};

// Navegación
const irADetalle = (idContenido) => {
  router.push(`/contenido/${idContenido}`);
};

// FUNCIÓN CORREGIDA: Apunta al path estricto con el parámetro dinámico /:id
const irADetalleEmpleado = () => {
  const idCuenta = perfilActivo.value?.idCuenta || perfilActivo.value?.id_cuenta || 1;
  router.push(`/contenido-empleado/${idCuenta}`);
};

const irPanelEmpleado = () => {
  router.push('/panel-empleado');
};

const cambiarAvatar = () => {
  router.push({ path: '/cambiar-avatar' });
};

const salirPerfil = () => {
  localStorage.removeItem('perfil_activo');
  router.push('/profiles');
};

const contenidosPorGenero = (idGenero) => {
  if (!Array.isArray(contenidos.value)) return [];
  return contenidos.value.filter(c => {
    const categoriaId = c?.idCategoria || c?.id_categoria || c?.idCategoriaContenido;
    if (categoriaId === undefined || categoriaId === null) return false;
    return Number(categoriaId) === Number(idGenero);
  });
};

onMounted(cargarContenidos);
</script>

<template>
  <div class="dashboard bg-dark min-vh-100 text-white pb-5">

    <header class="p-4 d-flex justify-content-between align-items-center">
      <h1 class="text-danger fw-bold m-0" style="cursor: pointer;" @click="router.push('/dashboard')">QUINDIFLIX</h1>

      <div class="d-flex align-items-center gap-3">
        
        <button v-if="esEmpleado" @click="irADetalleEmpleado"
          class="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-bold">
          📊 Consola BI Empleado
        </button>

        <div class="dropdown">
          <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button"
            id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
            <img :src="perfilActivo?.avatar" alt="Avatar" width="30" class="rounded">
            <span>{{ perfilActivo?.nombre }}</span>
          </button>

          <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="userMenu">
            <li>
              <h6 class="dropdown-header">Perfil: {{ perfilActivo?.tipoPerfil }}</h6>
            </li>
            <li><a class="dropdown-item" href="#" @click.prevent="cambiarAvatar">Cambiar Avatar</a></li>
            <li>
              <hr class="dropdown-divider">
            </li>

            <li v-if="esEmpleado">
              <a class="dropdown-item text-warning" href="#" @click.prevent="irPanelEmpleado">
                <i class="bi bi-gear-fill me-2"></i>Panel de Control Empleado
              </a>
            </li>
            <li v-if="esEmpleado">
              <hr class="dropdown-divider">
            </li>

            <li><a class="dropdown-item text-danger" href="#" @click.prevent="salirPerfil">Salir del Perfil</a></li>
          </ul>
        </div>
      </div>
    </header>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <main v-else class="px-4">

      <section class="mt-4" v-if="favoritos && favoritos.length">
        <h3 class="mb-3 fs-4 text-warning"><i class="bi bi-star-fill me-2"></i>Mi Lista Favorita</h3>
        <div class="row-scroll">
          <div v-for="item in favoritos" :key="item.idContenido || item.id_contenido" class="content-card"
            @click="irADetalle(item.idContenido || item.id_contenido)" style="cursor: pointer;">
            <div class="card-image rounded"
              :style="{ backgroundImage: `url(${item.urlImagen || item.url_imagen || 'https://via.placeholder.com/220x125'})` }">
              <span class="original-tag" v-if="item.esOriginal || item.es_original">Original</span>
              <p class="title-overlay">{{ item.titulo }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-4" v-if="peliculas.length">
        <h3 class="mb-3 fs-4">Películas que te encantarán</h3>
        <div class="row-scroll">
          <div v-for="item in peliculas" :key="item.idContenido" class="content-card"
            @click="irADetalle(item.idContenido)" style="cursor: pointer;">
            <div
              class="card-image rounded position-relative overflow-hidden bg-dark d-flex align-items-center justify-content-center"
              style="height: 125px; width: 220px;">
              <img v-if="item?.urlImagen" :src="item.urlImagen" referrerpolicy="no-referrer"
                class="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                @error="(e) => e.target.style.display = 'none'" />
              <div v-else class="text-center text-muted small position-absolute">
                <i class="bi bi-play-circle fs-3 d-block mb-1"></i>
                <span>{{ item?.titulo }}</span>
              </div>
              <span class="original-tag" v-if="item?.esOriginal" style="z-index: 2;">Original</span>
              <p class="title-overlay" style="z-index: 2;">{{ item?.titulo }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5" v-if="series.length">
        <h3 class="mb-3 fs-4">Series más vistas</h3>
        <div class="row-scroll">
          <div v-for="item in series" :key="item.idContenido" class="content-card" @click="irADetalle(item.idContenido)"
            style="cursor: pointer;">
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
          <div v-for="item in podcasts" :key="item.idContenido" class="content-card"
            @click="irADetalle(item.idContenido)" style="cursor: pointer;">
            <div class="card-image rounded"
              :style="{ backgroundImage: `url(${item.urlImagen || 'https://via.placeholder.com/220x125'})` }">
              <p class="title-overlay text-info">{{ item.titulo }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5" v-if="generos && generos.length">
        <h3 class="mb-3 fs-4 text-white">Explorar por Géneros</h3>
        <div class="accordion accordion-dark" id="accordionGeneros">
          <div class="accordion-item bg-dark text-white border-secondary" v-for="(genero, index) in generos"
            :key="genero.idGenero">
            <h2 class="accordion-header" :id="'heading-' + genero.idGenero">
              <button class="accordion-button collapsed bg-dark text-white fw-bold" type="button"
                data-bs-toggle="collapse" :data-bs-target="'#collapse-' + genero.idGenero" aria-expanded="false"
                :aria-controls="'collapse-' + genero.idGenero">
                {{ genero.nombre }}
              </button>
            </h2>
            <div :id="'collapse-' + genero.idGenero" class="accordion-collapse collapse"
              :aria-labelledby="'heading-' + genero.idGenero" data-bs-parent="#accordionGeneros">
              <div class="accordion-body bg-dark px-2">
                <div v-if="contenidosPorGenero(genero.idGenero).length" class="row-scroll">
                  <div v-for="item in contenidosPorGenero(genero.idGenero)" :key="item.idContenido" class="content-card"
                    @click="irADetalle(item.idContenido)" style="cursor: pointer;">
                    <div class="card-image rounded"
                      :style="{ backgroundImage: `url(${item.urlImagen || 'https://via.placeholder.com/220x125'})` }">
                      <span class="original-tag" v-if="item.esOriginal">Original</span>
                      <p class="title-overlay">{{ item.titulo }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted small py-2 ps-3">
                  <i class="bi bi-info-circle me-2"></i>No hay contenidos disponibles en este género.
                </div>
              </div>
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