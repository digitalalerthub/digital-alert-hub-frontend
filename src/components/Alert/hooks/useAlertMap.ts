import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { Alert } from "../../../types/Alert";
import {
  getGoogleMapsApi,
  type GoogleInfoWindow,
  type GoogleMap,
  type GoogleMapMouseEvent,
  type GoogleMarker,
} from "../../../config/googleMaps";
import {
  MAP_SELECTION_TEXT,
  extractCoordsFromText,
  formatReadableAddress,
  geocodeAddress,
  geocodeAddressDetailed,
  geocodePlaceSuggestion,
  getAddressSuggestions,
  getCurrentPosition,
  reverseGeocode,
} from "../createAlertWorkspace.utils";
import type { Coords, LocationSuggestion } from "../createAlertWorkspace.utils";

type UseAlertMapArgs = {
  ubicacion: string;
  setUbicacion: (value: string) => void;
  pendingStateId: number | null;
};

const buildColombiaAddressAttempts = (query: string): string[] => {
  const clean = query
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*#\s*/g, " # ")
    .trim();

  if (!clean) return [];

  const attempts = [clean];

  const carreraMatch = clean.match(
    /(?:^|\s)(?:carrera|cra|kr|cr)\s*([0-9]+[a-z]?)\s*#\s*([0-9]+[a-z]?)/i
  );
  if (carreraMatch) {
    const cra = carreraMatch[1].toUpperCase();
    const cl = carreraMatch[2].toUpperCase();
    attempts.push(`Carrera ${cra} con Calle ${cl}`);
  }

  const calleMatch = clean.match(
    /(?:^|\s)(?:calle|cl)\s*([0-9]+[a-z]?)\s*#\s*([0-9]+[a-z]?)/i
  );
  if (calleMatch) {
    const cl = calleMatch[1].toUpperCase();
    const cra = calleMatch[2].toUpperCase();
    attempts.push(`Calle ${cl} con Carrera ${cra}`);
  }

  const withCityHints = attempts.flatMap((item) => [
    item,
    `${item}, Medellín, Antioquia, Colombia`,
    `${item}, Medellín, Colombia`,
  ]);

  return Array.from(new Set(withCityHints));
};

