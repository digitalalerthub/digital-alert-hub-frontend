import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setIsLoading(true);
      await api.put("/auth/change-password", { nuevaContrasena: password });
      toast.success("Contraseña actualizada correctamente");
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="position-relative mb-3">
        <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-control ps-5"
          placeholder="Nueva contraseña"
        />
      </div>
      <div className="position-relative mb-4">
        <i className="bi bi-shield-lock position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="form-control ps-5"
          placeholder="Confirmar contraseña"
        />
      </div>
      <div className="d-flex justify-content-center gap-2">
        <button type="submit" className="btn btn-success btn-sm" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
