import { useEffect, useState } from "react";
import "./CarouselInfo.css";

interface Stats {
  ciudadanos: number;
  alertasTotales: number;
  alertasAtendidas: number;
  alertasPendientes: number;
}

const CarouselInfo = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error cargando estadísticas", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <p className="text-center text-light">Cargando...</p>;

  const items = [
    { label: "Ciudadanos registrados", value: stats.ciudadanos },
    { label: "Alertas totales", value: stats.alertasTotales },
    { label: "Alertas atendidas", value: stats.alertasAtendidas },
    { label: "Alertas por atender", value: stats.alertasPendientes },
  ];

  return (
    <div className="stats-strip">
      <div className="stats-track">
        {[...items, ...items].map((item, i) => (
          <div className="stats-item" key={i}>
            <span className="stats-label">{item.label}</span>
            <span className="stats-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselInfo;
