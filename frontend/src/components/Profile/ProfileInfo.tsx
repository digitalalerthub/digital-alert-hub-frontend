import type { User } from "../../types/User";
import type { ReactNode } from "react";

interface Props {
  user: User;
  onEdit: () => void;
  onChangePassword: () => void;
  children?: ReactNode;
}

export default function ProfileInfo({
  user,
  onEdit,
  onChangePassword,
  children,
}: Props) {
  return (
    <div className="edit-background d-flex justify-content-center align-items-center">
      <div
        className="card shadow-sm p-4 w-100 bg-light"
        style={{ maxWidth: "400px", borderRadius: "16px" }}
      >
        {/* Avatar */}
        <div className="text-center mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #e6f4ff, #f3f8ff)",
            }}
          >
            <i className="bi bi-person-circle text-primary fs-1"></i>
          </div>
          <h5 className="fw-bold mb-0">Mi Perfil</h5>
          <small className="text-muted">Información de la cuenta</small>
        </div>

        {/* Datos */}
        <div className="input-group mb-3">
          <span className="input-group-text">
            <i className="bi bi-person"></i>
          </span>
          <input
            className="form-control"
            disabled
            value={`${user.nombre} ${user.apellido}`}
          />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text">
            <i className="bi bi-envelope"></i>
          </span>
          <input className="form-control" disabled value={user.email} />
        </div>

        <div className="input-group mb-4">
          <span className="input-group-text">
            <i className="bi bi-telephone"></i>
          </span>
          <input
            className="form-control"
            disabled
            value={user.telefono || "No registrado"}
          />
        </div>

        {/* Acciones */}
        <div className="d-flex justify-content-center gap-2 mb-3">
          <button onClick={onEdit} className="btn btn-primary btn-sm">
            <i className="bi bi-pencil me-1" />
            Editar perfil
          </button>

          <button
            onClick={onChangePassword}
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-shield-lock me-1" />
            Cambiar contraseña
          </button>
        </div>

        {/* ⚠️ Zona peligrosa */}
        {children && (
          <div className="border-top pt-3 mt-3 text-center">{children}</div>
        )}
      </div>
    </div>
  );
}
