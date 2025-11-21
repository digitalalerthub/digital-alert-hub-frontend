import React from "react";
import BannerContact from "../components/Contact/BannerContact";
import ContactInfo from "../components/Contact/ContactInfo";
import Footer from "./Home/components/Footer";

const ContactoPage: React.FC = () => {
  return (
    <>
      <BannerContact />
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold">Contacto</h2>
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <ContactInfo />
          </div>
          <div className="col-lg-7">
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127336.95!2d-75.56!3d6.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428dfb80fad05%3A0x42137cfcc7b53b56!2sMedell%C3%ADn%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1234567890"
                className="w-100 h-100 border-0 rounded-3"
                allowFullScreen
                loading="lazy"
                title="Mapa de ubicación"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactoPage;
