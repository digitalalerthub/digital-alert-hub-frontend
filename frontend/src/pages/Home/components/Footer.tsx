import React from "react";
import { Container } from "react-bootstrap";

const Footer: React.FC = () => {
  return (
    <footer className="py-4 bg-light mt-5 border-top">
      <Container className="text-center text-muted">
        © {new Date().getFullYear()} Digital Alert Hub • Todos los derechos reservados
      </Container>
    </footer>
  );
};

export default Footer;
