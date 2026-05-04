import { defineStore } from 'pinia';
import { ref } from 'vue';
import { peliculaService } from '../services/peliculaService';
import { categoriaService } from '../services/categoriaService';

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
            // Hacemos ambas peticiones al tiempo para ganar velocidad
            const [dataPelis, dataCats] = await Promise.all([
                peliculaService.obtenerTodas(),
                categoriaService.obtenerTodas()
            ]);
            peliculas.value = dataPelis;
            categorias.value = dataCats;
        } finally {
            cargando.value = false;
        }
    }

    function filtrarPorCategoria(id) {
        categoriaSeleccionada.value = id;
    }
});