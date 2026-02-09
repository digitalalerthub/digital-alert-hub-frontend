import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <h1 className="display-4 mb-4">Bienvenido Administrador 👋</h1>

      <div className="row g-4">
        {/* Tarjeta Usuarios */}
        <div className="col-lg-4">
          <div
            className="card shadow h-100"
            onClick={() => navigate("/admin/users")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body text-center p-5">
              <i className="bi bi-people fs-1 text-primary mb-3"></i>
              <h3 className="fw-bold text-primary">Usuarios</h3>
              <p className="text-muted">Gestionar usuarios</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Roles - NUEVA */}
        <div className="col-lg-4">
          <div
            className="card shadow h-100"
            onClick={() => navigate("/admin/roles")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body text-center p-5">
              <i className="bi bi-shield-check fs-1 text-warning mb-3"></i>
              <h3 className="fw-bold text-warning">Roles</h3>
              <p className="text-muted">Gestionar roles</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Crear Alertas */}
        <div className="col-lg-4">
          <div
            className="card shadow h-100"
            onClick={() => navigate("/crear-alertas")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body text-center p-5">
              <i className="bi bi-plus-circle fs-1 text-success mb-3"></i>
              <h3 className="fw-bold text-success">Crear Alertas</h3>
              <p className="text-muted">Nueva alerta del sistema</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Power BI */}
        <div className="col-lg-4">
          <div
            className="card shadow h-100"
            onClick={() => navigate("/reportes")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body text-center p-5">
              <i className="bi bi-bar-chart fs-1 text-info mb-3"></i>
              <h3 className="fw-bold text-info">Power BI</h3>
              <p className="text-muted">Reportes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
