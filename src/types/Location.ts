export interface ComunaOption {
  id_comuna: number;
  nombre: string;
}

export interface BarrioOption {
  id_barrio: number;
  id_comuna: number;
  nombre: string;
}
