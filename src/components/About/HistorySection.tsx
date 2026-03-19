import "./HistorySection.css";

export default function HistorySection() {
  const events = [
    {
      year: "2025",
      phase: "IDEA",
      description:
        "Nace la idea de crear una herramienta para mejorar la comunicaci\u00F3n y seguridad en los barrios.",
      icon: "bi-lightbulb",
      color: "#007bff",
    },
    {
      year: "2025",
      phase: "DESARROLLO",
      description:
        "Se construyen prototipos y se realizan pruebas con Juntas de Acci\u00F3n Comunal.",
      icon: "bi-hammer",
      color: "#28a745",
    },
    {
      year: "2026",
      phase: "LANZAMIENTO",
      description:
        "Lanzamos oficialmente Alertas Comunitarias para transformar la seguridad ciudadana.",
      icon: "bi-rocket-takeoff",
      color: "#dc3545",
    },
  ];

  return (
    <div className="container py-5">
      <h2 className="history-title text-center mb-5">Nuestra Historia</h2>

      <div className="row align-items-center">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="timeline-vertical">
            {events.map((event, index) => (
              <div key={index} className="timeline-item">
                <div
                  className="timeline-dot"
                  style={{
                    background: `linear-gradient(135deg, ${event.color}, ${event.color}cc)`,
                    boxShadow: `0 0 0 4px ${event.color}20`,
                  }}
                >
                  <i className={`bi ${event.icon}`}></i>
                </div>

                <div className="timeline-content">
                  <div
                    className="timeline-badge mb-2"
                    style={{
                      background: `${event.color}15`,
                      color: event.color,
                    }}
                  >
                    {event.year}
                  </div>
                  <h3 className="timeline-title">{event.phase}</h3>
                  <p className="timeline-text mb-0">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="history-image">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
              alt="Equipo trabajando"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
