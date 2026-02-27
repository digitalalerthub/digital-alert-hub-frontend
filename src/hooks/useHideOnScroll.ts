// Controla el navegador para que oculte cuando hay un inicio de sesión

import { useEffect, useState, useRef } from 'react';

export function useHideOnScroll() {
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;

            if (current < 80) {
                setHidden(false); // Siempre visible en la parte superior el nav
            } else if (current > lastScrollY.current) {
                setHidden(true); // Scroll hacia abajo ocultarse
            }

            lastScrollY.current = current;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // solo una vez

    return hidden;
}
