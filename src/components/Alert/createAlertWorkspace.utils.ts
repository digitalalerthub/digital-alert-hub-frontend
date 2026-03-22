import {
  getGoogleMapsApi,
  type GoogleAddressComponent,
  type GoogleGeocoderRequest,
  type GoogleGeocoderResult,
  type GooglePrediction,
} from "../../config/googleMaps";

export type LocationSuggestion = {
  place_id: string;
  display_name: string;
};

export type Coords = {
  lat: number;
  lng: number;
};

export type ReverseAddress = {
  road?: string;
  route?: string;
  residential?: string;
  pedestrian?: string;
  footway?: string;
  house_number?: string;
  street_number?: string;
  neighbourhood?: string;
  neighborhood?: string;
  suburb?: string;
  city_district?: string;
  sublocality?: string;
  sublocality_level_1?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  locality?: string;
  administrative_area_level_2?: string;
  administrative_area_level_3?: string;
};

export type ReverseGeocodeResponse = {
  display_name?: string;
  place_id?: string;
  address?: ReverseAddress;
  components?: GoogleAddressComponent[];
};

type GeocodedLocation = {
  coords: Coords;
  data: ReverseGeocodeResponse;
};

const COORDS_REGEX = /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/;
const MEDELLIN_BOUNDS = {
  north: 6.41,
  south: 6.08,
  east: -75.49,
  west: -75.68,
};

export const ALERTS_PER_PAGE = 3;
export const MAP_SELECTION_TEXT = "Ubicación seleccionada en el mapa";

export const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no disponible"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000,
    });
  });

const normalizeForComparison = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getAddressComponent = (
  components: GoogleAddressComponent[] = [],
  ...types: string[]
): GoogleAddressComponent | undefined =>
  components.find((component) =>
    types.some((type) => component.types.includes(type))
  );

const normalizeGoogleGeocoderResult = (
  result: GoogleGeocoderResult
): ReverseGeocodeResponse => {
  const components = Array.isArray(result?.address_components)
    ? result.address_components
    : [];

  return {
    place_id: result?.place_id,
    display_name: result?.formatted_address || "",
    components,
    address: {
      route: getAddressComponent(components, "route")?.long_name,
      road: getAddressComponent(components, "route")?.long_name,
      house_number: getAddressComponent(components, "street_number")?.long_name,
      street_number: getAddressComponent(components, "street_number")?.long_name,
      neighborhood: getAddressComponent(components, "neighborhood")?.long_name,
      neighbourhood: getAddressComponent(components, "neighborhood")?.long_name,
      sublocality: getAddressComponent(
        components,
        "sublocality",
        "sublocality_level_1"
      )?.long_name,
      sublocality_level_1: getAddressComponent(
        components,
        "sublocality_level_1",
        "sublocality"
      )?.long_name,
      suburb: getAddressComponent(components, "sublocality_level_1")?.long_name,
      city_district: getAddressComponent(
        components,
        "administrative_area_level_3",
        "sublocality_level_1"
      )?.long_name,
      city: getAddressComponent(components, "locality")?.long_name,
      locality: getAddressComponent(components, "locality")?.long_name,
      municipality: getAddressComponent(
        components,
        "administrative_area_level_2"
      )?.long_name,
      administrative_area_level_2: getAddressComponent(
        components,
        "administrative_area_level_2"
      )?.long_name,
      administrative_area_level_3: getAddressComponent(
        components,
        "administrative_area_level_3"
      )?.long_name,
    },
  };
};

const geocodeWithGoogle = async (
  request: GoogleGeocoderRequest
): Promise<GoogleGeocoderResult[]> => {
  const maps = await getGoogleMapsApi();
  const geocoder = new maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      request,
      (results: GoogleGeocoderResult[] | null, status: string) => {
      if (status === "OK" && Array.isArray(results)) {
        resolve(results);
        return;
      }

      if (status === "ZERO_RESULTS") {
        resolve([]);
        return;
      }
        reject(new Error(`Geocodificación falló: ${status}`));
      }
    );
  });
};

