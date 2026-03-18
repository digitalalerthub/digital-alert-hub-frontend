import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../App.css";
import { isRecaptchaEnabled } from "../../config/recaptcha";
import api from "../../services/api";
import GoogleButton from "./GoogleButton";
import ReCaptchaWidget from "./ReCaptchaWidget";

const RegisterForm = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const loginUrl = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRecaptchaEnabled && !captchaToken) {
      toast.error("Confirma que no eres un robot.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        nombre,
        apellido,
        email,
        contrasena,
        telefono,
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
    } finally {
      if (isRecaptchaEnabled) {
        setCaptchaToken(null);
        setCaptchaResetSignal((current) => current + 1);
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
              placeholder="Correo electronico"
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
              placeholder="Contrasena"
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
              placeholder="Numero de telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
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
              className="btn btn-success w-50"
              disabled={isRecaptchaEnabled && !captchaToken}
            >
              Registrarse
            </button>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleButton />
          </div>

          <p className="text-center">
            Ya tienes una cuenta?{" "}
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
