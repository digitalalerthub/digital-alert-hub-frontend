import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // CDN Bootstrap
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Esto activa el colapso del menú
import "react-toastify/dist/ReactToastify.css"; // Notificaciones
import "bootstrap-icons/font/bootstrap-icons.css"; // Iconos de Bootstrap


import "./App.css";

import App from "./App.tsx";

// Crea el punto de entrada de la aplicación React en el elemento con id="root"
createRoot(document.getElementById("root")!).render(
  // StrictMode: Detecta problemas, se mantiene en entorno de desarrollo.
  <StrictMode>
      <App /> {/* Se renderiza el componente principal de la aplicación */}
  </StrictMode>
);
