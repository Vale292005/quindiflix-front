import api from '../api/axios';

export const usuarioService = {
  async listarTodos() {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'No se pudo obtener la lista de usuarios';
    }
  },

  async obtenerPorId(id) {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Usuario no encontrado';
    }
  }
};