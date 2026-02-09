import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import usersService from "../../services/users";
import rolesService, { type Rol } from "../../services/rolesService";
import type { User } from "../../types/User";
import UserModal from "./UserModal";
import "./UserTable.css";

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersList, rolesList] = await Promise.all([
        usersService.getAll(),
        rolesService.getAll(),
      ]);

      setUsers(usersList);
      setRoles(rolesList);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error cargando usuarios o roles", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const searchLower = searchTerm.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const email = user.email.toLowerCase();

      return fullName.includes(searchLower) || email.includes(searchLower);
    });
  }, [users, searchTerm]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const findRoleName = (id_rol: number): string => {
    const role = roles.find((r) => r.id_rol === id_rol);
    return role ? role.nombre_rol : "Sin rol";
  };

  const formatDate = (dateString: string): string => {
    try {
      const iso = dateString.replace(" ", "T");
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "Fecha inválida";

      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const toggleStatus = async (id_usuario: number, estado: boolean) => {
    if (!confirm(`¿Desea ${estado ? "inactivar" : "activar"} este usuario?`)) {
      return;
    }

    try {
      await usersService.toggleStatus(id_usuario, !estado);
      loadData();
    } catch {
      alert("Error cambiando el estado");
    }
  };

  const openCreate = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
    loadData();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="user-table-container">
      {showModal && (
        <UserModal user={selectedUser} onClose={handleModalClose} />
      )}

      <nav aria-label="breadcrumb" className="breadcrumb-nav">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin" className="breadcrumb-link">
              <i className="bi bi-house-door-fill me-2" />
              Panel Principal
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Gestión de Usuarios
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="header-section">
        <div className="title-section">
          <h1 className="main-title">Gestión de Usuarios</h1>
          <p className="subtitle">
            Administra y controla los usuarios del sistema
          </p>
        </div>
      </div>

      {/* Card contenedor */}
      <div className="main-card">
        {/* Barra de búsqueda con botón */}
        <div className="search-section">
          <div className="search-box-wrapper">
            <svg
              className="search-icon-svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-button">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5.354 4.646a.5.5 0 1 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            )}
          </div>

          <button className="create-btn" onClick={openCreate}>
            <span className="btn-icon">+</span>
            Nuevo Usuario
          </button>
        </div>

        {searchTerm && (
          <div className="search-results-info">
            {filteredUsers.length === 0 ? (
              <span className="no-results-text">
                No se encontraron usuarios que coincidan con "{searchTerm}"
              </span>
            ) : (
              <span className="results-found-text">
                {filteredUsers.length} usuario
                {filteredUsers.length !== 1 ? "s" : ""} encontrado
                {filteredUsers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Tabla */}
        <div className="table-container">
          {paginatedUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="empty-title">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay usuarios"}
              </h3>
              <p className="empty-description">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza creando tu primer usuario"}
              </p>
            </div>
          ) : (
            <table className="user-table">
              <thead>
                <tr className="thead-row">
                  <th className="table-th">ID</th>
                  <th className="table-th table-th-left">Nombre Completo</th>
                  <th className="table-th table-th-left">Correo Electrónico</th>
                  <th className="table-th">Rol</th>
                  <th className="table-th">Fecha de Creación</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr
                    key={user.id_usuario}
                    className="table-row"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="td-id">{user.id_usuario}</td>
                    <td className="td-name">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="td-email">{user.email}</td>
                    <td className="td-center">
                      <span className="role-badge">
                        {findRoleName(user.id_rol)}
                      </span>
                    </td>
                    <td className="td-date">{formatDate(user.created_at)}</td>
                    <td className="td-center">
                      <span
                        className={
                          user.estado ? "status-active" : "status-inactive"
                        }
                      >
                        <span className="status-dot"></span>
                        {user.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button
                        className="action-btn-edit"
                        title="Editar usuario"
                        onClick={() => openEdit(user)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className={
                          user.estado
                            ? "action-btn-deactivate"
                            : "action-btn-activate"
                        }
                        title={
                          user.estado ? "Desactivar usuario" : "Activar usuario"
                        }
                        onClick={() =>
                          toggleStatus(user.id_usuario, user.estado)
                        }
                      >
                        {user.estado ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {filteredUsers.length > 0 && totalPages > 1 && (
          <div className="pagination-section">
            <div className="pagination-info">
              Mostrando{" "}
              <strong>
                {startIndex + 1}-{endIndex}
              </strong>{" "}
              de <strong>{filteredUsers.length}</strong> usuarios
            </div>
            <div className="pagination-buttons">
              <button
                className={`pagination-btn ${currentPage === 1 ? "pagination-btn-disabled" : ""}`}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? "pagination-btn-active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className={`pagination-btn ${currentPage === totalPages ? "pagination-btn-disabled" : ""}`}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
