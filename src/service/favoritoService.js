import api from '../api/axios';

export const favoritoService = {
  async obtenerFavoritos(perfilId) {
    try {
      const response = await api.get(`/favoritos/perfil/${perfilId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener favoritos';
    }
  },

  async agregar(perfilId, peliculaId) {
    return await api.post('/favoritos', { perfilId, peliculaId });
  },

  async eliminar(favoritoId) {
    return await api.delete(`/favoritos/${favoritoId}`);
  }
};