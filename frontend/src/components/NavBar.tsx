// Hook para navegar entre páginas sin recargar
import { Link, useLocation, useNavigate } from "react-router-dom";

// Hook de autenticación global (estado de sesión)
import { useAuth } from "../context/useAuth";

// Hook personalizado: oculta el navbar cuando el usuario hace scroll hacia abajo
import { useHideOnScroll } from "../hooks/useHideOnScroll";


const NavBar: React.FC = () => {
  const hidden = useHideOnScroll(); // true si debe esconderse el navbar

  const { isLoggedIn, logout } = useAuth(); // Estado actual de login y función para cerrar sesión
  const navigate = useNavigate(); // Permite redirigir desde código
  const location = useLocation(); // Saber en qué ruta estamos

  // Cierra sesión y manda al usuario al home
  const handleLogout = () => {
    logout();     // Limpia token o sesión
    navigate("/"); // Redirige al inicio
  };

  // Cambia el color del texto del navbar dependiendo de la ruta
  const NavBarTextColor = () => {
    switch (location.pathname) {
      case "/":
        return "#ffffff"; // blanco
      case "/quienes-somos":
        return "#ffffff";
      case "/contacto":
        return "#ffffff";
      case "/dashboard":
        return "#ffc107"; // amarillo
      case "/perfil":
        return "#ffc107"; // amarillo
      default:
        return "#ffffff";
    }
  };

  // Color ya calculado para usarlo en varios elementos
  const textColor = NavBarTextColor();


  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 py-2 ${
        hidden ? "navbar-hidden" : "" // Agrega clase si el navbar debe ocultarse
      }`}
      style={{ color: textColor }} // Cambia color del texto según ruta
    >

      <div className="container-fluid">

        {/* LOGO — clicable, lleva al dashboard si hay sesión; si no, al home */}
        <Link
          className="navbar-brand fw-bold"
          to={isLoggedIn ? "/dashboard" : "/"}
          style={{ color: textColor }}
        >
          <img
            src="/Logo_transparente.png"
            alt="Digital Alert Hub Logo"
            width="110"
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

        {/* Contenedor del menú */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">

            {/* ===========================
                MENÚ PRIVADO (usuario logueado)
               ============================ */}
            {isLoggedIn ? (
              <>
                {/* Crear alerta */}
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/crear-alertas"
                    style={{ color: textColor }}
                  >
                    Crear alerta
                  </Link>
                </li>

                {/* Dashboard */}
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/dashboard"
                    style={{ color: textColor }}
                  >
                    Dashboard
                  </Link>
                </li>

                {/* Botón cerrar sesión */}
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
              /* ===========================
                 MENÚ PÚBLICO (no logueado)
                 ============================ */
              <>
                {/* Links del menú público */}
                <li className="nav-item">
                  <Link className="nav-link" to="/" style={{ color: textColor }}>
                    Inicio
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/perfil" style={{ color: textColor }}>
                    Perfil
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/quienes-somos" style={{ color: textColor }}>
                    Quiénes somos
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/contacto" style={{ color: textColor }}>
                    Contacto
                  </Link>
                </li>

                {/* Botón iniciar sesión (solo si no está ya en /login) */}
                {location.pathname !== "/login" && (
                  <button
                    className="btn btn-outline-light fw-semibold mx-1"
                    onClick={() => navigate("/login")}
                  >
                    Iniciar sesión
                  </button>
                )}

                {/* Botón registro (solo si no está en /register) */}
                {location.pathname !== "/register" && (
                  <button
                    className="btn btn-danger fw-semibold mx-1"
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
