import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useHideOnScroll } from "../../hooks/useHideOnScroll";

const NavBar: React.FC = () => {
  const hidden = useHideOnScroll();
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const collapseRef = useRef<HTMLDivElement | null>(null);
  const togglerRef = useRef<HTMLButtonElement | null>(null);
  const desktopMenuRef = useRef<HTMLLIElement | null>(null);

  const closeMobileMenu = () => {
    if (window.innerWidth >= 992) return;

    const collapseElement = collapseRef.current;
    if (!collapseElement?.classList.contains("show")) return;

    collapseElement.classList.remove("show");
    togglerRef.current?.setAttribute("aria-expanded", "false");
  };

  const closeDesktopMenu = () => setIsDesktopMenuOpen(false);

  useEffect(() => {
    closeMobileMenu();
    closeDesktopMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsDesktopMenuOpen(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node)
      ) {
        setIsDesktopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const navigateTo = (path: string) => {
    closeMobileMenu();
    closeDesktopMenu();
    navigate(path);
  };

  const handleLogout = () => {
    closeMobileMenu();
    closeDesktopMenu();
    logout();
    navigate("/");
  };

  const NavBarTextColor = () => {
    switch (location.pathname) {
      case "/":
      case "/quienes-somos":
      case "/contacto":
        return "#ffffff";
      case "/crear-alertas":
      case "/perfil":
      case "/admin":
      case "/admin/users":
      case "/jac/alertas":
      case "/admin/roles":
      case "/reportes":
        return "#ffffff";
      default:
        return "#000000ff";
    }
  };

  const NavBarBackground = () => {
    switch (location.pathname) {
      case "/":
      case "/quienes-somos":
      case "/contacto":
        return "transparent";
      case "/admin":
      case "/admin/users":
      case "/admin/roles":
      case "/jac/alertas":
      case "/reportes":
        return "#ffffff";
      default:
        return "#ffffffff";
    }
  };

  const textColor = NavBarTextColor();
  const backColor = NavBarBackground();

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top px-4 py-2 ${
        hidden ? "navbar-hidden" : ""
      }`}
      style={{
        backgroundColor: backColor,
        transition: "background-color 0.3s ease",
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to={isLoggedIn ? "/admin" : "/"}>
          <img
            src="/Logo_transparente.png"
            alt="Digital Alert Hub Logo"
            width="110"
            className="me-2"
          />
        </Link>

        <button
          ref={togglerRef}
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          ref={collapseRef}
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {isLoggedIn ? (
              <>
                <li className="nav-item d-lg-none">
                  <button
                    className="nav-link btn btn-link text-start w-100"
                    onClick={() => navigateTo("/perfil")}
                  >
                    <i className="bi bi-person me-2" />
                    Mi perfil
                  </button>
                </li>

                <li className="nav-item d-lg-none">
                  <button
                    className="nav-link btn btn-link text-start w-100"
                    onClick={() => navigateTo("/perfil/cambiar-contrasena")}
                  >
                    <i className="bi bi-shield-lock me-2" />
                    Cambiar contraseña
                  </button>
                </li>

                <li className="nav-item d-lg-none">
                  <hr className="dropdown-divider border-secondary" />
                </li>

                <li className="nav-item d-lg-none">
                  <button
                    className="nav-link btn btn-link text-start text-danger w-100"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2" />
                    Cerrar sesión
                  </button>
                </li>

                <li
                  ref={desktopMenuRef}
                  className="nav-item dropdown d-none d-lg-block position-relative"
                >
                  <button
                    className="btn border-0 bg-transparent p-0"
                    aria-expanded={isDesktopMenuOpen}
                    onClick={() =>
                      setIsDesktopMenuOpen((current) => !current)
                    }
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

                  <ul
                    className={`dropdown-menu shadow ${
                      isDesktopMenuOpen ? "show" : ""
                    }`}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.75rem)",
                      right: 0,
                      left: "auto",
                      minWidth: "220px",
                      maxWidth: "min(92vw, 260px)",
                    }}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => navigateTo("/perfil")}
                      >
                        <i className="bi bi-person me-2" />
                        Mi perfil
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => navigateTo("/perfil/cambiar-contrasena")}
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
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/"
                    onClick={closeMobileMenu}
                    style={{ color: textColor }}
                  >
                    Inicio
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/quienes-somos"
                    onClick={closeMobileMenu}
                    style={{ color: textColor }}
                  >
                    Quiénes somos
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/contacto"
                    onClick={closeMobileMenu}
                    style={{ color: textColor }}
                  >
                    Contacto
                  </Link>
                </li>

                {location.pathname !== "/login" && (
                  <li className="nav-item">
                    <button
                      className="btn btn-primary fw-semibold"
                      onClick={() => navigateTo("/login")}
                    >
                      Iniciar sesión
                    </button>
                  </li>
                )}

                {location.pathname !== "/register" && (
                  <li className="nav-item">
                    <button
                      className="btn btn-danger fw-semibold"
                      onClick={() => navigateTo("/register")}
                    >
                      Crear cuenta
                    </button>
                  </li>
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
