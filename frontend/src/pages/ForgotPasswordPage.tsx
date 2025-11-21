import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Cargando en el botón Enviar

    try {
      await api.post("/auth/forgot-password", { email });
      setEmailSent(true);
      toast.success("Te enviamos un enlace para restablecer tu contraseña.");
    } catch {
      toast.error("Error al enviar el correo. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setEmailSent(false);
    setEmail("");
  };

  // Vista de confirmación después de enviar
  if (emailSent) {
    return (
      <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
        <div
          className="card shadow p-4"
          style={{ width: "340px", borderRadius: "15px" }}
        >
          <div className="text-center mb-3">
            <i className="bi bi-check-circle fs-1 text-success"></i>
          </div>
          <h3 className="text-center mb-3 fw-bold">¡Correo enviado!</h3>
          <p className="text-center text-muted mb-4">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <p className="text-center text-muted small mb-4">
            Revisa tu bandeja de entrada y la carpeta de spam. El enlace
            expirará en 15 minutos.
          </p>
          <div className="d-flex flex-column gap-2">
            <button
              onClick={handleBackToForm}
              className="btn btn-outline-primary"
            >
              Enviar a otro correo
            </button>
            <a href="/login" className="btn btn-link text-decoration-none">
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Vista del formulario
  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "360px", borderRadius: "15px" }}
      >
        <div className="text-center mb-3">
          <i className="bi bi-shield-lock fs-1 text-primary"></i>
        </div>
        <h3 className="text-center mb-4 fw-bold">Recuperar contraseña</h3>
        <form onSubmit={handleSubmit}>
          <div className="position-relative mb-3">
            <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="email"
              className="form-control ps-5"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="d-flex justify-content-center mb-3">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </button>
          </div>
          <div className="text-center">
            <a href="/login" className="text-decoration-none small">
              Volver al inicio de sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
