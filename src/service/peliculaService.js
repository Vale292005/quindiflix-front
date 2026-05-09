import api from '../api/axios';

export const peliculaService = {
  async obtenerTodas() {
    try {
      const response = await api.get('http://localhost:8080/api/contenidos');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar el catálogo';
    }
  },

  // Obtener películas de una categoría específica
  async obtenerPorCategoria(categoriaId) {
    try {
      const response = await api.get(`http://localhost:8080/peliculas/categoria/${categoriaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al filtrar películas';
    }
  },

  // Buscar película por nombre
  async buscar(query) {
    try {
      const response = await api.get(`http://localhost:8080/peliculas/buscar?nombre=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error en la búsqueda';
    }
  }
};