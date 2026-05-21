import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useCuentaStore } from './cuentaStore';

axios.defaults.withCredentials = true;

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref(null);
    localStorage.clear();

    const userInit = localStorage.getItem('usuario')
    if (userInit && userInit !== "undefined" && userInit !== "null") {
        try {
            usuario.value = JSON.parse(userInit)
        } catch (e) {
            console.error("Error al cargar usuario inicial", e)
        }
    }

    const estaAutenticado = computed(() => !!usuario.value)

    function guardarSesion(datosUsuario) {
        usuario.value = datosUsuario;
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    }

async function iniciarSesionEmpleado(email, password) {
        try {
            // 1. Limpieza preventiva total de cualquier sesión previa usando refs directas
            localStorage.clear();
            usuario.value = null;   // 🌟 CORREGIDO: Se quitó 'this'
            perfiles.value = [];    // 🌟 CORREGIDO: Se quitó 'this'

            // El backend para empleados recibe un JSON plano de clave-valor
            const payload = {
                correo: email,
                password: password
            };

            console.log("🚀 Enviando payload de Empleado...", payload);

            // Apuntamos al nuevo endpoint aislado que creamos en Spring Boot
            const respuesta = await axios.post('http://localhost:8080/api/auth/login-empleado', payload);
            const empleado = respuesta.data;

            console.log("👋 Empleado autenticado con éxito:", empleado.nombre);

            // 2. Creamos un perfil virtual/ficticio de Empleado para que el Dashboard lo reconozca
            const perfilEmpleado = {
                nombre: empleado.nombre,
                tipoPerfil: 'Empleado', // 🎯 Activa automáticamente el v-if del Panel de Control en el Dashboard
                avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
            };

            // 3. Guardamos en el localStorage para mantener la persistencia
            localStorage.setItem('perfil_activo', JSON.stringify(perfilEmpleado));

            // 🌟 CORREGIDO: Guardamos usando .value para mantener la reactividad de Vue 3
            usuario.value = empleado;
            localStorage.setItem('usuario', JSON.stringify(empleado));

            return empleado;
        } catch (error) {
            console.error("❌ Error en el proceso de login de Empleado:", error);
            throw error;
        }
    }

    async function iniciarSesion(email, password) {
        try {
            localStorage.clear();
            localStorage.removeItem('usuario');
            localStorage.removeItem('perfil_activo');
            this.usuario = null; // Limpia el estado de Pinia también
            this.perfiles = [];

            const payload = {
                datosUsuario: {
                    idUsuario: 0,
                    nombreCompleto: "",
                    correoElectronico: email,
                    telefono: "",
                    fechaNacimiento: "2026-05-03",
                    ciudadResidencia: "",
                    esEmpleado: false
                },
                password: password
            };

            console.log("1. Enviando payload (Cookies Mode)...", payload);

            const respuesta = await axios.post('http://localhost:8080/api/auth/login', payload);

            console.log("ID recibido del servidor:", respuesta.data.idUsuario);

            const datosCompletos = respuesta.data;

            guardarSesion(datosCompletos);

            return respuesta.data;
        } catch (error) {
            console.error("Error en el proceso de login del Store:", error);
            throw error;
        }
    }

    async function cerrarSesion() {
        const cuentaStore = useCuentaStore();
        try {
            await axios.post('http://localhost:8080/api/auth/logout');
        } catch (error) {
            console.warn("El servidor no pudo invalidar la cookie, limpiando local...");
        } finally {
            // Siempre limpiamos el local aunque el server falle
            usuario.value = null;
            perfiles.value = [];
            cuentaStore.limpiarCuenta();
            localStorage.removeItem('usuario');
            localStorage.removeItem('perfil_activo');
            localStorage.removeItem('cuenta_activa');
        }
    }

    const perfiles = ref([])

    async function cargarPerfiles() {
        const cuentaStore = useCuentaStore();
        try {
            const respuesta = await axios.get(`http://localhost:8080/api/perfiles/cuenta/${cuentaStore.idCuentaActiva}`);
            perfiles.value = respuesta.data;
            return respuesta.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`El usuario ${usuario.value.idUsuario} no tiene perfiles creados aún. Inicializando vacío.`);
                perfiles.value = [];
                return [];
            }
            console.error("Error cargando perfiles:", error);
            throw error;
        }
    }

    async function crearPerfil(nuevoPerfil) {
        try {
            const response = await axios.post('http://localhost:8080/api/perfiles', nuevoPerfil);
            await cargarPerfiles();
            return response.data;
        } catch (error) {
            console.error("Error al crear perfil:", error);
            throw error;
        }
    }

    return {
        usuario,
        perfiles,
        estaAutenticado,
        iniciarSesion,
        iniciarSesionEmpleado,
        cerrarSesion,
        cargarPerfiles,
        crearPerfil
    }
})