import axios from "axios";

// URL del backend desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Se crea una instancia de Axios con una configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("🔑 Token en localStorage:", token ? "SÍ existe" : "NO existe");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header agregado");
    } else {
      console.warn("⚠️ No hay token - petición sin autenticar");
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en interceptor:", error);
    return Promise.reject(error);
  }
);

export default api;
