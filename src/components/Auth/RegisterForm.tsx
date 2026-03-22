import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../App.css";
import { getRecaptchaToken, isRecaptchaEnabled } from "../../config/recaptcha";
import api from "../../services/api";
import GoogleButton from "./GoogleButton";

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]{2,100}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const RegisterForm = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const loginUrl = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";

  const validateForm = (): string | null => {
    const normalizedNombre = nombre.trim();
    const normalizedApellido = apellido.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = contrasena.trim();
    const normalizedPhone = telefono.trim();

    if (!NAME_REGEX.test(normalizedNombre)) {
      return "El nombre solo puede contener letras, espacios, apostrofes o guiones, y debe tener al menos 2 caracteres.";
    }

    if (!NAME_REGEX.test(normalizedApellido)) {
      return "El apellido solo puede contener letras, espacios, apostrofes o guiones, y debe tener al menos 2 caracteres.";
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return "Ingresa un correo electronico con formato valido.";
    }

    if (!PHONE_REGEX.test(normalizedPhone)) {
      return "El telefono debe tener solo numeros y entre 7 y 15 digitos.";
    }

    if (!PASSWORD_REGEX.test(normalizedPassword)) {
      return "La contrasena debe tener minimo 8 caracteres e incluir letras y numeros.";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const captchaToken = isRecaptchaEnabled
        ? await getRecaptchaToken("register")
        : null;

      const res = await api.post("/auth/register", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        contrasena: contrasena.trim(),
        telefono: telefono.trim(),
        captchaToken,
      });

      toast.success(res.data.message || "Registro exitoso", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(loginUrl, { replace: true });
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
          <i
            className="bi bi-person-circle fs-1"
            style={{ color: "#0d6efd" }}
          />
        </div>

        <h3 className="text-center mb-4 fw-bold" style={{ color: "#ff1100" }}>
          Crear una Cuenta
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              minLength={2}
              maxLength={100}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <i className="bi bi-person-lines-fill position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tu apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              minLength={2}
              maxLength={100}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="email"
              className="form-control ps-5"
              placeholder="Correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="password"
              className="form-control ps-5"
              placeholder="Contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="mb-4 position-relative">
            <i className="bi bi-telephone position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="tel"
              className="form-control ps-5"
              placeholder="Numero de telefono"
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value.replace(/\D/g, "").slice(0, 15))
              }
              inputMode="numeric"
              pattern="\d{7,15}"
              minLength={7}
              maxLength={15}
              autoComplete="tel"
              required
            />
          </div>

          <div className="d-flex justify-content-center mb-3">
            <button type="submit" className="btn btn-primary w-50">
              Registrarse
            </button>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleButton />
          </div>

          <p className="text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to={loginUrl}
              className="text-decoration-none fw-semibold text-primary"
            >
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
