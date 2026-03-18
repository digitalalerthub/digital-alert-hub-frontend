import api from './api';
import type {
    Alert,
    CreateAlertPayload,
    UpdateAlertPayload,
} from '../types/Alert';

const alertsService = {
    create: async (payload: CreateAlertPayload): Promise<Alert> => {
        const formData = new FormData();
        formData.append('titulo', payload.titulo);
        formData.append('descripcion', payload.descripcion);
        formData.append('categoria', payload.categoria);
        formData.append('id_comuna', String(payload.id_comuna));
        formData.append('id_barrio', String(payload.id_barrio));

        if (payload.prioridad) formData.append('prioridad', payload.prioridad);
        if (payload.ubicacion) formData.append('ubicacion', payload.ubicacion);
        if (payload.evidencias?.length) {
            payload.evidencias.forEach((file) => {
                formData.append('evidencias', file);
            });
        }

        const { data } = await api.post<{ message: string; alert: Alert }>(
            '/alerts',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return data.alert;
    },

    list: async (): Promise<Alert[]> => {
        const { data } = await api.get<Alert[]>('/alerts');
        return data;
    },

    featured: async (): Promise<Alert[]> => {
        const { data } = await api.get<Alert[]>('/alerts/featured');
        return data;
    },

    getById: async (id: number): Promise<Alert> => {
        const { data } = await api.get<Alert>(`/alerts/${id}`);
        return data;
    },

    update: async (id: number, payload: UpdateAlertPayload): Promise<Alert> => {
        const formData = new FormData();

        if (payload.titulo !== undefined)
            formData.append('titulo', payload.titulo);
        if (payload.descripcion !== undefined)
            formData.append('descripcion', payload.descripcion);
        if (payload.categoria !== undefined)
            formData.append('categoria', payload.categoria);
        if (payload.prioridad !== undefined)
            formData.append('prioridad', payload.prioridad);
        if (payload.id_comuna !== undefined)
            formData.append('id_comuna', String(payload.id_comuna));
        if (payload.id_barrio !== undefined)
            formData.append('id_barrio', String(payload.id_barrio));
        if (payload.ubicacion !== undefined)
            formData.append('ubicacion', payload.ubicacion);
        if (payload.evidencias_eliminadas?.length) {
            formData.append(
                'evidencias_eliminadas',
                JSON.stringify(payload.evidencias_eliminadas),
            );
        }
        if (payload.eliminar_todas_evidencias) {
            formData.append('eliminar_todas_evidencias', 'true');
        }
        if (payload.evidencias?.length) {
            payload.evidencias.forEach((file) => {
                formData.append('evidencias', file);
            });
        }

        const { data } = await api.put<{ message: string; alert: Alert }>(
            `/alerts/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return data.alert;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/alerts/${id}`);
    },

    updateAlertStatus: async (
        idAlerta: number,
        idEstado: number,
    ): Promise<Alert> => {
        const { data } = await api.patch<{ message: string; alert: Alert }>(
            `/alerts/${idAlerta}/estado`,
            { id_estado: idEstado },
        );
        return data.alert;
    },
};

export default alertsService;
