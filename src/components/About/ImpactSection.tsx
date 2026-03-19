import { Link } from "react-router-dom";
import "./ImpactSection.css";

export default function ImpactSection() {
  return (
    <div className="container py-5">
      <div className="impact-box">
        <h2 className="impact-title mb-3">Nuestro Impacto</h2>
        <p className="impact-lead mb-5">
          Buscamos generar un cambio positivo y medible en la calidad de vida de
          los barrios.
        </p>

        <div className="row justify-content-center g-4">
          <div className="col-lg-4 col-md-6">
            <div className="impact-item">
              <i className="bi bi-shield-lock fs-1"></i>
              <h4 className="impact-item-title">Mayor Seguridad</h4>
              <p className="impact-item-copy">
                {"Reducci\u00F3n de tiempos de respuesta mediante alertas tempranas."}
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="impact-item">
              <i className="bi bi-people-fill fs-1"></i>
              <h4 className="impact-item-title">{"Fuerte Colaboraci\u00F3n"}</h4>
              <p className="impact-item-copy">
                {"Comunicaci\u00F3n fluida entre vecinos y autoridades."}
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="impact-item">
              <i className="bi bi-lightning-fill fs-1"></i>
              <h4 className="impact-item-title">{"Gesti\u00F3n \u00C1gil"}</h4>
              <p className="impact-item-copy">
                {"Optimizaci\u00F3n de incidentes para las Juntas de Acci\u00F3n Comunal."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <Link to="/login">
          <button className="btninfe btn-lg rounded-3 fw-bold px-5 py-2 shadow-sm">
            <i className="bi bi-shield-lock me-2"></i>
            Activar Mis Alertas Ahora
          </button>
        </Link>
      </div>
    </div>
  );
}
