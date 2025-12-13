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


// // Encapsula las llamadas al backend o localStorage (simulación ahora, pero listo para conectarse a API real).
// // Separa totalmente la lógica de negocio del componente visual.

// import api from "./api";
// import type { User } from "../types/User";

// const KEY = "mock_user_v1";

// // Obtener perfil
// export const getProfile = async (): Promise<User> => {
//   const raw = localStorage.getItem(KEY);

//   if (raw) return JSON.parse(raw) as User;
//   const seed: User = {
//     id: 1,
//     nombre: "Jennifer García",
//     email: "veronica@gmail.com",
//     rol: "Usuario",
//   };

//   localStorage.setItem(KEY, JSON.stringify(seed));
//   return seed;
// };

// // Actualizar perfil
// export const updateProfile = async (payload: Partial<User>): Promise<User> => {
//   const current = await getProfile();
//   const updated = { ...current, ...payload };
//   localStorage.setItem(KEY, JSON.stringify(updated));
//   return updated;
// };

// // Eliminar cuenta
// export const deleteAccount = async (): Promise<{ success: boolean }> => {
//   localStorage.removeItem(KEY);
//   return { success: true };
// };

// // Cambiar contraseña (mock)
// export const changePassword = async (_currentPass: string, newPass: string) => {
//   // mock simple
//   if (newPass.length < 6)
//     return {
//       success: false,
//       message: "La contraseña debe tener >= 6 caracteres",
//     };
//   return { success: true };
// };
