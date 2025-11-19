import React from "react";
import { Container, Button } from "react-bootstrap";
import "../../../App.css"; // estilos globales si los necesitas
import "../HomePage.css"; // el fondo y estilos del Home

const Hero: React.FC = () => {
  return (
    <section className="hero-section d-flex align-items-center">
      <Container className="d-flex justify-content-between align-items-center flex-wrap">

        {/* Texto */}
        <div className="text-white mb-5">
          <h1 className="fw-bold display-5">
            ¡TU <span className="text-danger">ALERTA</span>, <br />
            NUESTRA <span className="text-info">ACCIÓN</span>! 🚨
          </h1>

          <p className="mt-3 mb-4 lead">
            La forma más rápida de informar riesgos en tu <br />
            comunidad. Envía evidencias y ubicación para <br />
            que las JAC y autoridades actúen de inmediato.
          </p>

          <Button variant="danger" size="lg" href="/Login" className="rounded-pill">
            Crear Alerta
          </Button>
        </div>

        {/* Imagen */}
        <div>
          <img
            src="/logoNombre.png"
            alt="Logo"
            className="img-fluid"
            style={{ width: "450px" }}
          />
        </div>
      </Container>
    </section>
  );
};

export default Hero;
