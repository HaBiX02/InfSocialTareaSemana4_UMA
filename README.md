# Mapa Interactivo de España

Aplicación web que visualiza un mapa interactivo de las Comunidades Autónomas de España. Al seleccionar una región, se muestra dinámicamente su bandera e información relevante obtenida de Wikipedia o archivos locales.

## 🚀 Características

*   **Interactivo**: Renderizado con **D3.js**.
*   **Dinámico**: Carga de información e imágenes vía **AJAX** (con fallback a la API de Wikipedia).
*   **Responsive**: Diseño adaptable a móviles y escritorio.
*   **Accesible**: Alto contraste y navegación clara.

## �️ Tecnologías

*   HTML5 / CSS3 (Diseño moderno y responsive)
*   JavaScript (ES6+)
*   D3.js (Visualización de datos geográficos)

## � Instalación y Uso

Debido al uso de peticiones AJAX, **es necesario ejecutar el proyecto en un servidor local** para evitar bloqueos por políticas CORS.

### Opción rápida con Python:

```bash
python3 -m http.server
```

Accede desde tu navegador a: `http://localhost:8000`

---
**Realizado por:** Javier Carmona Gálvez (Febrero 2026)
