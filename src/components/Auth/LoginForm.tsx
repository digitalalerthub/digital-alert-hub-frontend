import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../App.css";
import { isRecaptchaEnabled } from "../../config/recaptcha";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";
import GoogleButton from "./GoogleButton";
import ReCaptchaWidget from "./ReCaptchaWidget";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [contrasena, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/admin";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRecaptchaEnabled && !captchaToken) {
      toast.error("Confirma que no eres un robot.");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        contrasena,
        captchaToken,
      });
      login(res.data.token);

      toast.success("Inicio de sesión exitoso");
      setTimeout(() => navigate(redirectTo, { replace: true }), 800);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error en el login");
        setPassword("");
      } else {
        toast.error("Error desconocido");
      }
    } finally {
      if (isRecaptchaEnabled) {
        setCaptchaToken(null);
        setCaptchaResetSignal((current) => current + 1);
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
          <i
            className="bi bi-box-arrow-in-right fs-1"
            style={{ color: "#0d6efd" }}
          />
        </div>

        <h3 className="text-center mb-4 fw-bold" style={{ color: "#ff1100" }}>
          Iniciar Sesión
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="position-relative mb-3">
            <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="email"
              className="form-control ps-5"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="position-relative mb-4">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <input
              type="password"
              className="form-control ps-5"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRecaptchaEnabled ? (
            <div className="d-flex justify-content-center mb-4">
              <ReCaptchaWidget
                onVerify={setCaptchaToken}
                resetSignal={captchaResetSignal}
              />
            </div>
          ) : null}

          <div className="d-flex justify-content-center mb-3">
            <button
              type="submit"
              className="btn btn-primary w-50"
              disabled={isRecaptchaEnabled && !captchaToken}
            >
              Ingresar
            </button>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleButton />
          </div>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="d-block text-secondary mb-1 small"
            >
              ¿Olvidaste la contraseña?
            </Link>

            <Link
              to={`/register${location.search}`}
              className="d-block fw-semibold text-primary small"
            >
              ¿Eres un usuario nuevo? Crear cuenta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
