<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const loading = ref(true);

// --- ALMACENAMIENTO DE DATOS ANALÍTICOS (CUBOS BI) ---
const datosFinancieros = ref([]); // Data proveniente del UNPIVOT
const datosEquipo = ref([]);      // Data proveniente del PIVOT

// --- ESTADOS DE LOS FORMULARIOS DE CONSULTA ---
const filtroCiudad = ref('Armenia');
const usuariosPorCiudad = ref([]);
const loadingCiudad = ref(false);

const filtroCuentaId = ref('');
const historialTransacciones = ref([]);
const loadingTransacciones = ref(false);

const fechaInicio = ref('2026-01-01');
const fechaFin = ref('2026-05-31');
const controlTemporalData = ref([]);
const loadingTemporal = ref(false);

// Configuración de cabeceras seguras para el rol EMPLEADO
const getHeaders = () => {
  const token = localStorage.getItem('token'); // Recuperación del JWT de sesión si aplica
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

onMounted(async () => {
  try {
    // Carga de los bloques estáticos del cubo analítico de base de datos
    const resFinanciero = await axios.get('http://localhost:8080/api/admin/bi/financiero', getHeaders());
    datosFinancieros.value = resFinanciero.data;

    const resEquipo = await axios.get('http://localhost:8080/api/admin/bi/equipo', getHeaders());
    datosEquipo.value = resEquipo.data;

    // Ejecuciones basales automáticas
    await consultarUsuariosCiudad();
  } catch (error) {
    console.error("Error inicializando la consola analítica corporativa:", error);
  } finally {
    loading.value = false;
  }
});

// --- OPERACIÓN PARAMETRIZADA 1: FILTRADO POR LOCALIZACIÓN GEOGRÁFICA ---
const consultarUsuariosCiudad = async () => {
  if (!filtroCiudad.value.trim()) return;
  loadingCiudad.value = true;
  try {
    const res = await axios.get(`http://localhost:8080/api/admin/bi/usuarios-por-ciudad`, {
      params: { ciudad: filtroCiudad.value },
      ...getHeaders()
    });
    usuariosPorCiudad.value = res.data;
  } catch (error) {
    console.error("Error en barrido demográfico:", error);
  } finally {
    loadingCiudad.value = false;
  }
};

// --- OPERACIÓN PARAMETRIZADA 2: HISTORIAL DE TRANSACCIONES ---
const consultarHistorialCuentas = async () => {
  if (!filtroCuentaId.value) return;
  loadingTransacciones.value = true;
  try {
    const res = await axios.get(`http://localhost:8080/api/admin/bi/historial-transacciones`, {
      params: { idCuenta: filtroCuentaId.value },
      ...getHeaders()
    });
    historialTransacciones.value = res.data;
  } catch (error) {
    console.error("Error consultando historial de pagos:", error);
  } finally {
    loadingTransacciones.value = false;
  }
};

// --- OPERACIÓN PARAMETRIZADA 3: BARRIDO Y CONTROL TEMPORAL ---
const consultarRangoTemporal = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  loadingTemporal.value = true;
  console.log("Ejecutando consulta de control temporal con rango:", fechaInicio.value, "a", fechaFin.value);
  try {
    const res = await axios.get(`http://localhost:8080/api/admin/bi/control-temporal`, {
      params: { 
        fechaInicio: fechaInicio.value, 
        fechaFin: fechaFin.value 
      },
      ...getHeaders()
    });
    controlTemporalData.value = res.data;
  } catch (error) {
    console.error("Error en auditoría cronológica:", error);
  } finally {
    loadingTemporal.value = false;
  }
};
</script>

