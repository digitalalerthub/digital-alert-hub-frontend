import AndresImage from "../../assets/Andres.jpg";
import JenniferImage from "../../assets/Jennifer.jpg";
import "./FoundersSection.css";

export default function FoundersSection() {

  // Array que contiene los datos a mostrar en la card
  const teamMembers = [
    {
      name: "Andrés Monsalve",
      role: "Co - Fundador & Product Owner",
      description: "Guía la visión del producto, define prioridades y transforma ideas en soluciones valiosas.",
      image: AndresImage
    },
    {
      name: "Jennifer Gómez",
      role: "Co - Fundador & Scrum Master",
      description: "Organiza al equipo y asegura que cada proyecto avance con enfoque y eficiencia.",
      image: JenniferImage
    }
  ];

  return (
    <div className="founders-section py-5">
      <div className="container">
        <h2 className="text-center mb-5 founders-title">Nuestro Equipo Fundador</h2>

        <div className="row justify-content-center g-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-sm-10">
              <div className="founder-card">
                <div className="founder-image-wrapper mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="founder-image"
                  />
                </div>

                <h3 className="founder-name">{member.name}</h3>
                <p className="founder-role">{member.role}</p>
                <p className="founder-description">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}