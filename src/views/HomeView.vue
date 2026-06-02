<template>
  <div class="position-relative d-flex flex-column justify-content-center align-items-center text-center min-vh-100 bg-black overflow-hidden">
    
    <div class="netflix-background-mosaic position-absolute w-100 h-100"></div>
    
    <div class="netflix-overlay position-absolute w-100 h-100"></div>

    <div class="container position-relative z-3 px-4" style="max-width: 950px;">
      <h1 class="display-2 fw-black text-white mb-3 tracking-tight">
        Películas, series y analítica <br class="d-none d-md-inline" /> sin límite.
      </h1>
      <p class="fs-4 text-white mb-4 fw-normal">
        Administra contenidos, revisa tendencias por ciudad y controla ingresos.
      </p>
      <p class="fs-5 text-secondary mb-4">
        ¿Listo para gestionar el servidor? Ingresa con tu cuenta corporativa de empleado.
      </p>

      <div class="d-flex justify-content-center align-items-center mt-2">
        <router-link to="/login" class="btn btn-netflix-cta d-flex align-items-center justify-content-center gap-2 fw-bold shadow-lg" @click="irInicioSecion">
          Comenzar
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </router-link>
      </div>
    </div>

    <div class="position-absolute bottom-0 w-100" style="height: 120px; background: linear-gradient(to top, #141414, transparent);"></div>
  </div>
</template>
<script setup>
import router from '../router';

const irInicioSecion = () => {
  router.push('/login');
};
</script>
<style scoped>
.netflix-background-mosaic {
  background-image: url('https://assets.nflxext.com/ffe/siteui/vlv3/ca6a7616-0acb-4bc7-9325-cd1ef615c0da/web/CO-es-20240212-popsignuptwoweeks-perspective_alpha_website_large.jpg');
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
  filter: blur(1.5px) brightness(0.5);
}

.netflix-overlay {
  background: radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%),
              linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, #000000 100%);
}

.fw-black {
  font-weight: 900 !important;
  letter-spacing: -1px;
}

/* El icónico botón rojo con tamaño proporcional de Bootstrap */
.btn-netflix-cta {
  background-color: #e50914;
  color: #ffffff !important;
  font-size: 1.625rem;
  padding: 0.85rem 3.5rem;
  border-radius: 4px;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-netflix-cta:hover {
  background-color: #c11119;
}

@media (max-width: 576px) {
  .display-2 {
    font-size: 2.3rem !important;
  }
  .fs-4 {
    font-size: 1.15rem !important;
  }
  .btn-netflix-cta {
    font-size: 1.25rem;
    padding: 0.75rem 2rem;
    width: 100%;
  }
}
</style>