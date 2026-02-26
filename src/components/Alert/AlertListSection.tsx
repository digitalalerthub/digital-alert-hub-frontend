import type { Alert } from "../../types/Alert";
import { formatAlertDate, getStatusMeta } from "./createAlertWorkspace.utils";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  alertsLoading: boolean;
  pagedAlerts: Alert[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSelectAlert: (alert: Alert) => void;
  onBackToAdmin: () => void;
};

const AlertListSection = ({
  search,
  onSearchChange,
  alertsLoading,
  pagedAlerts,
  totalPages,
  currentPage,
  onPageChange,
  onSelectAlert,
  onBackToAdmin,
}: Props) => {
  return (
    <section className="create-alert-right">
      <input
        type="text"
        className="form-control create-alert-search"
        placeholder="Buscar alertas por titulos"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onSelectAlert(alert)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectAlert(alert);
                }
              }}
            >
              <div className="create-alert-item-top">
                <span className="create-alert-item-date">{formatAlertDate(alert.created_at)}</span>
                <span className="create-alert-item-priority">{alert.prioridad || "Sin prioridad"}</span>
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
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`btn btn-sm ${page === currentPage ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
      )}

      <button type="button" className="btn btn-link p-0 create-alert-admin-link" onClick={onBackToAdmin}>
        Volver al panel
      </button>
    </section>
  );
};

export default AlertListSection;
