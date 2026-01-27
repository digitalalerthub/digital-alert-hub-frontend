import api from "./api";
import type { User, CreateUserPayload, UpdateUserPayload } from "../types/User";

const usersService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>("/users");
       // Normalizar el campo created_at para que siempre sea una fecha válida
    const normalized = data.map((u) => {
      let created = u.created_at;

      if (created) {
        // Remover microsegundos: "2025-09-25 16:05:39.569573" → "2025-09-25 16:05:39"
        if (created.includes(".")) {
          created = created.split(".")[0];
        }

        // Reemplazar espacio por "T" para que sea ISO válido
        if (created.includes(" ")) {
          created = created.replace(" ", "T");
        }
      }

      return {
        ...u,
        created_at: created, // Fecha corregida
      };
    });

    return normalized.sort((a, b) => a.id_usuario - b.id_usuario);
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post<User>("/users", payload);
    return data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },

  toggleStatus: async (id: number, nuevoEstado: boolean): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}/status`, {
      estado: nuevoEstado,
    });
    return data;
  },
};

export default usersService;

// // src/services/users.ts
// import api from './api';

// export interface User {
//   id_usuario: number;
//   nombre: string;
//   apellido: string;
//   email: string;
//   id_rol: number;
//   estado: boolean;
//   telefono?: string;
// }

// const usersService = {
//   // Lista todos los usuarios (GET /api/users)
//   getAll: () => api.get<User[]>('/users'),

//   // Crear nuevo usuario (POST /api/users)
//   create: (userData: Omit<User, 'id_usuario'>) => api.post<User>('/users', userData),

//   // Actualizar usuario (PATCH /api/users/:id)
//   update: (id: number, userData: Partial<User>) => api.patch<User>(`/users/${id}`, userData),

//   // Activar/inactivar (PATCH /api/users/:id/status)
//   toggleStatus: (id: number, estado: boolean) => api.patch(`/users/${id}/status`, { estado }),
// };

// export default usersService;
