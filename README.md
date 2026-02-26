# Digital Alert Hub - Frontend

Plataforma web para gestión y visualización de alertas en tiempo real. Desarrollada con **React**, **TypeScript** y **Vite** con autenticación OAuth 2.0 de Google y arquitectura modular escalable.

## 🚀 Características principales

- ✅ Autenticación con Google OAuth 2.0
- ✅ Gestión de perfil de usuario
- ✅ Creación y visualización de alertas en tiempo real
- ✅ Dashboard administrativo con estadísticas
- ✅ Roles y permisos (usuario regular vs administrador)
- ✅ Recuperación de contraseña
- ✅ Interfaz responsive con CSS modular
- ✅ Context API para gestión de estado global

---

## 📋 Requisitos Previos

- **Node.js** 18+ instalado
- **npm** o **yarn** como gestor de paquetes
- **Backend** ejecutándose en `http://localhost:4000`
- Cuenta de Google para OAuth 2.0

---

## ⚙️ Instalación y Configuración

### 1. **Clonar el repositorio**

```bash
git clone https://github.com/digitalalerthub/digital-alert-hub-frontend.git
cd digital-alert-hub-frontend
git checkout dev
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Configurar variables de entorno (.env)**

Crea archivo `.env` en la raiz del proyecto:

```env
# Frontend
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

Obtén el `VITE_GOOGLE_CLIENT_ID` de [Google Cloud Console](https://console.developers.google.com).

---

## 🎯 Dependencias Principales

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| **React** | ^18.3.1 | Biblioteca UI declarativa |
| **React Router DOM** | ^6.28.0 | Enrutamiento de páginas |
| **TypeScript** | ^5.6.3 | Tipado estático |
| **Axios** | ^1.7.9 | Cliente HTTP para peticiones API |
| **@react-oauth/google** | ^0.12.1 | Integración Google OAuth 2.0 |
| **jwt-decode** | ^4.0.0 | Decodificación de JWT tokens |
| **Vite** | ^6.0.3 | Bundler y dev server rápido |

### Dependencias de Desarrollo

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| **@vitejs/plugin-react** | ^4.3.1 | Plugin React para Vite con HMR |
| **eslint** | ^9.15.0 | Linter de código |
| **typescript** | ^5.6.3 | Compilador TypeScript |
| **@types/react** | ^18.3.12 | Tipos TypeScript para React |
| **@types/react-dom** | ^18.3.1 | Tipos TypeScript para React DOM |

---

## 🏃 Ejecutar el proyecto

### Desarrollo con auto-reload (HMR)

```bash
npm run dev
```

Accede a `http://localhost:5173`

### Compilar para producción

```bash
npm run build
```

### Vista previa de producción

```bash
npm run preview
```

---

## 📁 Estructura de Carpetas

```
src/
├── components/           # Componentes reutilizables
│   ├── About/           # Sección Quiénes Somos
│   ├── Admin/           # Panel administrativo
│   ├── Alert/           # Componentes de alertas
│   ├── Auth/            # Componentes de autenticación
│   ├── Contact/         # Formulario de contacto
│   ├── Home/            # Componentes de inicio
│   ├── Layout/          # Navegación, footer, estructura
│   ├── Profile/         # Edición de perfil
│   └── Route/           # Rutas protegidas
├── context/             # Context API (AuthContext)
├── hooks/               # Custom hooks (useAuth, useHideOnScroll)
├── pages/               # Páginas principales
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── CreateAlertPage.tsx
│   ├── AlertDetailPage.tsx
│   ├── ProfilePage.tsx
│   ├── QuienesSomosPage.tsx
│   ├── ContactoPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── Callback.tsx        # OAuth callback handler
│   └── NotFoundPage.tsx
├── services/            # Servicios API (axios)
│   ├── api.ts           # Configuración base Axios
│   ├── profileService.ts
│   ├── rolesService.ts
│   └── users.ts
├── config/              # Configuración
│   └── google.ts        # Config Google OAuth
├── types/               # Tipos TypeScript
│   └── User.ts
├── App.tsx              # Componente raiz
├── App.css              # Estilos globales
├── main.tsx             # Punto de entrada
└── index.css            # Estilos base

```

---

## 🔐 Autenticación

### OAuth 2.0 con Google

1. Usuario hace clic en "Login with Google"
2. Se abre popup de consent de Google
3. Backend recibe código y lo intercambia por JWT token
4. Token se almacena en `localStorage`
5. `AuthContext` decodifica el JWT y extrae: `id`, `email`, `rol`
6. Redirecciona a `/dashboard` si es admin (rol === 1) o a `/home` si es usuario regular

### Estructura del JWT Token

```typescript
{
  id: number,           // ID del usuario
  email: string,        // Email del usuario
  rol: number,          // 1 = Admin, 2 = Usuario normal
  iat: number,          // Token issued at
  exp: number           // Token expiration (8 horas)
}
```

---

## 🛣️ Rutas Principales

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | HomePage | No | Página de inicio |
| `/login` | LoginPage | No | Login con OAuth o credenciales |
| `/register` | RegisterPage | No | Registrar cuenta |
| `/quienes-somos` | QuienesSomosPage | No | Información del proyecto |
| `/contacto` | ContactoPage | No | Formulario de contacto |
| `/callback` | Callback | No | Handler para OAuth redirect |
| `/dashboard` | DashboardPage | **Sí** | Panel principal (admin + usuarios) |
| `/create-alert` | CreateAlertPage | **Sí** | Crear nueva alerta |
| `/alert/:id` | AlertDetailPage | **Sí** | Detalle de alerta |
| `/profile` | ProfilePage | **Sí** | Editar perfil |
| `/forgot-password` | ForgotPasswordPage | No | Recuperar contraseña |
| `/reset-password` | ResetPasswordPage | No | Resetear contraseña |
| `*` | NotFoundPage | No | Página no encontrada |

---

## 🔧 Configuración de ESLint

La configuración ESLint está en `eslint.config.js`. Para desarrollo type-aware, consulta la [documentación oficial](https://typescript-eslint.io/).

---

## 🔗 Conexión con Backend

El frontend se conecta al backend en `http://localhost:4000` a través de:

- **Base URL**: `VITE_API_URL` en `.env`
- **Cliente HTTP**: Axios configurado en `src/services/api.ts`
- **Autenticación**: JWT token en header `Authorization: Bearer <token>`
- **Endpoints principales**:
  - `POST /api/auth/google` - Login con Google
  - `POST /api/auth/register` - Registrar usuario
  - `POST /api/auth/login` - Login con credenciales
  - `GET /api/users/profile` - Obtener perfil
  - `GET /api/alerts` - Listar alertas
  - `POST /api/alerts` - Crear alerta

---

## 📝 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Vista previa de build
npm run lint         # Ejecutar ESLint
```

---

## 🤝 Contribuir

1. Crear rama desde `dev`: `git checkout -b feature/nombre-feature`
2. Realizar cambios y commits
3. Push a la rama: `git push origin feature/nombre-feature`
4. Crear Pull Request a `dev`

---

## 📄 Licencia

Proyecto de SENA - Digital Alert Hub 2025
