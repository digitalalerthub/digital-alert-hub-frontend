export interface AlertEvidence {
  id_evidencia: number;
  url_evidencia: string;
  tipo_evidencia?: string | null;
}

export interface CreateAlertPayload {
  titulo: string;
  descripcion: string;
  id_categoria: number;
  prioridad?: string;
  id_comuna: number;
  id_barrio: number;
  ubicacion: string;
  evidencias: File[];
}

export interface Alert {
  id_alerta: number;
  id_usuario: number | null;
  nombre_usuario?: string;
  nombre_comuna?: string;
  nombre_barrio?: string;
  id_estado: number;
  id_categoria: number;
  id_comuna?: number;
  id_barrio?: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad?: string;
  ubicacion?: string;
  evidencia_url?: string;
  evidencia_tipo?: string;
  evidencias?: AlertEvidence[];
  total_reacciones?: number;
  total_comentarios?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateAlertPayload {
  titulo?: string;
  descripcion?: string;
  id_categoria?: number;
  prioridad?: string;
  id_comuna?: number;
  id_barrio?: number;
  ubicacion?: string;
  evidencias?: File[];
  evidencias_eliminadas?: number[];
  eliminar_todas_evidencias?: boolean;
}
