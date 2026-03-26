import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { validatePassword } from "../../utils/userValidation";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>(
    {}
  );
  const isActivationMode = searchParams.get("mode") === "activation";

  const validateForm = (): { isValid: boolean; firstError: string | null } => {
    const nextErrors: { password?: string; confirmPassword?: string } = {};
    const passwordError = validatePassword(password);

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Debes confirmar la contrasena";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Las contrasenas no coinciden";
    }

    setErrors(nextErrors);
    const firstError = nextErrors.password || nextErrors.confirmPassword || null;

    return {
      isValid: Object.keys(nextErrors).length === 0,
      firstError,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      if (validation.firstError) {
        toast.error(validation.firstError);
      }
      return;
    }

    try {
      await api.post(`/auth/reset-password/${token}`, {
        nuevaContrasena: password.trim(),
      });

      toast.success(
        isActivationMode
          ? "Cuenta activada correctamente. Ya puedes iniciar sesion."
          : "Contrasena restablecida correctamente."
      );
      navigate("/login");
    } catch {
      toast.error("Error al restablecer la contrasena, intentalo nuevamente");
    }
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "360px", borderRadius: "15px" }}
      >
        <div className="text-center mb-3">
          <i className="bi bi-arrow-repeat fs-1 text-primary"></i>
        </div>
        <h3 className="text-center mb-4 fw-bold">
          {isActivationMode ? "Activa tu cuenta" : "Actualizar Contrasena"}
        </h3>

        {isActivationMode && (
          <p className="text-center text-muted small">
            Define tu contrasena para activar el acceso a la plataforma.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="position-relative mb-3">
            <i className="bi bi-arrow-counterclockwise position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              required
              className={`form-control ps-5 ${errors.password ? "is-invalid" : ""}`}
              placeholder="Nueva Contrasena"
              minLength={8}
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>
          <div className="position-relative mb-3">
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((current) => ({
                    ...current,
                    confirmPassword: undefined,
                  }));
                }
              }}
              required
              className={`form-control ps-5 ${
                errors.confirmPassword ? "is-invalid" : ""
              }`}
              placeholder="Confirma la nueva contrasena"
              minLength={8}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                {errors.confirmPassword}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-center mb-3">
            <button type="submit" className="btn btn-success">
              {isActivationMode ? "Activar cuenta" : "Cambiar contrasena"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
