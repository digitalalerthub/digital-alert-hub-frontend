import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import alertsService from "../../../services/alertsService";
import type { Alert, UpdateAlertPayload } from "../../../types/Alert";
import { ALERTS_PER_PAGE } from "../createAlertWorkspace.utils";

type UseAlertsManagerArgs = {
  renderActiveAlertsOnMap: (data: Alert[]) => Promise<void>;
};

export const useAlertsManager = ({ renderActiveAlertsOnMap }: UseAlertsManagerArgs) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAlerts = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return alerts;
    return alerts.filter((a) => a.titulo.toLowerCase().includes(text));
  }, [alerts, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE));

  const pagedAlerts = useMemo(() => {
    const start = (currentPage - 1) * ALERTS_PER_PAGE;
    return filteredAlerts.slice(start, start + ALERTS_PER_PAGE);
  }, [currentPage, filteredAlerts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const loadAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const data = await alertsService.list();
      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        if (da !== db) return db - da;
        return b.id_alerta - a.id_alerta;
      });
      setAlerts(sorted);
      await renderActiveAlertsOnMap(sorted);
    } catch {
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, [renderActiveAlertsOnMap]);

  const handleUpdateAlert = useCallback(
    async (id: number, payload: UpdateAlertPayload) => {
      try {
        await alertsService.update(id, payload);
        toast.success("Alerta actualizada");
        await loadAlerts();
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "No se pudo actualizar la alerta");
        } else {
          toast.error("Error inesperado al actualizar");
        }
        throw error;
      }
    },
    [loadAlerts]
  );

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  return {
    alertsLoading,
    pagedAlerts,
    totalPages,
    search,
    currentPage,
    loadAlerts,
    handleUpdateAlert,
    onSearchChange,
    onPageChange: setCurrentPage,
  };
};
