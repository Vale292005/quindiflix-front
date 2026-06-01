import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { peliculaService } from '../service/peliculaService';
import { categoriaService } from '../service/categoriaService';

export const useContentStore = defineStore('content', () => {
    const peliculas = ref([]);
    const categorias = ref([]);
    const cargando = ref(false);
    const categoriaSeleccionada = ref(null);
    const error = ref(null);

    const peliculasFiltradas = computed(() => {
        if (!categoriaSeleccionada.value) {
            return peliculas.value; // Si no hay selección, muestra todasx
        }
        return peliculas.value.filter(p => p.categoriaId === categoriaSeleccionada.value);
    });

    async function cargarTodoElContenido() {
        cargando.value = true;
        try {
            const [dataPelis, dataCats] = await Promise.all([
                peliculaService.obtenerTodas(),
                categoriaService.obtenerTodas()
            ]);
            

            if (!dataPelis) throw new Error("Servicio de películas devolvió undefined");

            peliculas.value = dataPelis;
            categorias.value = dataCats;
        } catch (e) {
            console.error("Error dentro del store:", e);
        } finally {
            cargando.value = false;
        }
    }

    function filtrarPorCategoria(id) {
        categoriaSeleccionada.value = id;
    }

    async function crearPelicula(nuevoContenidoDTO) {
        error.value = null;
        try {
            const response = await peliculaService.crear(nuevoContenidoDTO);
            peliculas.value.push(response.data);
            return response.data;
        } catch (e) {
            console.error("Error al crear película:", e);
            error.value = e;
            throw e;
        }
    }

    async function actualizarPelicula(id, contenidoDTO) {
        error.value = null;
        try {
            const response = await peliculaService.actualizarPelicula(id, contenidoDTO);
            const index = peliculas.value.findIndex(p => p.id === id);
            if (index !== -1) {
                peliculas.value[index] = response.data;
            }
            return response.data;
        } catch (e) {
            console.error("Error al actualizar película:", e);
            error.value = e;
            throw e;
        }
    };

    async function eliminarPelicula(id) {
        error.value = null;
        try {
            await peliculaService.eliminarPelicula(id);
            peliculas.value = peliculas.value.filter(p => p.id !== id);
        } catch (e) {
            console.error("Error al eliminar película:", e);
            error.value = e;
            throw e;
        }

    }

    return {
        peliculas,
        categorias,
        cargando,
        categoriaSeleccionada,
        peliculasFiltradas,
        cargarTodoElContenido,
        filtrarPorCategoria,
        crearPelicula,
        actualizarPelicula,
        eliminarPelicula,
        error
    };
});