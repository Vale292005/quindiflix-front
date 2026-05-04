import { useAuthStore } from "../stores/auth";
import api from './api/axios';

export const authService = {
    async registrar (datosUsuario){
        try{
            const response = await api.post('/usuarios/registro', datosUsuario);
            return response.data;
        }catch(error){
            throw error.response?.data?.message || 'Error en el registro';
        }
    },
    async login (credenciales){
        try{
            const response = await api.post('/usuarios/login', credenciales);
            const authStore = useAuthStore();

            if(response.data.token){
                authStore.guardarSesion(response.data.token, response.data.usuario);
            }
            return response.data;
        }catch(error){
            throw error.response?.data?.message || 'Error de autenticación';
        }
    }
}