import geoService from "../../services/geoService";

export type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export type Coords = {
  lat: number;
  lng: number;
};

type ReverseGeocodeResponse = {
  display_name?: string;
  address?: {
    road?: string;
    residential?: string;
    pedestrian?: string;
    footway?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
};

const COORDS_REGEX = /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/;

export const ALERTS_PER_PAGE = 3;
export const MAP_SELECTION_TEXT = "Ubicacion seleccionada en el mapa";

export const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalizacion no disponible"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000,
    });
  });

export const formatReadableAddress = (data: ReverseGeocodeResponse): string => {
  const a = data.address || {};
  const road = a.road || a.residential || a.pedestrian || a.footway || "";
  const houseNumber = a.house_number ? ` # ${a.house_number}` : "";
  const sector = a.neighbourhood || a.suburb || a.city_district || "";
  const city = a.city || a.town || a.village || a.municipality || "";
  const parts = [`${road}${houseNumber}`.trim(), sector.trim(), city.trim()].filter(
    (v) => v.length > 0
  );

  if (parts.length > 0) return parts.join(", ");

  return (data.display_name || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
};

export const extractCoordsFromText = (text?: string): Coords | null => {
  if (!text) return null;
  const match = text.match(COORDS_REGEX);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

export const geocodeAddress = async (query: string, strict = false): Promise<Coords | null> => {
  if (!query.trim()) return null;

  try {
    const data = await geoService.search(query, 1, strict);
    if (!data?.length) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch {
    return null;
  }
};

export const formatAlertDate = (value?: string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getStatusMeta = (idEstado: number) => {
  switch (idEstado) {
    case 1:
      return { label: "Activa", className: "text-bg-success" };
    case 2:
      return { label: "En proceso", className: "text-bg-warning text-dark" };
    case 3:
      return { label: "Atendida", className: "text-bg-primary" };
    case 4:
      return { label: "Cerrada", className: "text-bg-secondary" };
    default:
      return { label: "Sin estado", className: "text-bg-dark" };
  }
};