<template>
  <div class="bg-dark min-vh-100 text-white p-4 p-md-5">
    
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 border-bottom border-secondary border-opacity-25 pb-4">
      <div>
        <span class="badge bg-danger px-3 py-1 text-uppercase fw-bold mb-2">Módulo Gerencial (BI)</span>
        <h1 class="display-6 fw-extrabold m-0 tracking-tight text-white">Consola de Analítica e Inteligencia de Negocios</h1>
        <p class="text-white-50 m-0 mt-1">Nivel de Acceso: Restringido - Personal Corporativo Empleado</p>
      </div>
      <button class="btn btn-outline-danger px-4 fw-bold align-self-start align-self-md-center" @click="router.back()">
        <i class="bi bi-arrow-left me-2"></i>Salir del Panel
      </button>
    </div>

    <div v-if="loading" class="text-center my-5 py-5">
      <div class="spinner-border text-danger" style="width: 4rem; height: 4rem;"></div>
      <p class="text-white-50 mt-3 fw-bold">Compilando cubos de datos e índices multidimensionales Oracle...</p>
    </div>

    <div v-else class="row g-4">
      
      <div class="col-12 col-xl-6">
        <div class="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
          <h3 class="fs-4 fw-bold mb-3 text-danger"><i class="bi bi-phone-vibrate me-2"></i>Interacción por Canales Digitales (UNPIVOT)</h3>
          <p class="text-white-50 small mb-4">Transformación matricial de columnas de tráfico transaccional mapeadas directo desde el servidor.</p>
          <div class="table-responsive">
            <table class="table table-dark table-hover align-middle border-secondary m-0">
              <thead>
                <tr class="text-white-50 border-bottom border-secondary">
                  <th>Tipo Contenido</th>
                  <th>Plataforma Origen</th>
                  <th class="text-end">Interacciones Métricas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in datosFinancieros" :key="index">
                  <td><span class="badge bg-secondary px-2.5 py-1.5">{{ item.tipoContenido }}</span></td>
                  <td class="fw-bold text-info">{{ item.dispositivo }}</td>
                  <td class="text-end text-white fw-bold fs-5">{{ item.totalInteracciones }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-6">
        <div class="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
          <h3 class="fs-4 fw-bold mb-3 text-warning"><i class="bi bi-grid-3x3-gap-fill me-2"></i>Preferencias Cruzadas de Audiencia (PIVOT)</h3>
          <p class="text-white-50 small mb-4">Rotación dinámica relacional cruzando las interacciones transaccionales frente a tipos de perfil.</p>
          <div class="table-responsive">
            <table class="table table-dark table-hover align-middle border-secondary m-0">
              <thead>
                <tr class="text-white-50 border-bottom border-secondary">
                  <th>ID Categoría</th>
                  <th class="text-center">Perfil Adulto</th>
                  <th class="text-center">Perfil Infantil</th>
                  <th class="text-center">Perfil Empleado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in datosEquipo" :key="index">
                  <td class="fw-bold">Categoría #{{ item.idCategoria }}</td>
                  <td class="text-center text-success fw-bold">{{ item.perfilAdulto }}</td>
                  <td class="text-center text-info fw-bold">{{ item.perfilInfantil }}</td>
                  <td class="text-center text-warning fw-bold">{{ item.perfilEmpleado }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
          <h3 class="fs-4 fw-bold mb-2 text-white"><i class="bi bi-geo-alt-fill text-danger me-2"></i>Barrido Demográfico Dinámico</h3>
          <p class="text-white-50 small mb-3">Mapeo de usuarios activos por coincidencia de localización geográfica.</p>
          
          <div class="input-group mb-4 shadow">
            <input v-model="filtroCiudad" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Escriba la ciudad (ej: Armenia, Pereira)">
            <button class="btn btn-danger px-4" type="button" @click="consultarUsuariosCiudad" :disabled="loadingCiudad">
              <span v-if="loadingCiudad" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-search me-2"></i>Escanear
            </button>
          </div>

          <div class="table-responsive" style="max-height: 250px;">
            <table class="table table-dark table-sm table-hover border-secondary m-0">
              <thead class="sticky-top bg-dark">
                <tr class="text-white-50">
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th>Plan</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, index) in usuariosPorCiudad" :key="index">
                  <td class="small">{{ u.NOMBRE_COMPLETO }}</td>
                  <td class="small text-white-50">{{ u.CORREO_ELECTRONICO }}</td>
                  <td><span class="badge bg-primary btn-sm">{{ u.NOMBRE_PLAN }}</span></td>
                  <td>
                    <span class="badge" :class="u.ESTADO_SERVICIO === 'Activo' ? 'bg-success' : 'bg-danger'">{{ u.ESTADO_SERVICIO }}</span>
                  </td>
                </tr>
                <tr v-if="usuariosPorCiudad.length === 0">
                  <td colspan="4" class="text-center py-4 text-white-50">No hay registros cargados para esta localización.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
          <h3 class="fs-4 fw-bold mb-2 text-white"><i class="bi bi-credit-card-2-front-fill text-success me-2"></i>Auditoría Financiera de Cuentas</h3>
          <p class="text-white-50 small mb-3">Rastreo e historial de transacciones bancarias indexadas por ID de Cuenta.</p>
          
          <div class="input-group mb-4 shadow">
            <input v-model="filtroCuentaId" type="number" class="form-control bg-dark text-white border-secondary" placeholder="Ingrese ID de la Cuenta Corporativa">
            <button class="btn btn-success px-4" type="button" @click="consultarHistorialCuentas" :disabled="loadingTransacciones">
              <span v-if="loadingTransacciones" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-shield-lock-fill me-2"></i>Auditar Pagos
            </button>
          </div>

          <div class="table-responsive" style="max-height: 250px;">
            <table class="table table-dark table-sm table-hover border-secondary m-0">
              <thead class="sticky-top bg-dark">
                <tr class="text-white-50">
                  <th>ID Pago</th>
                  <th>Monto Recaudado</th>
                  <th>Fecha Transacción</th>
                  <th>Estado Banco</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(t, index) in historialTransacciones" :key="index">
                  <td>#{{ t.ID_PAGO }}</td>
                  <td class="fw-bold text-success">${{ t.MONTO }}</td>
                  <td class="small">{{ t.FECHA_PAGO }}</td>
                  <td>
                    <span class="badge" :class="t.ESTADO_PAGO === 'Aprobado' ? 'bg-success' : 'bg-danger'">{{ t.ESTADO_PAGO }}</span>
                  </td>
                </tr>
                <tr v-if="historialTransacciones.length === 0">
                  <td colspan="4" class="text-center py-4 text-white-50">Ninguna cuenta ha sido auditada en este ciclo.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 p-4">
          <h3 class="fs-4 fw-bold mb-2 text-info"><i class="bi bi-calendar-range-fill me-2"></i>Control de Tráfico y Trazabilidad Cronológica</h3>
          <p class="text-white-50 small mb-4">Barrido de telemetría de streaming ejecutando segmentación física sobre rangos de fecha nativos en disco.</p>
          
          <div class="row g-3 align-items-end mb-4">
            <div class="col-12 col-sm-5 col-md-4">
              <label class="form-label text-white-50 small fw-bold">Fecha Límite Inferior</label>
              <input v-model="fechaInicio" type="date" class="form-control bg-dark text-white border-secondary">
            </div>
            <div class="col-12 col-sm-5 col-md-4">
              <label class="form-label text-white-50 small fw-bold">Fecha Límite Superior</label>
              <input v-model="fechaFin" type="date" class="form-control bg-dark text-white border-secondary">
            </div>
            <div class="col-12 col-sm-2 col-md-4">
              <button class="btn btn-info text-dark fw-bold px-4 w-100 py-2 shadow" type="button" @click="consultarRangoTemporal" :disabled="loadingTemporal">
                <span v-if="loadingTemporal" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-lightning-charge-fill me-2"></i>Ejecutar Filtro Temporal
              </button>
            </div>
          </div>

          <div class="table-responsive" style="max-height: 300px;">
            <table class="table table-dark table-hover align-middle border-secondary m-0">
              <thead class="sticky-top bg-dark">
                <tr class="text-white-50">
                  <th>ID Streaming</th>
                  <th>Perfil Consumidor</th>
                  <th>Contenido Audiovisual</th>
                  <th>Estampa de Tiempo (Oracle Timestamp)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, index) in controlTemporalData" :key="index">
                  <td class="text-white-50">#{{ r.ID_REPRODUCCION }}</td>
                  <td class="fw-bold text-info">{{ r.NOMBRE_PERFIL }}</td>
                  <td class="text-white fw-medium">{{ r.TITULO }}</td>
                  <td class="small text-warning">{{ r.FECHA_REPRODUCCION }}</td>
                </tr>
                <tr v-if="controlTemporalData.length === 0">
                  <td colspan="4" class="text-center py-4 text-white-50">Modifique el rango cronológico superior e inferior para consultar las particiones.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Estilización corporativa para simular una consola de alto rendimiento */
.card {
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 8px 24px rgba(220, 53, 69, 0.05);
}
.table-responsive {
  scrollbar-width: thin;
  scrollbar-color: #495057 #212529;
}
.sticky-top {
  z-index: 2;
}
</style>