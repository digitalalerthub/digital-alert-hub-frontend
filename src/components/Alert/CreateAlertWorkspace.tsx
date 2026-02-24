import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import alertsService from "../../services/alertsService";
import geoService from "../../services/geoService";
import type { Alert, UpdateAlertPayload } from "../../types/Alert";
import AlertDetailModal from "./AlertDetailModal";
import AlertEditModal from "./AlertEditModal";
import { useAuth } from "../../context/useAuth";
import "./CreateAlertWorkspace.css";

type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

type Coords = {
  lat: number;
  lng: number;
};

type ReverseGeocodeResponse = {
  display_name?: string;
  address?: {
    road?: string;
    residential?: string;
    pedestrian?: string;
    footway?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
};

const COORDS_REGEX = /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/;
const ALERTS_PER_PAGE = 3;

const iconDefaultProto = L.Icon.Default.prototype as unknown as {
  _getIconUrl?: () => string;
};
delete iconDefaultProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalizacion no disponible"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000,
    });
  });

const formatReadableAddress = (data: ReverseGeocodeResponse): string => {
  const a = data.address || {};
  const road = a.road || a.residential || a.pedestrian || a.footway || "";
  const houseNumber = a.house_number ? ` # ${a.house_number}` : "";
  const sector = a.neighbourhood || a.suburb || a.city_district || "";
  const city = a.city || a.town || a.village || a.municipality || "";
  const parts = [`${road}${houseNumber}`.trim(), sector.trim(), city.trim()].filter(
    (v) => v.length > 0
  );

  if (parts.length > 0) return parts.join(", ");

  return (data.display_name || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
};

const extractCoordsFromText = (text?: string): Coords | null => {
  if (!text) return null;
  const match = text.match(COORDS_REGEX);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

const geocodeAddress = async (query: string, strict = false): Promise<Coords | null> => {
  if (!query.trim()) return null;

  try {
    const data = await geoService.search(query, 1, strict);
    if (!data?.length) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch {
    return null;
  }
};

const formatAlertDate = (value?: string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const CreateAlertWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Seguridad");
  const [prioridad, setPrioridad] = useState("Media");
  const [ubicacion, setUbicacion] = useState("");
  const [evidencia, setEvidencia] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [forceCoordsOnSubmit, setForceCoordsOnSubmit] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const suggestionsCacheRef = useRef<Map<string, LocationSuggestion[]>>(new Map());

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const activeLayerRef = useRef<L.LayerGroup | null>(null);

  const filteredAlerts = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return alerts;
    return alerts.filter((a) => a.titulo.toLowerCase().includes(text));
  }, [alerts, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE));

  const pagedAlerts = useMemo(() => {
    const start = (currentPage - 1) * ALERTS_PER_PAGE;
    return filteredAlerts.slice(start, start + ALERTS_PER_PAGE);
  }, [currentPage, filteredAlerts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setSelectedMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    mapRef.current.setView([lat, lng], 16);
  }, []);

  const renderActiveAlertsOnMap = useCallback(
    async (data: Alert[]) => {
      if (!mapRef.current) return;

      if (!activeLayerRef.current) {
        activeLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      activeLayerRef.current.clearLayers();

      const activeAlerts = data
        .filter((a) => a.id_estado === 1 && a.ubicacion && a.ubicacion.trim().length > 0)
        .slice(0, 30);

      for (const alert of activeAlerts) {
        let coords = extractCoordsFromText(alert.ubicacion);

        if (!coords && alert.ubicacion) {
          coords = await geocodeAddress(alert.ubicacion, false);
        }

        if (!coords) continue;

        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 6,
          color: "#7f1d1d",
          fillColor: "#dc2626",
          fillOpacity: 0.9,
          weight: 1,
        });

        marker.bindPopup(
          `<strong>${alert.titulo}</strong><br/>${alert.categoria}${
            alert.prioridad ? ` - ${alert.prioridad}` : ""
          }`
        );

        marker.addTo(activeLayerRef.current);
      }
    },
    []
  );

  const loadAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const data = await alertsService.list();
      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        if (da !== db) return db - da;
        return b.id_alerta - a.id_alerta;
      });
      setAlerts(sorted);
      await renderActiveAlertsOnMap(sorted);
    } catch {
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, [renderActiveAlertsOnMap]);

  const setLocationFromCoords = useCallback(
    async (lat: number, lng: number) => {
      setSelectedCoords({ lat, lng });
      setSelectedMarker(lat, lng);

      try {
        setReverseLoading(true);
        const data = (await geoService.reverse(lat, lng)) as ReverseGeocodeResponse;
        const readable = formatReadableAddress(data);

        if (readable) {
          setUbicacion(readable);
          setForceCoordsOnSubmit(false);
        } else {
          setUbicacion("Ubicacion seleccionada en el mapa");
          setForceCoordsOnSubmit(true);
        }
      } catch {
        setUbicacion("Ubicacion seleccionada en el mapa");
        setForceCoordsOnSubmit(true);
      } finally {
        setReverseLoading(false);
      }
    },
    [setSelectedMarker]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const medellin: Coords = { lat: 6.2442, lng: -75.5812 };
    mapRef.current = L.map(mapContainerRef.current).setView([medellin.lat, medellin.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapRef.current);

    mapRef.current.on("click", async (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      await setLocationFromCoords(lat, lng);
    });

    (async () => {
      try {
        const position = await getCurrentPosition();
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        mapRef.current?.setView([lat, lng], 15);
      } catch {
        mapRef.current?.setView([medellin.lat, medellin.lng], 13);
      }

      await loadAlerts();
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      activeLayerRef.current = null;
    };
  }, [loadAlerts, setLocationFromCoords]);

  useEffect(() => {
    const query = ubicacion.trim();

    const isMapSelectionText = query.toLowerCase().startsWith("ubicacion seleccionada en el mapa");
    const hasLetters = /[a-zA-Z]/.test(query);
    const hasNumbers = /\d/.test(query);

    if (query.length < 8 || isMapSelectionText || !hasLetters || !hasNumbers) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const cacheKey = query.toLowerCase();
    const cached = suggestionsCacheRef.current.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setSuggestionsLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const data = (await geoService.search(query, 5, true)) as LocationSuggestion[];
        suggestionsCacheRef.current.set(cacheKey, data || []);
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [ubicacion]);

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);

    setUbicacion(item.display_name);
    setForceCoordsOnSubmit(false);
    setSelectedCoords({ lat, lng });
    setSuggestions([]);
    setSelectedMarker(lat, lng);
  };

  const verifyAddress = async () => {
    const query = ubicacion.trim();

    if (!query) {
      toast.info("Escribe una direccion para verificarla");
      return;
    }

    try {
      let coords = await geocodeAddress(query, true);

      if (!coords && !/medell[ií]n|antioquia|colombia/i.test(query)) {
        coords = await geocodeAddress(`${query}, Medellin, Antioquia, Colombia`, true);
      }

      if (!coords) {
        coords = await geocodeAddress(query, false);
      }

      if (!coords) {
        toast.warning("No encontramos esa direccion, pero puedes registrar la alerta igual");
        return;
      }

      setSelectedCoords(coords);
      setSelectedMarker(coords.lat, coords.lng);
      setForceCoordsOnSubmit(false);
      toast.success("Direccion ubicada en el mapa");
    } catch {
      toast.warning("No se pudo verificar la direccion, puedes continuar de todos modos");
    }
  };

  const useMyLocation = async () => {
    try {
      setLocatingUser(true);
      const position = await getCurrentPosition();
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));
      await setLocationFromCoords(lat, lng);
      toast.success("Ubicacion actual detectada");
    } catch {
      toast.warning("No se pudo obtener tu ubicacion actual");
    } finally {
      setLocatingUser(false);
    }
  };

  const handleAddressBlur = async () => {
    if (!ubicacion.trim()) return;

    const coords = await geocodeAddress(ubicacion, true);
    if (!coords) return;

    setSelectedCoords(coords);
    setSelectedMarker(coords.lat, coords.lng);
    setForceCoordsOnSubmit(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim() || !categoria.trim()) {
      toast.error("Titulo, descripcion y categoria son obligatorios");
      return;
    }

    const locationValue = (() => {
      const clean = ubicacion.trim();
      if (selectedCoords && (forceCoordsOnSubmit || !clean)) {
        return `Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
      }
      if (selectedCoords && clean) {
        // Guarda texto entendible + coordenadas para poder pintar siempre el punto en el mapa.
        return `${clean} | Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
      }
      if (clean) return clean;
      return undefined;
    })();

    try {
      setSubmitting(true);
      await alertsService.create({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria.trim(),
        prioridad: prioridad.trim() || undefined,
        ubicacion: locationValue,
        evidencia: evidencia || undefined,
      });

      toast.success("Alerta creada correctamente");
      setTitulo("");
      setDescripcion("");
      setCategoria("Seguridad");
      setPrioridad("Media");
      setUbicacion("");
      setForceCoordsOnSubmit(false);
      setEvidencia(null);
      setSelectedCoords(null);
      setSuggestions([]);
      markerRef.current?.remove();
      markerRef.current = null;

      await loadAlerts();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "No se pudo crear la alerta");
      } else {
        toast.error("Error inesperado al crear la alerta");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAlert = async (id: number, payload: UpdateAlertPayload) => {
    try {
      await alertsService.update(id, payload);
      toast.success("Alerta actualizada");
      await loadAlerts();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "No se pudo actualizar la alerta");
      } else {
        toast.error("Error inesperado al actualizar");
      }
      throw error;
    }
  };

  return (
    <div className="create-alert-page">
      <div className="create-alert-layout">
        <nav aria-label="breadcrumb" className="create-alert-breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/admin" className="breadcrumb-link">
                <i className="bi bi-house-door-fill me-2" />
                Panel Principal
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Gestion de Alertas
            </li>
          </ol>
        </nav>

        <div className="create-alert-header-section">
          <h1 className="create-alert-page-title">Gestion de Alertas</h1>
          <p className="create-alert-page-subtitle">
            Administra y controla los reportes de alertas del sistema
          </p>
        </div>

        <div className="create-alert-shell">
          <section className="create-alert-left">
            <h2 className="create-alert-box-title">+ Reportar Nueva Alerta</h2>

            <form onSubmit={handleSubmit} className="create-alert-form">
              <label className="create-alert-label">Titulo de la alerta</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Fuga de agua"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={200}
                required
              />

              <div className="create-alert-row">
                <div>
                  <label className="create-alert-label">Categoria</label>
                  <select
                    className="form-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="Seguridad">Seguridad</option>
                    <option value="Infraestructura">Infraestructura</option>
                    <option value="Servicios publicos">Servicios publicos</option>
                    <option value="Movilidad">Movilidad</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="create-alert-label">Prioridad</label>
                  <select
                    className="form-select"
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value)}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Critica">Critica</option>
                  </select>
                </div>
              </div>

              <label className="create-alert-label">Descripcion del incidente</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe los detalles de la situacion..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />

              <label className="create-alert-label">Ubicacion del incidente</label>
              <input
                type="text"
                className="form-control"
                value={ubicacion}
                onChange={(e) => {
                  setUbicacion(e.target.value);
                  setForceCoordsOnSubmit(false);
                  setSelectedCoords(null);
                }}
                onBlur={handleAddressBlur}
                maxLength={255}
                placeholder="Direccion de la alerta"
                disabled={submitting}
              />

              {reverseLoading && <small className="text-muted">Obteniendo direccion...</small>}
              {suggestionsLoading && <small className="text-muted">Buscando sugerencias...</small>}

              {suggestions.length > 0 && (
                <div className="list-group mt-1">
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={`${item.lat}-${item.lon}-${item.display_name}`}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}

              <div className="create-alert-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={verifyAddress}
                  disabled={submitting || locatingUser}
                >
                  Verificar direccion
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={useMyLocation}
                  disabled={submitting || locatingUser}
                >
                  {locatingUser ? "Ubicando..." : "Usar mi ubicacion"}
                </button>
              </div>

              <label className="create-alert-label">Evidencia multimedia (opcional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setEvidencia(null);
                    return;
                  }

                  if (file.size > 20 * 1024 * 1024) {
                    toast.warning("La evidencia no puede superar 20MB");
                    e.target.value = "";
                    setEvidencia(null);
                    return;
                  }

                  setEvidencia(file);
                }}
                disabled={submitting}
              />
              {evidencia && (
                <small className="text-muted">
                  Archivo seleccionado: {evidencia.name}
                </small>
              )}

              <div className="create-alert-map-wrap">
                <div ref={mapContainerRef} className="create-alert-map" />
                {selectedCoords && (
                  <small className="text-primary d-block mt-2">
                    Punto seleccionado: {selectedCoords.lat}, {selectedCoords.lng}
                  </small>
                )}
              </div>

              <button type="submit" className="btn btn-dark create-alert-submit" disabled={submitting}>
                {submitting ? "Publicando..." : "Publicar Alerta"}
              </button>
            </form>
          </section>

          <section className="create-alert-right">
            <input
              type="text"
              className="form-control create-alert-search"
              placeholder="Buscar alertas por titulos"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            <h3 className="create-alert-right-title">Alertas recientes</h3>

            <div className="create-alert-list">
              {alertsLoading && <p className="text-muted mb-0">Cargando alertas...</p>}
              {!alertsLoading && pagedAlerts.length === 0 && (
                <p className="text-muted mb-0">No hay alertas para mostrar.</p>
              )}
              {pagedAlerts.map((alert) => {
                const status = getStatusMeta(alert.id_estado);
                return (
                <article
                  key={alert.id_alerta}
                  className="create-alert-item create-alert-item-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedAlert(alert)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedAlert(alert);
                    }
                  }}
                >
                  <div className="create-alert-item-top">
                    <span className="create-alert-item-date">{formatAlertDate(alert.created_at)}</span>
                    <span className="create-alert-item-priority">
                      {alert.prioridad || "Sin prioridad"}
                    </span>
                  </div>
                  <h4 className="create-alert-item-title">{alert.titulo}</h4>
                  <p className="create-alert-item-desc">{alert.descripcion}</p>
                  <div className="create-alert-item-meta">
                    <span className="badge rounded-pill text-bg-light">{alert.categoria}</span>
                    <span className={`badge rounded-pill ${status.className}`}>{status.label}</span>
                  </div>
                </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="create-alert-pagination">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`btn btn-sm ${
                      page === currentPage ? "btn-dark" : "btn-outline-secondary"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </button>
              </div>
            )}

            <button type="button" className="btn btn-link p-0 create-alert-admin-link" onClick={() => navigate("/admin")}>
              Volver al panel
            </button>
          </section>
        </div>
      </div>
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          canEdit={user?.id === selectedAlert.id_usuario && selectedAlert.id_estado === 1}
          onEdit={() => setEditingAlert(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
        />
      )}
      {editingAlert && (
        <AlertEditModal
          alert={editingAlert}
          onClose={() => setEditingAlert(null)}
          onSave={handleUpdateAlert}
        />
      )}
    </div>
  );
};

export default CreateAlertWorkspace;


