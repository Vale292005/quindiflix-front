import api from '../api/axios';

export const categoriaService = {
  async obtenerTodas() {
    try {
      const response = await api.get('http://localhost:8080/api/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar categorías';
    }
  }
};