import { useEffect, useState, useCallback } from 'react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { toast } from 'react-toastify';
import AlertDetailModal from '../../components/Alert/AlertDetailModal';
import type { Alert } from '../../types/Alert';
import alertsService from '../../services/alertsService';
import {
    useJACAlertsManager,
    type EstadoId,
} from '../../hooks/useJACAlertsManager';
import { formatAlertDate } from '../../components/Alert/createAlertWorkspace.utils';

import './JACAlertPanel.css';

// ─── Constantes ───────

const ESTADO_META: Record<
    EstadoId,
    { label: string; color: string; bg: string }
> = {
    1: { label: 'Nueva', color: '#2563eb', bg: '#eff6ff' },
    2: { label: 'En Progreso', color: '#ec8108', bg: '#fffbeb' },
    3: { label: 'Resuelta', color: '#16a34a', bg: '#f0fdf4' },
    4: { label: 'Falsa Alerta', color: '#e40e0e', bg: '#fef2f2' },
};

const STATS_CONFIG = [
    { label: 'Nuevas Alertas', id_estado: 1 as EstadoId, icon: 'bi-send' },
    { label: 'En Progreso', id_estado: 2 as EstadoId, icon: 'bi-arrow-repeat' },
    { label: 'Resueltas', id_estado: 3 as EstadoId, icon: 'bi-check-circle' },
    {
        label: 'Falsas Alertas',
        id_estado: 4 as EstadoId,
        icon: 'bi-exclamation-triangle',
    },
];

const ACCIONES: {
    nuevoEstado: EstadoId;
    label: string;
    icon: string;
    title: string;
}[] = [
    {
        nuevoEstado: 2,
        label: 'En Progreso',
        icon: 'bi-arrow-repeat',
        title: 'Marcar En Progreso',
    },
    {
        nuevoEstado: 3,
        label: 'Resuelta',
        icon: 'bi-check-circle',
        title: 'Marcar Resuelta',
    },
    {
        nuevoEstado: 4,
        label: 'Falsa Alerta',
        icon: 'bi-exclamation-triangle',
        title: 'Marcar Falsa Alerta',
    },
];

const PRIORIDAD_COLOR: Record<string, string> = {
    Alta: '#dc2626',
    Media: '#d97706',
    Baja: '#16a34a',
};

const PAGE_SIZE = 10;

// ─── Componente ──────────────

