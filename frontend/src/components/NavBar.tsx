import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useHideOnScroll } from "../hooks/useHideOnScroll";

const NavBar: React.FC = () => {
  const hidden = useHideOnScroll();

  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const NavBarTextColor = () => {
    switch (location.pathname) {
      case "/":
      case "/quienes-somos":
      case "/contacto":
        return "#ffffff";
      case "/dashboard":
      case "/crear-alertas":
      case "/perfil":
        return "#ffffffff";
      default:
        return "#000000ff";
    }
  };

  const textColor = NavBarTextColor();

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 py-2 ${
        hidden ? "navbar-hidden" : ""
      }`}
    >
      <div className="container-fluid">
        {/* LOGO */}
        <Link
          className="navbar-brand fw-bold"
          to={isLoggedIn ? "/dashboard" : "/"}
        >
          <img
            src="/Logo_transparente.png"
            alt="Digital Alert Hub Logo"
            width="110"
            className="me-2"
          />
        </Link>

        {/* TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">

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

                {/* 👤 AVATAR + DROPDOWN */}
                <li className="nav-item dropdown">
                  <button
                    className="btn border-0 bg-transparent p-0"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                        background: "rgba(255,255,255,0.15)",
                      }}
                    >
                      <i
                        className="bi bi-person-fill fs-5"
                        style={{ color: textColor }}
                      />
                    </div>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow mt-2">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => navigate("/perfil")}
                      >
                        <i className="bi bi-person me-2" />
                        Mi perfil
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          navigate("/perfil?tab=password")
                        }
                      >
                        <i className="bi bi-shield-lock me-2" />
                        Cambiar contraseña
                      </button>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2" />
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* MENÚ PÚBLICO */}
                <li className="nav-item">
                  <Link className="nav-link" to="/" style={{ color: textColor }}>
                    Inicio
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/quienes-somos"
                    style={{ color: textColor }}
                  >
                    Quiénes somos
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/contacto"
                    style={{ color: textColor }}
                  >
                    Contacto
                  </Link>
                </li>

                {location.pathname !== "/login" && (
                  <button
                    className="btn btn-outline-light fw-semibold"
                    onClick={() => navigate("/login")}
                  >
                    Iniciar sesión
                  </button>
                )}

                {location.pathname !== "/register" && (
                  <button
                    className="btn btn-danger fw-semibold"
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