export const useAlertMap = ({ ubicacion, setUbicacion, pendingStateId }: UseAlertMapArgs) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [forceCoordsOnSubmit, setForceCoordsOnSubmit] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const suggestionsCacheRef = useRef<Map<string, LocationSuggestion[]>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const activeMarkersRef = useRef<GoogleMarker[]>([]);
  const infoWindowRef = useRef<GoogleInfoWindow | null>(null);

  const setSelectedMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    const maps = window.google?.maps;
    if (!maps) return;

    if (!markerRef.current) {
      markerRef.current = new maps.Marker({
        map: mapRef.current,
        position: { lat, lng },
      });
    } else {
      markerRef.current.setPosition({ lat, lng });
    }

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(16);
  }, []);

  const renderActiveAlertsOnMap = useCallback(async (data: Alert[]) => {
    if (!mapRef.current) return;

    const maps = window.google?.maps;
    if (!maps) return;

    activeMarkersRef.current.forEach((marker) => marker.setMap(null));
    activeMarkersRef.current = [];

    if (!infoWindowRef.current) {
      infoWindowRef.current = new maps.InfoWindow();
    }

    const activeAlerts = data
      .filter(
        (a) =>
          (pendingStateId === null || a.id_estado === pendingStateId) &&
          a.ubicacion &&
          a.ubicacion.trim().length > 0
      )
      .slice(0, 30);

    for (const alert of activeAlerts) {
      let coords = extractCoordsFromText(alert.ubicacion);

      if (!coords && alert.ubicacion) {
        coords = await geocodeAddress(alert.ubicacion, false);
      }

      if (!coords) continue;

      const marker = new maps.Marker({
        map: mapRef.current,
        position: coords,
        title: alert.titulo,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#dc2626",
          fillOpacity: 0.95,
          strokeColor: "#7f1d1d",
          strokeWeight: 1,
        },
      });

      marker.addListener("click", () => {
        if (!mapRef.current) return;

        infoWindowRef.current?.setContent(
          `<strong>${alert.titulo}</strong><br/>${alert.categoria}${
            alert.prioridad ? ` - ${alert.prioridad}` : ""
          }`
        );
        infoWindowRef.current?.open({
          anchor: marker,
          map: mapRef.current,
        });
      });

      activeMarkersRef.current.push(marker);
    }
  }, [pendingStateId]);

  const setLocationFromCoords = useCallback(
    async (lat: number, lng: number) => {
      setSelectedCoords({ lat, lng });
      setSelectedMarker(lat, lng);

      try {
        setReverseLoading(true);
        const data = await reverseGeocode(lat, lng);
        const readable = formatReadableAddress(data);

        if (readable) {
          setUbicacion(readable);
          setForceCoordsOnSubmit(false);
        } else {
          setUbicacion(MAP_SELECTION_TEXT);
          setForceCoordsOnSubmit(true);
          toast.info(
            "Google Maps no devolvió una dirección legible para ese punto. Revisa Geocoding API, restricciones del dominio y reinicia el frontend si acabas de cambiar la key."
          );
        }
      } catch {
        setUbicacion(MAP_SELECTION_TEXT);
        setForceCoordsOnSubmit(true);
        toast.warning(
          "No se pudo consultar la dirección en Google Maps. Verifica la API key, Geocoding API y que el dominio actual esté permitido."
        );
      } finally {
        setReverseLoading(false);
      }
    },
    [setSelectedMarker, setUbicacion]
  );

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const medellin: Coords = { lat: 6.2442, lng: -75.5812 };

      try {
        const maps = await getGoogleMapsApi();
        if (cancelled || !mapContainerRef.current) return;

        mapRef.current = new maps.Map(mapContainerRef.current, {
          center: medellin,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapRef.current.addListener("click", async (event: GoogleMapMouseEvent) => {
          const clickedLat = event?.latLng?.lat?.();
          const clickedLng = event?.latLng?.lng?.();
          if (
            typeof clickedLat !== "number" ||
            typeof clickedLng !== "number" ||
            !Number.isFinite(clickedLat) ||
            !Number.isFinite(clickedLng)
          ) {
            return;
          }

          const lat = Number(clickedLat.toFixed(6));
          const lng = Number(clickedLng.toFixed(6));
          await setLocationFromCoords(lat, lng);
        });

        setIsMapReady(true);

        try {
          const position = await getCurrentPosition();
          if (cancelled || !mapRef.current) return;

          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(15);
        } catch {
          mapRef.current?.setCenter(medellin);
          mapRef.current?.setZoom(13);
        }
      } catch {
        setIsMapReady(false);
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;
      markerRef.current?.setMap?.(null);
      activeMarkersRef.current.forEach((marker) => marker.setMap(null));
      activeMarkersRef.current = [];
      infoWindowRef.current?.close?.();
      markerRef.current = null;
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [setLocationFromCoords]);

  useEffect(() => {
    const query = ubicacion.trim();

    const isMapSelectionText = query
      .toLowerCase()
      .startsWith(MAP_SELECTION_TEXT.toLowerCase());
    const hasLetters = /[a-zA-Z]/.test(query);

    if (query.length < 5 || isMapSelectionText || !hasLetters) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const cacheKey = query.toLowerCase();
    const cached = suggestionsCacheRef.current.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setSuggestionsLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const data = await getAddressSuggestions(query, 5);
        suggestionsCacheRef.current.set(cacheKey, data || []);
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [ubicacion]);

  const handleManualUbicacionChange = useCallback(
    (value: string) => {
      setUbicacion(value);
      setForceCoordsOnSubmit(false);
      setSelectedCoords(null);
    },
    [setUbicacion]
  );

  const handleSelectSuggestion = useCallback(
    async (item: LocationSuggestion) => {
      const result = await geocodePlaceSuggestion(item.place_id);
      if (!result) {
        toast.warning("No se pudo ubicar esa dirección en Google Maps");
        return;
      }

      const { coords, data } = result;

      setUbicacion(formatReadableAddress(data) || item.display_name);
      setForceCoordsOnSubmit(false);
      setSelectedCoords(coords);
      setSuggestions([]);
      setSelectedMarker(coords.lat, coords.lng);
      if (!formatReadableAddress(data)) {
        toast.info(
          "Se ubicó el punto, pero Google no devolvió una dirección detallada. Revisa restricciones de la key."
        );
      }
    },
    [setSelectedMarker, setUbicacion]
  );

  const verifyAddress = useCallback(async () => {
    const query = ubicacion.trim();

    if (!query) {
      toast.info("Escribe una dirección para verificarla");
      return;
    }

    try {
      const attempts = buildColombiaAddressAttempts(query);
      let coords: Coords | null = null;
      let formattedAddress = "";

      for (const item of attempts) {
        const result = await geocodeAddressDetailed(item, true);
        if (!result) continue;

        coords = result.coords;
        formattedAddress = formatReadableAddress(result.data) || item;
        break;
      }

      if (!coords) {
        for (const item of attempts) {
          const result = await geocodeAddressDetailed(item, false);
          if (!result) continue;

          coords = result.coords;
          formattedAddress = formatReadableAddress(result.data) || item;
          break;
        }
      }

      if (!coords) {
        toast.warning(
          "No encontramos esa dirección, pero puedes registrar la alerta igual"
        );
        return;
      }

      setSelectedCoords(coords);
      setSelectedMarker(coords.lat, coords.lng);
      if (formattedAddress) {
        setUbicacion(formattedAddress);
      }
      setForceCoordsOnSubmit(false);
      toast.success("Dirección ubicada en el mapa");
    } catch {
      toast.warning(
        "No se pudo verificar la dirección, puedes continuar de todos modos"
      );
    }
  }, [setSelectedMarker, setUbicacion, ubicacion]);

  const useMyLocation = useCallback(async () => {
    try {
      setLocatingUser(true);
      const position = await getCurrentPosition();
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));
      await setLocationFromCoords(lat, lng);
      toast.success("Ubicación actual detectada");
    } catch {
      toast.warning("No se pudo obtener tu ubicación actual");
    } finally {
      setLocatingUser(false);
    }
  }, [setLocationFromCoords]);

  const handleAddressBlur = useCallback(async () => {
    if (!ubicacion.trim()) return;

    const attempts = buildColombiaAddressAttempts(ubicacion);
    for (const item of attempts) {
      const result = await geocodeAddressDetailed(item, true);
      if (!result) continue;

      setSelectedCoords(result.coords);
      setSelectedMarker(result.coords.lat, result.coords.lng);
      setUbicacion(formatReadableAddress(result.data) || ubicacion);
      setForceCoordsOnSubmit(false);
      return;
    }
  }, [setSelectedMarker, setUbicacion, ubicacion]);

  const clearLocationSelection = useCallback(() => {
    setForceCoordsOnSubmit(false);
    setSelectedCoords(null);
    setSuggestions([]);
    markerRef.current?.setMap?.(null);
    markerRef.current = null;
  }, []);

  return {
    mapContainerRef,
    selectedCoords,
    reverseLoading,
    locatingUser,
    forceCoordsOnSubmit,
    suggestions,
    suggestionsLoading,
    isMapReady,
    renderActiveAlertsOnMap,
    handleManualUbicacionChange,
    handleSelectSuggestion,
    verifyAddress,
    useMyLocation,
    handleAddressBlur,
    setLocationFromCoords,
    clearLocationSelection,
  };
};
