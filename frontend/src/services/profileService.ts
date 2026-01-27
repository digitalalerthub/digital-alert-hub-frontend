import api from "./api";
import type { User } from "../types/User";

export const getProfile = async (): Promise<User> => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateProfile = async (data: {
  nombre: string;
  apellido: string;
  telefono?: string;
}): Promise<User> => {
  const response = await api.put("/profile", data);
  return response.data;
};

export const changePassword = async (
  nuevaContrasena: string,
  contrasenaActual?: string
) => {
  const response = await api.put("/profile/change-password", {
    nuevaContrasena,
    contrasenaActual,
  });
  return response.data;
};

export const deleteAccount = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.delete("/profile");
  return response.data;
};
