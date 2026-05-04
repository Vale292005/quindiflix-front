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

  async crearPerfil(datosPerfil) {
    try {
      const response = await api.post('/perfiles', datosPerfil);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'No se pudo crear el perfil';
    }
  }
};