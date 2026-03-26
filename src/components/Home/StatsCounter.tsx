import { useEffect, useRef, useState } from "react";
import "./StatsCounter.css";

interface Stats {
  ciudadanos: number;
  alertasTotales: number;
  alertasAtendidas: number;
  alertasPendientes: number;
}

function useCountUp(target: number, duration = 800, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger || target === 0) return;

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return count;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  pct: number;
  trigger: boolean;
  duration?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  pct,
  trigger,
  duration = 500,
}) => {
  const count = useCountUp(value, duration, trigger);

  return (
    <div className="sc-card">
      <div className="sc-icon">{icon}</div>
      <div className="sc-num">{count.toLocaleString("es-CO")}</div>
      <div className="sc-label">{label}</div>
      <div className="sc-bar">
        <div
          className="sc-bar-fill"
          style={{ width: trigger ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
};

const StatsCounter = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [hasError, setHasError] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    try {
      const res = await fetch(`${API_URL}/stats`);
      if (!res.ok) throw new Error("Error en respuesta");
      const data = await res.json();
      setStats(data);
      setHasError(false);
    } catch {
      setStats(null);
      setHasError(true);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dispara la animación en cuanto llegan los datos
  useEffect(() => {
    if (!stats) return;

    if (sectionRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0 } // ← 0 para que dispare apenas sea visible 1px
      );
      observer.observe(sectionRef.current);

      // Si ya es visible al montar, forzamos el trigger igualmente
      const rect = sectionRef.current.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) setVisible(true);

      return () => observer.disconnect();
    }
  }, [stats]); // depende de stats, se registra cuando ya hay datos

  if (!stats) {
    return (
      <div className="sc-section">
        {hasError ? (
          <div className="sc-skeleton-grid">
            <div className="sc-skeleton" style={{ width: "100%", minHeight: 160 }}>
              No fue posible cargar las estadisticas en este momento.
            </div>
          </div>
        ) : (
          <div className="sc-skeleton-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="sc-skeleton" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const total = stats.alertasTotales || 1;

  const items = [
    {
      label: "Ciudadanos registrados",
      value: stats.ciudadanos,
      icon: "👥",
      pct: 85,
    },
    {
      label: "Alertas totales",
      value: stats.alertasTotales,
      icon: "🔔",
      pct: 100,
    },
    {
      label: "Alertas atendidas",
      value: stats.alertasAtendidas,
      icon: "✅",
      pct: Math.round((stats.alertasAtendidas / total) * 100),
    },
    {
      label: "Alertas por atender",
      value: stats.alertasPendientes,
      icon: "⏳",
      pct: Math.round((stats.alertasPendientes / total) * 100),
    },
  ];

  return (
    <section className="sc-section" ref={sectionRef}>
      <p className="sc-eyebrow">Red ciudadana activa</p>
      <h2 className="sc-title">Impacto en tiempo real</h2>
      <p className="sc-sub">Datos actualizados</p>

      <div className="sc-grid">
        {items.map((item, i) => (
          <StatCard key={i} {...item} trigger={visible} duration={800} />
        ))}
      </div>
    </section>
  );
};

export default StatsCounter;
