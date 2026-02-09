import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import rolesService, { type Rol } from "../../services/rolesService";
import RoleModal from "./RoleModal";
import "./RoleTable.css";

const RoleTable = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rolesList = await rolesService.getAll();
      setRoles(rolesList);
    } catch (err) {
      console.error("Error cargando roles", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedRole(null);
    setShowModal(true);
  };

  const openEdit = (role: Rol) => {
    setSelectedRole(role);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRole(null);
    loadData();
  };

  const handleDelete = async (id_rol: number, nombre_rol: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${nombre_rol}"?`)) {
      return;
    }

    try {
      await rolesService.delete(id_rol);
      loadData();
    } catch (err) {
      alert("Error eliminando el rol");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <div className="role-table-container">
      {showModal && (
        <RoleModal role={selectedRole} onClose={handleModalClose} />
      )}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="breadcrumb-nav">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin" className="breadcrumb-link">
              <i className="bi bi-house-door-fill me-2" />
              Panel Principal
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Gestión de Roles
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="header-section">
        <div className="title-section">
          <h1 className="main-title">Gestión de Roles</h1>
          <p className="subtitle">Administra los roles del sistema</p>
        </div>
      </div>

      {/* Card contenedor */}
      <div className="main-card">
        {/* Header con botón */}
        <div className="card-header-section">
          <div className="header-info">
            <h3 className="header-title">Roles del Sistema</h3>
            <p className="header-description">
              Total de roles: <strong>{roles.length}</strong>
            </p>
          </div>
          <button className="create-btn" onClick={openCreate}>
            <span className="btn-icon">+</span>
            Nuevo Rol
          </button>
        </div>

        {/* Lista de roles */}
        {roles.length > 0 ? (
          <div className="roles-grid">
            {roles.map((role, index) => (
              <div
                key={role.id_rol}
                className="role-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="role-card-header">
                  <div className="role-icon-wrapper">
                    <i className="bi bi-shield-check role-icon" />
                  </div>
                  <div className="role-actions">
                    <button
                      className="action-btn-edit"
                      onClick={() => openEdit(role)}
                      title="Editar rol"
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="action-btn-delete"
                      onClick={() => handleDelete(role.id_rol, role.nombre_rol)}
                      title="Eliminar rol"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>

                <div className="role-card-body">
                  <h4 className="role-name">{role.nombre_rol}</h4>
                  <p className="role-id-text">ID: {role.id_rol}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <i className="bi bi-shield-x" style={{ fontSize: "4rem" }} />
            </div>
            <h3 className="empty-title">No hay roles registrados</h3>
            <p className="empty-description">
              Comienza creando tu primer rol del sistema
            </p>
            <button className="create-btn-empty" onClick={openCreate}>
              <span className="btn-icon">+</span>
              Crear Primer Rol
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleTable;