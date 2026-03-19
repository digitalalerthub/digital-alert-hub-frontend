import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getProfile } from "../../services/profileService";
import "../Admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const rol = user?.rol;
  const cardColors = {
    users: "#0d6efd",
    roles: "#ffc107",
    alerts: "#198754",
    jac: "#dc3545",
    reports: "#0dcaf0",
  };

  useEffect(() => {
    getProfile().then((u) => setNombre(u.nombre));
  }, []);

  return (
    <div className="panel-admin">
      <div className="container py-5 ">
        <h1 className="display-4 mb-4">Bienvenido {nombre} 👋</h1>

        <div className="row g-4">
          {rol === 1 && (
            <div className="col-lg-4">
              <div
                className="card shadow h-100"
                onClick={() => navigate("/admin/users")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center p-5">
                  <i className="bi bi-people fs-1 text-primary mb-3" />
                  <h3
                    className="fw-bold panel-admin-card-title"
                    style={{ color: cardColors.users }}
                  >
                    Usuarios
                  </h3>
                  <p
                    className="panel-admin-card-copy"
                    style={{ color: "#212529" }}
                  >
                    Gestionar usuarios
                  </p>
                </div>
              </div>
            </div>
          )}

          {rol === 1 && (
            <div className="col-lg-4">
              <div
                className="card shadow h-100"
                onClick={() => navigate("/admin/roles")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center p-5">
                  <i className="bi bi-shield-check fs-1 text-warning mb-3" />
                  <h3
                    className="fw-bold panel-admin-card-title"
                    style={{ color: cardColors.roles }}
                  >
                    Roles
                  </h3>
                  <p
                    className="panel-admin-card-copy"
                    style={{ color: "#212529" }}
                  >
                    Gestionar roles
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="col-lg-4">
            <div
              className="card shadow h-100"
              onClick={() => navigate("/crear-alertas")}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body text-center p-5">
                <i className="bi bi-plus-circle fs-1 text-success mb-3" />
                <h3
                  className="fw-bold panel-admin-card-title"
                  style={{ color: cardColors.alerts }}
                >
                  Crear Alertas
                </h3>
                <p
                  className="panel-admin-card-copy"
                  style={{ color: "#212529" }}
                >
                  Nueva alerta del sistema
                </p>
              </div>
            </div>
          </div>

          {(rol === 1 || rol === 3) && (
            <div className="col-lg-4">
              <div
                className="card shadow h-100"
                onClick={() => navigate("/jac/alertas")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center p-5">
                  <i className="bi bi-people-fill fs-1 text-danger" />
                  <h3
                    className="fw-bold panel-admin-card-title"
                    style={{ color: cardColors.jac }}
                  >
                    Panel JAC
                  </h3>
                  <p
                    className="panel-admin-card-copy"
                    style={{ color: "#212529" }}
                  >
                    Gestión comunitaria
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="col-lg-4">
            <div
              className="card shadow h-100"
              onClick={() => navigate("/reportes")}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body text-center p-5">
                <i className="bi bi-bar-chart fs-1 text-info mb-3" />
                <h3
                  className="fw-bold panel-admin-card-title"
                  style={{ color: cardColors.reports }}
                >
                  Reportes
                </h3>
                <p
                  className="panel-admin-card-copy"
                  style={{ color: "#212529" }}
                >
                  Métricas e indicadores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
