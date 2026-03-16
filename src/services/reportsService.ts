import api from "./api";
import type { AlertReportResponse, ReportFilters } from "../types/Report";

const reportsService = {
  getAlertsReport: async (filters: ReportFilters): Promise<AlertReportResponse> => {
    const params: Record<string, string | number> = {};

    if (filters.id_estado !== undefined) params.id_estado = filters.id_estado;
    if (filters.id_comuna !== undefined) params.id_comuna = filters.id_comuna;
    if (filters.id_barrio !== undefined) params.id_barrio = filters.id_barrio;
    if (filters.year !== undefined) params.year = filters.year;
    if (filters.month) params.month = filters.month;
    if (filters.category) params.category = filters.category;

    const { data } = await api.get<AlertReportResponse>("/reports/alerts", {
      params,
    });

    return data;
  },
};

export default reportsService;
