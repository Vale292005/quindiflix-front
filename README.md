# 🎬 QUINDIFLIX - Frontend (Streaming & Consola Analítica BI)

¡Bienvenido al repositorio **Frontend** de [QUINDIFLIX](https://github.com/Vale292005/quindiflix-front)! Esta es una SPA (Single Page Application) reactiva que combina una plataforma de streaming inspirada en la interfaz de Netflix con un **Panel Analítico de Business Intelligence (BI)** para el monitoreo transaccional.

---

## 🚀 Tecnologías Utilizadas

- **Framework Frontend:** [Vue 3](https://vuejs.org/) (Composition API / `<script setup>`)[cite: 2]
- **Gestión de Estado Global:** [Pinia](https://pinia.vuejs.org/)[cite: 2]
- **Cliente HTTP:** [Axios](https://axios-http.com/)[cite: 2]
- **Estilos & UI:** Bootstrap 5 / Utilidades tipo Tailwind para diseño oscuro estilo Netflix[cite: 1]
- **Herramienta de Construcción:** [Vite](https://vitejs.dev/)[cite: 2]
- **Enrutamiento:** Vue Router[cite: 2]
- **Backend Integrado:** Java, Spring Boot 3, Spring JDBC (JdbcTemplate), HikariCP y **Oracle Database** (Procedimientos Almacenados, Triggers, Vistas y Auditorías SQL)[cite: 2].

---

## ✨ Características Principales

- **Interfaz Estilo Netflix:** Diseño visual en modo oscuro con utilidades avanzadas de CSS/Bootstrap para una experiencia inmersiva de streaming[cite: 1].
- **Panel Analítico & Consola BI:**
  - Tablero interactivo para el reporte de métricas transaccionales[cite: 2].
  - Consumo directo de datos procesados mediante *Stored Procedures*, *Triggers* y vistas en Oracle DB[cite: 2].
- **Control de Estado:** Gestión centralizada de sesiones, catálogo de contenido y consultas analíticas mediante Pinia[cite: 2].
- **Consultas Seguras:** Integración con backend en Spring Boot optimizado contra inyecciones SQL mediante consultas parametrizadas[cite: 2].

---

## 🏛️ Persistencia & Auditoría (Oracle DB)

La interfaz se comunica con endpoints respaldados por una infraestructura sólida en Oracle DB:
- **Procedimientos Almacenados & Triggers:** Lógica de negocio y auditoría automática ejecutada directamente en el motor de datos[cite: 2].
- **Vista de Consultas SQL:** Módulo habilitado para inspeccionar y visualizar reportes dinámicos generados por la base de datos[cite: 2].

---

## 🛠️ Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/)
- Backend de **Quindiflix** en ejecución[cite: 2]

---

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/Vale292005/quindiflix-front.git](https://github.com/Vale292005/quindiflix-front.git)
   cd quindiflix-front
