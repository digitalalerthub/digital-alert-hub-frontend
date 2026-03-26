type Coords = {
    lat: number;
    lng: number;
};

const COORDS_REGEX = /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/;

export const extractAlertCoordsFromText = (text?: string): Coords | null => {
    if (!text) return null;
    const match = text.match(COORDS_REGEX);
    if (!match) return null;

    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
};

export const getReadableAlertLocation = (text?: string): string => {
    if (!text) return 'No especificada';
    const marker = ' | Punto en mapa:';
    if (text.includes(marker)) {
        return text.split(marker)[0].trim() || 'No especificada';
    }
    return text;
};

export const formatAlertDateTime = (value?: string): string => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
