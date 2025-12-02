// Hook de React Router para navegar programáticamente (redirecciones con JS)
import { useNavigate } from "react-router-dom";

// Card de React Bootstrap para mostrar contenido en tarjeta con diseño bonito
import { Card } from "react-bootstrap";

import "./Features.css";

// Lista de elementos que formarán el carrusel infinito.
// Cada ítem tiene imagen, título y texto descriptivo.
const items = [
  {
    img: "/img01.jpg",
    title: "Deslizamientos de Tierra en Laderas Vulnerables",
    text: "El crecimiento urbano desordenado y las lluvias han provocado frecuentes deslizamientos en Medellín, afectando sobre todo a barrios vulnerables cercanos a laderas y quebradas. Estos eventos representan el 74% de las pérdidas por desastres naturales en la ciudad, dejando viviendas destruidas y familias en alto riesgo."
  },
  {
    img: "/img02.jpeg",
    title: "Incumplimiento de Normas de Construcción  y Riesgos Estructurales",
    text: "Medellín enfrenta problemas estructurales graves por fallas en la planificación, el control y el cumplimiento de normas de construcción, lo que ha puesto en riesgo vidas y evidenciado debilidades en la supervisión urbana. Esta situación ha generado consecuencias humanas y un llamado urgente a reforzar la seguridad, la responsabilidad de las constructoras y los estándares de calidad en la ciudad."
  },
  {
    img: "/img03.jpg",
    title: "Contaminación y Gestión del Río Medellín",
    text: "El río Medellín sigue en crisis por la mala gestión de residuos y la contaminación industrial y doméstica, lo que, sumado a las lluvias intensas, genera crecidas peligrosas y riesgo de desbordamientos. En octubre de 2025, las filtraciones obligaron a suspender el servicio en varias estaciones del Metro, dejando claro que el impacto ya no es solo ambiental, sino también directo sobre la movilidad y la infraestructura de la ciudad."
  },
  {
    img: "/img04.jpg",
    title: "Deterioro de la Malla Vial y Riesgos Urbanos",
    text: "Medellín enfrenta una crisis en su malla vial: el deterioro por falta de mantenimiento, mal diseño y el clima ha llenado las vías de huecos y grietas que generan accidentes y daños vehiculares. Para frenar la situación, la Alcaldía invertirá más de $53.000 millones y promete tapar 5.000 huecos antes de finalizar el año con cuadrillas trabajando día y noche."
  },
  {
    img: "/img05.jpeg",
    title: "Inundaciones y Crecientes de Quebradas",
    text: "Las lluvias intensas han desatado inundaciones y caos en Medellín, golpeando fuerte zonas como Belén y Altavista, donde el desbordamiento de quebradas ha dejado viviendas y negocios destruidos. La emergencia ha obligado a evacuaciones, suspensión de eventos y ha afectado seriamente la movilidad, dejando claro que la ciudad sigue vulnerable frente al impacto climático."
  },
];

const Features = () => {
  // Hook para navegar al hacer clic en cualquier tarjeta
  const navigate = useNavigate();

  return (
    <div className="carousel-infinite">
      {/* Track que contiene todas las tarjetas duplicadas para simular un carrusel infinito */}
      <div className="carousel-track">
        {[...items, ...items].map((item, index) => (
          // Cada tarjeta es clickeable: redirige al usuario al login
          <div
            key={index}
            className="carousel-card"
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer" }}
          >
            {/* Tarjeta visual con sombra y altura completa */}
            <Card className="shadow-sm h-100">
              <Card.Img src={item.img} /> {/* Imagen del problema */}
              <Card.Body>
                <Card.Title>{item.title}</Card.Title> {/* Título */}
                <Card.Text>{item.text}</Card.Text>   {/* Descripción */}
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
