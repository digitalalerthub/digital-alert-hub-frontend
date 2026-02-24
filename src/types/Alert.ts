export interface CreateAlertPayload {
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad?: string;
  ubicacion?: string;
  evidencia?: File;
}

export interface Alert {
  id_alerta: number;
  id_usuario: number;
  id_estado: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad?: string;
  ubicacion?: string;
  evidencia_url?: string;
  evidencia_tipo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateAlertPayload {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  prioridad?: string;
  ubicacion?: string;
  evidencia?: File;
}
