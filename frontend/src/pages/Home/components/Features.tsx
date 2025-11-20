import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import "./Features.css";

const items = [
  {
    img: "/img01.jpg",
    title: "Reportar alertas",
    text: "Envía incidentes como deslizamientos, daños viales y más."
  },
  {
    img: "/img02.jpeg",
    title: "Ver alertas cercanas",
    text: "Explora problemas de tu barrio en tiempo real."
  },
  {
    img: "/img03.jpg",
    title: "Conectar con autoridades",
    text: "Tu reporte llega a quienes pueden resolverlo."
  },
  {
    img: "/img04.jpg",
    title: "Noticias en tiempo real",
    text: "Mantente informado de alertas importantes."
  },
  {
    img: "/img05.jpg",
    title: "Comunidad conectada",
    text: "Comparte info y apoya a tus vecinos."
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="carousel-infinite">

      <div className="carousel-track">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="carousel-card"
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer" }}
          >
            <Card className="shadow-sm h-100">
              <Card.Img src={item.img} />
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.text}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;