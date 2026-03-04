export interface Reaction {
  id_reaccion: number;
  tipo: string;
  descrip_tipo_reaccion?: string;
}

export interface AlertReactionSummary extends Reaction {
  count: number;
  user_reacted: boolean;
}
