import { useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../App.css";
import GoogleButton from "./Auth/GoogleButton";

const RegisterForm = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", {
        nombre,
        apellido,
        email,
        contrasena,
        telefono,
      });

      toast.success(res.data.message || "Registro exitoso", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error en el registro", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Error desconocido", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="register-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4 bg-white bg-opacity-75 border border-white"
        style={{ width: "380px", borderRadius: "15px" }}
      >
        <div className="text-center mb-3">
          <i className="bi bi-person-circle fs-1 text-success"></i>
        </div>

        <h3 className="text-center mb-4 fw-bold">Crear una Cuenta</h3>

        <form onSubmit={handleSubmit}>
          {/* Inputs */}
          <div className="mb-3 position-relative">
            <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <i className="bi bi-person-lines-fill position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tu apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 position-relative">
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

          <div className="mb-3 position-relative">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              className="form-control ps-5"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 position-relative">
            <i className="bi bi-telephone position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Número de teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          {/* Botón principal */}
          <div className="d-flex justify-content-center mb-3">
            <button type="submit" className="btn btn-success w-50">
              Registrarse
            </button>
          </div>

          {/* Google Login */}
          <div className="d-flex justify-content-center mb-3">
            <GoogleButton />
          </div>

          <p className="text-center">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="text-decoration-none fw-semibold text-primary"
            >
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
