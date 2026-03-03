import api from "./api";
import type { BarrioOption, ComunaOption } from "../types/Location";

const locationsService = {
  listComunas: async (): Promise<ComunaOption[]> => {
    const { data } = await api.get<ComunaOption[]>("/locations/comunas");
    return data;
  },

  listBarriosByComuna: async (idComuna: number): Promise<BarrioOption[]> => {
    const { data } = await api.get<BarrioOption[]>(`/locations/comunas/${idComuna}/barrios`);
    return data;
  },
};

export default locationsService;
