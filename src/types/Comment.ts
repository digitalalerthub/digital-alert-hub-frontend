export interface AlertComment {
  id_comentario: number;
  id_alerta: number;
  id_usuario: number;
  nombre_usuario: string;
  texto_comentario: string;
  created_at?: string;
}

export interface CreateAlertCommentPayload {
  texto_comentario: string;
}
