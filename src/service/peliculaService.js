import api from '../api/axios';

const API_BASE_URL = '/contenidos';

export const peliculaService = {
  async obtenerTodas() {
    try {
      const response = await api.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar el catálogo';
    }
  },

  async crear(contenidoDTO) {
    const response = await api.post(`${API_BASE_URL}`, contenidoDTO);
    return response.data;
  },

  async actualizarPelicula(id, contenidoDTO) {
    const response = await api.put(`${API_BASE_URL}/${id}`, contenidoDTO);
    return response.data;
  },
  async eliminarPelicula(id) {
    const response = await api.delete(`${API_BASE_URL}/${id}`);
    return response.data;
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
      const response = await api.get(`/peliculas/buscar?nombre=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error en la búsqueda';
    }
  }
};