import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer-section text-light">
      <Container>
        <Row className="gy-4">

          {/* Logo clickeable → Registro */}
          <Col md={4} className="text-center text-md-start">
            <Link to="/register">
              <img
                src="/logoSinFondo.png"
                alt="Digital Alert Hub Logo"
                className="footer-logo"
                style={{ cursor: "pointer" }}
              />
            </Link>

            <p className="mt-3 small">
              Construyendo comunidades más seguras con tecnología.
            </p>
          </Col>

          {/* Contacto */}
          <Col md={4} className="text-center">
            <h5 className="fw-bold mb-3">Contacto</h5>
            <p className="m-0">📍 Medellín, Colombia</p>
            <p className="m-0">📧 contacto@digitalalerthub.com</p>
            <p className="m-0">📞 +57 300 000 0000</p>
          </Col>

          {/* Redes sociales */}
          <Col md={4} className="text-center text-md-end">
            <h5 className="fw-bold mb-3">Síguenos</h5>
            <div className="social-icons">
              <a href="#" className="social-icon me-3">Facebook</a>
              <a href="#" className="social-icon me-3">Instagram</a>
              <a href="#" className="social-icon">X / Twitter</a>
            </div>
          </Col>

        </Row>

        {/* Línea final */}
        <div className="text-center mt-4 pt-3 border-top small footer-separator">
          
          © {new Date().getFullYear()} Digital Alert Hub — Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
