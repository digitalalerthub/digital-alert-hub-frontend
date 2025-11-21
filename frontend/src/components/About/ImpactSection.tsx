import "./ImpactSection.css";

export default function ImpactSection() {
  return (
    <div className="container py-5">
      <div className="impact-box">

        <h2 className="fw-bold mb-3">Nuestro Impacto</h2>
        <p className="lead mb-5">
          Buscamos generar un cambio positivo y medible en la calidad de vida de
          los barrios.
        </p>

        {/* Pilares */}
        <div className="row justify-content-center g-4">
          <div className="col-lg-4 col-md-6">
            <div className="impact-item">
              <i className="bi bi-shield-lock fs-1"></i>
              <h4>Mayor Seguridad</h4>
              <p>Reducción de tiempos de respuesta mediante alertas tempranas.</p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="impact-item">
              <i className="bi bi-people-fill fs-1"></i>
              <h4>Fuerte Colaboración</h4>
              <p>Comunicación fluida entre vecinos y autoridades.</p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="impact-item">
              <i className="bi bi-lightning-fill fs-1"></i>
              <h4>Gestión Ágil</h4>
              <p>Optimización de incidentes para las Juntas de Acción Comunal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-5">
        <button className="btninfe btn-lg rounded-3 fw-bold px-5 py-2 shadow-sm">
          <i className="bi bi-shield-lock me-2"></i>
          Activar Mis Alertas Ahora
        </button>
      </div>
    </div>
  );
}
