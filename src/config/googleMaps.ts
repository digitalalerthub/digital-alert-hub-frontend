export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || "";

export const isGoogleMapsEnabled = Boolean(GOOGLE_MAPS_API_KEY);

export type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

export type GoogleLatLngLiteral = {
  lat: number;
  lng: number;
};

export type GoogleGeocoderResult = {
  place_id?: string;
  formatted_address?: string;
  partial_match?: boolean;
  address_components?: GoogleAddressComponent[];
  geometry?: {
    location?: GoogleLatLng;
  };
};

export type GoogleGeocoderRequest = {
  address?: string;
  componentRestrictions?: {
    country: string;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  region?: string;
  location?: GoogleLatLngLiteral;
  placeId?: string;
};

export type GooglePrediction = {
  place_id: string;
  description: string;
};

export type GoogleCircle = Record<string, never>;

export type GoogleAutocompleteRequest = {
  input: string;
  componentRestrictions?: {
    country: string;
  };
  locationBias?: GoogleCircle;
};

export type GoogleMapMouseEvent = {
  latLng?: GoogleLatLng | null;
};

export type GoogleMarkerIcon = {
  path: string;
  scale: number;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
};

export type GoogleMap = {
  addListener: (
    eventName: string,
    handler: (event: GoogleMapMouseEvent) => void | Promise<void>
  ) => void;
  panTo: (coords: GoogleLatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  setCenter: (coords: GoogleLatLngLiteral) => void;
  fitBounds: (bounds: GoogleLatLngBounds) => void;
};

export type GoogleLatLngBounds = {
  extend: (coords: GoogleLatLngLiteral) => void;
};

export type GoogleMarker = {
  addListener: (eventName: string, handler: () => void) => void;
  setMap: (map: GoogleMap | null) => void;
  setPosition: (coords: GoogleLatLngLiteral) => void;
};

export type GoogleInfoWindow = {
  close: () => void;
  setContent: (content: string) => void;
  open: (options: { anchor: GoogleMarker; map: GoogleMap }) => void;
};

export type GoogleMapsApi = {
  Map: new (
    element: HTMLElement,
    options: {
      center: GoogleLatLngLiteral;
      zoom: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }
  ) => GoogleMap;
  Marker: new (options: {
    map: GoogleMap;
    position: GoogleLatLngLiteral;
    title?: string;
    icon?: GoogleMarkerIcon;
  }) => GoogleMarker;
  InfoWindow: new () => GoogleInfoWindow;
  Geocoder: new () => {
    geocode: (
      request: GoogleGeocoderRequest,
      callback: (
        results: GoogleGeocoderResult[] | null,
        status: string
      ) => void
    ) => void;
  };
  Circle: new (options: {
    center: GoogleLatLngLiteral;
    radius: number;
  }) => GoogleCircle;
  LatLngBounds: new () => GoogleLatLngBounds;
  SymbolPath: {
    CIRCLE: string;
  };
  places: {
    AutocompleteService: new () => {
      getPlacePredictions: (
        request: GoogleAutocompleteRequest,
        callback: (
          predictions: GooglePrediction[] | null,
          status: string
        ) => void
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsApi;
    };
    __googleMapsScriptPromise?: Promise<void>;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-javascript-api";

export const loadGoogleMapsScript = async (): Promise<void> => {
  if (typeof window === "undefined") {
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Falta configurar VITE_GOOGLE_MAPS_API_KEY.");
  }

  if (window.google?.maps?.Map) {
    return;
  }

  if (window.__googleMapsScriptPromise) {
    return window.__googleMapsScriptPromise;
  }

  window.__googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Google Maps.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&libraries=places&language=es&region=CO&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar Google Maps."));

    document.head.appendChild(script);
  });

  return window.__googleMapsScriptPromise;
};

export const getGoogleMapsApi = async (): Promise<GoogleMapsApi> => {
  await loadGoogleMapsScript();

  if (!window.google?.maps) {
    throw new Error("Google Maps no está disponible.");
  }

  return window.google.maps;
};
