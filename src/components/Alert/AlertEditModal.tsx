import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Alert, UpdateAlertPayload } from "../../types/Alert";
import "./AlertEditModal.css";

type Props = {
  alert: Alert;
  onClose: () => void;
  onSave: (id: number, payload: UpdateAlertPayload) => Promise<void>;
};

const AlertEditModal = ({ alert, onClose, onSave }: Props) => {
  const [titulo, setTitulo] = useState(alert.titulo);
  const [descripcion, setDescripcion] = useState(alert.descripcion);
  const [categoria, setCategoria] = useState(alert.categoria);
  const [prioridad, setPrioridad] = useState(alert.prioridad || "Media");
  const [ubicacion, setUbicacion] = useState(alert.ubicacion || "");
  const [evidencia, setEvidencia] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !categoria.trim()) return;

    try {
      setSaving(true);
      await onSave(alert.id_alerta, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria.trim(),
        prioridad: prioridad.trim(),
        ubicacion: ubicacion.trim(),
        evidencia: evidencia || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="alert-edit-backdrop" onClick={onClose}>
      <div className="alert-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alert-edit-header">
          <h3>Editar Alerta</h3>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="alert-edit-form">
          <label>Titulo</label>
          <input
            className="form-control"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <label>Descripcion</label>
          <textarea
            className="form-control"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          <div className="alert-edit-row">
            <div>
              <label>Categoria</label>
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
              <label>Prioridad</label>
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

          <label>Ubicacion</label>
          <input
            className="form-control"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />

          <label>Nueva evidencia (opcional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
          />

          <div className="alert-edit-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertEditModal;
