// 2. mostrar información del usuario y botón para editar perfil.
// Importamos el tipo User para tipar correctamente las props

import type { User } from "../../types/User";

interface Props {
  user: User;
  onEdit: () => void;
  onChangePassword: () => void;
}

export default function ProfileInfo({ user, onEdit, onChangePassword }: Props) {
  return (
    <div>
      {/* Icono superior */}
      <div className="text-center mb-2">
        <i className="bi bi-person-circle fs-1 text-success"></i>
      </div>

      {/* Título más pequeño */}
      <h4 className="text-center mb-3 fw-semibold text-secondary">
        Información del Perfil
      </h4>

      {/* Campos de solo lectura */}
      <div className="mb-2 position-relative">
        <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-secondary small"></i>
        <input
          type="text"
          className="form-control ps-5 py-2 small"
          value={user.nombre || ""}
          disabled
        />
      </div>

      <div className="mb-2 position-relative">
        <i className="bi bi-person-lines-fill position-absolute top-50 translate-middle-y ms-3 text-secondary small"></i>
        <input
          type="text"
          className="form-control ps-5 py-2 small"
          value={user.apellido || ""}
          disabled
        />
      </div>

      <div className="mb-2 position-relative">
        <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-secondary small"></i>
        <input
          type="email"
          className="form-control ps-5 py-2 small"
          value={user.email || ""}
          disabled
        />
      </div>

      <div className="mb-3 position-relative">
        <i className="bi bi-telephone position-absolute top-50 translate-middle-y ms-3 text-secondary small"></i>
        <input
          type="text"
          className="form-control ps-5 py-2 small"
          value={user.telefono || ""}
          disabled
        />
      </div>

      {/* Botones más pequeños y centrados */}
      <div className="d-flex justify-content-center gap-2 mb-2">
        <button
          onClick={onEdit}
          type="button"
          className="btn btn-primary btn-sm fw-semibold"
          style={{ width: "135px", fontSize: "0.80rem" }}
        >
          Editar perfil
        </button>

        <button
          onClick={onChangePassword}
          type="button"
          className="btn btn-secondary btn-sm fw-semibold"
          style={{ width: "141px", fontSize: "0.80rem" }}
        >
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
}
