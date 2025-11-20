import { Container, Button } from "react-bootstrap";
import "../HomePage.css";

const Hero = () => {
  return (
    <section className="hero-section text-white d-flex align-items-center">

      <div className="w-100 d-flex justify-content-center">
        <div 
          className="d-flex align-items-center flex-wrap justify-content-center"
          style={{ maxWidth: "1200px", gap: "40px", minHeight: "70vh" }}
        >

          {/* COLUMNA IZQUIERDA */}
          <div 
            className="d-flex flex-column text-start"
            style={{ maxWidth: "480px" }}
          >
            <h1 className="fw-bold display-5">
              ¡TU <span className="text-danger">ALERTA</span>, <br />
              NUESTRA <span className="text-info">ACCIÓN</span>! 🚨
            </h1>

            <p className="mt-3 mb-4 lead">
              La forma más rápida de informar riesgos en tu comunidad.  
              Envía evidencias y ubicación para que las JAC actúen.
            </p>

            <div className="text-center">
              <Button 
                variant="danger" 
                size="lg" 
                href="/login"
                className="rounded-pill px-5"
              >
                Crear Alerta
              </Button>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="text-center">
            <img
              src="/logoNombre.png"
              alt="Logo"
              className="img-fluid"
              style={{ width: "500px" }}
            />
          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;
