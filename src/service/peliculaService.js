import api from '../api/axios';

export const peliculaService = {
  // Obtener todo el catálogo
  async obtenerTodas() {
    try {
      const response = await api.get('/peliculas');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar el catálogo';
    }
  },

  // Obtener películas de una categoría específica
  async obtenerPorCategoria(categoriaId) {
    try {
      const response = await api.get(`/peliculas/categoria/${categoriaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al filtrar películas';
    }
  },

  // Buscar película por nombre
  async buscar(query) {
    try {
      const response = await api.get(`/peliculas/buscar?nombre=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error en la búsqueda';
    }
  }
};