import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true
});

export const useCuentaStore = defineStore('cuenta', () => {

    const cuenta = ref(null);
    const cargando = ref(false);

    const cuentaGuardada = localStorage.getItem('cuenta_activa');
    if (cuentaGuardada) {
        cuenta.value = JSON.parse(cuentaGuardada);
    }

    const idCuentaActiva = computed(() => cuenta.value?.idCuenta || cuenta.value?.id_cuenta || null);

    async function cargarCuentaUsuario() {
        const authStore = useAuthStore();
        const usuarioId = authStore.usuario?.idUsuario;

        cuenta.value = null;

        if (!usuarioId) {
            console.warn("No hay un usuario en sesión para cargar la cuenta");
            return;
        }

        cargando.value = true;
        try {
            // Llamamos al endpoint de cuenta filtrando por el ID del usuario
            const response = await api.get(`/cuentas/usuario/${usuarioId}`);

            const datosCuenta = Array.isArray(response.data) ? response.data[0] : response.data;

            cuenta.value = datosCuenta;
            localStorage.setItem('cuenta_activa', JSON.stringify(datosCuenta));

            return datosCuenta;
        } catch (error) {
            console.error("Error al obtener la cuenta del usuario:", error);
            throw error;
        } finally {
            cargando.value = false;
        }
    }

    function limpiarCuenta() {
        cuenta.value = null;
        localStorage.removeItem('cuenta_activa');
    }

    return {
        cuenta,
        idCuentaActiva,
        cargando,
        cargarCuentaUsuario,
        limpiarCuenta
    };
});