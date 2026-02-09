// Estructura que viene desde el backend
export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  id_rol: number;
  estado: boolean;
  created_at: string;
}

// Payload para crear usuario (backend NO exige 'estado')
export interface CreateUserPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  id_rol: number;
  contrasena: string;
}

// Payload para editar usuario (no contraseña)
export interface UpdateUserPayload {
  nombre: string;
  apellido: string;
  telefono?: string | null;
  id_rol: number;
}



// // 1. Definir la estructura de datos de un usuario para todo el sistema.

// export interface User {
//   id: number;
//   nombre: string;
//   apellido: string;
//   email: string;
//   telefono?: string;
//   rol?: string; // ? significa campo opcional
//   estado: boolean;
//   // agrega opcionales que realmente necesites (avatarUrl?, telefono?, ...)
// }
