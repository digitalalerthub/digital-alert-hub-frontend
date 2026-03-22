import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import locationsService from "../../services/locationsService";
import type { Alert, UpdateAlertPayload } from "../../types/Alert";
import type { BarrioOption, ComunaOption } from "../../types/Location";
import {
  extractCoordsFromText,
  reverseGeocode,
} from "./createAlertWorkspace.utils";
import { useAlertMap } from "./hooks/useAlertMap";
import { resolveAdministrativeLocation } from "./locationResolver.utils";
import "./AlertEditModal.css";

type Props = {
  alert: Alert;
  mode?: "full" | "evidence-only";
  onClose: () => void;
  onSave: (id: number, payload: UpdateAlertPayload) => Promise<void>;
};

const CATEGORY_OPTIONS = ["Agua", "Energía", "Gas", "Movilidad", "Seguridad", "Residuos", "Otro"] as const;
const PRIORITY_OPTIONS = ["Baja", "Media", "Alta"] as const;
const MAX_EVIDENCE_IMAGES = 10;
const MAX_EVIDENCE_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Coords = {
  lat: number;
  lng: number;
};

type ExistingEvidenceItem = {
  key: string;
  id: number | null;
  url: string;
  type: string | null;
};

const buildLocationValue = (
  ubicacion: string,
  selectedCoords: Coords | null,
  forceCoordsOnSubmit: boolean
): string | undefined => {
  const clean = ubicacion.trim();

  if (selectedCoords && (forceCoordsOnSubmit || !clean)) {
    return `Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
  }

  if (selectedCoords && clean) {
    return `${clean} | Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
  }

  if (clean) return clean;
  return undefined;
};

const buildExistingEvidenceList = (alert: Alert): ExistingEvidenceItem[] => {
  const fromArray = (alert.evidencias || [])
    .filter((item) => Boolean(item?.url_evidencia))
    .map((item, index) => ({
      key: `evidence-${item.id_evidencia || index}-${item.url_evidencia}`,
      id: item.id_evidencia || null,
      url: item.url_evidencia,
      type: item.tipo_evidencia || null,
    }));

  if (fromArray.length > 0) {
    return fromArray;
  }

  if (alert.evidencia_url) {
    return [
      {
        key: `legacy-${alert.id_alerta}-${alert.evidencia_url}`,
        id: null,
        url: alert.evidencia_url,
        type: alert.evidencia_tipo || null,
      },
    ];
  }

  return [];
};

