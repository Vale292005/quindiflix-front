<template>
  <div class="container py-5 text-light">
    <div class="row g-4">
      
      <div class="col-12">
        <div class="card bg-dark border-secondary shadow p-4 mb-2">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
            <div>
              <h1 class="display-6 fw-bold tracking-wider text-danger mb-1 font-monospace">
                QUINDIFLIX 🎬
              </h1>
              <p class="text-secondary small mb-0">Panel de Control Unificado de Analítica y Métricas del Servidor</p>
            </div>
            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 uppercase tracking-widest text-xs">
              Live Metrics
            </span>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card bg-dark border-secondary shadow overflow-hidden">
          <div class="card-header bg-dark border-secondary p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <span class="fs-3 text-success">💰</span>
              <div>
                <h2 class="h5 fw-bold text-white mb-0">Ingresos y Transacciones por Plan</h2>
                <p class="text-secondary small mb-0">Análisis financiero mensual de suscripciones activas</p>
              </div>
            </div>
            
            <div class="d-flex align-items-center gap-2 bg-black bg-opacity-50 p-2 rounded border border-secondary">
              <div class="d-flex align-items-center gap-2">
                <span class="text-secondary text-uppercase small fw-bold px-1">Mes:</span>
                <select v-model="mesSeleccionado" @change="cargarDatosPlanes" class="form-select form-select-sm bg-dark text-white border-secondary cursor-pointer">
                  <option v-for="m in listaMeses" :key="m.valor" :value="m.valor">{{ m.nombre }}</option>
                </select>
              </div>
              <div class="vr bg-secondary my-1"></div>
              <div class="d-flex align-items-center gap-2">
                <span class="text-secondary text-uppercase small fw-bold">Año:</span>
                <select v-model="anioSeleccionado" @change="cargarDatosPlanes" class="form-select form-select-sm bg-dark text-white border-secondary cursor-pointer">
                  <option v-for="a in listaAnios" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card-body p-4">
            <div v-if="cargandoPlanes" class="d-flex justify-content-center align-items-center py-5 text-secondary gap-2">
              <div class="spinner-border spinner-border-sm text-danger" role="status"></div>
              <span>Procesando caja mensual...</span>
            </div>
            <div v-else-if="errorPlanes" class="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-25 text-center" role="alert">
              ⚠️ {{ errorPlanes }}
            </div>
            
            <div v-else class="table-responsive rounded border border-secondary border-opacity-50">
              <table class="table table-dark table-hover align-middle mb-0">
                <thead class="table-dark border-secondary text-uppercase fs-7 tracking-wider">
                  <tr>
                    <th class="p-3 text-secondary fw-bold">Plan de Suscripción</th>
                    <th class="p-3 text-center text-secondary fw-bold">Cantidad Transacciones</th>
                    <th class="p-3 text-end text-secondary fw-bold">Ingresos Totales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in datosPlanes" :key="index" v-show="item.planSuscripcion">
                    <td class="p-3 fw-bold text-white">
                      <span class="d-inline-block rounded-circle me-2" :class="index === 0 ? 'bg-success' : 'bg-primary'" style="width: 10px; height: 10px;"></span>
                      {{ item.planSuscripcion }}
                    </td>
                    <td class="p-3 text-center font-monospace">
                      <span class="badge bg-black border border-secondary text-light px-2 py-1.5 fw-normal">
                        {{ item.cantidadTransacciones?.toLocaleString() || 0 }} pagos
                      </span>
                    </td>
                    <td class="p-3 text-end font-monospace text-success fw-bold fs-5">
                      $ {{ item.ingresosTotales != null ? Number(item.ingresosTotales).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0,00' }}
                    </td>
                  </tr>
                  <tr v-if="datosPlanes.length === 0">
                    <td colspan="3" class="text-center p-4 text-secondary fst-italic">No se registraron transacciones exitosas en este periodo.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card bg-dark border-secondary shadow overflow-hidden">
          <div class="card-header bg-dark border-secondary p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <span class="fs-3 text-primary">📊</span>
              <div>
                <h2 class="h5 fw-bold text-white mb-0">Rendimiento de Formatos por Género</h2>
                <p class="text-secondary small mb-0">Calificaciones promedio calculadas en Oracle</p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 bg-black bg-opacity-50 p-2 rounded border border-secondary">
              <label class="text-secondary text-uppercase small fw-bold px-1 mb-0">Género:</label>
              <select v-model="generoSeleccionado" @change="cargarPromediosPorGenero" class="form-select form-select-sm bg-dark text-white border-secondary cursor-pointer">
                <option v-for="gen in listaGeneros" :key="gen" :value="gen">{{ gen }}</option>
              </select>
            </div>
          </div>

          <div class="card-body p-4">
            <div v-if="cargandoGenero" class="d-flex justify-content-center align-items-center py-5 text-secondary gap-2">
              <div class="spinner-border spinner-border-sm text-danger" role="status"></div>
              <span>Cargando formatos...</span>
            </div>
            <div v-else-if="errorGenero" class="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-25 text-center" role="alert">
              ⚠️ {{ errorGenero }}
            </div>
            
            <div v-else class="table-responsive rounded border border-secondary border-opacity-50">
              <table class="table table-dark table-hover align-middle mb-0">
                <thead class="table-dark border-secondary text-uppercase fs-7 tracking-wider">
                  <tr>
                    <th class="p-3 text-secondary fw-bold">Formato / Categoría</th>
                    <th class="p-3 text-center text-secondary fw-bold">Calificación Promedio</th>
                    <th class="p-3 text-end text-secondary fw-bold">Total Votos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in datosGenero" :key="index" v-show="item.formatoCategoria">
                    <td class="p-3 fw-bold text-white">{{ item.formatoCategoria }}</td>
                    <td class="p-3 text-center">
                      <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2.5 py-2 font-monospace fw-bold">
                        ⭐ {{ item.calificacionPromedio != null ? Number(item.calificacionPromedio).toFixed(2) : '0.00' }}
                      </span>
                    </td>
                    <td class="p-3 text-end text-secondary font-monospace">
                      {{ item.totalCalificaciones?.toLocaleString() || 0 }} calificaciones
                    </td>
                  </tr>
                  <tr v-if="datosGenero.length === 0">
                    <td colspan="3" class="text-center p-4 text-secondary fst-italic">No hay formatos para este género.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card bg-dark border-secondary shadow overflow-hidden">
          <div class="card-header bg-dark border-secondary p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <span class="fs-3 text-warning">🏆</span>
              <div>
                <h2 class="h5 fw-bold text-white mb-0">Top 10 Contenidos Más Vistos</h2>
                <p class="text-secondary small mb-0">Basado en el historial de reproducciones de los usuarios</p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 bg-black bg-opacity-50 p-1.5 rounded border border-secondary">
              <span class="text-secondary text-uppercase small fw-bold ps-2">Ciudad:</span>
              <input type="text" v-model="ciudadSeleccionada" @keyup.enter="cargarTopContenido" placeholder="Ej: Armenia" class="form-control form-control-sm bg-dark text-white border-secondary inline-block" style="max-width: 130px;" />
              <button @click="cargarTopContenido" class="btn btn-sm btn-danger fw-bold text-uppercase px-3 shadow-sm">Buscar</button>
            </div>
          </div>

          <div class="card-body p-4">
            <div v-if="cargandoTop" class="d-flex justify-content-center align-items-center py-5 text-secondary gap-2">
              <div class="spinner-border spinner-border-sm text-danger" role="status"></div>
              <span>Analizando reproducciones...</span>
            </div>
            <div v-else-if="errorTop" class="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-25 text-center" role="alert">
              ⚠️ {{ errorTop }}
            </div>

            <div v-else class="table-responsive rounded border border-secondary border-opacity-50">
              <table class="table table-dark table-hover align-middle mb-0">
                <thead class="table-dark border-secondary text-uppercase fs-7 tracking-wider">
                  <tr>
                    <th class="p-3 text-center text-secondary fw-bold" style="width: 70px;">Puesto</th>
                    <th class="p-3 text-secondary fw-bold">Título del Contenido</th>
                    <th class="p-3 text-center text-secondary fw-bold">Categoría</th>
                    <th class="p-3 text-end text-secondary fw-bold">Reproducciones Totales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in datosTop" :key="index">
                    <td class="p-3 text-center fw-bold">
                      <span v-if="index === 0" class="fs-5">🥇</span>
                      <span v-else-if="index === 1" class="fs-5">🥈</span>
                      <span v-else-if="index === 2" class="fs-5">🥉</span>
                      <span v-else class="text-secondary small font-monospace">#{{ index + 1 }}</span>
                    </td>
                    <td class="p-3 fw-bold text-light">{{ item.tituloContenido }}</td>
                    <td class="p-3 text-center">
                      <span :class="item.categoria === 'Serie' ? 'bg-primary bg-opacity-10 text-primary border-primary' : 'bg-info bg-opacity-10 text-info border-info'" class="badge border bg-opacity-10 px-2.5 py-1.5 fw-semibold">
                        {{ item.categoria }}
                      </span>
                    </td>
                    <td class="p-3 text-end font-monospace text-danger fw-bold">
                      <span class="bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10 px-2 py-1 rounded">
                        🔥 {{ item.totalReproducciones?.toLocaleString() || 0 }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="datosTop.length === 0">
                    <td colspan="4" class="text-center p-4 text-secondary fst-italic">No se encontraron datos para "{{ ciudadSeleccionada }}"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios.js';

// --- ESTADOS SECCIÓN 1 (PLANES FINANCIEROS) ---
const datosPlanes = ref([]);
const cargandoPlanes = ref(false);
const errorPlanes = ref(null);
const mesSeleccionado = ref(new Date().getMonth() + 1); // Mes actual por defecto (1-12)
const anioSeleccionado = ref(new Date().getFullYear()); // Año actual por defecto

const listaAnios = ref([2024, 2025, 2026, 2027]);
const listaMeses = ref([
  { nombre: 'Enero', valor: 1 }, { nombre: 'Febrero', valor: 2 }, { nombre: 'Marzo', valor: 3 },
  { nombre: 'Abril', valor: 4 }, { nombre: 'Mayo', valor: 5 }, { nombre: 'Junio', valor: 6 },
  { nombre: 'Julio', valor: 7 }, { nombre: 'Agosto', valor: 8 }, { nombre: 'Septiembre', valor: 9 },
  { nombre: 'Octubre', valor: 10 }, { nombre: 'Noviembre', valor: 11 }, { nombre: 'Diciembre', valor: 12 }
]);

// --- ESTADOS SECCIÓN 2 (GÉNERO) ---
const generoSeleccionado = ref('Terror');
const listaGeneros = ref(['Terror', 'Acción', 'Comedia', 'Ciencia Ficción', 'Drama']);
const datosGenero = ref([]);
const cargandoGenero = ref(false);
const errorGenero = ref(null);

// --- ESTADOS SECCIÓN 3 (CIUDAD) ---
const ciudadSeleccionada = ref('Armenia');
const datosTop = ref([]);
const cargandoTop = ref(false);
const errorTop = ref(null);


// --- MÉTODO BACKEND SECCIÓN 1 (PLANES) ---
const cargarDatosPlanes = async () => {
  cargandoPlanes.value = true;
  errorPlanes.value = null;
  try {
    const response = await api.get(`/planes/ingresos-plan`, {
      params: { 
        mes: mesSeleccionado.value,
        anio: anioSeleccionado.value
      }
    });
    datosPlanes.value = response.data;
  } catch (error) {
    console.error(error);
    errorPlanes.value = "Error al conectar con la métrica financiera de planes.";
  } finally {
    cargandoPlanes.value = false;
  }
};

// --- MÉTODO BACKEND SECCIÓN 2 (GÉNERO) ---
const cargarPromediosPorGenero = async () => {
  cargandoGenero.value = true;
  errorGenero.value = null;
  try {
    const response = await api.get(`/calificaciones/promedio-por-genero`, {
      params: { genero: generoSeleccionado.value }
    });
    datosGenero.value = response.data;
  } catch (error) {
    errorGenero.value = "Error al conectar con las métricas de género.";
  } finally {
    cargandoGenero.value = false;
  }
};

// --- MÉTODO BACKEND SECCIÓN 3 (CIUDAD) ---
const cargarTopContenido = async () => {
  if (!ciudadSeleccionada.value.trim()) return;
  cargandoTop.value = true;
  errorTop.value = null;
  try {
    const response = await api.get(`/contenidos/top-contenido`, {
      params: { ciudad: ciudadSeleccionada.value.trim() }
    });
    datosTop.value = response.data;
  } catch (error) {
    errorTop.value = "Error al conectar con las reproducciones por ciudad.";
  } finally {
    cargandoTop.value = false;
  }
};

// Carga simultánea inicial
onMounted(() => {
  cargarDatosPlanes();
  cargarPromediosPorGenero();
  cargarTopContenido();
});
</script>

<style scoped>
/* Clases auxiliares para pulir detalles sutiles de la tipografía */
.tracking-wider { letter-spacing: 0.05em; }
.fs-7 { font-size: 0.8rem; }
</style>