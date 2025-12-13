// Este componente: Envía credenciales, obtiene token, ejecuta login()

import { useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../App.css";
import GoogleButton from "./Auth/GoogleButton";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [contrasena, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, contrasena });
      login(res.data.token);

      toast.success("Inicio de sesión exitoso");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error en el login");
        setPassword("");
      } else {
        toast.error("Error desconocido");
      }
    }
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4 bg-white bg-opacity-75 border border-white"
        style={{ width: "360px", borderRadius: "15px" }}
      >
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

          {/* BOTÓN DE GOOGLE */}
          <div className="d-flex justify-content-center mb-3">
            <GoogleButton />
          </div>

          {/* Enlaces secundarios */}
          <div className="text-center">
            <a
              href="/forgot-password"
              className="d-block text-secondary mb-1 small"
            >
              ¿Olvidaste la contraseña?
            </a>

            <a
              href="/register"
              className="d-block fw-semibold text-primary small"
            >
              ¿Eres un usuario nuevo? Crear cuenta
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
