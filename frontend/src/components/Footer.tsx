// Importa los componentes de layout de React Bootstrap (grid responsiva)
import { Container, Row, Col } from "react-bootstrap";

// Link de React Router para navegación sin recargar la página
import { Link } from "react-router-dom";

import "../App.css";

// Lista de redes sociales con su ícono y URL
const socialIcons = [
  { icon: "bi-facebook", url: "#" },
  { icon: "bi-instagram", url: "#" },
  { icon: "bi-github", url: "#" },
  { icon: "bi-twitter-x", url: "#" },
];

const Footer: React.FC = () => {
  return (
    // Sección completa del footer con estilo oscuro
    <footer className="footer-section text-light">
      <Container>
        <Row className="gy-4">

          {/* =====================
              Columna 1: Logo + Texto
             ===================== */}
          <Col md={4} className="text-center text-md-start">
            {/* Logo que al hacer clic te envía al registro */}
            <Link to="/register">
              <img
                src="/logoSinFondo.png"
                alt="Digital Alert Hub Logo"
                className="footer-logo"
              />
            </Link>

            <p className="mt-3 small">
              La red inteligente de alertas ciudadanas.
            </p>
          </Col>

          {/* =====================
              Columna 2: Datos de contacto
             ===================== */}
          <Col md={4} className="text-center">
            <h5 className="fw-bold mb-3">Contacto</h5>
            <p className="m-0">📍 Medellín, Colombia</p>
            <p className="m-0">📧 digitalalerthub@gmail.com</p>
            <p className="m-0">📞 +57 300 000 0000</p>
          </Col>

          {/* =====================
              Columna 3: Redes sociales
             ===================== */}
          <Col md={4} className="text-center text-md-end">
            <h5 className="fw-bold mb-3">Síguenos</h5>

            {/* Lista de íconos con enlaces */}
            <div className="social-icons d-flex justify-content-md-end justify-content-center gap-3">
              {socialIcons.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                >
                  {/* Clase de Bootstrap Icons dinámica */}
                  <i className={`bi ${item.icon}`}></i>
                </a>
              ))}
            </div>
          </Col>

        </Row>

        {/* =====================
            Línea inferior del footer
           ===================== */}
        <div className="text-center mt-4 pt-3 border-top small footer-separator">
          © {new Date().getFullYear()} Digital Alert Hub — Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
