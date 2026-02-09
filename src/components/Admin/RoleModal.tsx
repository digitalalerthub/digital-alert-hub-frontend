import { useState, useEffect } from "react";
import rolesService, { type Rol } from "../../services/rolesService";
import "./RoleModal.css";

interface Props {
  role: Rol | null;
  onClose: () => void;
}

const RoleModal = ({ role, onClose }: Props) => {
  const isEditing = Boolean(role);

  const [nombreRol, setNombreRol] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role) {
      setNombreRol(role.nombre_rol);
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNombreRol(e.target.value);
    if (error) setError("");
  };

  const validateForm = () => {
    if (!nombreRol.trim()) {
      setError("El nombre del rol es requerido");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      if (isEditing) {
        await rolesService.update(role!.id_rol, { nombre_rol: nombreRol });
      } else {
        await rolesService.create({ nombre_rol: nombreRol });
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error guardando el rol");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop-custom" onClick={onClose} />

      {/* Modal */}
      <div className="modal-container">
        <div className="modal-content shadow-lg modal-content-custom">
          {/* Header */}
          <div className="modal-header modal-header-custom">
            <div>
              <h5 className="modal-title modal-title-custom">
                {isEditing ? "✏️ Editar Rol" : "➕ Crear Rol"}
              </h5>
              <p className="modal-subtitle">
                {isEditing
                  ? "Actualiza el nombre del rol"
                  : "Ingresa el nombre del nuevo rol"}
              </p>
            </div>
            <button
              className="btn-close btn-close-white modal-close-btn"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body modal-body-custom">
            <div className="mb-3">
              <label className="form-label form-label-custom">
                Nombre del Rol <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                name="nombre_rol"
                className={`form-control form-input-custom ${
                  error ? "is-invalid" : ""
                }`}
                value={nombreRol}
                onChange={handleChange}
                placeholder="Ej: Administrador, Usuario, Moderador"
              />
              {error && (
                <div className="invalid-feedback d-block">{error}</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer modal-footer-custom">
            <button
              className="btn btn-secondary btn-custom"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary btn-primary-custom"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Guardando...
                </>
              ) : (
                <>💾 Guardar</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleModal;