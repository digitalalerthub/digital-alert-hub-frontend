import type { Alert, AlertEvidence } from '../../types/Alert';

export type AlertEvidenceItem = {
    id: number;
    url: string;
    type: string | null;
};

export const buildAlertEvidenceItems = (alert: Alert): AlertEvidenceItem[] => {
    const listFromArray = (alert.evidencias || [])
        .filter((item): item is AlertEvidence => Boolean(item?.url_evidencia))
        .map((item, index) => ({
            id: item.id_evidencia || index,
            url: item.url_evidencia,
            type: item.tipo_evidencia || null,
        }));

    if (listFromArray.length > 0) return listFromArray;

    if (alert.evidencia_url) {
        return [
            {
                id: 0,
                url: alert.evidencia_url,
                type: alert.evidencia_tipo || null,
            },
        ];
    }

    return [];
};
