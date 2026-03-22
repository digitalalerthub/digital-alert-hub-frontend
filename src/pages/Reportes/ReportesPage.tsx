import { useEffect, useState, type ChangeEvent } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import locationsService from '../../services/locationsService';
import reportsService from '../../services/reportsService';
import ReportAlertsMap from './ReportAlertsMap';
import type { BarrioOption, ComunaOption } from '../../types/Location';
import type {
    AlertReportResponse,
    ReportFilterState,
} from '../../types/Report';
import './ReportesPage.css';

const AUTO_REFRESH_MS = 60000;
const PIE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
const DEFAULT_CATEGORY_OPTIONS = [
    'Agua',
    'Energia',
    'Gas',
    'Movilidad',
    'Seguridad',
    'Residuos',
    'Otro',
];

const INITIAL_FILTERS: ReportFilterState = {
    idEstado: '',
    idComuna: '',
    idBarrio: '',
    year: '',
    month: '',
    category: '',
};

const buildMonthOptions = (selectedYear?: string) => {
    const formatter = new Intl.DateTimeFormat('es-CO', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

    if (selectedYear) {
        const numericYear = Number(selectedYear);
        if (Number.isInteger(numericYear) && numericYear > 0) {
            return Array.from({ length: 12 }, (_, index) => {
                const monthNumber = 11 - index;
                const date = new Date(Date.UTC(numericYear, monthNumber, 1));
                const value = `${numericYear}-${String(monthNumber + 1).padStart(
                    2,
                    '0',
                )}`;

                return {
                    value,
                    label: formatter.format(date),
                };
            });
        }
    }

    return Array.from({ length: 12 }, (_, index) => {
        const date = new Date();
        date.setUTCDate(1);
        date.setUTCMonth(date.getUTCMonth() - index);
        const value = `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1,
        ).padStart(2, '0')}`;

        return {
            value,
            label: formatter.format(date),
        };
    });
};

const formatDateTime = (value?: string) => {
    if (!value) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

const ReportesPage = () => {
    const [filters, setFilters] = useState<ReportFilterState>(INITIAL_FILTERS);
    const [report, setReport] = useState<AlertReportResponse | null>(null);
    const [comunas, setComunas] = useState<ComunaOption[]>([]);
    const [barrios, setBarrios] = useState<BarrioOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const monthOptions = buildMonthOptions(filters.year);
    const yearOptions =
        report?.catalogos.years.length
            ? report.catalogos.years
            : Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);
    const categoryOptions = Array.from(
        new Set([
            ...DEFAULT_CATEGORY_OPTIONS,
            ...(report?.catalogos.categorias ?? []),
        ]),
    );
    const barrioSeries = report?.charts.alertasPorBarrio ?? [];
    const topBarrios = (
        barrioSeries.some((item) => item.label !== 'Sin barrio')
            ? barrioSeries.filter((item) => item.label !== 'Sin barrio')
            : barrioSeries
    ).slice(0, 8);
    const trendData = report?.charts.tendenciaMensual ?? [];
    const statusData = report?.charts.alertasPorEstado ?? [];
    const topCategorias = report?.charts.alertasPorCategoria.slice(0, 6) ?? [];

    useEffect(() => {
        const loadComunas = async () => {
            try {
                const data = await locationsService.listComunas();
                setComunas(data);
            } catch {
                setError(
                    'No se pudieron cargar las comunas para el filtro de reportes.',
                );
            }
        };

        void loadComunas();
    }, []);

    useEffect(() => {
        const comunaId = Number(filters.idComuna);

        if (!comunaId) {
            setBarrios([]);
            setFilters((current) =>
                current.idBarrio ? { ...current, idBarrio: '' } : current,
            );
            return;
        }

        const loadBarrios = async () => {
            try {
                const data =
                    await locationsService.listBarriosByComuna(comunaId);
                setBarrios(data);
            } catch {
                setBarrios([]);
            }
        };

        void loadBarrios();
    }, [filters.idComuna]);

    useEffect(() => {
        let cancelled = false;

        const loadReport = async (silent = false) => {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                const data = await reportsService.getAlertsReport({
                    id_estado: filters.idEstado
                        ? Number(filters.idEstado)
                        : undefined,
                    id_comuna: filters.idComuna
                        ? Number(filters.idComuna)
                        : undefined,
                    id_barrio: filters.idBarrio
                        ? Number(filters.idBarrio)
                        : undefined,
                    year: filters.year ? Number(filters.year) : undefined,
                    month: filters.month || undefined,
                    category: filters.category || undefined,
                });

                if (!cancelled) {
                    setReport(data);
                    setError('');
                }
            } catch {
                if (!cancelled) {
                    setError(
                        'No fue posible consultar el reporte. Verifica permisos o conexion con la API.',
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        void loadReport();
        const intervalId = window.setInterval(() => {
            void loadReport(true);
        }, AUTO_REFRESH_MS);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [
        filters.category,
        filters.idBarrio,
        filters.idComuna,
        filters.idEstado,
        filters.month,
        filters.year,
    ]);

    const handleSelectChange =
        (field: keyof ReportFilterState) =>
        (event: ChangeEvent<HTMLSelectElement>) => {
            const nextValue = event.target.value;

            setFilters((current) => {
                if (field === 'idComuna') {
                    return {
                        ...current,
                        idComuna: nextValue,
                        idBarrio: '',
                    };
                }

                if (field === 'year') {
                    const shouldResetMonth =
                        current.month &&
                        nextValue &&
                        !current.month.startsWith(`${nextValue}-`);

                    return {
                        ...current,
                        year: nextValue,
                        month: shouldResetMonth ? '' : current.month,
                    };
                }

                return {
                    ...current,
                    [field]: nextValue,
                };
            });
        };

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    return (
        <div className='reportes-page'>
            <div className='reportes-container'>
                <Breadcrumb
                    items={[
                        { label: 'Panel Principal', to: '/admin' },
                        { label: 'Reporte Alertas' },
                    ]}
                />

                <div className='reportes-header-section'>
                    <div className='reportes-title-section'>
                        <h1 className='reportes-main-title'>Reporte Alertas</h1>
                        <p className='reportes-subtitle'>
                            Consulta las alertas registradas y visualiza su estado
                            en tiempo real.
                        </p>
                    </div>
                </div>

                <div className='reportes-main-card'>
                    <div className='reportes-card-meta'>
                        <span className='reportes-meta-pill'>
                            {refreshing ? 'Actualizando...' : 'Actualización automática'}
                        </span>
                        <span className='reportes-meta-pill'>
                            {formatDateTime(report?.generated_at)}
                        </span>
                    </div>

                    <div className='reportes-filters-row'>
                        <select
                            value={filters.idEstado}
                            onChange={handleSelectChange('idEstado')}
                        >
                            <option value=''>Filtro por Estado</option>
                            {report?.catalogos.estados.map((estado) => (
                                <option
                                    key={estado.id_estado}
                                    value={estado.id_estado}
                                >
                                    {estado.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.idComuna}
                            onChange={handleSelectChange('idComuna')}
                        >
                            <option value=''>Filtro por Comuna</option>
                            {comunas.map((comuna) => (
                                <option
                                    key={comuna.id_comuna}
                                    value={comuna.id_comuna}
                                >
                                    {comuna.nombre}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.idBarrio}
                            onChange={handleSelectChange('idBarrio')}
                            disabled={!filters.idComuna}
                        >
                            <option value=''>Filtro por Barrio</option>
                            {barrios.map((barrio) => (
                                <option
                                    key={barrio.id_barrio}
                                    value={barrio.id_barrio}
                                >
                                    {barrio.nombre}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.year}
                            onChange={handleSelectChange('year')}
                        >
                            <option value=''>Filtro Anual</option>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.month}
                            onChange={handleSelectChange('month')}
                        >
                            <option value=''>Filtro por Mes</option>
                            {monthOptions.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.category}
                            onChange={handleSelectChange('category')}
                        >
                            <option value=''>Filtro por Categoría</option>
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='reportes-filters-actions'>
                        <button
                            type='button'
                            className='reportes-clear-btn'
                            onClick={handleResetFilters}
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    {error && (
                        <div className='reportes-feedback reportes-feedback-error'>
                            {error}
                        </div>
                    )}

                    <section className='reportes-stats-grid'>
                        <article className='reportes-stat-card'>
                            <span>Alertas por atender</span>
                            <strong>{report?.kpis.porAtender ?? 0}</strong>
                        </article>
                        <article className='reportes-stat-card'>
                            <span>Alertas Resueltas</span>
                            <strong>{report?.kpis.resueltas ?? 0}</strong>
                        </article>
                        <article className='reportes-stat-card'>
                            <span>Alertas en Proceso</span>
                            <strong>{report?.kpis.enProceso ?? 0}</strong>
                        </article>
                        <article className='reportes-stat-card'>
                            <span>Alertas Falsas</span>
                            <strong>{report?.kpis.falsasAlertas ?? 0}</strong>
                        </article>
                    </section>

                    <section className='reportes-chart-grid'>
                        <article className='reportes-panel'>
                            <div className='reportes-panel-head'>
                                <h3>Alertas Resueltas</h3>
                            </div>
                            <div className='reportes-chart-wrap'>
                                {loading ? (
                                    <div className='reportes-empty'>Cargando...</div>
                                ) : trendData.length === 0 ? (
                                    <div className='reportes-empty'>Sin datos</div>
                                ) : (
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                                            <XAxis dataKey='label' tick={{ fill: '#666', fontSize: 10 }} />
                                            <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 10 }} />
                                            <Tooltip />
                                            <Line
                                                type='monotone'
                                                dataKey='resueltas'
                                                stroke='#2563eb'
                                                strokeWidth={2}
                                                dot={{ r: 3, fill: '#ef4444' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>

                        <article className='reportes-panel'>
                            <div className='reportes-panel-head'>
                                <h3>Alertas por Barrio</h3>
                            </div>
                            <div className='reportes-chart-wrap'>
                                {loading ? (
                                    <div className='reportes-empty'>Cargando...</div>
                                ) : topBarrios.length === 0 ? (
                                    <div className='reportes-empty'>Sin datos</div>
                                ) : (
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <BarChart data={topBarrios}>
                                            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                                            <XAxis dataKey='label' tick={{ fill: '#666', fontSize: 10 }} />
                                            <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar
                                                dataKey='total'
                                                fill='#f97316'
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>

                        <article className='reportes-panel'>
                            <div className='reportes-panel-head'>
                                <h3>Alertas por Estado</h3>
                            </div>
                            <div className='reportes-chart-wrap'>
                                {loading ? (
                                    <div className='reportes-empty'>Cargando...</div>
                                ) : statusData.every((item) => item.total === 0) ? (
                                    <div className='reportes-empty'>Sin datos</div>
                                ) : (
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <PieChart>
                                            <Tooltip />
                                            <Pie
                                                data={statusData}
                                                dataKey='total'
                                                nameKey='label'
                                                innerRadius={42}
                                                outerRadius={72}
                                                paddingAngle={2}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell
                                                        key={entry.id_estado}
                                                        fill={
                                                            PIE_COLORS[
                                                                index %
                                                                    PIE_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Legend
                                                verticalAlign='bottom'
                                                height={36}
                                                wrapperStyle={{ fontSize: '11px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>

                        <article className='reportes-panel'>
                            <div className='reportes-panel-head'>
                                <h3>Alertas por Categoría</h3>
                            </div>
                            <div className='reportes-chart-wrap'>
                                {loading ? (
                                    <div className='reportes-empty'>Cargando...</div>
                                ) : topCategorias.length === 0 ? (
                                    <div className='reportes-empty'>Sin datos</div>
                                ) : (
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <BarChart
                                            data={topCategorias}
                                            layout='vertical'
                                            margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
                                        >
                                            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                                            <XAxis
                                                type='number'
                                                allowDecimals={false}
                                                tick={{ fill: '#666', fontSize: 10 }}
                                            />
                                            <YAxis
                                                type='category'
                                                dataKey='label'
                                                width={96}
                                                tick={{ fill: '#666', fontSize: 10 }}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey='total'
                                                fill='#0f766e'
                                                radius={[0, 4, 4, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>
                    </section>

                    <ReportAlertsMap filters={filters} />
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;

