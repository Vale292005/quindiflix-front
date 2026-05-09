import api from '../api/axios';

export const perfilService = {
  async obtenerPerfilesPorUsuario(usuarioId) {
    try {
      const response = await api.get(`/perfiles/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar los perfiles';
    }
  },

async crearPerfil(payload) {
    try {
      const response = await api.post('/perfiles', payload);
      return response.data;
    } catch (error) {
      console.error("Error en la petición POST /perfiles:", error.response?.data);
      throw error;
    }
  }
};