import type { Alert } from "../../types/Alert";
import "./AlertDeleteConfirmModal.css";

type Props = {
  alert: Alert;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const AlertDeleteConfirmModal = ({ alert, deleting, onCancel, onConfirm }: Props) => {
  return (
    <div className="alert-delete-backdrop" onClick={deleting ? undefined : onCancel}>
      <div
        className="alert-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-delete-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="alert-delete-icon-wrap">
          <i className="bi bi-exclamation-triangle-fill" />
        </div>

        <p className="alert-delete-eyebrow">Eliminar alerta</p>
        <h3 id="alert-delete-title" className="alert-delete-title">
          {"Esta acci\u00F3n quitar\u00E1 la alerta del listado"}
        </h3>
        <p className="alert-delete-body">
          {"Se eliminar\u00E1 "}
          <strong>{alert.titulo}</strong>
          {" y ya no estar\u00E1 disponible para la comunidad."}
        </p>

        <div className="alert-delete-note">
          <i className="bi bi-info-circle-fill" />
          <span>{"Solo contin\u00FAa si est\u00E1s seguro de eliminar este reporte."}</span>
        </div>

        <div className="alert-delete-actions">
          <button
            type="button"
            className="alert-delete-cancel-btn"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="alert-delete-confirm-btn"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "S\u00ED, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDeleteConfirmModal;
