import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { peliculaService } from '../service/peliculaService';
import { categoriaService } from '../service/categoriaService';

export const useContentStore = defineStore('content', () => {
    const peliculas = ref([]);
    const categorias = ref([]);
    const cargando = ref(false);
    const categoriaSeleccionada = ref(null);

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

    return {
        peliculas,
        categorias,
        cargando,
        categoriaSeleccionada,
        peliculasFiltradas,
        cargarTodoElContenido,
        filtrarPorCategoria
    };
});