export interface AlertEvidence {
  id_evidencia: number;
  url_evidencia: string;
  tipo_evidencia?: string | null;
}

export interface CreateAlertPayload {
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad?: string;
  id_comuna: number;
  id_barrio: number;
  ubicacion?: string;
  evidencias?: File[];
}

export interface Alert {
  id_alerta: number;
  id_usuario: number;
  nombre_usuario?: string;
  id_estado: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface UpdateAlertPayload {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  prioridad?: string;
  id_comuna?: number;
  id_barrio?: number;
  ubicacion?: string;
  evidencias?: File[];
}
