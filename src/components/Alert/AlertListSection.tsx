import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { toast } from "react-toastify";
import type { Alert } from "../../types/Alert";
import reactionsService from "../../services/reactionsService";
import type { AlertReactionSummary, Reaction } from "../../types/Reaction";
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
  currentUserId: number | null;
  isAdmin: boolean;
  onDeleteAlertRequest: (alert: Alert) => void;
};

const buildDefaultReactionSummary = (catalog: Reaction[]): AlertReactionSummary[] =>
  catalog.map((reaction) => ({
    ...reaction,
    count: 0,
    user_reacted: false,
  }));

const AlertListSection = ({
  search,
  onSearchChange,
  alertsLoading,
  pagedAlerts,
  totalPages,
  currentPage,
  onPageChange,
  onSelectAlert,
  currentUserId,
  isAdmin,
  onDeleteAlertRequest,
}: Props) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionSummaryByAlert, setReactionSummaryByAlert] = useState<
    Record<number, AlertReactionSummary[]>
  >({});
  const [pendingReaction, setPendingReaction] = useState<string | null>(null);
  const defaultSummary = useMemo(() => buildDefaultReactionSummary(reactions), [reactions]);

  useEffect(() => {
    const loadReactions = async () => {
      try {
        const data = await reactionsService.list();
        setReactions(data);
      } catch {
        setReactions([]);
      }
    };

    void loadReactions();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      if (pagedAlerts.length === 0 || reactions.length === 0) {
        setReactionSummaryByAlert({});
        return;
      }

      const entries = await Promise.all(
        pagedAlerts.map(async (alert) => {
          try {
            const summary = await reactionsService.getAlertSummary(alert.id_alerta);
            return [alert.id_alerta, summary] as const;
          } catch {
            return [alert.id_alerta, buildDefaultReactionSummary(reactions)] as const;
          }
        })
      );

      if (cancelled) return;

      setReactionSummaryByAlert(
        Object.fromEntries(entries) as Record<number, AlertReactionSummary[]>
      );
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [pagedAlerts, reactions]);

  const handleReactionClick = async (
    event: MouseEvent<HTMLButtonElement>,
    alertId: number,
    reactionId: number
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const pendingKey = `${alertId}-${reactionId}`;
    setPendingReaction(pendingKey);

    try {
      const summary = await reactionsService.toggleAlertReaction(alertId, reactionId);
      setReactionSummaryByAlert((current) => ({
        ...current,
        [alertId]: summary,
      }));
    } catch {
      toast.error("No se pudo registrar la reaccion");
    } finally {
      setPendingReaction((current) => (current === pendingKey ? null : current));
    }
  };

  const handleShareClick = async (event: MouseEvent<HTMLButtonElement>, alert: Alert) => {
    event.preventDefault();
    event.stopPropagation();

    const readableLocation = (alert.ubicacion || "").split(" | Punto en mapa:")[0].trim();
    const shareText = `Alerta: ${alert.titulo}${readableLocation ? ` - ${readableLocation}` : ""}`;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: alert.titulo,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Enlace de alerta copiado");
        return;
      }

      toast.info("Tu navegador no permite compartir desde esta card");
    } catch (error) {
      const errorName = (error as { name?: string } | null)?.name;
      if (errorName === "AbortError") return;
      toast.error("No se pudo compartir la alerta");
    }
  };

  const handleDeleteClick = async (event: MouseEvent<HTMLButtonElement>, alert: Alert) => {
    event.preventDefault();
    event.stopPropagation();
    onDeleteAlertRequest(alert);
  };

  return (
    <section className="create-alert-right">
      <div className="create-alert-search-wrap">
        <i className="bi bi-search create-alert-search-icon" />
        <input
          type="text"
          className="form-control create-alert-search"
          placeholder="Buscar alertas por titulos"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <h3 className="create-alert-right-title">Alertas recientes</h3>

      <div className="create-alert-list">
        {alertsLoading && <p className="text-muted mb-0">Cargando alertas...</p>}
        {!alertsLoading && pagedAlerts.length === 0 && (
          <p className="text-muted mb-0">No hay alertas para mostrar.</p>
        )}
        {pagedAlerts.map((alert) => {
          const status = getStatusMeta(alert.id_estado);
          const hasImageEvidence = Boolean(
            alert.evidencia_url && !alert.evidencia_tipo?.startsWith("video/")
          );
          const alertReactions = reactionSummaryByAlert[alert.id_alerta] ?? defaultSummary;
          const creatorName = alert.nombre_usuario?.trim() || `Usuario #${alert.id_usuario}`;
          const isOwnAlert =
            currentUserId !== null && Number(currentUserId) === Number(alert.id_usuario);
          const canDeleteAlert = isAdmin || (isOwnAlert && alert.id_estado === 1);

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
                <div className="create-alert-item-user">
                  <i className="bi bi-person-circle create-alert-item-user-icon" />
                  <div>
                    <p className="create-alert-item-user-name">{creatorName}</p>
                    <span className="create-alert-item-date">{formatAlertDate(alert.created_at)}</span>
                  </div>
                </div>

                <div className="create-alert-item-state">
                  <span className={`create-alert-item-status ${status.className}`}>{status.label}</span>
                  <span className="create-alert-item-priority-note">
                    Prioridad {alert.prioridad || "Sin prioridad"}
                  </span>
                </div>
              </div>

              <div className="create-alert-item-body">
                <div className="create-alert-item-media">
                  {hasImageEvidence ? (
                    <img
                      src={alert.evidencia_url}
                      alt={`Evidencia de ${alert.titulo}`}
                      className="create-alert-item-image"
                    />
                  ) : (
                    <div className="create-alert-item-placeholder">
                      <i className="bi bi-image" />
                    </div>
                  )}
                </div>

                <div className="create-alert-item-content">
                  <h4 className="create-alert-item-title">{alert.titulo}</h4>
                  <p className="create-alert-item-desc">{alert.descripcion}</p>

                  <div className="create-alert-item-meta">
                    <span className="badge rounded-pill text-bg-light">{alert.categoria}</span>
                    {alert.ubicacion && <span className="create-alert-item-location">{alert.ubicacion}</span>}
                  </div>
                </div>
              </div>

              <div className="create-alert-item-footer">
                <div className="create-alert-item-share">
                  <button
                    type="button"
                    className="create-alert-icon-btn"
                    title="Compartir alerta"
                    onClick={(event) => void handleShareClick(event, alert)}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <i className="bi bi-share create-alert-footer-icon" />
                  </button>
                </div>
                <div className="create-alert-item-actions">
                  <i className="bi bi-chat-left-text create-alert-footer-icon" />
                  {alertReactions.length > 0 && (
                    <div className="create-alert-item-reactions">
                      {alertReactions.map((reaction) => {
                        const reactionKey = `${alert.id_alerta}-${reaction.id_reaccion}`;
                        return (
                          <button
                            key={reaction.id_reaccion}
                            type="button"
                            className={`create-alert-reaction-chip ${reaction.user_reacted ? "is-active" : ""}`}
                            title={reaction.descrip_tipo_reaccion || "Reaccion"}
                            onClick={(event) =>
                              void handleReactionClick(event, alert.id_alerta, reaction.id_reaccion)
                            }
                            onKeyDown={(event) => event.stopPropagation()}
                            disabled={pendingReaction === reactionKey}
                          >
                            <span>{reaction.tipo}</span>
                            {reaction.count > 0 && (
                              <span className="create-alert-reaction-count">{reaction.count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {canDeleteAlert && (
                  <div className="create-alert-item-tools">
                    <button
                      type="button"
                      className="create-alert-icon-btn"
                      title="Eliminar alerta"
                      onClick={(event) => void handleDeleteClick(event, alert)}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <i className="bi bi-trash3 create-alert-footer-icon" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="create-alert-pagination">
          <button
            type="button"
            className="create-alert-page-btn"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`create-alert-page-btn ${page === currentPage ? "is-active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="create-alert-page-btn"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
      )}
    </section>
  );
};

export default AlertListSection;
