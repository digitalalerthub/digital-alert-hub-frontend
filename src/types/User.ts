// Estructura que viene desde el backend.
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

// Payload para crear usuario. El backend no exige `estado`.
export interface CreateUserPayload {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string | null;
    id_rol: number;
}

// Payload para editar usuario. La contrasena se define por activacion.
export interface UpdateUserPayload {
    nombre: string;
    apellido: string;
    telefono?: string | null;
    id_rol: number;
}
