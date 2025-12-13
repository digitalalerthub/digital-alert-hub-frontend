import { useState } from "react";
import { changePassword } from "../../services/profileService";
import { toast } from "react-toastify";

interface Props {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({ onSuccess }: Props) {
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaContrasena !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (nuevaContrasena.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(nuevaContrasena, contrasenaActual);
      toast.success("Contraseña actualizada correctamente");
      onSuccess?.();
    } catch (error) {
      let message = "Error al cambiar la contraseña";
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="change-background d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow p-4"
        style={{ width: "360px", borderRadius: "16px" }}
      >
        {/* Icono + título */}
        <div className="text-center mb-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#e6f4ff",
            }}
          >
            <i className="bi bi-shield-lock text-primary fs-3"></i>
          </div>
          <h5 className="fw-bold mb-0">Cambiar contraseña</h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
            Actualiza tu contraseña de acceso
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Contraseña actual */}
          <div className="position-relative mb-3">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              required
              className="form-control ps-5"
              placeholder="Contraseña actual"
            />
          </div>

          {/* Nueva contraseña */}
          <div className="position-relative mb-3">
            <i className="bi bi-key position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required
              minLength={6}
              className="form-control ps-5"
              placeholder="Nueva contraseña"
            />
          </div>

          {/* Confirmar contraseña */}
          <div className="position-relative mb-4">
            <i className="bi bi-shield-check position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="form-control ps-5"
              placeholder="Confirmar nueva contraseña"
            />
          </div>

          {/* Botón */}
          <div className="d-flex justify-content-center">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-success btn-sm px-4"
            >
              {isLoading ? "Actualizando..." : "Guardar cambios"}
            </button>
          </div>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={onSuccess}
              className="btn btn-sm btn-outline-secondary px-3"
            >
              <i className="bi bi-arrow-left me-1"></i>
              Volver al perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
