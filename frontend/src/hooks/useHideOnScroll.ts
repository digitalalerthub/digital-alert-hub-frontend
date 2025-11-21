import { useEffect, useState } from "react";

export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      // ↓↓↓ LÓGICA EXACTA QUE TÚ PEDISTE ↓↓↓

      if (current < 80) {
        // 👉 Estás arriba → siempre mostrar navbar
        setHidden(false);
      } else {
        if (current > lastScrollY) {
          // 👉 Bajando → ocultar
          setHidden(true);
        } else {
          // 👉 Subiendo → NO mostrar hasta llegar arriba
          setHidden(true);
        }
      }
      setLastScrollY(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return hidden;
}
