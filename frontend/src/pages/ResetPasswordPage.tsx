import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Extrae el token desde la URL (ej: /reset-password/:token)
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: ambas contraseñas deben coincidir
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      // Petición POST al backend para restablecer la contraseña
      await api.post(`/auth/reset-password/${token}`, {
        nuevaContrasena: password,
      });
      toast.success("Contraseña restablecida correctamente.");
      navigate("/login");
    } catch {
      toast.error("Error al restablecer la contraseña, intentalo nuevamente");
    }
  };
  //  Renderizado del formulario con estilos de Bootstrap
  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "360px", borderRadius: "15px" }}
      >
        <div className="text-center mb-3">
          <i className="bi bi-arrow-repeat fs-1 text-primary"></i>
        </div>
        <h3 className="text-center mb-4 fw-bold">Actualizar Contraseña</h3>

        <form onSubmit={handleSubmit}>
          <div className="position-relative mb-3">
            <i className="bi bi-arrow-counterclockwise  position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control ps-5"
              placeholder="Nueva Contraseña"
            />
          </div>
          <div className="position-relative mb-3">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-control ps-5"
              placeholder="Confirma La Nueva Contraseña"
            />
          </div>
          <div className="d-flex justify-content-center mb-3">
            <button type="submit" className="btn btn-success">
              Cambiar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
