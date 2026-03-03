import api from "./api";
import type { AlertReactionSummary, Reaction } from "../types/Reaction";

const reactionsService = {
  list: async (): Promise<Reaction[]> => {
    const { data } = await api.get<Reaction[]>("/reactions");
    return data;
  },

  getAlertSummary: async (alertId: number): Promise<AlertReactionSummary[]> => {
    const { data } = await api.get<AlertReactionSummary[]>(`/alerts/${alertId}/reactions`);
    return data;
  },

  toggleAlertReaction: async (
    alertId: number,
    id_reaccion: number
  ): Promise<AlertReactionSummary[]> => {
    const { data } = await api.post<AlertReactionSummary[]>(`/alerts/${alertId}/reactions`, {
      id_reaccion,
    });
    return data;
  },
};

export default reactionsService;
