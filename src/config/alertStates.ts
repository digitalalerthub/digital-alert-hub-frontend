import type { AlertStateCatalogItem } from '../types/AlertState';

export type CanonicalAlertStateName =
    | 'pendiente'
    | 'en_progreso'
    | 'resuelta'
    | 'falsa_alerta';

type AlertStatusClassName =
    | 'is-pending'
    | 'is-progress'
    | 'is-resolved'
    | 'is-false-alert'
    | 'is-unknown';

type AlertStatusVisualMeta = {
    color: string;
    bg: string;
    className: AlertStatusClassName;
};

type AlertStatusMeta = AlertStatusVisualMeta & {
    label: string;
};

const STATE_ALIASES: Record<CanonicalAlertStateName, readonly string[]> = {
    pendiente: ['pendiente', 'nueva'],
    en_progreso: ['en progreso', 'en_progreso', 'enprogreso'],
    resuelta: ['resuelta', 'resuelto'],
    falsa_alerta: ['falsa alerta', 'falsa_alerta', 'falsaalerta'],
};

const STATUS_VISUAL_META_BY_NAME: Record<
    CanonicalAlertStateName,
    AlertStatusVisualMeta
> = {
    pendiente: { color: '#2563eb', bg: '#eff6ff', className: 'is-pending' },
    en_progreso: {
        color: '#ec8108',
        bg: '#fffbeb',
        className: 'is-progress',
    },
    resuelta: { color: '#16a34a', bg: '#f0fdf4', className: 'is-resolved' },
    falsa_alerta: {
        color: '#e40e0e',
        bg: '#fef2f2',
        className: 'is-false-alert',
    },
};

export const buildAlertStateLabelById = (
    estados: AlertStateCatalogItem[],
): Record<number, string> =>
    estados.reduce<Record<number, string>>((acc, estado) => {
        acc[estado.id_estado] = estado.label;
        return acc;
    }, {});

export const normalizeAlertStateLabel = (value: unknown): string => {
    if (typeof value !== 'string') return '';

    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
};

export const getCanonicalAlertStateName = (
    value: unknown,
): CanonicalAlertStateName | null => {
    const normalized = normalizeAlertStateLabel(value);
    if (!normalized) return null;

    for (const [canonicalName, aliases] of Object.entries(STATE_ALIASES) as Array<
        [CanonicalAlertStateName, readonly string[]]
    >) {
        if (aliases.includes(normalized)) {
            return canonicalName;
        }
    }

    return null;
};

export const getCanonicalAlertStateNameById = (
    idEstado: number,
    labelById: Record<number, string>,
): CanonicalAlertStateName | null =>
    getCanonicalAlertStateName(labelById[idEstado]);

export const findAlertStateIdByName = (
    estados: AlertStateCatalogItem[],
    canonicalName: CanonicalAlertStateName,
): number | null => {
    const estado = estados.find(
        (item) => getCanonicalAlertStateName(item.label) === canonicalName,
    );

    return estado?.id_estado ?? null;
};

export const isAlertState = (
    idEstado: number,
    labelById: Record<number, string>,
    canonicalName: CanonicalAlertStateName,
): boolean => getCanonicalAlertStateNameById(idEstado, labelById) === canonicalName;

export const getAlertStatusMeta = (
    idEstado: number,
    labelById: Record<number, string> = {},
): AlertStatusMeta => {
    const canonicalName = getCanonicalAlertStateNameById(idEstado, labelById);
    const visualMeta = canonicalName
        ? STATUS_VISUAL_META_BY_NAME[canonicalName]
        : null;
    const label = labelById[idEstado];

    if (!visualMeta) {
        return {
            label: label ?? `Estado ${idEstado}`,
            color: '#64748b',
            bg: '#f8fafc',
            className: 'is-unknown',
        };
    }

    return {
        ...visualMeta,
        label: label ?? `Estado ${idEstado}`,
    };
};
