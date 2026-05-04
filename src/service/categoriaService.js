import api from '../api/axios';

export const categoriaService = {
  async obtenerTodas() {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar categorías';
    }
  }
};