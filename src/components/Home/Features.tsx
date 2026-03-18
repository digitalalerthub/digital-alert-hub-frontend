import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import alertsService from "../../services/alertsService";
import type { Alert } from "../../types/Alert";
import "./Features.css";

const AUTO_SCROLL_SPEED = 0.04;
const FALLBACK_IMAGE = "/Imagen.png";

const buildAlertMeta = (alert: Alert): string => {
  const metadata = [
    alert.categoria,
    alert.prioridad ? `Prioridad ${alert.prioridad}` : null,
    `${alert.total_reacciones ?? 0} reacciones`,
  ].filter(Boolean);

  return metadata.join(" | ");
};

const normalizeOffset = (offset: number, loopWidth: number): number => {
  if (loopWidth <= 0) return offset;

  let normalizedOffset = offset % loopWidth;
  if (normalizedOffset > 0) {
    normalizedOffset -= loopWidth;
  }

  return normalizedOffset;
};

const Features = () => {
  const navigate = useNavigate();
  const [featuredAlerts, setFeaturedAlerts] = useState<Alert[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstSetRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const carouselItems = featuredAlerts.length > 0 ? featuredAlerts : [];

  useEffect(() => {
    let cancelled = false;

    const loadFeaturedAlerts = async () => {
      try {
        const data = await alertsService.featured();
        if (!cancelled) {
          setFeaturedAlerts(data.slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setFeaturedAlerts([]);
        }
      }
    };

    void loadFeaturedAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !firstSet || carouselItems.length === 0) return;

    const applyTransform = () => {
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    };

    const updateLoopWidth = () => {
      const trackStyles = window.getComputedStyle(track);
      const trackGap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || "0");
      const measuredLoopWidth = firstSet.offsetWidth + trackGap;

      loopWidthRef.current = measuredLoopWidth;
      offsetRef.current = normalizeOffset(offsetRef.current, measuredLoopWidth);
      dragStartOffsetRef.current = normalizeOffset(
        dragStartOffsetRef.current,
        measuredLoopWidth
      );
      applyTransform();
    };

    updateLoopWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateLoopWidth();
    });

    resizeObserver.observe(track);
    resizeObserver.observe(firstSet);

    const tick = (timestamp: number) => {
      if (!track) return;

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      if (!isDraggingRef.current && loopWidthRef.current > 0) {
        offsetRef.current -= delta * AUTO_SCROLL_SPEED;
        offsetRef.current = normalizeOffset(offsetRef.current, loopWidthRef.current);
        applyTransform();
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    applyTransform();
    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      lastFrameTimeRef.current = 0;
    };
  }, [carouselItems.length]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !isDraggingRef.current) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasDraggedRef.current = true;
    }

    offsetRef.current = dragStartOffsetRef.current + deltaX;
    if (loopWidthRef.current > 0) {
      offsetRef.current = normalizeOffset(offsetRef.current, loopWidthRef.current);
    }

    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  };

  const finishDrag = (pointerId?: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    isDraggingRef.current = false;
    viewport.classList.remove("is-dragging");

    if (
      typeof pointerId === "number" &&
      viewport.hasPointerCapture(pointerId)
    ) {
      viewport.releasePointerCapture(pointerId);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    finishDrag(event.pointerId);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    finishDrag(event.pointerId);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) return;
    finishDrag();
  };

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      hasDraggedRef.current = false;
      return;
    }

    navigate("/login");
  };

  return (
    <div
      ref={viewportRef}
      className="carousel-infinite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={trackRef} className="carousel-track">
        {[carouselItems, carouselItems].map((group, groupIndex) => (
          <div
            key={`featured-group-${groupIndex}`}
            ref={groupIndex === 0 ? firstSetRef : undefined}
            className="carousel-set"
          >
            {group.map((item, index) => (
              <div
                key={`${item.id_alerta}-${groupIndex}-${index}`}
                className="carousel-card"
                onClick={handleCardClick}
                style={{ cursor: "pointer" }}
              >
                <Card className="shadow-sm h-100">
                  <Card.Img src={item.evidencia_url || FALLBACK_IMAGE} />
                  <Card.Body>
                    <Card.Title>{item.titulo}</Card.Title>
                    <Card.Text className="carousel-card-meta">
                      {buildAlertMeta(item)}
                    </Card.Text>
                    <Card.Text className="carousel-card-description">
                      {item.descripcion}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
