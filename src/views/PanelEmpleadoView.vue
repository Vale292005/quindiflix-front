<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '../stores/content';
import api from '../api/axios';

const router = useRouter();
const contentStore = useContentStore();

// Estados
const loading = ref(true);
const contenidos = ref([]);
const busqueda = ref('');

// Cargar catálogo de contenidos
const cargarCatalogo = async () => {
  try {
    loading.value = true;
    await contentStore.cargarTodoElContenido();
    contenidos.value = contentStore.peliculas || contentStore.contenidos || [];
  } catch (error) {
    console.error("Error cargando el catálogo de administración:", error);
  } finally {
    loading.value = false;
  }
};

// Buscador reactivo en la tabla
const contenidosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return contenidos.value;
  return contenidos.value.filter(c => 
    c.titulo?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    c.tipoContenido?.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

// Métodos de administración
const irAAgregar = () => {
  router.push('/contenido/nuevo'); // Ruta para el formulario de creación
};

const editarContenido = (id) => {
  router.push(`/contenido/editar/${id}`); // Ruta para edición
};

const eliminarContenido = async (id, titulo) => {
  if (confirm(`¿Estás seguro de que deseas eliminar "${titulo}" de Quindoflix?`)) {
    try {
      await api.delete(`http://localhost:8080/api/contenidos/${id}`);
      alert("Contenido eliminado con éxito.");
      await cargarCatalogo(); // Recargamos la tabla
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al intentar eliminar el contenido.");
    }
  }
};

onMounted(cargarCatalogo);
</script>

<template>
  <div class="panel-empleado bg-dark min-vh-100 text-white p-4">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-secondary pb-3">
      <div>
        <h1 class="text-danger fw-bold m-0" style="cursor: pointer;" @click="router.push('/dashboard')">QUINDIFLIX</h1>
        <p class="text-warning m-0 mt-1"><i class="bi bi-gear-fill me-2"></i>Panel de Control de Empleados</p>
      </div>
      <button class="btn btn-outline-light" @click="router.push('/dashboard')">
        <i class="bi bi-arrow-left me-2"></i>Volver al Dashboard
      </button>
    </header>

    <div class="row g-4 mb-4" v-if="!loading">
      <div class="col-md-4">
        <div class="card bg-black text-white border-secondary h-100 shadow-sm">
          <div class="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 class="text-muted text-uppercase small">Total Catálogo</h6>
              <h3 class="fw-bold m-0">{{ contenidos.length }}</h3>
            </div>
            <i class="bi bi-collection-play fs-1 text-danger"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-black text-white border-secondary h-100 shadow-sm">
          <div class="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 class="text-muted text-uppercase small">Películas</h6>
              <h3 class="fw-bold m-0">{{ contenidos.filter(c => c.tipoContenido === 'Película' || c.tipo_contenido === 'Pelicula').length }}</h3>
            </div>
            <i class="bi bi-film fs-1 text-warning"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-black text-white border-secondary h-100 shadow-sm">
          <div class="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 class="text-muted text-uppercase small">Series</h6>
              <h3 class="fw-bold m-0">{{ contenidos.filter(c => c.tipoContenido === 'Serie').length }}</h3>
            </div>
            <i class="bi bi-tv fs-1 text-info"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div class="search-box position-relative flex-grow-1" style="max-width: 500px;">
        <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
        <input 
          type="text" 
          v-model="busqueda"
          class="form-control bg-black text-white border-secondary ps-5 py-2" 
          placeholder="Buscar contenido por título o tipo..."
        />
      </div>
      <button class="btn btn-danger px-4 py-2 fw-bold shadow-sm" @click="irAAgregar">
        <i class="bi bi-plus-circle me-2"></i>Agregar Nuevo Contenido
      </button>
    </div>

    <div class="card bg-black border-secondary shadow">
      <div class="card-body p-0">
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
          <p class="text-muted mt-2 m-0">Sincronizando catálogo con la base de datos...</p>
        </div>

        <div v-else-if="!contenidosFiltrados.length" class="text-center text-muted py-5">
          <i class="bi bi-folder-x fs-2 d-block mb-2"></i>
          <span>No se encontraron contenidos que coincidan con la búsqueda.</span>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-dark table-hover align-middle m-0">
            <thead class="table-secondary text-uppercase font-monospace small">
              <tr>
                <th scope="col" class="ps-4" style="width: 80px;">ID</th>
                <th scope="col">Miniatura</th>
                <th scope="col">Título</th>
                <th scope="col" style="width: 150px;">Tipo</th>
                <th scope="col" style="width: 130px;">Original</th>
                <th scope="col" class="text-end pe-4" style="width: 180px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in contenidosFiltrados" :key="item.idContenido">
                <th scope="row" class="ps-4 text-muted">{{ item.idContenido }}</th>
                <td>
                  <img 
                    :src="item.urlImagen || 'https://via.placeholder.com/60x35'" 
                    alt="Miniatura" 
                    class="rounded object-fit-cover border border-secondary"
                    style="width: 60px; height: 35px;"
                  />
                </td>
                <td class="fw-bold text-white">{{ item.titulo }}</td>
                <td>
                  <span class="badge" :class="{
                    'bg-danger': item.tipoContenido === 'Película' || item.tipo_contenido === 'Pelicula',
                    'bg-info text-dark': item.tipoContenido === 'Serie',
                    'bg-success': item.tipoContenido === 'Podcast'
                  }">{{ item.tipoContenido }}</span>
                </td>
                <td>
                  <span v-if="item.esOriginal" class="badge bg-warning text-dark">Original</span>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td class="text-end pe-4">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-light" title="Editar" @click="editarContenido(item.idContenido)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-outline-danger" title="Eliminar" @click="eliminarContenido(item.idContenido, item.titulo)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.panel-empleado {
  background-color: #141414 !important;
}
.table {
  --bs-table-bg: #000000;
  --bs-table-hover-bg: #1c1c1c;
  border-color: #2d3135;
}
.form-control:focus {
  background-color: #000000;
  color: white;
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
</style>