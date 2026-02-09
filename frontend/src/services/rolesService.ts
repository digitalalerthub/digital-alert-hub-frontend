import api from "./api";

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

const rolesService = {
  getAll: async (): Promise<Rol[]> => {
    const { data } = await api.get<Rol[]>("/roles");
    return data;
  },

  create: async (data: Omit<Rol, "id_rol">): Promise<Rol> => {
    const response = await api.post<Rol>("/roles", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Rol>): Promise<Rol> => {
    const response = await api.put<Rol>(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};

export default rolesService;
