import type { Alert } from '../../types/Alert';
import { buildAlertEvidenceItems } from './alertEvidence.utils';

export const PRIORITY_OPTIONS = ['Baja', 'Media', 'Alta'] as const;
export const MAX_EVIDENCE_IMAGES = 10;
export const MAX_EVIDENCE_SIZE = 20 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type Coords = {
    lat: number;
    lng: number;
};

export type ExistingEvidenceItem = {
    key: string;
    id: number | null;
    url: string;
    type: string | null;
};

export const buildLocationValue = (
    ubicacion: string,
    selectedCoords: Coords | null,
    forceCoordsOnSubmit: boolean,
): string | undefined => {
    const clean = ubicacion.trim();

    if (selectedCoords && (forceCoordsOnSubmit || !clean)) {
        return `Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
    }

    if (selectedCoords && clean) {
        return `${clean} | Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
    }

    if (clean) return clean;
    return undefined;
};

export const buildExistingEvidenceList = (
    alert: Alert,
): ExistingEvidenceItem[] =>
    buildAlertEvidenceItems(alert).map((item, index) => ({
        key: `evidence-${item.id || index}-${item.url}`,
        id: item.id || null,
        url: item.url,
        type: item.type,
    }));
