// Este componente: Envía credenciales, obtiene token, ejecuta login()

import { useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // 🔹 Importamos el contexto
import "../App.css";

const LoginForm = () => {
  // Estados locales del formulario
  const [email, setEmail] = useState("");
  const [contrasena, setPassword] = useState("");
  const navigate = useNavigate();

  // Obtenemos la función login del contexto
  const { login } = useAuth();

  // 🔹 Función para enviar el formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Petición al backend
      const res = await api.post("/auth/login", { email, contrasena });

      // Guardamos el token y actualizamos el contexto global
      login(res.data.token);

      toast.success("Inicio de sesión exitoso");

      // Redirigimos al dashboard sin refrescar la página
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: unknown) {
      // Manejo de errores del servidor
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error en el login");
      } else {
        toast.error("Error desconocido");
      }
    }
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "360px", borderRadius: "15px" }}>
        <div className="text-center mb-3">
          <i className="bi bi-box-arrow-in-right fs-1 text-primary"></i>
        </div>

        <h3 className="text-center mb-4 fw-bold">Iniciar Sesión</h3>

        <form onSubmit={handleSubmit}>
          {/* Campo Email */}
          <div className="position-relative mb-3">
            <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="email"
              className="form-control ps-5"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="position-relative mb-4">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              className="form-control ps-5"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Botón enviar */}
          <div className="d-flex justify-content-center mb-3">
            <button type="submit" className="btn btn-primary w-50">
              Ingresar
            </button>
          </div>

          {/* Enlaces secundarios */}
          <div className="text-center">
            <a href="#" className="d-block text-secondary mb-1 small">
              ¿Olvidaste la contraseña?
            </a>
            <a href="/register" className="d-block fw-semibold text-primary small">
              ¿Eres un usuario nuevo? Crear cuenta
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
