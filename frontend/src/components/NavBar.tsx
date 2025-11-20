// NavBar dinámico — ahora el menú público SIEMPRE muestra ambos botones (login y registro)

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const NavBar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth(); // Estado global: true si hay sesión
  const navigate = useNavigate(); // Permite navegación programática
  const location = useLocation(); // saber la ubicación de la ruta

  // 🔹 Función para cerrar sesión
  const handleLogout = () => {
    logout(); // limpia el token
    navigate("/"); // redirige al login
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 py-3">
      <div className="container-fluid">
        {/* Logo */}
        <Link
          className="navbar-brand fw-bold"
          to={isLoggedIn ? "/dashboard" : "/"}
        >
          <img
            src="/Logo_transparente.png"
            alt="Digital Alert Hub Logo"
            width="150"
            height="auto"
            className="me-2"
          />
        </Link>

        {/* Botón hamburguesa (para móviles) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenedor del menú */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* MENÚ PRIVADO: visible solo cuando hay sesión */}

            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/crear-alertas">
                    Crear alerta
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item btn-primary fw-semibold mx-1">
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger fw-semibold text-white border-0"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              /* MENÚ PÚBLICO: siempre visible cuando no hay sesión */

              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Inicio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/perfil">
                    Perfil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/quienes-somos">
                    Quiénes somos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contacto">
                    Contacto
                  </Link>
                </li>

                {/* Botones de acción (siempre visibles en menú público) */}
                {location.pathname !== "/login" && (
                  <button
                    className="btn btn-outline-light fw-semibold mx-1"
                    onClick={() => navigate("/login")}
                  >
                    Iniciar sesión
                  </button>
                )}
                {location.pathname !== "/register" && (
                  <button
                    className="btn btn-primary fw-semibold mx-1"
                    onClick={() => navigate("/register")}
                  >
                    Crear cuenta
                  </button>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