const JACAlertPanel = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [loadingSelectedAlert, setLoadingSelectedAlert] = useState(false);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState('Todas');
    const [filtroComuna, setFiltroComuna] = useState('Todas');
    const [filtroBarrio, setFiltroBarrio] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);

    const handleAlertUpdated = useCallback((updated: Alert) => {
        setAlerts((prev) =>
            prev.map((a) =>
                a.id_alerta === updated.id_alerta ? { ...a, ...updated } : a,
            ),
        );
        setSelectedAlert((current) =>
            current?.id_alerta === updated.id_alerta
                ? { ...current, ...updated }
                : current,
        );
    }, []);

    const {
        confirmAction,
        updatingId,
        requestStatusChange,
        cancelAction,
        confirmStatusChange,
    } = useJACAlertsManager(handleAlertUpdated);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await alertsService.list();
                setAlerts(data);
            } catch {
                toast.error('No se pudieron cargar las alertas');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    // ─── Filtrado y paginación ───────────────────────────────────
    // Alertas pre-filtradas por estado y categoría (para opciones de comuna/barrio)
    const alertasPreFiltradas = alerts.filter((a) => {
        const estadoLabel = ESTADO_META[a.id_estado as EstadoId]?.label ?? '';
        if (filtroEstado !== 'Todos' && estadoLabel !== filtroEstado)
            return false;
        if (filtroCategoria !== 'Todas' && a.categoria !== filtroCategoria)
            return false;
        return true;
    });

    const comunasDisponibles = [
        'Todas',
        ...Array.from(
            new Set(
                alertasPreFiltradas
                    .map((a) => a.nombre_comuna ?? '')
                    .filter(Boolean),
            ),
        ),
    ];

    const barriosDisponibles = [
        'Todos',
        ...Array.from(
            new Set(
                alertasPreFiltradas
                    .filter(
                        (a) =>
                            filtroComuna === 'Todas' ||
                            a.nombre_comuna === filtroComuna,
                    )
                    .map((a) => a.nombre_barrio ?? '')
                    .filter(Boolean),
            ),
        ),
    ];
    const categoriasDisponibles = [
        'Todas',
        ...Array.from(new Set(alerts.map((a) => a.categoria))),
    ];

    const stats = STATS_CONFIG.map((s) => ({
        ...s,
        count: alerts.filter((a) => a.id_estado === s.id_estado).length,
    }));

    const filtered = alerts.filter((a) => {
        const estadoLabel = ESTADO_META[a.id_estado as EstadoId]?.label ?? '';
        if (filtroEstado !== 'Todos' && estadoLabel !== filtroEstado)
            return false;
        if (filtroCategoria !== 'Todas' && a.categoria !== filtroCategoria)
            return false;
        if (filtroComuna !== 'Todas' && a.nombre_comuna !== filtroComuna)
            return false;
        if (filtroBarrio !== 'Todos' && a.nombre_barrio !== filtroBarrio)
            return false;
        if (search && !a.titulo.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const onFilterChange =
        (setter: (v: string) => void) =>
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setter(e.target.value);
            setCurrentPage(1);
        };

    const handleComunaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroComuna(e.target.value);
        setFiltroBarrio('Todos');
        setCurrentPage(1);
    };

    const openAlertDetail = useCallback(async (alert: Alert) => {
        setLoadingSelectedAlert(true);
        try {
            const detail = await alertsService.getById(alert.id_alerta);
            setSelectedAlert(detail);
        } catch {
            toast.error('No se pudo cargar el detalle de la alerta');
        } finally {
            setLoadingSelectedAlert(false);
        }
    }, []);

    const closeAlertDetail = useCallback(() => {
        if (loadingSelectedAlert) return;
        setSelectedAlert(null);
    }, [loadingSelectedAlert]);

    const jacManagementActions = selectedAlert
        ? ACCIONES.map(({ nuevoEstado, label, icon, title }) => {
              const accionMeta = ESTADO_META[nuevoEstado];
              const yaEsEseEstado = selectedAlert.id_estado === nuevoEstado;
              const isUpdatingSelected =
                  updatingId === selectedAlert.id_alerta;

              return (
                  <button
                      key={nuevoEstado}
                      type='button'
                      className='jac-detail-action-btn'
                      title={title}
                      disabled={
                          loadingSelectedAlert ||
                          isUpdatingSelected ||
                          yaEsEseEstado
                      }
                      onClick={() =>
                          requestStatusChange(
                              selectedAlert,
                              nuevoEstado,
                              label,
                          )
                      }
                      style={{
                          borderColor: accionMeta.color,
                          color: accionMeta.color,
                          background: accionMeta.bg,
                          opacity: yaEsEseEstado ? 0.4 : 1,
                      }}
                  >
                      <i className={`bi ${icon}`} />
                      <span>{label}</span>
                  </button>
              );
          })
        : null;
    // ─── Render ─────────────────────────────────────────────────

    return (
        <div className='panel-jac'>
            <div className='jac-panel-page'>
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Panel Principal', to: '/admin' },
                        { label: 'Panel JAC' },
                    ]}
                />

                {/* Stats */}
                <div className='jac-stats-grid'>
                    {stats.map((s) => {
                        const meta = ESTADO_META[s.id_estado];
                        return (
                            <div key={s.id_estado} className='jac-stat-card'>
                                <div
                                    className='jac-stat-icon'
                                    style={{
                                        color: meta.color,
                                        background: meta.bg,
                                    }}
                                >
                                    <i className={`bi ${s.icon}`} />
                                </div>
                                <div>
                                    <p className='jac-stat-label'>{s.label}</p>
                                    <p className='jac-stat-count'>{s.count}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Card principal */}
                <h2 className='jac-title'>Gestión de Alertas</h2>
                <div className='jac-main-card'>
                    {/* Filtros */}
                    <div className='jac-filters'>
                        {/* Búsqueda */}
                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Buscar</label>
                            <div className='jac-search-wrap'>
                                <i className='bi bi-search jac-search-icon' />
                                <input
                                    type='text'
                                    className='form-control jac-search'
                                    placeholder='Buscar por título...'
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        {/* Estado */}
                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Estado</label>
                            <select
                                className='form-select jac-filter-select'
                                value={filtroEstado}
                                onChange={onFilterChange(setFiltroEstado)}
                            >
                                {[
                                    'Todos',
                                    ...Object.values(ESTADO_META).map(
                                        (e) => e.label,
                                    ),
                                ].map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Categoría */}
                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>
                                Categoría
                            </label>
                            <select
                                className='form-select jac-filter-select'
                                value={filtroCategoria}
                                onChange={onFilterChange(setFiltroCategoria)}
                            >
                                {categoriasDisponibles.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Comuna */}
                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Comuna</label>
                            <select
                                className='form-select jac-filter-select'
                                value={filtroComuna}
                                onChange={handleComunaChange}
                            >
                                {comunasDisponibles.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Barrio */}
                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Barrio</label>
                            <select
                                className='form-select jac-filter-select'
                                value={filtroBarrio}
                                onChange={onFilterChange(setFiltroBarrio)}
                                disabled={filtroComuna === 'Todas'}
                            >
                                {barriosDisponibles.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Limpiar filtros */}
                        {(filtroEstado !== 'Todos' ||
                            filtroCategoria !== 'Todas' ||
                            filtroComuna !== 'Todas' ||
                            filtroBarrio !== 'Todos' ||
                            search) && (
                            <div
                                className='jac-filter-group'
                                style={{ justifyContent: 'flex-end' }}
                            >
                                <label
                                    className='jac-filter-label'
                                    style={{ opacity: 0 }}
                                >
                                    -
                                </label>
                                <button
                                    className='jac-clear-btn'
                                    onClick={() => {
                                        setFiltroEstado('Todos');
                                        setFiltroCategoria('Todas');
                                        setFiltroComuna('Todas');
                                        setFiltroBarrio('Todos');
                                        setSearch('');
                                        setCurrentPage(1);
                                    }}
                                >
                                    <i className='bi bi-x-circle me-1' />
                                    Limpiar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tabla */}
                    <div className='jac-table-wrap'>
                        <table className='jac-table'>
                            <thead>
                                <tr>
                                    <th>ALERTA</th>
                                    <th>CATEGORÍA</th>
                                    <th>INFORMANTE</th>
                                    <th>ESTADO</th>
                                    <th>PRIORIDAD</th>
                                    <th>FECHA</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={7} className='jac-empty'>
                                            Cargando alertas...
                                        </td>
                                    </tr>
                                )}
                                {!loading && paged.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className='jac-empty'>
                                            No hay alertas que coincidan.
                                        </td>
                                    </tr>
                                )}
                                {paged.map((alert) => {
                                    const meta =
                                        ESTADO_META[
                                            alert.id_estado as EstadoId
                                        ] ?? ESTADO_META[1];
                                    const isUpdating =
                                        updatingId === alert.id_alerta;
                                    return (
                                        <tr
                                            key={alert.id_alerta}
                                            className={
                                                isUpdating
                                                    ? 'jac-row-updating'
                                                    : ''
                                            }
                                        >
                                            <td className='jac-td-title'>
                                                <button
                                                    type='button'
                                                    className='jac-alert-link'
                                                    onClick={() =>
                                                        void openAlertDetail(
                                                            alert,
                                                        )
                                                    }
                                                >
                                                    {alert.titulo}
                                                </button>
                                            </td>
                                            <td>{alert.categoria}</td>
                                            <td>
                                                {alert.nombre_usuario ??
                                                    'Cuenta eliminada'}
                                            </td>
                                            <td>
                                                <span
                                                    className='jac-badge'
                                                    style={{
                                                        color: meta.color,
                                                        background: meta.bg,
                                                        border: `1px solid ${meta.color}44`,
                                                    }}
                                                >
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 13,
                                                        color:
                                                            PRIORIDAD_COLOR[
                                                                alert.prioridad ??
                                                                    ''
                                                            ] ?? '#9ca3af',
                                                    }}
                                                >
                                                    {alert.prioridad ?? '—'}
                                                </span>
                                            </td>
                                            <td className='jac-td-date'>
                                                {formatAlertDate(
                                                    alert.created_at,
                                                )}
                                            </td>
                                            <td>
                                                <div className='jac-actions'>
                                                    {ACCIONES.map(
                                                        ({
                                                            nuevoEstado,
                                                            label,
                                                            icon,
                                                            title,
                                                        }) => {
                                                            const accionMeta =
                                                                ESTADO_META[
                                                                    nuevoEstado
                                                                ];
                                                            const yaEsEseEstado =
                                                                alert.id_estado ===
                                                                nuevoEstado;
                                                            return (
                                                                <button
                                                                    key={
                                                                        nuevoEstado
                                                                    }
                                                                    type='button'
                                                                    className='jac-action-btn'
                                                                    title={
                                                                        title
                                                                    }
                                                                    disabled={
                                                                        isUpdating ||
                                                                        yaEsEseEstado
                                                                    }
                                                                    onClick={() =>
                                                                        requestStatusChange(
                                                                            alert,
                                                                            nuevoEstado,
                                                                            label,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        borderColor:
                                                                            accionMeta.color,
                                                                        color: accionMeta.color,
                                                                        background:
                                                                            accionMeta.bg,
                                                                        opacity:
                                                                            yaEsEseEstado
                                                                                ? 0.3
                                                                                : 1,
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`bi ${icon}`}
                                                                    />
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className='jac-pagination-bar'>
                        <span className='jac-pagination-info'>
                            Mostrando {paged.length} de {filtered.length}{' '}
                            alertas
                        </span>
                        {totalPages > 1 && (
                            <div className='jac-pagination'>
                                <button
                                    type='button'
                                    className='jac-page-btn'
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    &lt;
                                </button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((p) => (
                                    <button
                                        key={p}
                                        type='button'
                                        className={`jac-page-btn ${p === currentPage ? 'is-active' : ''}`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    type='button'
                                    className='jac-page-btn'
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de confirmación */}
                {confirmAction && (
                    <div className='jac-modal-backdrop' onClick={cancelAction}>
                        <div
                            className='jac-modal'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className='jac-modal-title'>
                                Confirmar cambio de estado
                            </h3>
                            <p className='jac-modal-body'>
                                ¿Cambiar{' '}
                                <strong>"{confirmAction.alert.titulo}"</strong>{' '}
                                a{' '}
                                <strong
                                    style={{
                                        color: ESTADO_META[
                                            confirmAction.nuevoEstado
                                        ].color,
                                    }}
                                >
                                    {confirmAction.label}
                                </strong>
                                ?
                            </p>
                            <div className='jac-modal-actions'>
                                <button
                                    type='button'
                                    className='btn btn-outline-secondary btn-sm'
                                    onClick={cancelAction}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-dark btn-sm'
                                    onClick={() => void confirmStatusChange()}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {selectedAlert && (
                    <AlertDetailModal
                        alert={selectedAlert}
                        onClose={closeAlertDetail}
                        topActions={jacManagementActions}
                    />
                )}
            </div>
        </div>
    );
};

export default JACAlertPanel;
