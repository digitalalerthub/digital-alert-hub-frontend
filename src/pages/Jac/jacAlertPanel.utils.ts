import {
    findAlertStateIdByName,
    getAlertStatusMeta,
    type CanonicalAlertStateName,
} from '../../config/alertStates';
import type { AlertStateCatalogItem } from '../../types/AlertState';
import type { Alert } from '../../types/Alert';
import {
    ACTION_STATUS_NAMES,
    STATUS_ICONS,
    STATUS_NAMES,
} from './jacAlertPanel.config';

export type EstadoMetaEntry = {
    id_estado: number;
    stateName: CanonicalAlertStateName;
    label: string;
    color: string;
    bg: string;
};

export type EstadoMetaById = Record<
    number,
    {
        label: string;
        color: string;
        bg: string;
    }
>;

export const buildEstadoMeta = (
    estados: AlertStateCatalogItem[],
    labelById: Record<number, string>,
): EstadoMetaEntry[] =>
    STATUS_NAMES.map((stateName) => {
        const id_estado = findAlertStateIdByName(estados, stateName);
        if (id_estado === null) return null;

        const { label, color, bg } = getAlertStatusMeta(id_estado, labelById);

        return {
            id_estado,
            stateName,
            label,
            color,
            bg,
        };
    }).filter(Boolean) as EstadoMetaEntry[];

export const buildEstadoMetaById = (
    estadoMeta: EstadoMetaEntry[],
): EstadoMetaById =>
    estadoMeta.reduce<EstadoMetaById>((acc, item) => {
        acc[item.id_estado] = {
            label: item.label,
            color: item.color,
            bg: item.bg,
        };
        return acc;
    }, {});

export const buildStatsConfig = (estadoMeta: EstadoMetaEntry[]) =>
    estadoMeta.map((item) => ({
        id_estado: item.id_estado,
        label: item.label,
        icon: STATUS_ICONS[item.stateName],
    }));

export const buildJacActions = (
    estados: AlertStateCatalogItem[],
    estadoMetaById: EstadoMetaById,
) =>
    ACTION_STATUS_NAMES.map((stateName) => {
        const nuevoEstado = findAlertStateIdByName(estados, stateName);
        if (nuevoEstado === null) return null;

        const label = estadoMetaById[nuevoEstado]?.label ?? `Estado ${nuevoEstado}`;

        return {
            nuevoEstado,
            label,
            icon: STATUS_ICONS[stateName],
            title: `Marcar ${label}`,
        };
    }).filter(Boolean) as Array<{
        nuevoEstado: number;
        label: string;
        icon: string;
        title: string;
    }>;

export const getAlertStateLabel = (
    idEstado: number,
    estadoMetaById: EstadoMetaById,
    labelById: Record<number, string>,
) =>
    estadoMetaById[idEstado]?.label ?? getAlertStatusMeta(idEstado, labelById).label;

export const filterAlertsByJacState = (
    alerts: Alert[],
    filtroEstado: string,
    filtroCategoria: string,
    getStateLabel: (idEstado: number) => string,
) =>
    alerts.filter((alert) => {
        const estadoLabel = getStateLabel(alert.id_estado);
        if (filtroEstado !== 'Todos' && estadoLabel !== filtroEstado) {
            return false;
        }
        if (filtroCategoria !== 'Todas' && alert.categoria !== filtroCategoria) {
            return false;
        }
        return true;
    });

export const buildComunaOptions = (
    alerts: Alert[],
    filtroComuna: string,
) => [
    'Todos',
    ...Array.from(
        new Set(
            alerts
                .filter(
                    (alert) =>
                        filtroComuna === 'Todas' ||
                        alert.nombre_comuna === filtroComuna,
                )
                .map((alert) => alert.nombre_barrio ?? '')
                .filter(Boolean),
        ),
    ),
];

export const buildAvailableComunas = (alerts: Alert[]) => [
    'Todas',
    ...Array.from(
        new Set(alerts.map((alert) => alert.nombre_comuna ?? '').filter(Boolean)),
    ),
];

export const buildAvailableCategorias = (alerts: Alert[]) => [
    'Todas',
    ...Array.from(new Set(alerts.map((alert) => alert.categoria))),
];
