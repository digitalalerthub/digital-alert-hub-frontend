import api from "./api";
import type { AlertComment, CreateAlertCommentPayload } from "../types/Comment";

const commentsService = {
  listAlertComments: async (alertId: number): Promise<AlertComment[]> => {
    const { data } = await api.get<AlertComment[]>(`/alerts/${alertId}/comments`);
    return data;
  },

  createAlertComment: async (
    alertId: number,
    payload: CreateAlertCommentPayload
  ): Promise<AlertComment> => {
    const { data } = await api.post<AlertComment>(`/alerts/${alertId}/comments`, payload);
    return data;
  },

  updateAlertComment: async (
    alertId: number,
    commentId: number,
    payload: CreateAlertCommentPayload
  ): Promise<AlertComment> => {
    const { data } = await api.put<AlertComment>(`/alerts/${alertId}/comments/${commentId}`, payload);
    return data;
  },

  deleteAlertComment: async (alertId: number, commentId: number): Promise<void> => {
    await api.delete(`/alerts/${alertId}/comments/${commentId}`);
  },
};

export default commentsService;
