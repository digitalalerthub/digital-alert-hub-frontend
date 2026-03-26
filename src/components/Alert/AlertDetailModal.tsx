import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Alert } from "../../types/Alert";
import reactionsService from "../../services/reactionsService";
import type { AlertReactionSummary } from "../../types/Reaction";
import commentsService from "../../services/commentsService";
import type { AlertComment } from "../../types/Comment";
import { useAlertStates } from "../../context/useAlertStates";
import { useAuth } from "../../context/useAuth";
import {
  getGoogleMapsApi,
  type GoogleMap,
  type GoogleMarker,
} from "../../config/googleMaps";
import { buildAlertEvidenceItems } from "./alertEvidence.utils";
import {
  extractAlertCoordsFromText,
  formatAlertDateTime,
  getReadableAlertLocation,
} from "./alertModal.utils";
import { getStatusMeta } from "./createAlertWorkspace.utils";
import "./AlertDetailModal.css";

type Props = {
  alert: Alert;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  editLabel?: string;
  onEdit?: () => void;
  onDeleteRequest?: (alert: Alert) => void;
  topActions?: React.ReactNode;
};

const AlertDetailModal = ({
  alert,
  onClose,
  canEdit = false,
  canDelete = false,
  editLabel = "Editar",
  onEdit,
  onDeleteRequest,
  topActions,
}: Props) => {
  const hasTopActions = canEdit || canDelete || Boolean(topActions);
  const { labelById } = useAlertStates();
  const { user, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
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
  const mapCoords = useMemo(() => extractAlertCoordsFromText(alert.ubicacion), [alert.ubicacion]);
  const readableLocation = useMemo(() => getReadableAlertLocation(alert.ubicacion), [alert.ubicacion]);
  const creatorName = useMemo(
    () => alert.nombre_usuario?.trim() || "Cuenta eliminada",
    [alert.nombre_usuario]
  );
  const status = getStatusMeta(alert.id_estado, labelById);
  const priorityText = (alert.prioridad || "Sin prioridad").toUpperCase();
  const shareUrl = useMemo(
    () => `${window.location.origin}/alertas/${alert.id_alerta}`,
    [alert.id_alerta]
  );
  const evidenceItems = useMemo(() => buildAlertEvidenceItems(alert), [alert]);
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
    let cancelled = false;

    const loadMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const fallback = { lat: 6.2442, lng: -75.5812 };
      const center = mapCoords || fallback;

      try {
        const maps = await getGoogleMapsApi();
        if (cancelled || !mapContainerRef.current) return;

        mapRef.current = new maps.Map(mapContainerRef.current, {
          center,
          zoom: mapCoords ? 16 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        if (mapCoords) {
          markerRef.current = new maps.Marker({
            map: mapRef.current,
            position: mapCoords,
          });
        }
      } catch {
        mapRef.current = null;
      }
    };

    void loadMap();

    return () => {
      cancelled = true;
      markerRef.current?.setMap?.(null);
      markerRef.current = null;
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
          <button
            type="button"
            className="alert-detail-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <span className="visually-hidden">Cerrar modal</span>
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
                  <span className="alert-detail-author-date">{formatAlertDateTime(alert.created_at)}</span>
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
          <div className={`alert-detail-comments-head ${hasTopActions ? "with-actions" : ""}`}>
            <article className="alert-detail-comments-pill">
              <i className="bi bi-chat-left-text" aria-hidden="true" />
              <span>Comentarios</span>
            </article>

            {hasTopActions && (
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
                    {editLabel}
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
                {topActions}
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

                <span className="alert-detail-comment-date">{formatAlertDateTime(comment.created_at)}</span>
              </article>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AlertDetailModal;