const AlertEditModal = ({ alert, mode = "full", onClose, onSave }: Props) => {
  const isEvidenceOnlyMode = mode === "evidence-only";
  const [titulo, setTitulo] = useState(alert.titulo);
  const [descripcion, setDescripcion] = useState(alert.descripcion);
  const [categoria, setCategoria] = useState(alert.categoria);
  const [prioridad, setPrioridad] = useState(alert.prioridad || "Media");
  const [ubicacion, setUbicacion] = useState(alert.ubicacion || "");
  const [comunas, setComunas] = useState<ComunaOption[]>([]);
  const [barrios, setBarrios] = useState<BarrioOption[]>([]);
  const [comunaId, setComunaId] = useState(alert.id_comuna ? String(alert.id_comuna) : "");
  const [barrioId, setBarrioId] = useState(alert.id_barrio ? String(alert.id_barrio) : "");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [existingEvidences, setExistingEvidences] = useState<ExistingEvidenceItem[]>(
    () => buildExistingEvidenceList(alert)
  );
  const [removedEvidenceIds, setRemovedEvidenceIds] = useState<number[]>([]);
  const [removeAllEvidence, setRemoveAllEvidence] = useState(false);
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const categoryOptions = useMemo(() => Array.from(new Set([categoria, ...CATEGORY_OPTIONS])), [categoria]);
  const priorityOptions = useMemo(() => Array.from(new Set([prioridad, ...PRIORITY_OPTIONS])), [prioridad]);
  const initialCoords = useMemo(() => extractCoordsFromText(alert.ubicacion), [alert.ubicacion]);
  const mapSeededRef = useRef(false);
  const barriosCacheRef = useRef<Map<number, BarrioOption[]>>(new Map());
  const autoResolutionRequestRef = useRef(0);

  const {
    mapContainerRef,
    selectedCoords,
    reverseLoading,
    locatingUser,
    forceCoordsOnSubmit,
    suggestions,
    suggestionsLoading,
    isMapReady,
    handleManualUbicacionChange,
    handleSelectSuggestion,
    verifyAddress,
    useMyLocation: triggerMyLocation,
    handleAddressBlur,
    setLocationFromCoords,
  } = useAlertMap({ ubicacion, setUbicacion });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    setTitulo(alert.titulo);
    setDescripcion(alert.descripcion);
    setCategoria(alert.categoria);
    setPrioridad(alert.prioridad || "Media");
    setUbicacion(alert.ubicacion || "");
    setComunaId(alert.id_comuna ? String(alert.id_comuna) : "");
    setBarrioId(alert.id_barrio ? String(alert.id_barrio) : "");
    setExistingEvidences(buildExistingEvidenceList(alert));
    setRemovedEvidenceIds([]);
    setRemoveAllEvidence(false);
    setEvidencias([]);
    mapSeededRef.current = false;
    autoResolutionRequestRef.current = 0;
  }, [alert]);

  const getBarriosByComuna = useCallback(async (idComuna: number): Promise<BarrioOption[]> => {
    const cached = barriosCacheRef.current.get(idComuna);
    if (cached) {
      return cached;
    }

    const data = await locationsService.listBarriosByComuna(idComuna);
    barriosCacheRef.current.set(idComuna, data);
    return data;
  }, []);

  useEffect(() => {
    if (isEvidenceOnlyMode) return;

    let cancelled = false;

    const loadComunas = async () => {
      try {
        setLoadingLocations(true);
        const data = await locationsService.listComunas();
        if (cancelled) return;
        setComunas(data);
        barriosCacheRef.current.clear();

        setComunaId((current) => {
          const parsedCurrent = Number(current);
          if (Number.isInteger(parsedCurrent) && data.some((item) => item.id_comuna === parsedCurrent)) {
            return current;
          }
          if (alert.id_comuna && data.some((item) => item.id_comuna === alert.id_comuna)) {
            return String(alert.id_comuna);
          }
          return data[0] ? String(data[0].id_comuna) : "";
        });
      } catch {
        if (!cancelled) {
          setComunas([]);
          toast.error("No se pudieron cargar las comunas");
        }
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    };

    void loadComunas();

    return () => {
      cancelled = true;
    };
  }, [alert.id_alerta, alert.id_comuna, isEvidenceOnlyMode]);

  useEffect(() => {
    if (isEvidenceOnlyMode) return;

    const parsedComuna = Number(comunaId);
    if (!Number.isInteger(parsedComuna) || parsedComuna <= 0) {
      setBarrios([]);
      setBarrioId("");
      return;
    }

    let cancelled = false;
    const loadBarrios = async () => {
      try {
        const data = await getBarriosByComuna(parsedComuna);
        if (cancelled) return;
        setBarrios(data);

        setBarrioId((current) => {
          if (data.some((item) => String(item.id_barrio) === current)) return current;
          if (alert.id_barrio && data.some((item) => item.id_barrio === alert.id_barrio)) {
            return String(alert.id_barrio);
          }
          return data[0] ? String(data[0].id_barrio) : "";
        });
      } catch {
        if (!cancelled) {
          setBarrios([]);
          setBarrioId("");
          toast.error("No se pudieron cargar los barrios de la comuna");
        }
      }
    };

    void loadBarrios();
    return () => {
      cancelled = true;
    };
  }, [alert.id_barrio, comunaId, getBarriosByComuna, isEvidenceOnlyMode]);

  useEffect(() => {
    if (isEvidenceOnlyMode || !isMapReady || mapSeededRef.current) return;
    mapSeededRef.current = true;

    if (initialCoords) {
      void setLocationFromCoords(initialCoords.lat, initialCoords.lng);
      return;
    }

    if (alert.ubicacion?.trim()) {
      void handleAddressBlur();
    }
  }, [
    alert.id_alerta,
    alert.ubicacion,
    handleAddressBlur,
    initialCoords,
    isEvidenceOnlyMode,
    isMapReady,
    setLocationFromCoords,
  ]);

  useEffect(() => {
    if (isEvidenceOnlyMode || !selectedCoords || comunas.length === 0) return;

    let cancelled = false;

    const syncAdministrativeLocation = async () => {
      const requestId = autoResolutionRequestRef.current + 1;
      autoResolutionRequestRef.current = requestId;

      const reversePayload = await reverseGeocode(
        selectedCoords.lat,
        selectedCoords.lng
      );

      if (
        cancelled ||
        autoResolutionRequestRef.current !== requestId ||
        !reversePayload
      ) {
        return;
      }

      const currentComuna = Number(comunaId);
      const resolvedLocation = await resolveAdministrativeLocation({
        payload: reversePayload,
        comunas,
        currentComunaId:
          Number.isInteger(currentComuna) && currentComuna > 0
            ? currentComuna
            : null,
        getBarriosByComuna,
      });

      if (
        cancelled ||
        autoResolutionRequestRef.current !== requestId ||
        !resolvedLocation
      ) {
        return;
      }

      setComunaId(String(resolvedLocation.comunaId));
      setBarrioId(String(resolvedLocation.barrioId));
    };

    void syncAdministrativeLocation();

    return () => {
      cancelled = true;
    };
  }, [comunaId, comunas, getBarriosByComuna, isEvidenceOnlyMode, selectedCoords]);

  const selectEvidence = (files: File[]): boolean => {
    if (!files.length) {
      setEvidencias([]);
      return true;
    }

    if (files.length > MAX_EVIDENCE_IMAGES) {
      toast.warning(`Puedes subir máximo ${MAX_EVIDENCE_IMAGES} imágenes`);
      setEvidencias([]);
      return false;
    }

    const invalidType = files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      toast.warning("Solo se permiten imágenes JPG, PNG o WEBP");
      setEvidencias([]);
      return false;
    }

    const oversized = files.some((file) => file.size > MAX_EVIDENCE_SIZE);
    if (oversized) {
      toast.warning("Cada imagen no puede superar 20MB");
      setEvidencias([]);
      return false;
    }

    setEvidencias(files);
    return true;
  };

  const handleEvidenceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const ok = selectEvidence(files);

    if (!ok) {
      e.target.value = "";
    }
  };

  const handleEvidenceDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    selectEvidence(files);
  };

  const handleEvidenceDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const removeExistingEvidence = (item: ExistingEvidenceItem) => {
    if (saving || isEvidenceOnlyMode) return;

    setExistingEvidences((current) => current.filter((evidence) => evidence.key !== item.key));

    const evidenceId = item.id;

    if (evidenceId !== null && Number.isInteger(evidenceId)) {
      setRemovedEvidenceIds((current) =>
        current.includes(evidenceId) ? current : [...current, evidenceId]
      );
      return;
    }

    setRemoveAllEvidence(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEvidenceOnlyMode) {
      if (!evidencias.length) {
        toast.error("Agrega al menos una nueva evidencia");
        return;
      }
    } else if (!titulo.trim() || !descripcion.trim() || !categoria.trim()) {
      toast.error("Título, descripción y categoría son obligatorios");
      return;
    }

    const parsedComunaId = Number(comunaId);
    const parsedBarrioId = Number(barrioId);
    const locationValue = buildLocationValue(ubicacion, selectedCoords, forceCoordsOnSubmit);
    const payload: UpdateAlertPayload = isEvidenceOnlyMode
      ? {
          evidencias: evidencias.length ? evidencias : undefined,
        }
      : {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          categoria: categoria.trim(),
          prioridad: prioridad.trim(),
          ubicacion: locationValue,
          evidencias: evidencias.length ? evidencias : undefined,
        };

    if (!isEvidenceOnlyMode && removedEvidenceIds.length > 0) {
      payload.evidencias_eliminadas = removedEvidenceIds;
    }

    if (!isEvidenceOnlyMode && removeAllEvidence) {
      payload.eliminar_todas_evidencias = true;
    }

    if (!isEvidenceOnlyMode && Number.isInteger(parsedComunaId) && parsedComunaId > 0) {
      payload.id_comuna = parsedComunaId;
    }
    if (!isEvidenceOnlyMode && Number.isInteger(parsedBarrioId) && parsedBarrioId > 0) {
      payload.id_barrio = parsedBarrioId;
    }

    try {
      setSaving(true);
      await onSave(alert.id_alerta, payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="alert-edit-backdrop" onClick={onClose}>
      <div className="alert-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alert-edit-header">
          <h3 className="alert-edit-title">
            {isEvidenceOnlyMode ? "+ Agregar Evidencia" : "+ Editar Alerta"}
          </h3>
          <button type="button" className="alert-edit-close" onClick={onClose} aria-label="Cerrar modal">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="alert-edit-form">
          {isEvidenceOnlyMode ? (
            <div className="alert-edit-mode-note">
              <i className="bi bi-info-circle-fill" />
              <div>
                <strong>Alerta en progreso</strong>
                <span>
                  Puedes agregar nuevas evidencias, pero no modificar ni eliminar el contenido actual.
                </span>
              </div>
            </div>
          ) : (
            <>
              <label className="alert-edit-label">Título de la alerta</label>
              <input
                className="alert-edit-input"
                value={titulo}
                placeholder="Fuga de agua"
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={200}
                required
              />

              <div className="alert-edit-row">
                <div>
                  <label className="alert-edit-label">Categoría</label>
                  <select
                    className="alert-edit-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="alert-edit-label">Prioridad</label>
                  <div className="alert-edit-priority-group" role="group" aria-label="Prioridad">
                    {priorityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`alert-edit-priority-chip ${prioridad === option ? "is-active" : ""}`}
                        onClick={() => setPrioridad(option)}
                        aria-pressed={prioridad === option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="alert-edit-label">Descripción del incidente</label>
              <textarea
                className="alert-edit-textarea"
                rows={3}
                value={descripcion}
                placeholder="Describe los detalles de la situación..."
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />

              <label className="alert-edit-label">Ubicación del incidente</label>
              <input
                className="alert-edit-input"
                value={ubicacion}
                onChange={(e) => handleManualUbicacionChange(e.target.value)}
                onBlur={() => void handleAddressBlur()}
                placeholder="Dirección de la alerta"
                maxLength={255}
                disabled={saving}
              />

              {(suggestionsLoading || reverseLoading) && (
                <small className="alert-edit-help-text">
                  {suggestionsLoading ? "Buscando sugerencias..." : "Obteniendo dirección..."}
                </small>
              )}

              {suggestions.length > 0 && (
                <div className="alert-edit-suggestions">
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={`${item.place_id}-${item.display_name}`}
                      className="alert-edit-suggestion-item"
                      onClick={() => void handleSelectSuggestion(item)}
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}

              <div className="alert-edit-location-actions">
                <button
                  type="button"
                  className="alert-edit-location-btn"
                  onClick={() => void verifyAddress()}
                  disabled={saving || locatingUser}
                >
                  Verificar dirección
                </button>
                <button
                  type="button"
                  className="alert-edit-location-btn"
                  onClick={() => void triggerMyLocation()}
                  disabled={saving || locatingUser}
                >
                  {locatingUser ? "Ubicando..." : "Usar mi ubicación"}
                </button>
              </div>

              <div className="alert-edit-map-wrap">
                <div ref={mapContainerRef} className="alert-edit-map" />
                {selectedCoords && (
                  <small className="alert-edit-map-status">
                    Punto seleccionado: {selectedCoords.lat}, {selectedCoords.lng}
                  </small>
                )}
              </div>

              <div className="alert-edit-row">
                <div>
                  <label className="alert-edit-label">Comuna</label>
                  <select
                    className="alert-edit-select"
                    value={comunaId}
                    onChange={(e) => setComunaId(e.target.value)}
                    disabled={loadingLocations || saving}
                  >
                    {comunas.length === 0 && <option value="">Cargando...</option>}
                    {comunas.map((item) => (
                      <option key={item.id_comuna} value={item.id_comuna}>
                        {item.id_comuna} - {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="alert-edit-label">Barrio</label>
                  <select
                    className="alert-edit-select"
                    value={barrioId}
                    onChange={(e) => setBarrioId(e.target.value)}
                    disabled={barrios.length === 0 || loadingLocations || saving}
                  >
                    {barrios.length === 0 && <option value="">Selecciona comuna</option>}
                    {barrios.map((item) => (
                      <option key={item.id_barrio} value={item.id_barrio}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <label className="alert-edit-label">Evidencias actuales</label>
          {existingEvidences.length > 0 ? (
            <div className="alert-edit-existing-grid">
              {existingEvidences.map((item) => (
                <article key={item.key} className="alert-edit-existing-item">
                  {item.type?.startsWith("video/") ? (
                    <video className="alert-edit-existing-media" src={item.url} controls />
                  ) : (
                    <img className="alert-edit-existing-media" src={item.url} alt="Evidencia cargada" />
                  )}
                  {!isEvidenceOnlyMode && (
                    <button
                      type="button"
                      className="alert-edit-existing-remove"
                      aria-label="Quitar evidencia"
                      onClick={() => removeExistingEvidence(item)}
                      disabled={saving}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <small className="alert-edit-help-text">No hay evidencias cargadas actualmente.</small>
          )}

          <label className="alert-edit-label">
            {isEvidenceOnlyMode ? "Agregar nuevas evidencias" : "Agregar nuevas evidencias (opcional)"}
          </label>
          <div className="alert-edit-dropzone-wrap">
            <label
              htmlFor="alert-edit-evidence"
              className={`alert-edit-dropzone ${evidencias.length > 0 ? "has-file" : ""}`}
              onDrop={handleEvidenceDrop}
              onDragOver={handleEvidenceDragOver}
            >
              <i className="bi bi-cloud-upload alert-edit-dropzone-icon" />
              <span>
                {evidencias.length > 0
                  ? `${evidencias.length} imagen(es) seleccionada(s)`
                  : "Sube imágenes o arrastra y suelta"}
              </span>
              <small>PNG, JPG, WEBP</small>
            </label>
            <input
              id="alert-edit-evidence"
              type="file"
              className="alert-edit-file-input"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleEvidenceChange}
              disabled={saving}
            />
          </div>

          <div className="alert-edit-actions">
            <button type="button" className="alert-edit-cancel-btn" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="alert-edit-save-btn" disabled={saving}>
              {saving
                ? "Guardando..."
                : isEvidenceOnlyMode
                  ? "Agregar evidencia"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertEditModal;
