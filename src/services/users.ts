import api from './api';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types/User';

const usersService = {
    getAll: async (): Promise<User[]> => {
        const { data } = await api.get<User[]>('/users');

        const normalized = data.map((user) => {
            let created = user.created_at;

            if (created) {
                if (created.includes('.')) {
                    created = created.split('.')[0];
                }

                if (created.includes(' ')) {
                    created = created.replace(' ', 'T');
                }
            }

            return {
                ...user,
                created_at: created,
            };
        });

        return normalized.sort((a, b) => a.id_usuario - b.id_usuario);
    },

    create: async (payload: CreateUserPayload): Promise<User> => {
        const { data } = await api.post<User>('/users', payload);
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
