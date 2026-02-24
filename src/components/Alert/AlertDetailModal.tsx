import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { Alert } from "../../types/Alert";
import "./AlertDetailModal.css";

type Props = {
  alert: Alert;
  onClose: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
};

type Coords = {
  lat: number;
  lng: number;
};

const COORDS_REGEX = /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/;

const extractCoordsFromText = (text?: string): Coords | null => {
  if (!text) return null;
  const match = text.match(COORDS_REGEX);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

const getReadableLocation = (text?: string): string => {
  if (!text) return "No especificada";
  const marker = " | Punto en mapa:";
  if (text.includes(marker)) {
    return text.split(marker)[0].trim() || "No especificada";
  }
  return text;
};

const formatAlertDate = (value?: string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusMeta = (idEstado: number) => {
  switch (idEstado) {
    case 1:
      return { label: "Activa", className: "text-bg-success" };
    case 2:
      return { label: "En proceso", className: "text-bg-warning text-dark" };
    case 3:
      return { label: "Atendida", className: "text-bg-primary" };
    case 4:
      return { label: "Cerrada", className: "text-bg-secondary" };
    default:
      return { label: "Sin estado", className: "text-bg-dark" };
  }
};

const AlertDetailModal = ({ alert, onClose, canEdit = false, onEdit }: Props) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapCoords = useMemo(() => extractCoordsFromText(alert.ubicacion), [alert.ubicacion]);
  const readableLocation = useMemo(() => getReadableLocation(alert.ubicacion), [alert.ubicacion]);
  const status = getStatusMeta(alert.id_estado);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const fallback: Coords = { lat: 6.2442, lng: -75.5812 };
    const center = mapCoords || fallback;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.lat, center.lng], mapCoords ? 16 : 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);

    if (mapCoords) {
      L.circleMarker([mapCoords.lat, mapCoords.lng], {
        radius: 7,
        color: "#7f1d1d",
        fillColor: "#dc2626",
        fillOpacity: 0.95,
        weight: 2,
      }).addTo(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapCoords]);

  return (
    <div className="alert-detail-backdrop" onClick={onClose}>
      <div className="alert-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="alert-detail-close" onClick={onClose}>
          <i className="bi bi-x-lg" />
        </button>

        <h2 className="alert-detail-title">{alert.titulo}</h2>

        <div className="alert-detail-content">
          <section className="alert-detail-media-box">
            {alert.evidencia_url ? (
              alert.evidencia_tipo?.startsWith("video/") ? (
                <video controls className="alert-detail-media" src={alert.evidencia_url} />
              ) : (
                <img
                  src={alert.evidencia_url}
                  alt={`Evidencia de ${alert.titulo}`}
                  className="alert-detail-media"
                />
              )
            ) : (
              <div className="alert-detail-no-media">
                <i className="bi bi-image" />
                <span>Sin evidencia multimedia</span>
              </div>
            )}
          </section>

          <section className="alert-detail-info">
            <div className="alert-detail-meta-row">
              <span className="badge rounded-pill text-bg-light">{alert.categoria}</span>
              <span className="badge rounded-pill text-bg-warning text-dark">
                {alert.prioridad || "Sin prioridad"}
              </span>
              <span className={`badge rounded-pill ${status.className}`}>{status.label}</span>
            </div>

            <h3 className="alert-detail-subtitle">Descripcion</h3>
            <p className="alert-detail-description">{alert.descripcion}</p>

            <h3 className="alert-detail-subtitle">Ubicacion exacta</h3>
            <p className="alert-detail-location">{readableLocation}</p>
            {mapCoords && (
              <p className="alert-detail-location text-muted mb-0">
                Coordenadas: {mapCoords.lat}, {mapCoords.lng}
              </p>
            )}

            <p className="alert-detail-date">{formatAlertDate(alert.created_at)}</p>
          </section>
        </div>

        <div className="alert-detail-map-wrap">
          <div ref={mapContainerRef} className="alert-detail-map" />
        </div>

        {canEdit && (
          <div className="alert-detail-actions">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                onClose();
                onEdit?.();
              }}
            >
              Editar alerta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertDetailModal;
