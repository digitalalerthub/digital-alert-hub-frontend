import { useState } from "react";
import type { User } from "../../types/User";

interface Props {
  user: User;
  onSave: (data: User) => void;
  onCancel: () => void;
  onChangePassword?: () => void; // Nuevo: abrir modal de cambio de contraseña
}

export default function EditProfileForm({
  user,
  onSave,
  onCancel,
  onChangePassword,
}: Props) {
  const [formData, setFormData] = useState<User>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="text-center mb-2">
        <i className="bi bi-person-circle fs-1 text-success"></i>
      </div>
      {/* Título */}
      <h3 className="text-center mb-4 fw-bold">Editar Perfil</h3>

      {/* Campo: Nombre */}
      <div className="mb-3 position-relative">
        <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
        <input
          type="text"
          id="nombre"
          name="nombre"
          placeholder="Tu nombre"
          value={formData.nombre || ""}
          onChange={handleChange}
          className="form-control ps-5"
          required
        />
      </div>

      {/* Campo: Apellido */}
      <div className="mb-3 position-relative">
        <i className="bi bi-person-lines-fill position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
        <input
          type="text"
          id="apellido"
          name="apellido"
          placeholder="Tu apellido"
          value={formData.apellido || ""}
          onChange={handleChange}
          className="form-control ps-5"
          required
        />
      </div>

      {/* Campo: Email */}
      <div className="mb-3 position-relative">
        <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email || ""}
          className="form-control ps-5"
          disabled
        />
        {/*<small className="text-muted ms-1">El correo no se puede modificar</small>*/}
      </div>

      {/* Campo: Teléfono */}
      <div className="mb-4 position-relative">
        <i className="bi bi-telephone position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
        <input
          type="text"
          id="telefono"
          name="telefono"
          placeholder="Número de teléfono"
          value={formData.telefono || ""}
          onChange={handleChange}
          className="form-control ps-5"
        />
      </div>

      {/* Botones principales */}
      <div className="d-flex justify-content-center gap-2 mb-3">
        <button
          type="submit"
          className="btn btn-sm btn-primary fw-semibold px-3"
        >
          Guardar
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary fw-semibold px-3"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>

      {/* Botón extra: Cambiar contraseña */}
      {onChangePassword && (
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={onChangePassword}
            className="btn btn-outline-success btn-sm fw-semibold"
          >
            Cambiar contraseña
          </button>
        </div>
      )}
    </form>
  );
}
