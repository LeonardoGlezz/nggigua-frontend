# Hablando Nggigua — Frontend

Interfaz web (React + Vite + Tailwind CSS) del videojuego educativo "Hablando Nggigua", para la enseñanza y preservación de la lengua indígena Nggigua. Incluye registro/login, cinco minijuegos, perfiles diferenciados por edad (Niño/Joven/Adulto), panel de administrador y modo oscuro.

Este frontend necesita el backend corriendo aparte: [nggigua-backend](https://github.com/LeonardoGlezz/nggigua-backend).

## Cómo ejecutar este proyecto en una computadora nueva

### Requisitos

- **Node.js 20 o superior** (se desarrolló con Node 22, y con Vite 8 / React 19, que ya no soportan versiones más viejas de Node). Descargar de [nodejs.org](https://nodejs.org).
- El backend ya corriendo en `http://localhost:3000` (ver el README de [nggigua-backend](https://github.com/LeonardoGlezz/nggigua-backend) — hay que dejarlo listo primero).

### 1. Clonar y instalar

```bash
git clone https://github.com/LeonardoGlezz/nggigua-frontend.git
cd nggigua-frontend
npm install
```

### 2. Variables de entorno (opcional)

Por defecto el frontend apunta a `http://localhost:3000/api`, que es donde corre el backend siguiendo su propio README. Si el backend corriera en otro puerto o dirección, crear un archivo `.env` en esta carpeta:

```
VITE_API_URL=http://localhost:3000/api
```

### 3. Levantar en modo desarrollo

```bash
npm run dev
```

Vite va a mostrar la URL local, normalmente `http://localhost:5173`. Abrir esa dirección en el navegador con el backend ya corriendo.

### Otros comandos

```bash
npm run build     # compila la versión de producción a la carpeta dist/
npm run preview   # sirve localmente esa versión ya compilada, para probarla
npm run lint      # revisa el código con ESLint
```
