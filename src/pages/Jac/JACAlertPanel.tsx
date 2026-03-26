import { useCallback, useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { toast } from 'react-toastify';
import AlertDetailModal from '../../components/Alert/AlertDetailModal';
import type { Alert } from '../../types/Alert';
import {
    getAlertStatusMeta,
} from '../../config/alertStates';
import { useAlertStates } from '../../context/useAlertStates';
import alertsService from '../../services/alertsService';
import {
    useJACAlertsManager,
    type EstadoId,
} from '../../hooks/useJACAlertsManager';
import { formatAlertDate } from '../../components/Alert/createAlertWorkspace.utils';
import {
    PAGE_SIZE,
    PRIORIDAD_COLOR,
} from './jacAlertPanel.config';
import {
    buildAvailableCategorias,
    buildAvailableComunas,
    buildComunaOptions,
    buildEstadoMeta,
    buildEstadoMetaById,
    buildJacActions,
    buildStatsConfig,
    filterAlertsByJacState,
    getAlertStateLabel as resolveAlertStateLabel,
} from './jacAlertPanel.utils';
import './JACAlertPanel.css';

const JACAlertPanel = () => {
    const { estados, labelById } = useAlertStates();
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

    const estadoMeta = useMemo(
        () => buildEstadoMeta(estados, labelById),
        [estados, labelById],
    );

    const estadoMetaById = useMemo(
        () => buildEstadoMetaById(estadoMeta) as Record<
            EstadoId,
            { label: string; color: string; bg: string }
        >,
        [estadoMeta],
    );

    const statsConfig = useMemo(
        () => buildStatsConfig(estadoMeta),
        [estadoMeta],
    );

    const acciones = useMemo(
        () => buildJacActions(estados, estadoMetaById),
        [estados, estadoMetaById],
    );

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

    const getAlertStateLabel = useCallback(
        (idEstado: number) =>
            resolveAlertStateLabel(idEstado, estadoMetaById, labelById),
        [estadoMetaById, labelById],
    );

    const alertasPreFiltradas = filterAlertsByJacState(
        alerts,
        filtroEstado,
        filtroCategoria,
        getAlertStateLabel,
    );

    const comunasDisponibles = buildAvailableComunas(alertasPreFiltradas);

    const barriosDisponibles = buildComunaOptions(
        alertasPreFiltradas,
        filtroComuna,
    );

    const categoriasDisponibles = buildAvailableCategorias(alerts);

    const stats = statsConfig.map((s) => ({
        ...s,
        count: alerts.filter((a) => a.id_estado === s.id_estado).length,
    }));

    const filtered = alerts.filter((a) => {
        const estadoLabel = getAlertStateLabel(a.id_estado);
        if (filtroEstado !== 'Todos' && estadoLabel !== filtroEstado) {
            return false;
        }
        if (filtroCategoria !== 'Todas' && a.categoria !== filtroCategoria) {
            return false;
        }
        if (filtroComuna !== 'Todas' && a.nombre_comuna !== filtroComuna) {
            return false;
        }
        if (filtroBarrio !== 'Todos' && a.nombre_barrio !== filtroBarrio) {
            return false;
        }
        if (search && !a.titulo.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const onFilterChange =
        (setter: (value: string) => void) =>
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
        ? acciones.map(({ nuevoEstado, label, icon, title }) => {
              const accionMeta = estadoMetaById[nuevoEstado];
              const yaEsEseEstado = selectedAlert.id_estado === nuevoEstado;
              const isUpdatingSelected = updatingId === selectedAlert.id_alerta;

              if (!accionMeta) return null;

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
                          requestStatusChange(selectedAlert, nuevoEstado, label)
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

    const estadoOptions = [
        'Todos',
        ...estadoMeta
            .map((item) => item.label)
            .filter((label, index, labels) => labels.indexOf(label) === index),
    ];

    return (
        <div className='panel-jac'>
            <div className='jac-panel-page'>
                <Breadcrumb
                    items={[
                        { label: 'Panel Principal', to: '/admin' },
                        { label: 'Panel JAC' },
                    ]}
                />

                <div className='jac-stats-grid'>
                    {stats.map((s) => {
                        const meta = estadoMetaById[s.id_estado];
                        if (!meta) return null;

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

                <h2 className='jac-title'>Gestion de Alertas</h2>
                <div className='jac-main-card'>
                    <div className='jac-filters'>
                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Buscar</label>
                            <div className='jac-search-wrap'>
                                <i className='bi bi-search jac-search-icon' />
                                <input
                                    type='text'
                                    className='form-control jac-search'
                                    placeholder='Buscar por titulo...'
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Estado</label>
                            <select
                                className='form-select jac-filter-select'
                                value={filtroEstado}
                                onChange={onFilterChange(setFiltroEstado)}
                            >
                                {estadoOptions.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        <div className='jac-filter-group'>
                            <label className='jac-filter-label'>Categoria</label>
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

                    <div className='jac-table-wrap'>
                        <table className='jac-table'>
                            <thead>
                                <tr>
                                    <th>ALERTA</th>
                                    <th>CATEGORIA</th>
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
                                    const meta = getAlertStatusMeta(
                                        alert.id_estado,
                                        labelById,
                                    );
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
                                                    {alert.prioridad ?? '-'}
                                                </span>
                                            </td>
                                            <td className='jac-td-date'>
                                                {formatAlertDate(
                                                    alert.created_at,
                                                )}
                                            </td>
                                            <td>
                                                <div className='jac-actions'>
                                                    {acciones.map(
                                                        ({
                                                            nuevoEstado,
                                                            label,
                                                            icon,
                                                            title,
                                                        }) => {
                                                            const accionMeta =
                                                                estadoMetaById[
                                                                    nuevoEstado
                                                                ];
                                                            const yaEsEseEstado =
                                                                alert.id_estado ===
                                                                nuevoEstado;

                                                            if (!accionMeta) {
                                                                return null;
                                                            }

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
                                Cambiar{' '}
                                <strong>"{confirmAction.alert.titulo}"</strong>{' '}
                                a{' '}
                                <strong
                                    style={{
                                        color: estadoMetaById[
                                            confirmAction.nuevoEstado
                                        ]?.color,
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
