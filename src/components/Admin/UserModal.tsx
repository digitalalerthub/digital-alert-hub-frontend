import { useState, useEffect } from "react";
import usersService from "../../services/users";
import rolesService, { type Rol } from "../../services/rolesService";
import "./UserModal.css";

import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "../../types/User";

interface Props {
  user: User | null;
  onClose: () => void;
}

const UserModal = ({ user, onClose }: Props) => {
  const isEditing = Boolean(user);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    id_rol: "",
    contrasena: "",
  });

  const [roles, setRoles] = useState<Rol[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesService.getAll();
        setRoles(data);
      } catch (err) {
        console.error("Error cargando roles", err);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || "",
        id_rol: String(user.id_rol),
        contrasena: "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es requerido";
    if (!form.email.trim()) newErrors.email = "El email es requerido";
    if (!form.id_rol) newErrors.id_rol = "Debe seleccionar un rol";
    if (!isEditing && !form.contrasena) {
      newErrors.contrasena = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      if (isEditing) {
        const payload: UpdateUserPayload = {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          id_rol: Number(form.id_rol),
        };

        await usersService.update(user!.id_usuario, payload);
      } else {
        const payload: CreateUserPayload = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          telefono: form.telefono,
          id_rol: Number(form.id_rol),
          contrasena: form.contrasena,
        };

        await usersService.create(payload);
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error guardando el usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop con blur */}
      <div className="modal-backdrop-custom" onClick={onClose} />

      {/* Modal */}
      <div className="modal-container">
        <div className="modal-content shadow-lg modal-content-custom">
          {/* Header mejorado */}
          <div className="modal-header modal-header-custom">
            <div>
              <h5 className="modal-title modal-title-custom">
                {isEditing ? "✏️ Editar Usuario" : "➕ Crear Usuario"}
              </h5>
              <p className="modal-subtitle">
                {isEditing
                  ? "Actualiza la información del usuario"
                  : "Completa los datos del nuevo usuario"}
              </p>
            </div>
            <button
              className="btn-close btn-close-white modal-close-btn"
              onClick={onClose}
            ></button>
          </div>

          {/* Body con mejor espaciado */}
          <div className="modal-body modal-body-custom">
            <div className="row g-4">
              {/* Nombre */}
              <div className="col-md-6">
                <label className="form-label form-label-custom">
                  Nombre <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className={`form-control form-input-custom ${
                    errors.nombre ? "is-invalid" : ""
                  }`}
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ingresa el nombre"
                />
                {errors.nombre && (
                  <div className="invalid-feedback d-block">
                    {errors.nombre}
                  </div>
                )}
              </div>

              {/* Apellido */}
              <div className="col-md-6">
                <label className="form-label form-label-custom">
                  Apellido <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  className={`form-control form-input-custom ${
                    errors.apellido ? "is-invalid" : ""
                  }`}
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Ingresa el apellido"
                />
                {errors.apellido && (
                  <div className="invalid-feedback d-block">
                    {errors.apellido}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="col-md-7">
                <label className="form-label form-label-custom">
                  📧 Email <span className="required-asterisk">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-control form-input-custom ${
                    errors.email ? "is-invalid" : ""
                  } ${isEditing ? "input-disabled" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                  disabled={isEditing}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email}</div>
                )}
              </div>

              {/* Teléfono */}
              <div className="col-md-5">
                <label className="form-label form-label-custom">
                  📱 Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  className="form-control form-input-custom"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+57 300 123 4567"
                />
              </div>

              {/* Rol + Contraseña en la misma fila */}
              <div className="col-md-6">
                <label className="form-label form-label-custom">
                  👤 Rol <span className="required-asterisk">*</span>
                </label>
                <select
                  name="id_rol"
                  className={`form-select form-input-custom ${
                    errors.id_rol ? "is-invalid" : ""
                  }`}
                  value={form.id_rol}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre_rol}
                    </option>
                  ))}
                </select>
                {errors.id_rol && (
                  <div className="invalid-feedback d-block">
                    {errors.id_rol}
                  </div>
                )}
              </div>

              {/* Contraseña solo al crear */}
              {!isEditing && (
                <div className="col-md-6">
                  <label className="form-label form-label-custom">
                    🔒 Contraseña <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="password"
                    name="contrasena"
                    className={`form-control form-input-custom ${
                      errors.contrasena ? "is-invalid" : ""
                    }`}
                    value={form.contrasena}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.contrasena && (
                    <div className="invalid-feedback d-block">
                      {errors.contrasena}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer mejorado */}
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

export default UserModal;
