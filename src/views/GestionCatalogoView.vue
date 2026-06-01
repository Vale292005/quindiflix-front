<template>
  <div class="p-8 min-h-screen font-sans antialiased netflix-bg text-slate-100 selection:bg-red-600 selection:text-white">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-800/80 pb-6">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1 animate-pulse">
          <span class="h-2 w-2 rounded-full bg-red-500"></span> SISTEMA DE GESTIÓN CENTRAL
        </div>
        <h1 class="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          🎬 Catálogo de Contenidos
        </h1>
        <p class="text-xs text-slate-400 mt-1.5">Consola de administración en tiempo real conectada a Oracle</p>
      </div>
      
      <button 
        v-if="puedeModificar" 
        @click="abrirModalCrear"
        class="netflix-btn-primary font-bold px-6 py-3 rounded-md shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
      >
        ➕ Agregar Película
      </button>
    </div>

    <div v-if="contentStore.error" class="bg-red-500/10 border-l-4 border-red-600 p-4 rounded-r-xl mb-8 text-red-400 flex items-center gap-3 backdrop-blur-md">
      <span class="text-lg">⚠️</span>
      <p class="text-sm font-semibold">{{ contentStore.error }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
      <div class="netflix-card p-6 rounded-xl border border-slate-800/60 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-red-600 transition-all duration-300 group-hover:h-full"></div>
        <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Títulos</span>
        <div class="text-4xl font-black text-white mt-2 font-mono tracking-tight">{{ totalPeliculas }}</div>
      </div>
      <div class="netflix-card p-6 rounded-xl border border-slate-800/60 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-rose-500 transition-all duration-300 group-hover:h-full"></div>
        <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">Categorías Activas</span>
        <div class="text-4xl font-black text-rose-500 mt-2 font-mono tracking-tight">{{ generos.length }}</div>
      </div>
    </div>

    <div class="netflix-table-container rounded-xl overflow-hidden shadow-2xl border border-slate-800/50">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="netflix-th text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/80">
              <th class="p-4 w-20 text-center text-slate-600">Índice</th>
              <th class="p-4">Título del Contenido</th>
              <th class="p-4">Categoría / Género</th>
              <th class="p-4 text-center" v-if="puedeModificar">Acciones Administrativas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-900/80 text-sm">
            <tr 
              v-for="(peli, index) in contentStore.peliculas" 
              :key="obtenerId(peli)" 
              class="netflix-tr transition-all duration-200 group"
            >
              <td class="p-4 text-center font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                {{ String(index + 1).padStart(2, '0') }}
              </td>
              <td class="p-4">
                <span class="font-bold text-slate-200 group-hover:text-white transition-colors tracking-wide text-[15px]">
                  {{ peli.titulo || peli.nombre }}
                </span>
              </td>
              <td class="p-4">
                <span :class="obtenerBadgeClase(obtenerNombreCategoria(peli))">
                  {{ obtenerNombreCategoria(peli) }}
                </span>
              </td>
              <td class="p-4 text-center" v-if="puedeModificar">
                <div class="flex justify-center items-center gap-3">
                  <button @click="abrirModalEditar(peli)" class="btn-action-edit px-3.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all duration-200">
                    ✏️ EDITAR
                  </button>
                  <button @click="confirmarEliminar(peli)" class="btn-action-delete px-3.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all duration-200">
                    🗑️ ELIMINAR
                  </button>
                </div>
              </td>
            </tr>
            
            <tr v-if="!totalPeliculas">
              <td colspan="4" class="p-16 text-center text-slate-500 font-semibold tracking-wide bg-black/40">
                🍿 No se encontraron películas registradas en el catálogo.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md z-50 transition-opacity duration-300">
      <div class="netflix-modal p-8 rounded-xl w-full max-w-md border border-slate-800/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <h2 class="text-2xl font-black mb-6 text-white flex items-center gap-2 tracking-tight">
          <span>{{ editandoId ? '📝' : '✨' }}</span>
          {{ editandoId ? 'Editar Película' : 'Nueva Película' }}
        </h2>
        
        <form @submit.prevent="guardar" class="space-y-6">
          <div>
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Título Comercial</label>
            <input 
              v-model="form.titulo" 
              type="text" 
              required 
              placeholder="Ej. Batman: El Caballero de la Noche"
              class="w-full netflix-input rounded p-3.5 text-white transition-all outline-none text-sm placeholder:text-slate-700 font-medium" 
            />
          </div>
          
          <div>
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Clasificación de Género</label>
            <div class="relative">
              <select 
                v-model="form.idCategoria" 
                required
                class="w-full netflix-input rounded p-3.5 text-white transition-all outline-none text-sm cursor-pointer appearance-none font-medium"
              >
                <option :value="null" disabled>Selecciona un género...</option>
                <option v-for="gen in generos" :key="gen.idGenero" :value="gen.idGenero">
                  {{ gen.nombre }}
                </option>
              </select>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</span>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-8">
            <button type="button" @click="mostrarModal = false" class="bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white font-bold px-5 py-2.5 rounded text-xs tracking-widest transition duration-200">
              CANCELAR
            </button>
            <button type="submit" class="netflix-btn-primary font-bold px-6 py-2.5 rounded text-xs tracking-widest shadow-md transition-all">
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useContentStore } from '../stores/content';
import api from '../api/axios';

const contentStore = useContentStore();
const generos = ref([]);
const mostrarModal = ref(false);
const editandoId = ref(null);
const form = ref({ titulo: '', idCategoria: null });

const puedeModificar = computed(() => true); 
const totalPeliculas = computed(() => contentStore.peliculas?.length || 0);

onMounted(async () => {
  await contentStore.cargarTodoElContenido();
  await cargarListaGeneros();
});

async function cargarListaGeneros() {
  try {
    const { data } = await api.get('/generos');
    generos.value = data || [];
  } catch (error) {
    console.error("Error cargando lista de géneros:", error);
  }
}

const obtenerId = (p) => p.id || p.idContenido || p.id_contenido;
const obtenerIdCat = (p) => p.idCategoria || p.id_categoria || p.idCategoriaContenido || p.categoriaId || p.idGenero;

function obtenerNombreCategoria(peli) {
  const peliCatId = obtenerIdCat(peli);
  if (!peliCatId) return 'Sin Categoría';

  const genero = generos.value.find(g => Number(g.idGenero || g.id) === Number(peliCatId));
  return genero ? (genero.nombre || genero.nombreCategoria) : `ID: ${peliCatId}`;
}

function obtenerBadgeClase(nombreCat) {
  const base = "px-2.5 py-1 rounded text-[11px] font-extrabold uppercase tracking-widest border ";
  if (nombreCat.startsWith('ID: ') || nombreCat === 'Sin Categoría') {
    return base + "bg-slate-900 text-slate-500 border-slate-800";
  }
  
  const nombre = nombreCat.toLowerCase();
  if (nombre.includes('accion')) return base + "bg-red-950/40 text-red-500 border-red-900/50";
  if (nombre.includes('terror') || nombre.includes('miedo') || nombre.includes('suspenso')) return base + "bg-purple-950/40 text-purple-400 border-purple-900/50";
  if (nombre.includes('comedia')) return base + "bg-amber-950/40 text-amber-500 border-amber-900/50";
  if (nombre.includes('infantil') || nombre.includes('niños') || nombre.includes('animacion')) return base + "bg-sky-950/40 text-sky-400 border-sky-900/50";
  
  return base + "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
}

function abrirModalCrear() {
  editandoId.value = null;
  form.value = { titulo: '', idCategoria: null };
  mostrarModal.value = true;
}

function abrirModalEditar(peli) {
  editandoId.value = obtenerId(peli);
  form.value = { 
    titulo: peli.titulo || peli.nombre, 
    idCategoria: obtenerIdCat(peli)
  };
  mostrarModal.value = true;
}

async function guardar() {
  try {
    if (editandoId.value) {
      await contentStore.actualizarPelicula(editandoId.value, form.value);
    } else {
      await contentStore.crearPelicula(form.value);
    }
    mostrarModal.value = false;
    await contentStore.cargarTodoElContenido();
  } catch (error) {
    console.error("Error guardando el contenido:", error);
  }
}

async function confirmarEliminar(peli) {
  if (confirm(`¿Seguro que deseas eliminar "${peli.titulo || peli.nombre}"?`)) {
    try {
      await contentStore.eliminarPelicula(obtenerId(peli));
      await contentStore.cargarTodoElContenido();
    } catch (error) {
      console.error("Error eliminando el contenido:", error);
    }
  }
}
</script>

<style scoped>
/* Fondo cinematográfico oficial de Netflix */
.netflix-bg {
  background-color: #141414 !important;
}

/* Tarjetas e Inputs usando negros profundos puros (#000000) */
.netflix-card,
.netflix-table-container,
.netflix-modal,
.netflix-input {
  background-color: #000000 !important;
  border-color: #222222 !important;
}

/* Efecto focus en los inputs con la marca roja */
.netflix-input {
  border: 1px solid #222222;
  transition: all 0.25s ease-in-out;
}
.netflix-input:focus {
  border-color: #e50914 !important;
  box-shadow: 0 0 8px rgba(229, 9, 20, 0.2);
}

/* Encabezado de la tabla */
.netflix-th {
  background-color: #0b0b0b !important;
}

/* Filas de la tabla con efecto hover sutil */
.netflix-tr {
  background-color: #000000;
}
.netflix-tr:hover {
  background-color: #0c0c0c !important;
}

/* Botón principal Rojo Netflix Oficial con transiciones */
.netflix-btn-primary {
  background-color: #e50914;
  color: #ffffff;
  transition: all 0.2s ease-in-out;
}
.netflix-btn-primary:hover {
  background-color: #ff0f1b;
  box-shadow: 0 0 15px rgba(229, 9, 20, 0.4);
}

/* Botones de acción minimalistas dentro de la tabla */
.btn-action-edit {
  background-color: #111111;
  color: #a0aec0;
  border: 1px solid #2d3748;
}
.btn-action-edit:hover {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}

.btn-action-delete {
  background-color: #111111;
  color: #a0aec0;
  border: 1px solid #2d3748;
}
.btn-action-delete:hover {
  background-color: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
}
</style>