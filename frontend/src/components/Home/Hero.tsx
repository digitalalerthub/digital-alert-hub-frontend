import { Button } from "react-bootstrap"; // Importa el componente Button de React Bootstrap para usar botones ya estilizados.
import "./Hero.css";

const Hero = () => {
  return (
    // Sección principal del home. Fondo, texto blanco y contenido centrado verticalmente.
    <section className="hero-section text-white d-flex align-items-center">

      {/* Contenedor que centra todo horizontalmente */}
      <div className="w-100 d-flex justify-content-center">

        {/* Contenedor interno con límite de ancho, separación entre columnas y altura mínima */}
        <div
          className="d-flex align-items-center flex-wrap justify-content-center"
          style={{ maxWidth: "1200px", gap: "40px", minHeight: "70vh" }}
        >

          {/* ================= COLUMNA IZQUIERDA ================= */}
          <div
            className="d-flex flex-column text-start"
            style={{ maxWidth: "580px" }}
          >

            {/* Título principal del banner, con partes coloreadas y un ícono de alerta */}
            <h1 className="fw-bold display-5">
              ¡TU <span className="text-danger">ALERTA</span>, <br />
              NUESTRA <span className="text-info">ACCIÓN</span>!
              <span className="alert-icon">
                <img src="/alertaIcono.png" alt="alert icon" />
              </span>
            </h1>

            {/* Texto descriptivo breve del propósito de la app */}
            <p className="mt-3 mb-4 lead">
              La forma más rápida de informar riesgos <br />  
              en tu comunidad. Envía evidencias y <br />
              ubicación para que las JAC actúen.
            </p>

            {/* Botón principal de acción: redirige al login para crear una alerta */}
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

          {/* ================= COLUMNA DERECHA ================= */}
          <div className="text-center">
            {/* Logo grande del proyecto. Imagen responsive. */}
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