const pickBestGeocodeResult = (
  results: GoogleGeocoderResult[],
  query: string,
  strict: boolean
): GoogleGeocoderResult | null => {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const medellinResults = results.filter((item) =>
    String(item?.formatted_address || "")
      .toLowerCase()
      .includes("medell")
  );

  const pool = medellinResults.length > 0 ? medellinResults : results;
  if (!strict) {
    return pool[0] || null;
  }

  const normalizedQuery = normalizeForComparison(query);
  const exactMatch = pool.find((item) =>
    normalizeForComparison(String(item?.formatted_address || "")).includes(
      normalizedQuery
    )
  );

  if (exactMatch) {
    return exactMatch;
  }

  const nonPartial = pool.find((item) => !item?.partial_match);
  return nonPartial || pool[0] || null;
};

const buildGeocodedLocation = (
  result: GoogleGeocoderResult
): GeocodedLocation | null => {
  const location = result?.geometry?.location;
  if (!location?.lat || !location?.lng) {
    return null;
  }

  const lat = Number(location.lat().toFixed(6));
  const lng = Number(location.lng().toFixed(6));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    coords: { lat, lng },
    data: normalizeGoogleGeocoderResult(result),
  };
};

export const formatReadableAddress = (data: ReverseGeocodeResponse | null): string => {
  const a = data?.address || {};
  const road =
    a.route || a.road || a.residential || a.pedestrian || a.footway || "";
  const houseNumber = a.street_number || a.house_number || "";
  const sector =
    a.neighborhood ||
    a.neighbourhood ||
    a.sublocality_level_1 ||
    a.sublocality ||
    a.suburb ||
    a.city_district ||
    a.administrative_area_level_3 ||
    "";
  const city =
    a.locality ||
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.administrative_area_level_2 ||
    "";

  const line = [road.trim(), houseNumber.trim()].filter(Boolean).join(" ");
  const parts = [line, sector.trim(), city.trim()].filter((value) => value.length > 0);

  if (parts.length > 0) return parts.join(", ");

  return (data?.display_name || "")
    .split(",")
    .map((item) => item.trim())
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

export const getAddressSuggestions = async (
  query: string,
  limit = 5
): Promise<LocationSuggestion[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const maps = await getGoogleMapsApi();
    const autocomplete = new maps.places.AutocompleteService();

    const predictions = await new Promise<GooglePrediction[]>(
      (resolve, reject) => {
      autocomplete.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "co" },
          locationBias: new maps.Circle({
            center: { lat: 6.2442, lng: -75.5812 },
            radius: 25000,
          }),
        },
          (items: GooglePrediction[] | null, status: string) => {
          if (status === "OK" && Array.isArray(items)) {
            resolve(items);
            return;
          }

          if (status === "ZERO_RESULTS") {
            resolve([]);
            return;
          }
            reject(new Error(`Autocomplete falló: ${status}`));
          }
        );
      }
    );

    return predictions.slice(0, limit).map((item) => ({
      place_id: item.place_id,
      display_name: item.description,
    }));
  } catch {
    return [];
  }
};

export const geocodeAddressDetailed = async (
  query: string,
  strict = false
): Promise<GeocodedLocation | null> => {
  if (!query.trim()) return null;

  try {
    const results = await geocodeWithGoogle({
      address: query,
      componentRestrictions: { country: "CO" },
      bounds: MEDELLIN_BOUNDS,
      region: "CO",
    });

    const selected = pickBestGeocodeResult(results, query, strict);
    if (!selected) {
      return null;
    }

    return buildGeocodedLocation(selected);
  } catch {
    return null;
  }
};

export const geocodePlaceSuggestion = async (
  placeId: string
): Promise<GeocodedLocation | null> => {
  if (!placeId.trim()) {
    return null;
  }

  try {
    const results = await geocodeWithGoogle({ placeId });
    if (!results[0]) {
      return null;
    }

    return buildGeocodedLocation(results[0]);
  } catch {
    return null;
  }
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResponse | null> => {
  try {
    const results = await geocodeWithGoogle({
      location: { lat, lng },
    });

    if (!results[0]) {
      return null;
    }

    return normalizeGoogleGeocoderResult(results[0]);
  } catch {
    return null;
  }
};

export const geocodeAddress = async (
  query: string,
  strict = false
): Promise<Coords | null> => {
  const result = await geocodeAddressDetailed(query, strict);
  return result?.coords || null;
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
