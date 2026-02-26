import api from "./api";
import type { Alert, CreateAlertPayload, UpdateAlertPayload } from "../types/Alert";

const alertsService = {
  create: async (payload: CreateAlertPayload): Promise<Alert> => {
    const formData = new FormData();
    formData.append("titulo", payload.titulo);
    formData.append("descripcion", payload.descripcion);
    formData.append("categoria", payload.categoria);

    if (payload.prioridad) formData.append("prioridad", payload.prioridad);
    if (payload.ubicacion) formData.append("ubicacion", payload.ubicacion);
    if (payload.evidencia) formData.append("evidencia", payload.evidencia);

    const { data } = await api.post<{ message: string; alert: Alert }>(
      "/alerts",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data.alert;
  },

  list: async (): Promise<Alert[]> => {
    const { data } = await api.get<Alert[]>("/alerts");
    return data;
  },

  update: async (id: number, payload: UpdateAlertPayload): Promise<Alert> => {
    const formData = new FormData();

    if (payload.titulo !== undefined) formData.append("titulo", payload.titulo);
    if (payload.descripcion !== undefined) formData.append("descripcion", payload.descripcion);
    if (payload.categoria !== undefined) formData.append("categoria", payload.categoria);
    if (payload.prioridad !== undefined) formData.append("prioridad", payload.prioridad);
    if (payload.ubicacion !== undefined) formData.append("ubicacion", payload.ubicacion);
    if (payload.evidencia) formData.append("evidencia", payload.evidencia);

    const { data } = await api.put<{ message: string; alert: Alert }>(`/alerts/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.alert;
  },
};

export default alertsService;
