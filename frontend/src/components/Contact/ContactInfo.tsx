import React from "react";
import "./ContactInfo.css";

const ContactInfo: React.FC = () => {
  // Array guarda la información de contacto que se va a mostrar en pantalla
  const contactData = [
    {
      icon: "bi-envelope-fill", // clase de Bootstrap Icons
      title: "Correo de Soporte", // titulo del dato
      info: "soporte@alertacomunitaria.com" // información a mostrar
    },
    {
      icon: "bi-telephone-fill",
      title: "Teléfono de Contacto",
      info: "+57 300 123 4567"
    },
    {
      icon: "bi-geo-alt-fill",
      title: "Nuestra Oficina",
      info: "Calle Falsa 123, Bogotá, Colombia"
    }
  ];

   // Array guarda la información de los iconos
  const socialLinks = [
    { icon: "bi-facebook", url: "#" },
    { icon: "bi-instagram", url: "#" },
    { icon: "bi-github", url: "#" },
    { icon: "bi-twitter-x", url: "#" }
  ];

  // key index ayuda a react a identificar cada elemento
  return (
    <div>
      {contactData.map((item, index) => (
        <div key={index} className="d-flex gap-3 mb-4">
          <div className="contact-icon">
            <i className={`bi ${item.icon}`}></i>
          </div>
          <div>
            <h6 className="fw-semibold mb-1">{item.title}</h6>
            <p className="text-muted mb-0">{item.info}</p>
          </div>
        </div>
      ))}

      <div className="mt-5">
        <h5 className="fw-bold mb-3">Síguenos en nuestras redes</h5>
        <div className="d-flex gap-3">
          {socialLinks.map((social, index) => (
            <a key={index} href={social.url} className="social-link">
              <i className={`bi ${social.icon}`}></i>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;