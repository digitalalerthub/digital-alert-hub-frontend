import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import axios from "axios";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Alert, AlertEvidence } from "../../types/Alert";
import reactionsService from "../../services/reactionsService";
import type { AlertReactionSummary } from "../../types/Reaction";
import commentsService from "../../services/commentsService";
import type { AlertComment } from "../../types/Comment";
import { useAuth } from "../../context/useAuth";
import "./AlertDetailModal.css";

type Props = {
  alert: Alert;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDeleteRequest?: (alert: Alert) => void;
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
      return { label: "Pendiente", className: "is-pending" };
    case 2:
      return { label: "En Progreso", className: "is-progress" };
    case 3:
      return { label: "Resuelta", className: "is-resolved" };
    case 4:
      return { label: "Falsa Alerta", className: "is-false-alert" };
    default:
      return { label: "Sin Estado", className: "is-unknown" };
  }
};

const AlertDetailModal = ({
  alert,
  onClose,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDeleteRequest,
}: Props) => {
  const { user, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [reactions, setReactions] = useState<AlertReactionSummary[]>([]);
  const [loadingReactions, setLoadingReactions] = useState(false);
  const [pendingReactionId, setPendingReactionId] = useState<number | null>(null);
  const [comments, setComments] = useState<AlertComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [savingEditedComment, setSavingEditedComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [currentEvidenceIndex, setCurrentEvidenceIndex] = useState(0);
  const mapCoords = useMemo(() => extractCoordsFromText(alert.ubicacion), [alert.ubicacion]);
  const readableLocation = useMemo(() => getReadableLocation(alert.ubicacion), [alert.ubicacion]);
  const creatorName = useMemo(
    () => alert.nombre_usuario?.trim() || `Usuario #${alert.id_usuario}`,
    [alert.id_usuario, alert.nombre_usuario]
  );
  const status = getStatusMeta(alert.id_estado);
  const priorityText = (alert.prioridad || "Sin prioridad").toUpperCase();
  const shareUrl = useMemo(
    () => `${window.location.origin}/alertas/${alert.id_alerta}`,
    [alert.id_alerta]
  );
  const evidenceItems = useMemo(() => {
    const listFromArray = (alert.evidencias || [])
      .filter((item): item is AlertEvidence => Boolean(item?.url_evidencia))
      .map((item, index) => ({
        id: item.id_evidencia || index,
        url: item.url_evidencia,
        type: item.tipo_evidencia || null,
      }));

    if (listFromArray.length > 0) return listFromArray;

    if (alert.evidencia_url) {
      return [
        {
          id: 0,
          url: alert.evidencia_url,
          type: alert.evidencia_tipo || null,
        },
      ];
    }

    return [];
  }, [alert.evidencia_tipo, alert.evidencia_url, alert.evidencias]);
  const currentEvidence = evidenceItems[currentEvidenceIndex] || null;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const { body, documentElement } = document;

    body.classList.add("alert-detail-modal-open");
    documentElement.classList.add("alert-detail-modal-open");

    return () => {
      body.classList.remove("alert-detail-modal-open");
      documentElement.classList.remove("alert-detail-modal-open");
    };
  }, []);

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

  useEffect(() => {
    setCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
    setCurrentEvidenceIndex(0);
  }, [alert.id_alerta]);

  useEffect(() => {
    let cancelled = false;

    const loadReactions = async () => {
      try {
        setLoadingReactions(true);
        const data = await reactionsService.getAlertSummary(alert.id_alerta);
        if (!cancelled) setReactions(data);
      } catch {
        if (!cancelled) setReactions([]);
      } finally {
        if (!cancelled) setLoadingReactions(false);
      }
    };

    void loadReactions();

    return () => {
      cancelled = true;
    };
  }, [alert.id_alerta]);

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      try {
        setLoadingComments(true);
        const data = await commentsService.listAlertComments(alert.id_alerta);
        if (!cancelled) {
          setComments(data);
        }
      } catch {
        if (!cancelled) {
          setComments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingComments(false);
        }
      }
    };

    void loadComments();

    return () => {
      cancelled = true;
    };
  }, [alert.id_alerta]);

  const redirectToLogin = (reason: "reaction" | "comment") => {
    const actionLabel = reason === "reaction" ? "reaccionar" : "comentar";
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;
    toast.info(`Debes iniciar sesi\u00F3n o crear una cuenta para ${actionLabel} esta alerta`);
    navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleReactionToggle = async (idReaccion: number) => {
    if (!isLoggedIn) {
      redirectToLogin("reaction");
      return;
    }

    setPendingReactionId(idReaccion);
    try {
      const data = await reactionsService.toggleAlertReaction(alert.id_alerta, idReaccion);
      setReactions(data);
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        redirectToLogin("reaction");
      }
    } finally {
      setPendingReactionId((current) => (current === idReaccion ? null : current));
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: alert.titulo,
      text: `Alerta: ${alert.titulo} - ${readableLocation}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      }
    } catch {
      // Usuario cancel\u00F3 o el navegador no permiti\u00F3 compartir/copiar.
    }
  };

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanText = commentText.trim();
    if (!cleanText || submittingComment) return;
    if (!isLoggedIn) {
      redirectToLogin("comment");
      return;
    }

    try {
      setSubmittingComment(true);
      const createdComment = await commentsService.createAlertComment(alert.id_alerta, {
        texto_comentario: cleanText,
      });
      setComments((prev) => [...prev, createdComment]);
      setCommentText("");
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        redirectToLogin("comment");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const canManageComment = (comment: AlertComment): boolean => {
    if (isAdmin) return true;
    return Number(user?.id) === Number(comment.id_usuario);
  };

  const startEditComment = (comment: AlertComment) => {
    setEditingCommentId(comment.id_comentario);
    setEditingCommentText(comment.texto_comentario);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const saveEditedComment = async (commentId: number) => {
    const cleanText = editingCommentText.trim();
    if (!cleanText || savingEditedComment) return;

    try {
      setSavingEditedComment(true);
      const updatedComment = await commentsService.updateAlertComment(alert.id_alerta, commentId, {
        texto_comentario: cleanText,
      });
      setComments((prev) =>
        prev.map((item) => (item.id_comentario === commentId ? updatedComment : item))
      );
      cancelEditComment();
    } catch {
      // No bloqueamos UI por errores de red.
    } finally {
      setSavingEditedComment(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (deletingCommentId) return;

    try {
      setDeletingCommentId(commentId);
      await commentsService.deleteAlertComment(alert.id_alerta, commentId);
      setComments((prev) => prev.filter((item) => item.id_comentario !== commentId));
      if (editingCommentId === commentId) {
        cancelEditComment();
      }
    } catch {
      // No bloqueamos UI por errores de red.
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDeleteAlert = () => {
    if (!onDeleteRequest) return;
    onDeleteRequest(alert);
  };

  const showEvidenceNavigation = evidenceItems.length > 1;

  const showPreviousEvidence = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentEvidenceIndex((current) =>
      current <= 0 ? evidenceItems.length - 1 : current - 1
    );
  };

  const showNextEvidence = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentEvidenceIndex((current) =>
      current >= evidenceItems.length - 1 ? 0 : current + 1
    );
  };

    return (
      <div className="alert-detail-backdrop" onClick={onClose}>
      <div className="alert-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alert-detail-toolbar">
          <button type="button" className="alert-detail-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="alert-detail-top">
          <section className="alert-detail-media-box">
            {currentEvidence ? (
              currentEvidence.type?.startsWith("video/") ? (
                <video controls className="alert-detail-media" src={currentEvidence.url} />
              ) : (
                <img
                  src={currentEvidence.url}
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

            {showEvidenceNavigation && (
              <>
                <button
                  type="button"
                  className="alert-detail-media-arrow is-prev"
                  onClick={showPreviousEvidence}
                  aria-label="Evidencia anterior"
                >
                  <i className="bi bi-chevron-left" />
                </button>
                <button
                  type="button"
                  className="alert-detail-media-arrow is-next"
                  onClick={showNextEvidence}
                  aria-label="Siguiente evidencia"
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </>
            )}
          </section>

          <section className="alert-detail-info">
            <h2 className="alert-detail-title">{alert.titulo}</h2>

            <article className="alert-detail-author-card">
              <div className="alert-detail-author-main">
                <i className="bi bi-person-circle alert-detail-author-icon" />
                <div>
                  <p className="alert-detail-author-name">{creatorName}</p>
                  <span className="alert-detail-author-date">{formatAlertDate(alert.created_at)}</span>
                </div>
              </div>
              <div className="alert-detail-author-state">
                <span className={`alert-detail-state ${status.className}`}>{status.label.toUpperCase()}</span>
                <span className="alert-detail-priority">PRIORIDAD {priorityText}</span>
              </div>
            </article>

          <h3 className="alert-detail-subtitle">{"Descripci\u00F3n"}</h3>
            <p className="alert-detail-description">{alert.descripcion}</p>

            <h3 className="alert-detail-subtitle">Reacciones de la comunidad</h3>
            <div className="alert-detail-reactions">
              {loadingReactions && <span className="alert-detail-reactions-empty">Cargando...</span>}
              {!loadingReactions && reactions.length === 0 && (
                <span className="alert-detail-reactions-empty">{"Sin reacciones a\u00FAn"}</span>
              )}
              {reactions.map((reaction) => (
                <button
                  key={reaction.id_reaccion}
                  type="button"
                  className={`alert-detail-reaction-chip ${reaction.user_reacted ? "is-active" : ""}`}
                  title={reaction.descrip_tipo_reaccion || "Reacción"}
                  onClick={() => void handleReactionToggle(reaction.id_reaccion)}
                  disabled={pendingReactionId === reaction.id_reaccion}
                >
                  <span>{reaction.tipo}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>

            <div className="alert-detail-cta-row">
              <button type="button" className="alert-detail-share-btn" onClick={() => void handleShare()}>
                <i className="bi bi-share me-2" />
                Compartir alerta
              </button>
            </div>
          </section>
        </div>

        <div className="alert-detail-map-section">
          <h3 className="alert-detail-subtitle">{"Ubicaci\u00F3n exacta de la alerta"}</h3>
          <p className="alert-detail-location">{readableLocation}</p>
          {mapCoords && (
            <p className="alert-detail-location-meta">
              Coordenadas: {mapCoords.lat}, {mapCoords.lng}
            </p>
          )}

          <div className="alert-detail-map-wrap">
            <div ref={mapContainerRef} className="alert-detail-map" />
          </div>
        </div>

        <section className="alert-detail-comments-section">
          <div className={`alert-detail-comments-head ${canEdit || canDelete ? "with-actions" : ""}`}>
            <article className="alert-detail-comments-pill">
              <i className="bi bi-chat-left-text" aria-hidden="true" />
              <span>Comentarios</span>
            </article>

            {(canEdit || canDelete) && (
              <div className="alert-detail-comments-actions">
                {canEdit && (
                  <button
                    type="button"
                    className="alert-detail-edit-btn"
                    onClick={() => {
                      onClose();
                      onEdit?.();
                    }}
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    className="alert-detail-delete-btn"
                    onClick={() => void handleDeleteAlert()}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="alert-detail-comments-list" aria-label="Comentarios de la alerta">
            <form className="alert-detail-comment-form" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                className="alert-detail-comment-input"
                placeholder="Deja tu comentario"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                disabled={submittingComment}
              />
              <button
                type="submit"
                className="alert-detail-comment-submit"
                disabled={submittingComment || commentText.trim().length === 0}
              >
                {submittingComment ? "..." : "Enviar"}
              </button>
            </form>
            {!isLoggedIn && (
              <p className="alert-detail-reactions-empty">
                {"Inicia sesi\u00F3n o crea una cuenta para comentar o reaccionar."}
              </p>
            )}

            {loadingComments && <span className="alert-detail-reactions-empty">Cargando comentarios...</span>}

            {comments.map((comment) => (
              <article key={comment.id_comentario} className="alert-detail-comment-item">
                <div className="alert-detail-comment-head">
                  <p className="alert-detail-comment-author">{comment.nombre_usuario}</p>
                  {canManageComment(comment) && (
                    <div className="alert-detail-comment-tools">
                      {editingCommentId === comment.id_comentario ? (
                        <>
                          <button
                            type="button"
                            className="alert-detail-comment-tool"
                            disabled={savingEditedComment}
                            onClick={() => void saveEditedComment(comment.id_comentario)}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            className="alert-detail-comment-tool"
                            disabled={savingEditedComment}
                            onClick={cancelEditComment}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="alert-detail-comment-tool"
                            onClick={() => startEditComment(comment)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="alert-detail-comment-tool danger"
                            disabled={deletingCommentId === comment.id_comentario}
                            onClick={() => void deleteComment(comment.id_comentario)}
                          >
                            {deletingCommentId === comment.id_comentario ? "..." : "Eliminar"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id_comentario ? (
                  <input
                    type="text"
                    className="alert-detail-comment-edit-input"
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    maxLength={500}
                    disabled={savingEditedComment}
                  />
                ) : (
                  <p className="alert-detail-comment-text">{comment.texto_comentario}</p>
                )}

                <span className="alert-detail-comment-date">{formatAlertDate(comment.created_at)}</span>
              </article>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AlertDetailModal;
