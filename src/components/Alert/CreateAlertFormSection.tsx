import type { ChangeEvent, DragEvent, FormEvent, RefObject } from "react";
import type { Coords, LocationSuggestion } from "./createAlertWorkspace.utils";
import type { BarrioOption, ComunaOption } from "../../types/Location";

const CATEGORY_OPTIONS = [
  "Agua",
  "Energ\u00EDa",
  "Gas",
  "Movilidad",
  "Seguridad",
  "Residuos",
  "Otro",
];

const PRIORITY_OPTIONS = ["Baja", "Media", "Alta"] as const;

type Props = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  titulo: string;
  onTituloChange: (value: string) => void;
  descripcion: string;
  onDescripcionChange: (value: string) => void;
  categoria: string;
  onCategoriaChange: (value: string) => void;
  prioridad: string;
  onPrioridadChange: (value: string) => void;
  ubicacion: string;
  onUbicacionChange: (value: string) => void;
  onAddressBlur: () => Promise<void> | void;
  suggestionsLoading: boolean;
  suggestions: LocationSuggestion[];
  onSelectSuggestion: (item: LocationSuggestion) => void;
  onVerifyAddress: () => Promise<void> | void;
  onUseMyLocation: () => Promise<void> | void;
  reverseLoading: boolean;
  locatingUser: boolean;
  comunas: ComunaOption[];
  comunaId: string;
  onComunaChange: (value: string) => void;
  barrioId: string;
  barrios: BarrioOption[];
  onBarrioChange: (value: string) => void;
  loadingLocations: boolean;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  selectedCoords: Coords | null;
  submitting: boolean;
  evidencias: File[];
  onEvidenceChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEvidenceDrop: (files: File[]) => void;
};

const CreateAlertFormSection = ({
  onSubmit,
  titulo,
  onTituloChange,
  descripcion,
  onDescripcionChange,
  categoria,
  onCategoriaChange,
  prioridad,
  onPrioridadChange,
  ubicacion,
  onUbicacionChange,
  onAddressBlur,
  suggestionsLoading,
  suggestions,
  onSelectSuggestion,
  onVerifyAddress,
  onUseMyLocation,
  reverseLoading,
  locatingUser,
  comunas,
  comunaId,
  onComunaChange,
  barrioId,
  barrios,
  onBarrioChange,
  loadingLocations,
  mapContainerRef,
  selectedCoords,
  submitting,
  evidencias,
  onEvidenceChange,
  onEvidenceDrop,
}: Props) => {
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    onEvidenceDrop(files);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  return (
    <section className="create-alert-left">
      <h2 className="create-alert-box-title">+ Reportar Nueva Alerta</h2>

      <form onSubmit={onSubmit} className="create-alert-form">
        <label className="create-alert-label">{"T\u00EDtulo de la alerta"}</label>
        <input
          type="text"
          className="form-control create-alert-input"
          placeholder="Fuga de agua"
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          maxLength={200}
          required
        />

        <div className="create-alert-row">
          <div>
            <label className="create-alert-label">{"Categor\u00EDa"}</label>
            <select
              className="form-select create-alert-select"
              value={categoria}
              onChange={(e) => onCategoriaChange(e.target.value)}
              required
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="create-alert-label">Prioridad</label>
            <div className="create-alert-priority-group" role="group" aria-label="Prioridad">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`create-alert-priority-chip ${prioridad === option ? "is-active" : ""}`}
                  onClick={() => onPrioridadChange(option)}
                  aria-pressed={prioridad === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="create-alert-label">{"Descripci\u00F3n del incidente"}</label>
        <textarea
          className="form-control create-alert-textarea"
          rows={3}
          placeholder={"Describe los detalles de la situaci\u00F3n..."}
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          required
        />

        <label className="create-alert-label">{"Ubicaci\u00F3n del incidente"}</label>
        <input
          type="text"
          className="form-control create-alert-input"
          value={ubicacion}
          onChange={(e) => onUbicacionChange(e.target.value)}
          onBlur={onAddressBlur}
          maxLength={255}
          placeholder={"Direcci\u00F3n de la alerta"}
          disabled={submitting}
        />

        {(suggestionsLoading || reverseLoading) && (
          <small className="text-muted">
            {suggestionsLoading ? "Buscando sugerencias..." : "Obteniendo dirección..."}
          </small>
        )}

        {suggestions.length > 0 && (
          <div className="create-alert-suggestions">
            {suggestions.map((item) => (
              <button
                type="button"
                key={`${item.lat}-${item.lon}-${item.display_name}`}
                className="create-alert-suggestion-item"
                onClick={() => onSelectSuggestion(item)}
              >
                {item.display_name}
              </button>
            ))}
          </div>
        )}

        <div className="create-alert-location-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onVerifyAddress}
            disabled={submitting || locatingUser}
          >
            {"Verificar direcci\u00F3n"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onUseMyLocation}
            disabled={submitting || locatingUser}
          >
            {locatingUser ? "Ubicando..." : "Usar mi ubicación"}
          </button>
        </div>

        <div className="create-alert-map-wrap">
          <div ref={mapContainerRef} className="create-alert-map" />
          {selectedCoords && (
            <small className="create-alert-map-status">
              Punto seleccionado: {selectedCoords.lat}, {selectedCoords.lng}
            </small>
          )}
        </div>

        <div className="create-alert-row">
          <div>
            <label className="create-alert-label">Comuna</label>
            <select
              className="form-select create-alert-select"
              value={comunaId}
              onChange={(e) => onComunaChange(e.target.value)}
              disabled={loadingLocations}
            >
              {comunas.length === 0 && <option value="">Cargando...</option>}
              {comunas.map((option) => (
                <option key={option.id_comuna} value={option.id_comuna}>
                  {option.id_comuna} - {option.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="create-alert-label">Barrio</label>
            <select
              className="form-select create-alert-select"
              value={barrioId}
              onChange={(e) => onBarrioChange(e.target.value)}
              disabled={barrios.length === 0 || loadingLocations}
            >
              {barrios.length === 0 && <option value="">Selecciona comuna</option>}
              {barrios.map((option) => (
                <option key={option.id_barrio} value={option.id_barrio}>
                  {option.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="create-alert-label">{"Evidencia fotogr\u00E1fica"}</label>
        <div className="create-alert-dropzone-wrap">
            <label
              htmlFor="alert-evidence"
              className={`create-alert-dropzone ${evidencias.length > 0 ? "has-file" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <i className="bi bi-cloud-upload create-alert-dropzone-icon" />
              <span>
                {evidencias.length > 0
                  ? `${evidencias.length} imagen(es) seleccionada(s)`
                  : "Sube imágenes o arrastra y suelta"}
              </span>
              <small>PNG, JPG, WEBP</small>
            </label>
            <input
              id="alert-evidence"
              type="file"
              className="create-alert-file-input"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onEvidenceChange}
              disabled={submitting}
            />
        </div>

        <button type="submit" className="btn btn-dark create-alert-submit" disabled={submitting}>
          {submitting ? "Publicando..." : "Publicar Alerta"}
        </button>
      </form>
    </section>
  );
};

export default CreateAlertFormSection;
