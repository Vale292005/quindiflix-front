import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css' // El CSS de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

axios.defaults.withCredentials = true;

const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount('#app')