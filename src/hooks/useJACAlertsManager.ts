import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import type { Alert } from '../types/Alert';
import alertsService from '../services/alertsService';

export type EstadoId = 1 | 2 | 3 | 4;

export type ConfirmAction = {
    alert: Alert;
    nuevoEstado: EstadoId;
    label: string;
};

export const useJACAlertsManager = (
    onAlertUpdated?: (updated: Alert) => void,
) => {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
        null,
    );
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const requestStatusChange = useCallback(
        (alert: Alert, nuevoEstado: EstadoId, label: string) => {
            setConfirmAction({ alert, nuevoEstado, label });
        },
        [],
    );

    const cancelAction = useCallback(() => setConfirmAction(null), []);

    const confirmStatusChange = useCallback(async () => {
        if (!confirmAction) return;
        const { alert, nuevoEstado } = confirmAction;
        setConfirmAction(null);
        setUpdatingId(alert.id_alerta);
        try {
            const updated = await alertsService.updateAlertStatus(
                alert.id_alerta,
                nuevoEstado,
            );
            toast.success('Estado actualizado correctamente');
            onAlertUpdated?.(updated);
        } catch (error) {
            const msg =
                error !== null &&
                typeof error === 'object' &&
                'response' in error
                    ? ((error as { response?: { data?: { message?: string } } })
                          .response?.data?.message ??
                      'No se pudo actualizar el estado')
                    : 'No se pudo actualizar el estado';
            toast.error(msg);
        } finally {
            setUpdatingId(null);
        }
    }, [confirmAction, onAlertUpdated]);

    return {
        confirmAction,
        updatingId,
        requestStatusChange,
        cancelAction,
        confirmStatusChange,
    };
};
