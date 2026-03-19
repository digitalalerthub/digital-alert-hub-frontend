import React from "react";
import "./ContactInfo.css";

const ContactInfo: React.FC = () => {
  const contactData = [
    {
      icon: "bi-envelope-fill",
      title: "Correo de Soporte",
      info: "soporte@alertacomunitaria.com",
    },
    {
      icon: "bi-telephone-fill",
      title: "Teléfono de Contacto",
      info: "+57 300 123 4567",
    },
    {
      icon: "bi-geo-alt-fill",
      title: "Nuestra Oficina",
      info: "Calle Falsa 123, Bogotá, Colombia",
    },
  ];

  const socialLinks = [
    { icon: "bi-facebook", url: "#" },
    { icon: "bi-instagram", url: "#" },
    { icon: "bi-github", url: "#" },
    { icon: "bi-twitter-x", url: "#" },
  ];

  return (
    <div>
      {contactData.map((item, index) => (
        <div key={index} className="d-flex gap-3 mb-4">
          <div className="contact-icon">
            <i className={`bi ${item.icon}`} />
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
              <i className={`bi ${social.icon}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
