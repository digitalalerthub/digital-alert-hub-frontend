// 1. Definir la estructura de datos de un usuario para todo el sistema.

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol?: string; // ? significa campo opcional
  // agrega opcionales que realmente necesites (avatarUrl?, telefono?, ...)
}
