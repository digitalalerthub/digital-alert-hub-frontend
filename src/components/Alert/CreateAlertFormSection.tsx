import type { ChangeEvent, FormEvent, RefObject } from "react";
import type { Coords, LocationSuggestion } from "./createAlertWorkspace.utils";

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
  reverseLoading: boolean;
  suggestionsLoading: boolean;
  suggestions: LocationSuggestion[];
  onSelectSuggestion: (item: LocationSuggestion) => void;
  onVerifyAddress: () => Promise<void> | void;
  onUseMyLocation: () => Promise<void> | void;
  locatingUser: boolean;
  submitting: boolean;
  evidencia: File | null;
  onEvidenceChange: (e: ChangeEvent<HTMLInputElement>) => void;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  selectedCoords: Coords | null;
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
  reverseLoading,
  suggestionsLoading,
  suggestions,
  onSelectSuggestion,
  onVerifyAddress,
  onUseMyLocation,
  locatingUser,
  submitting,
  evidencia,
  onEvidenceChange,
  mapContainerRef,
  selectedCoords,
}: Props) => {
  return (
    <section className="create-alert-left">
      <h2 className="create-alert-box-title">+ Reportar Nueva Alerta</h2>

      <form onSubmit={onSubmit} className="create-alert-form">
        <label className="create-alert-label">Titulo de la alerta</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: Fuga de agua"
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          maxLength={200}
          required
        />

        <div className="create-alert-row">
          <div>
            <label className="create-alert-label">Categoria</label>
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => onCategoriaChange(e.target.value)}
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
              onChange={(e) => onPrioridadChange(e.target.value)}
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
          onChange={(e) => onDescripcionChange(e.target.value)}
          required
        />

        <label className="create-alert-label">Ubicacion del incidente</label>
        <input
          type="text"
          className="form-control"
          value={ubicacion}
          onChange={(e) => onUbicacionChange(e.target.value)}
          onBlur={onAddressBlur}
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
                onClick={() => onSelectSuggestion(item)}
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
            onClick={onVerifyAddress}
            disabled={submitting || locatingUser}
          >
            Verificar direccion
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onUseMyLocation}
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
          onChange={onEvidenceChange}
          disabled={submitting}
        />
        {evidencia && <small className="text-muted">Archivo seleccionado: {evidencia.name}</small>}

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
  );
};

export default CreateAlertFormSection;
