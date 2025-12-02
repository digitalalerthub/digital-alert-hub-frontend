import { useEffect, useState } from "react";

export function useHideOnScroll() {
  // Estado que indica si el navbar debe ocultarse o no
  const [hidden, setHidden] = useState(false);

  // Guarda la última posición del scroll para detectar si sube o baja
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY; // scroll actual

      /* ================================
         LÓGICA EXACTA QUE USAS PARA OCULTAR EL NAVBAR
         ================================ */

      if (current < 80) {
        // 👉 Si estás en la parte superior de la página → mostrar navbar siempre
        setHidden(false);
      } else {
        if (current > lastScrollY) {
          // 👉 Si el scroll va hacia abajo → ocultar navbar
          setHidden(true);
        } else {
          // 👉 Si el scroll va hacia arriba → NO mostrar todavía
          //     (solo se mostrará cuando vuelva a la zona superior)
          setHidden(true);
        }
      }

      // Actualizar la última posición del scroll
      setLastScrollY(current);
    };

    // Escuchar el scroll del usuario
    window.addEventListener("scroll", handleScroll);

    // Limpiar el evento cuando el componente se desmonta
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]); // Re-evaluar cuando cambie la posición previa del scroll

  // El componente que use este hook sabrá si debe ocultarse o mostrarse
  return hidden;
}
