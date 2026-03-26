import type { CanonicalAlertStateName } from '../../config/alertStates';

export const STATUS_ICONS: Record<CanonicalAlertStateName, string> = {
    pendiente: 'bi-send',
    en_progreso: 'bi-arrow-repeat',
    resuelta: 'bi-check-circle',
    falsa_alerta: 'bi-exclamation-triangle',
};

export const STATUS_NAMES: CanonicalAlertStateName[] = [
    'pendiente',
    'en_progreso',
    'resuelta',
    'falsa_alerta',
];

export const ACTION_STATUS_NAMES: CanonicalAlertStateName[] = [
    'en_progreso',
    'resuelta',
    'falsa_alerta',
];

export const PRIORIDAD_COLOR: Record<string, string> = {
    Alta: '#dc2626',
    Media: '#d97706',
    Baja: '#16a34a',
};

export const PAGE_SIZE = 10;
