import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

axios.defaults.withCredentials = true;

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref(null);

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

    async function iniciarSesion(email, password) {
        try {
            const payload = {
                datosUsuario: {
                    idUsuario: 0,
                    nombreCompleto: "",
                    correoElectronico: email,
                    telefono: "",
                    fechaNacimiento: "2026-05-03",
                    ciudadResidencia: ""
                },
                password: password
            };

            console.log("1. Enviando payload (Cookies Mode)...", payload);

            const respuesta = await axios.post('http://localhost:8080/api/auth/login', payload);

            const datosCompletos = respuesta.data;

            guardarSesion(datosCompletos);

            return respuesta.data;
        } catch (error) {
            console.error("Error en el proceso de login del Store:", error);
            throw error;
        }
    }

    async function cerrarSesion() {
        try {
            await axios.post('http://localhost:8080/api/auth/logout');
        } catch (error) {
            console.warn("El servidor no pudo invalidar la cookie, limpiando local...");
        } finally {
            // Siempre limpiamos el local aunque el server falle
            usuario.value = null;
            perfiles.value = [];
            localStorage.removeItem('usuario');
            localStorage.removeItem('perfil_activo');
        }
    }

    const perfiles = ref([])

    async function cargarPerfiles() {
        try {
            const respuesta = await axios.get('http://localhost:8080/api/perfiles');
            perfiles.value = respuesta.data;
            return respuesta.data;
        } catch (error) {
            console.error("Error cargando perfiles:", error);
            throw error;
        }
    }

    async function crearPerfil(nuevoPerfil){
        try{
            const response = await axios.post('http://localhost:8080/api/perfiles', nuevoPerfil);
            await cargarPerfiles();
            return response.data;
        }catch(error){
            console.error("Error al crear perfil:", error);
            throw error;
        }
    }

    return {
        usuario,
        perfiles,
        estaAutenticado,
        iniciarSesion,
        cerrarSesion,
        cargarPerfiles,
        crearPerfil
    }
})