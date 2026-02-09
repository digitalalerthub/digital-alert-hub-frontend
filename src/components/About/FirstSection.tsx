import "./FirstSection.css";

export default function FirstSection() {
  return (
    <div className="container py-5">
      <h2 className="text-center">Nuestros Principios</h2>

      <div className="row g-4 justify-content-center my-5">
        <div className="col-md-3">
          <div className="principle-card">
            <i className="bi bi-rocket-takeoff fs-4"></i>
            <h3>Misión</h3>
            <p>
              Facilitar la comunicación instantánea y efectiva para construir
              barrios más seguros y colaborativos.
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="principle-card">
            <i className="bi bi-bar-chart fs-4"></i>
            <h3>Visión</h3>
            <p>
              Ser plataforma líder en gestión de alertas comunitarias,
              reconocida por su impacto positivo en la cohesión social.
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="principle-card">
            <i className="bi bi-gem fs-4"></i>
            <h3>Valores</h3>
            <p>
              Compromiso, transparencia, colaboración e innovación son la base
              de nuestro trabajo diario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
