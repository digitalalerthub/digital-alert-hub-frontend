# Digital Alert Hub - Frontend

Plataforma web para gestion y visualizacion de alertas en tiempo real. Esta aplicacion esta construida con React, TypeScript y Vite, e integra autenticacion con Google, panel administrativo, gestion de alertas y modulo de reportes.

## Caracteristicas principales

- Autenticacion con Google OAuth 2.0
- Gestion de perfil de usuario
- Creacion, visualizacion y seguimiento de alertas
- Dashboard administrativo
- Modulo de reportes con filtros, graficas y mapa
- Roles y permisos
- Recuperacion de contrasena
- Interfaz responsive
- Manejo de estado global con Context API

## Requisitos previos

- Node.js 18 o superior
- npm
- Backend ejecutandose en `http://localhost:4000`
- Credenciales de Google OAuth

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/digitalalerthub/digital-alert-hub-frontend.git
cd digital-alert-hub-frontend
git checkout dev
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` con una configuracion similar a esta:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
VITE_RECAPTCHA_SITE_KEY=tu_site_key_de_recaptcha
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Ejecutar el proyecto

### Desarrollo

```bash
npm run dev
```

La aplicacion quedara disponible en `http://localhost:5173`.

### Compilar para produccion

```bash
npm run build
```

### Vista previa de produccion

```bash
npm run preview
```

## Stack principal

| Dependencia | Version | Uso |
| --- | --- | --- |
| react | ^19.2.0 | UI |
| react-dom | ^19.2.0 | Renderizado |
| react-router-dom | ^7.9.5 | Ruteo |
| typescript | ~5.8.3 | Tipado |
| vite | ^7.1.7 | Build y dev server |
| axios | ^1.13.2 | Cliente HTTP |
| recharts | ^3.8.0 | Graficas |
| @react-oauth/google | ^0.12.2 | Login con Google |
| react-toastify | ^11.0.5 | Notificaciones |
| bootstrap | ^5.3.8 | Base visual |
| bootstrap-icons | ^1.13.1 | Iconografia |

## Estructura del proyecto

```text
src/
  components/   Componentes reutilizables
  config/       Configuracion de integraciones
  context/      Contextos globales
  hooks/        Hooks reutilizables
  pages/        Pantallas principales
  services/     Clientes HTTP y servicios
  types/        Tipos TypeScript
  App.tsx       Componente raiz
  main.tsx      Punto de entrada
```

## Rutas principales

| Ruta | Descripcion |
| --- | --- |
| `/` | Inicio |
| `/login` | Inicio de sesion |
| `/register` | Registro |
| `/callback` | Retorno de OAuth |
| `/dashboard` | Panel principal |
| `/profile` | Perfil |
| `/reportes` | Reportes |
| `/crear-alertas` | Gestion y creacion de alertas |

## Conexion con backend

El frontend consume la API del backend mediante `VITE_API_URL`.

Puntos clave:

- Axios base en `src/services/api.ts`
- Token JWT enviado en `Authorization: Bearer <token>`
- Integracion con autenticacion de Google
- Integracion con Google Maps para mapas y geocodificacion

## Notas

- Para login con Google debes configurar correctamente el `VITE_GOOGLE_CLIENT_ID`.
- Para mapas y geocodificacion debes configurar `VITE_GOOGLE_MAPS_API_KEY`.
- El backend debe estar disponible antes de levantar el frontend.

## Contribucion

1. Crear una rama desde `dev`
2. Realizar cambios y commits
3. Subir la rama al remoto
4. Abrir Pull Request hacia `dev`

## Licencia

Proyecto academico SENA - Digital Alert Hub.
