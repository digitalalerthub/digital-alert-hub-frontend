import { useEffect, useRef, useState } from 'react';

export function useHideOnScroll() {
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;

            if (current < 80) {
                setHidden(false);
            } else if (current > lastScrollY.current) {
                setHidden(true);
            }

            lastScrollY.current = current;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return hidden;
}
