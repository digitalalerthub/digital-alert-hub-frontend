import { useState } from "react";
import { updateProfile } from "../../services/profileService";
import { toast } from "react-toastify";
import type { User } from "../../types/User";

/**
 * Props del componente:
 * - user: información actual del usuario (viene del estado global o padre)
 * - onSave: callback para notificar al padre que el usuario fue actualizado
 * - onCancel: callback para salir del modo edición
 * - onChangePassword: acción opcional para abrir el flujo de cambio de contraseña
 */
interface Props {
  user: User;
  onSave: (data: User) => void;
  onCancel: () => void;
  onChangePassword?: () => void;
}

export default function EditProfileForm({
  user,
  onSave,
  onCancel,
  onChangePassword,
}: Props) {
  const [formData, setFormData] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    telefono: user.telefono || "",
  });
  // Estado para controlar loading (deshabilitar botones y evitar doble submit)
  const [isLoading, setIsLoading] = useState(false);

    /**
   * Maneja los cambios en los inputs del formulario.
   * Usa el atributo "name" del input para actualizar la propiedad correcta.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    /**
   * Envío del formulario:
   * - Llama al servicio de actualización
   * - Muestra feedback al usuario
   * - Notifica al componente padre con los nuevos datos
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Llamada al backend para actualizar perfil
      setIsLoading(true);
      const updatedUser = await updateProfile(formData);

      toast.success("Perfil actualizado correctamente");
      // Notificar al padre para actualizar estado global
      onSave(updatedUser);
      
    } catch (error) {
      let message = "Error al actualizar el perfil";
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-background d-flex justify-content-center align-items-center">
      <div
        className="card shadow p-4 bg-light bg-opacity-76"
        style={{ width: "400px", borderRadius: "16px"  }}
      >
        {/* Avatar y título */}
        <div className="text-center mb-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#e6f4ff",
            }}
          >
            <i className="bi bi-person-circle text-danger fs-2"></i>
          </div>

          <h2 className="fw-bold mb-0" style={{ fontSize: "1.4rem" }}>
            Editar perfil
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
            Actualiza tu información personal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="mb-3">
            <label className="form-label small mb-1">Nombres</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>

          {/* Apellido */}
          <div className="mb-3">
            <label className="form-label small mb-1">Apellidos</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person-vcard"></i>
              </span>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small mb-1">Correo electrónico</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                value={user.email}
                disabled
                className="form-control bg-light"
              />
            </div>
            <small className="text-muted">
              El correo no se puede modificar.
            </small>
          </div>

          {/* Teléfono */}
          <div className="mb-4">
            <label className="form-label small mb-1">Teléfono</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-control"
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="d-flex justify-content-center gap-2 mb-3 ">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-outline-primary btn-sm"
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn btn-outline-secondary btn-sm"
            >
              Cancelar
            </button>
          </div>

          {onChangePassword && (
            <div className="d-flex justify-content-center">
              <button
                type="button"
                onClick={onChangePassword}
                className="btn btn-success btn-sm"
              >
                Cambiar contraseña
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
