import { useEffect, useMemo, useRef, useState } from 'react';
import {
    getGoogleMapsApi,
    isGoogleMapsEnabled,
    type GoogleInfoWindow,
    type GoogleMap,
    type GoogleMarker,
} from '../../config/googleMaps';
import {
    extractCoordsFromText,
    getStatusMeta,
} from '../../components/Alert/createAlertWorkspace.utils';
import alertsService from '../../services/alertsService';
import type { Alert } from '../../types/Alert';
import type { ReportFilterState } from '../../types/Report';

const AUTO_REFRESH_MS = 60000;
const MAP_FALLBACK_CENTER = { lat: 6.2442, lng: -75.5812 };

type Props = {
    filters: ReportFilterState;
};

type MappedAlert = Alert & {
    coords: {
        lat: number;
        lng: number;
    };
};

const normalizeText = (value?: string) =>
    (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const getReadableLocation = (value?: string) => {
    if (!value) return 'Sin direccion';
    const marker = ' | Punto en mapa:';
    return value.includes(marker) ? value.split(marker)[0].trim() : value;
};

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const getMarkerColor = (idEstado: number) => {
    switch (idEstado) {
        case 1:
            return '#64748b';
        case 2:
            return '#f59e0b';
        case 3:
            return '#22c55e';
        case 4:
            return '#ef4444';
        default:
            return '#2563eb';
    }
};

const alertMatchesFilters = (alert: Alert, filters: ReportFilterState) => {
    if (filters.idEstado && Number(filters.idEstado) !== alert.id_estado) {
        return false;
    }

    if (
        filters.idComuna &&
        Number(filters.idComuna) !== Number(alert.id_comuna ?? 0)
    ) {
        return false;
    }

    if (
        filters.idBarrio &&
        Number(filters.idBarrio) !== Number(alert.id_barrio ?? 0)
    ) {
        return false;
    }

    if (
        filters.category &&
        normalizeText(filters.category) !== normalizeText(alert.categoria)
    ) {
        return false;
    }

    if (filters.year || filters.month) {
        if (!alert.created_at) {
            return false;
        }

        const createdAt = new Date(alert.created_at);
        if (Number.isNaN(createdAt.getTime())) {
            return false;
        }

        if (
            filters.year &&
            createdAt.getUTCFullYear() !== Number(filters.year)
        ) {
            return false;
        }

        if (filters.month) {
            const alertMonth = `${createdAt.getUTCFullYear()}-${String(
                createdAt.getUTCMonth() + 1,
            ).padStart(2, '0')}`;
            if (alertMonth !== filters.month) {
                return false;
            }
        }
    }

    return true;
};

const ReportAlertsMap = ({ filters }: Props) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<GoogleMap | null>(null);
    const markerRefs = useRef<GoogleMarker[]>([]);
    const infoWindowRef = useRef<GoogleInfoWindow | null>(null);
    const shouldAutoFrameRef = useRef(true);
    const filtersSignature = useMemo(() => JSON.stringify(filters), [filters]);

    const mapAlerts = useMemo<MappedAlert[]>(
        () =>
            alerts
                .filter((alert) => alertMatchesFilters(alert, filters))
                .map((alert) => {
                    const coords = extractCoordsFromText(alert.ubicacion);
                    if (!coords) return null;

                    return {
                        ...alert,
                        coords,
                    };
                })
                .filter((alert): alert is MappedAlert => Boolean(alert)),
        [alerts, filters],
    );

    useEffect(() => {
        shouldAutoFrameRef.current = true;
    }, [filtersSignature]);

    useEffect(() => {
        let cancelled = false;

        const loadAlerts = async (silent = false) => {
            if (!silent) {
                setLoading(true);
            }

            try {
                const data = await alertsService.list();
                if (!cancelled) {
                    setAlerts(data);
                    setError('');
                }
            } catch {
                if (!cancelled) {
                    setError('No se pudieron cargar las alertas para el mapa.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadAlerts();
        const intervalId = window.setInterval(() => {
            void loadAlerts(true);
        }, AUTO_REFRESH_MS);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadMap = async () => {
            if (!isGoogleMapsEnabled || !mapContainerRef.current || mapRef.current) {
                return;
            }

            try {
                const maps = await getGoogleMapsApi();
                if (cancelled || !mapContainerRef.current) return;

                mapRef.current = new maps.Map(mapContainerRef.current, {
                    center: MAP_FALLBACK_CENTER,
                    zoom: 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });
                infoWindowRef.current = new maps.InfoWindow();
            } catch {
                if (!cancelled) {
                    setError('No se pudo cargar el mapa de alertas.');
                }
            }
        };

        void loadMap();

        return () => {
            cancelled = true;
            markerRefs.current.forEach((marker) => marker.setMap(null));
            markerRefs.current = [];
            infoWindowRef.current?.close();
            infoWindowRef.current = null;
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const renderMarkers = async () => {
            if (!mapRef.current || !isGoogleMapsEnabled) {
                return;
            }

            markerRefs.current.forEach((marker) => marker.setMap(null));
            markerRefs.current = [];

            try {
                const maps = await getGoogleMapsApi();
                if (cancelled || !mapRef.current) return;

                if (mapAlerts.length === 0) {
                    if (shouldAutoFrameRef.current) {
                        mapRef.current.setCenter(MAP_FALLBACK_CENTER);
                        mapRef.current.setZoom(12);
                    }
                    infoWindowRef.current?.close();
                    return;
                }

                const bounds = new maps.LatLngBounds();

                mapAlerts.forEach((alert) => {
                    const status = getStatusMeta(alert.id_estado);
                    const marker = new maps.Marker({
                        map: mapRef.current!,
                        position: alert.coords,
                        title: alert.titulo,
                        icon: {
                            path: maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: getMarkerColor(alert.id_estado),
                            fillOpacity: 0.95,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                        },
                    });

                    marker.addListener('click', () => {
                        infoWindowRef.current?.setContent(
                            `
                                <div class="reportes-map-popup">
                                    <strong>${escapeHtml(alert.titulo)}</strong>
                                    <span>${escapeHtml(status.label)}</span>
                                    <small>${escapeHtml(
                                        getReadableLocation(alert.ubicacion),
                                    )}</small>
                                </div>
                            `,
                        );
                        infoWindowRef.current?.open({
                            anchor: marker,
                            map: mapRef.current!,
                        });
                    });

                    bounds.extend(alert.coords);
                    markerRefs.current.push(marker);
                });

                if (!shouldAutoFrameRef.current) {
                    return;
                }

                if (mapAlerts.length === 1) {
                    mapRef.current.setCenter(mapAlerts[0].coords);
                    mapRef.current.setZoom(15);
                } else {
                    mapRef.current.fitBounds(bounds);
                }

                shouldAutoFrameRef.current = false;
            } catch {
                if (!cancelled) {
                    setError('No se pudieron dibujar los puntos del mapa.');
                }
            }
        };

        void renderMarkers();

        return () => {
            cancelled = true;
        };
    }, [mapAlerts]);

    return (
        <section className='reportes-map-section'>
            <article className='reportes-panel reportes-map-panel'>
                <div className='reportes-panel-head reportes-map-panel-head'>
                    <div>
                        <h3>Mapa de alertas</h3>
                        <p>
                            Visualiza las alertas con punto en mapa dentro de los
                            filtros aplicados.
                        </p>
                    </div>
                    <span className='reportes-meta-pill'>
                        {mapAlerts.length} punto
                        {mapAlerts.length === 1 ? '' : 's'}
                    </span>
                </div>

                {error && (
                    <div className='reportes-feedback reportes-feedback-error'>
                        {error}
                    </div>
                )}

                {!isGoogleMapsEnabled ? (
                    <div className='reportes-empty'>
                        Configura Google Maps para visualizar el mapa de reportes.
                    </div>
                ) : (
                    <div className='reportes-map-wrap'>
                        <div ref={mapContainerRef} className='reportes-map-canvas' />
                        {!loading && mapAlerts.length === 0 && (
                            <div className='reportes-map-overlay'>
                                No hay alertas con coordenadas para los filtros
                                actuales.
                            </div>
                        )}
                    </div>
                )}
            </article>
        </section>
    );
};

export default ReportAlertsMap;
