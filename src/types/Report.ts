export interface ReportFilters {
  id_estado?: number;
  id_comuna?: number;
  id_barrio?: number;
  year?: number;
  month?: string;
  category?: string;
}

export interface ReportFilterState {
  idEstado: string;
  idComuna: string;
  idBarrio: string;
  year: string;
  month: string;
  category: string;
}

export interface ReportMetricItem {
  id_estado: number;
  label: string;
  total: number;
}

export interface ReportSeriesItem {
  label: string;
  total: number;
}

export interface ReportTrendItem {
  month: string;
  label: string;
  total: number;
  resueltas: number;
}

export interface ReportCatalogEstado {
  id_estado: number;
  label: string;
}

export interface ReportCatalogComuna {
  id_comuna: number;
  nombre: string;
}

export interface ReportCatalogBarrio {
  id_barrio: number;
  nombre: string;
}

export interface AlertReportResponse {
  filters: {
    id_estado: number | null;
    id_comuna: number | null;
    id_barrio: number | null;
    year: number | null;
    month: string | null;
    category: string | null;
  };
  kpis: {
    total: number;
    porAtender: number;
    enProceso: number;
    resueltas: number;
    falsasAlertas: number;
  };
  charts: {
    alertasPorEstado: ReportMetricItem[];
    alertasPorBarrio: ReportSeriesItem[];
    alertasPorCategoria: ReportSeriesItem[];
    tendenciaMensual: ReportTrendItem[];
  };
  catalogos: {
    estados: ReportCatalogEstado[];
    comunas: ReportCatalogComuna[];
    barrios: ReportCatalogBarrio[];
    categorias: string[];
    years: number[];
  };
  generated_at: string;
}
