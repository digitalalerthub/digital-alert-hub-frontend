import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertDetailModal from "../../components/Alert/AlertDetailModal";
import alertsService from "../../services/alertsService";
import type { Alert } from "../../types/Alert";

const AlertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAlert = async () => {
      const alertId = Number(id);
      if (Number.isNaN(alertId)) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);
        const data = await alertsService.getById(alertId);
        if (!cancelled) {
          setAlert(data);
        }
      } catch {
        if (!cancelled) {
          setAlert(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAlert();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleClose = () => {
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <main className="container py-5">
        <p className="text-muted mb-0">Cargando alerta...</p>
      </main>
    );
  }

  if (notFound || !alert) {
    return (
      <main className="container py-5">
        <h1 className="h3 mb-3">Alerta no encontrada</h1>
        <p className="text-muted">El enlace compartido no corresponde a una alerta disponible.</p>
        <Link to="/" className="btn btn-primary">
          Ir al inicio
        </Link>
      </main>
    );
  }

  return <AlertDetailModal alert={alert} onClose={handleClose} />;
};

export default AlertDetailPage;
