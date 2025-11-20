import React from "react";
import BannerQuienesSomos from "../components/About/Banner";
import AndresImage from "../assets/Andres.jpg";
import JenniferImage from "../assets/Jennifer.jpg";

const QuienesSomosPage: React.FC = () => {
  return (
    <>
      <BannerQuienesSomos />
      <div className="container py-5">
        {/* ========================================================= */}
        {/* SECCIÓN NUESTROS PRINCIPIOS */}
        {/* ========================================================= */}
        <h2 className="text-center">Nuestros Principios</h2>

        <div className="container my-5">
          <div className="row g-5 justify-content-center">
            <div className="col-md-3">
              <div className="p-4 bg-light text-center rounded shadow h-100">
                <i className="bi bi-rocket-takeoff fs-4"></i>

                <h3>Misión</h3>
                <p>
                  Facilitar la comunicación instantánea y efectiva para
                  construir barrios más seguros y colaborativos
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-4 bg-light text-center rounded shadow h-100">
                <i className="bi bi-bar-chart fs-4"></i>

                <h3>Visión</h3>
                <p>
                  Ser plataforma líder en gestión de alertas comunitarias,
                  reconocida por su impacto positivo en la cohesión social.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-4 bg-light text-center rounded shadow h-100">
                <i className="bi bi-gem fs-4"></i>

                <h3>Valores</h3>
                <p>
                  Compromiso, transparencia, colaboración e innovación son los
                  pilares de nuestro trabajo diario.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECCIÓN NUESTRA HISTORIA (LÍNEA DE TIEMPO CON MEJORA) */}
        {/* ========================================================= */}
        <div className="container py-5">
          <h2 className="text-center mb-5">Nuestra Historia</h2>

          {/* 👈 INICIO DE LA MEJORA: Fila centrada con columna de ancho limitado */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              {/* Contenedor principal de la línea de tiempo simple */}
              <div className="simple-timeline">
                
                {/* Evento 1 */}
                <div className="timeline-item">
                  <div className="timeline-point"></div> {/* Punto azul */}
                  <div className="timeline-content">
                    <h3 className="mb-1">
                      {/* Título mejorado: Año en azul y negrita, título normal */}
                      <span className="text-primary fw-bolder me-2">2022</span>
                      <span className="fw-normal text-dark">- La Idea</span>
                    </h3>
                    <p>
                      Nace la idea de crear una herramienta para mejorar la
                      comunicación y seguridad en barrios, observando la necesidad
                      de una conexión más directa entre vecinos y autoridades.
                    </p>
                  </div>
                </div>

                {/* Evento 2 */}
                <div className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h3 className="mb-1">
                      <span className="text-primary fw-bolder me-2">2023</span>
                      <span className="fw-normal text-dark">- Desarrollo</span>
                    </h3>
                    <p>
                      Un equipo apasionado se une para dar vida al proyecto. Se
                      desarrollan los primeros prototipos y se realizan pruebas
                      piloto con Juntas de Acción Comunal para refinar la
                      plataforma.
                    </p>
                  </div>
                </div>

                {/* Evento 3 */}
                <div className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h3 className="mb-1">
                      <span className="text-primary fw-bolder me-2">2024</span>
                      <span className="fw-normal text-dark">- Lanzamiento</span>
                    </h3>
                    <p>
                      Lanzamos oficialmente Alertas Comunitarias, con el compromiso
                      de seguir creciendo y evolucionando para servir mejor a
                      nuestras comunidades.
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div> 
          {/* 👆 FIN DE LA MEJORA */}
        </div>
        
        {/* ========================================================= */}
        {/* SECCIÓN NUESTRO EQUIPO FUNDADOR */}
        {/* ========================================================= */}
        <div className="container my-5">
          <h2 className="text-center mb-5">Nuestro Equipo Fundador</h2>
          <div className="row justify-content-center g-4">
            {/* Columna 1: Andres Monsalve */}
            <div className="col-lg-4 col-md-6 col-sm-10">
              <div className="text-center p-3 h-100">
                {/* Contenedor de la Imagen con Estilo de Borde Redondeado y Fondo Gris */}
                <div className="d-inline-block p-2 bg-light rounded-4 mb-3">
                  <img
                    src={AndresImage}
                    alt="Andres Monsalve"
                    className="img-fluid rounded-4"
                    style={{
                      width: "150px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Texto */}
                <h4 className="mb-1">Andres Monsalve</h4>
                <p className="text-primary fw-bold mb-3">
                  Co - Fundador & Product Owner
                </p>
                <p className="text-muted">
                  Guía la visión del producto, define prioridades y transforma
                  ideas en soluciones valiosas que generan verdadero impacto.
                </p>
              </div>
            </div>

            {/* Columna 2: Jennifer Gómez */}
            <div className="col-lg-4 col-md-6 col-sm-10">
              <div className="text-center p-3 h-100">
                {/* Contenedor de la Imagen con Estilo de Borde Redondeado y Fondo Gris */}
                <div className="d-inline-block p-2 bg-light rounded-4 mb-3">
                  <img
                    src={JenniferImage}
                    alt="Jennifer Gómez"
                    className="img-fluid rounded-4"
                    style={{
                      width: "150px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Texto */}
                <h4 className="mb-1">Jennifer Gómez</h4>
                <p className="text-primary fw-bold mb-3">
                  Co - Fundador & Scrum Master
                </p>
                <p className="text-muted">
                  Organiza al equipo y asegura que cada proyecto avance con
                  enfoque y eficiencia, facilitando procesos ágiles que generan
                  resultados de alto impacto.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECCIÓN NUESTRO IMPACTO Y CTA */}
        {/* ========================================================= */}
        <div className="container py-5">
          {/* Contenedor del Impacto con fondo y bordes redondeados */}
          <div className="bg-light p-4 p-md-5 rounded-4 text-center">
            {/* Título y texto introductorio */}
            <h2 className="text-primary fw-bold mb-3">Nuestro Impacto</h2>
            <p className="lead mb-5">
              Buscamos generar un cambio positivo y medible en la calidad de
              vida de los barrios. Nuestra plataforma está diseñada para ser más
              que una herramienta de gran cohesión social y seguridad proactiva.
            </p>
            {/* ------------------------------------- */}
            {/* Fila de los 3 Pilares de Impacto */}
            {/* ------------------------------------- */}
            <div className="row justify-content-center g-4">
              {/* Pilar 1: Mayor Seguridad */}
              <div className="col-lg-4 col-md-6">
                <div className="h-100 px-3">
                  <i className="bi bi-shield-lock fs-1 text-primary"></i>

                  <h4 className="mt-3 mb-1 fw-bold">Mayor Seguridad</h4>
                  <p className="text-muted small">
                    Reducción en tiempos de respuesta y prevención del delito a
                    través de alertas tempranas.
                  </p>
                </div>
              </div>

              {/* Pilar 2: Fuerte Colaboración */}
              <div className="col-lg-4 col-md-6">
                <div className="h-100 px-3">
                  <i className="bi bi-people-fill fs-1 text-primary"></i>

                  <h4 className="mt-3 mb-1 fw-bold">Fuerte Colaboración</h4>
                  <p className="text-muted small">
                    Fortalecimiento de los lazos vecinales y una comunicación
                    fluida con las autoridades.
                  </p>
                </div>
              </div>

              {/* Pilar 3: Gestión Ágil */}
              <div className="col-lg-4 col-md-6">
                <div className="h-100 px-3">
                  <i className="bi bi-lightning-fill fs-1 text-primary"></i>

                  <h4 className="mt-3 mb-1 fw-bold">Gestión Ágil</h4>
                  <p className="text-muted small">
                    Optimización de la gestión de incidentes para las Juntas de
                    Acción Comunal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección del Botón Call to Action (CTA) con mejora de copy */}
          <div className="text-center mt-5">
            <h3 className="mb-3 text-primary">
              ¡Únete a miles de vecinos y transforma tu comunidad!
            </h3>
            <button className="btn btn-danger btn-lg rounded-3 fw-bold px-5 py-2 shadow-sm">
              <i className="bi bi-shield-lock me-2"></i>
              Activar Mis Alertas Ahora
            </button>
            <p className="text-muted small mt-2">
              Solo toma 30 segundos, ¡es completamente gratis!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuienesSomosPage;