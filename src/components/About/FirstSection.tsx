import "./FirstSection.css";

export default function FirstSection() {
  return (
    <div className="container py-5">
      <h2 className="principles-title text-center">Nuestros Principios</h2>

      <div className="row g-4 justify-content-center my-5">
        <div className="col-md-3">
          <div className="principle-card">
            <i className="bi bi-rocket-takeoff fs-4"></i>
            <h3 className="principle-title">{"Misi\u00F3n"}</h3>
            <p className="principle-copy">
              {
                "Facilitar la comunicaci\u00F3n instant\u00E1nea y efectiva para construir barrios m\u00E1s seguros y colaborativos."
              }
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="principle-card">
            <i className="bi bi-bar-chart fs-4"></i>
            <h3 className="principle-title">{"Visi\u00F3n"}</h3>
            <p className="principle-copy">
              {
                "Ser plataforma l\u00EDder en gesti\u00F3n de alertas comunitarias, reconocida por su impacto positivo en la cohesi\u00F3n social."
              }
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="principle-card">
            <i className="bi bi-gem fs-4"></i>
            <h3 className="principle-title">Valores</h3>
            <p className="principle-copy">
              {
                "Compromiso, transparencia, colaboraci\u00F3n e innovaci\u00F3n son la base de nuestro trabajo diario."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
