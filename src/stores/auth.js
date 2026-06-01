import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useCuentaStore } from './cuentaStore';

// Configuración global crítica para el envío automático de cookies de sesión
axios.defaults.withCredentials = true;

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref(null);
    const perfiles = ref([]);

    // Cargar sesión inicial al refrescar pantalla de manera segura
    const userInit = localStorage.getItem('usuario')
    if (userInit && userInit !== "undefined" && userInit !== "null") {
        try {
            usuario.value = JSON.parse(userInit)
        } catch (e) {
            console.error("Error al cargar usuario inicial", e)
        }
    }

    const estaAutenticado = computed(() => !!usuario.value)

    // Método centralizado para guardar la sesión en el estado y LocalStorage
    function guardarSesion(datosUsuario) {
        usuario.value = datosUsuario;
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    }

    async function iniciarSesionEmpleado(email, password) {
        try {
            localStorage.clear();
            usuario.value = null;
            perfiles.value = [];

            const payload = { correo: email, password: password };
            const respuesta = await axios.post('http://localhost:8080/api/auth/login-empleado', payload);
            const empleado = respuesta.data;

            const token = empleado.token || respuesta.data.token;
            let deptoId = null;

            if (token) {
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log("🔑 Token JWT corporativo obtenido.");

                // 🔥 LA MAGIA: Desencriptar la parte central (Payload) del JWT en JavaScript puro
                try {
                    const base64Url = token.split('.')[1]; // Agarramos los Claims del token
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const tokenData = JSON.parse(jsonPayload);
                    console.log("🎯 Datos dentro del JWT descifrado:", tokenData);

                    // Sacamos el idDepartamento que metiste en el Claims del backend
                    deptoId = tokenData.idDepartamento || tokenData.id_departamento;
                } catch (e) {
                    console.error("❌ Error leyendo los claims del JWT:", e);
                }
            }

            // Si logramos sacar el ID del token lo usamos; si falló por completo, dejamos un fallback defensivo
            const deptoFinal = deptoId !== null && deptoId !== undefined ? Number(deptoId) : 1;
            console.log("🏢 Departamento detectado final:", deptoFinal);

            // 2. Creamos el perfil incluyendo el ID real obtenido del JWT
            const perfilEmpleado = {
                nombre: empleado.nombre || empleado.nombreCompleto || 'Admin',
                tipoPerfil: 'Empleado',
                avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
                idDepartamento: deptoFinal
            };

            localStorage.setItem('perfil_activo', JSON.stringify(perfilEmpleado));

            empleado.idDepartamento = deptoFinal;
            guardarSesion(empleado);

            return empleado;
        } catch (error) {
            console.error("❌ Error en el proceso de login de Empleado:", error);
            throw error;
        }
    }
    async function iniciarSesion(email, password) {
        try {
            localStorage.clear();
            usuario.value = null;
            perfiles.value = [];

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

            console.log("1. Enviando payload Cliente (Cookies Mode)...", payload);

            const respuesta = await axios.post('http://localhost:8080/api/auth/login', payload);
            const datosCompletos = respuesta.data;

            guardarSesion(datosCompletos);

            return datosCompletos;
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
            usuario.value = null;
            perfiles.value = [];
            cuentaStore.limpiarCuenta();
            localStorage.clear();
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    async function cargarPerfiles() {
        const cuentaStore = useCuentaStore();
        try {
            const respuesta = await axios.get(`http://localhost:8080/api/perfiles/cuenta/${cuentaStore.idCuentaActiva}`);
            perfiles.value = respuesta.data;
            return respuesta.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`El usuario no tiene perfiles creados aún. Inicializando vacío.`);
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