// Detecta isLoggedIn y actualiza el menú dinámicamente

import { Link, useNavigate } from "react-router-dom"; // Uso de navegación interna
import { useAuth } from "../context/useAuth"; // Hook del contexto global de autenticación

const NavBar: React.FC = () => {
  // Obtenemos el estado global de autenticación
  // Extraemos del contexto si el usuario está logueado y la función para cerrar sesión
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Función para cuando el usuario cierra sesión
  const handleLogout = () => {
    logout(); // Borra token y cambia el estado global
    navigate("/"); // redirige al login
  };

  // Estructura Visual
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 py-3">
      <div className="container-fluid">
        {/* Logo */}
        <Link
          className="navbar-brand fw-bold"
          to={isLoggedIn ? "/dashboard" : "/"}
        >
          <img
            src="/Logo_Blanco.png" // Cambia por el nombre real de tu archivo (por ej. /Texto_Slogan_Transparente.png)
            alt="Digital Alert Hub Logo"
            width="150"
            height="auto"
            className="me-2"
          />
        </Link>

        {/* Botón hamburguesa para móviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú de navegación */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* 🔹 Si el usuario está logueado */}
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/alertas">
                    Alertas
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/perfil">
                    Perfil
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn nav-link text-danger fw-semibold border-0 bg-transparent"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              /* 🔹 Si NO está logueado */
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/inicio">
                    Inicio
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
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light fw-semibold mx-1"
                    onClick={() => navigate("/")}
                  >
                    Iniciar sesión
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-primary fw-semibold mx-1"
                    onClick={() => navigate("/register")}
                  >
                    Crear cuenta
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
