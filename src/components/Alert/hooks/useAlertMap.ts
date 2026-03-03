import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import L from "leaflet";
import geoService from "../../../services/geoService";
import type { Alert } from "../../../types/Alert";
import {
  MAP_SELECTION_TEXT,
  extractCoordsFromText,
  formatReadableAddress,
  geocodeAddress,
  getCurrentPosition,
} from "../createAlertWorkspace.utils";
import type { Coords, LocationSuggestion } from "../createAlertWorkspace.utils";

type UseAlertMapArgs = {
  ubicacion: string;
  setUbicacion: (value: string) => void;
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

  const calleMatch = clean.match(/(?:^|\s)(?:calle|cl)\s*([0-9]+[a-z]?)\s*#\s*([0-9]+[a-z]?)/i);
  if (calleMatch) {
    const cl = calleMatch[1].toUpperCase();
    const cra = calleMatch[2].toUpperCase();
    attempts.push(`Calle ${cl} con Carrera ${cra}`);
  }

  const withCityHints = attempts.flatMap((item) => [
    item,
    `${item}, Medellin, Antioquia, Colombia`,
    `${item}, Medellin, Colombia`,
  ]);

  return Array.from(new Set(withCityHints));
};

export const useAlertMap = ({ ubicacion, setUbicacion }: UseAlertMapArgs) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [forceCoordsOnSubmit, setForceCoordsOnSubmit] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const suggestionsCacheRef = useRef<Map<string, LocationSuggestion[]>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const activeLayerRef = useRef<L.LayerGroup | null>(null);

  const setSelectedMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    mapRef.current.setView([lat, lng], 16);
  }, []);

  const renderActiveAlertsOnMap = useCallback(async (data: Alert[]) => {
    if (!mapRef.current) return;

    if (!activeLayerRef.current) {
      activeLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    activeLayerRef.current.clearLayers();

    const activeAlerts = data
      .filter((a) => a.id_estado === 1 && a.ubicacion && a.ubicacion.trim().length > 0)
      .slice(0, 30);

    for (const alert of activeAlerts) {
      let coords = extractCoordsFromText(alert.ubicacion);

      if (!coords && alert.ubicacion) {
        coords = await geocodeAddress(alert.ubicacion, false);
      }

      if (!coords) continue;

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 6,
        color: "#7f1d1d",
        fillColor: "#dc2626",
        fillOpacity: 0.9,
        weight: 1,
      });

      marker.bindPopup(
        `<strong>${alert.titulo}</strong><br/>${alert.categoria}${
          alert.prioridad ? ` - ${alert.prioridad}` : ""
        }`
      );

      marker.addTo(activeLayerRef.current);
    }
  }, []);

  const setLocationFromCoords = useCallback(
    async (lat: number, lng: number) => {
      setSelectedCoords({ lat, lng });
      setSelectedMarker(lat, lng);

      try {
        setReverseLoading(true);
        const data = await geoService.reverse(lat, lng);
        const readable = formatReadableAddress(data);

        if (readable) {
          setUbicacion(readable);
          setForceCoordsOnSubmit(false);
        } else {
          setUbicacion(MAP_SELECTION_TEXT);
          setForceCoordsOnSubmit(true);
        }
      } catch {
        setUbicacion(MAP_SELECTION_TEXT);
        setForceCoordsOnSubmit(true);
      } finally {
        setReverseLoading(false);
      }
    },
    [setSelectedMarker, setUbicacion]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const medellin: Coords = { lat: 6.2442, lng: -75.5812 };
    mapRef.current = L.map(mapContainerRef.current).setView([medellin.lat, medellin.lng], 13);
    setIsMapReady(true);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapRef.current);

    mapRef.current.on("click", async (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      await setLocationFromCoords(lat, lng);
    });

    (async () => {
      try {
        const position = await getCurrentPosition();
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        mapRef.current?.setView([lat, lng], 15);
      } catch {
        mapRef.current?.setView([medellin.lat, medellin.lng], 13);
      }
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      activeLayerRef.current = null;
      setIsMapReady(false);
    };
  }, [setLocationFromCoords]);

  useEffect(() => {
    const query = ubicacion.trim();

    const isMapSelectionText = query.toLowerCase().startsWith(MAP_SELECTION_TEXT.toLowerCase());
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
        const data = await geoService.search(query, 5, true);
        suggestionsCacheRef.current.set(cacheKey, data || []);
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 900);

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
    (item: LocationSuggestion) => {
      const lat = Number(item.lat);
      const lng = Number(item.lon);

      setUbicacion(item.display_name);
      setForceCoordsOnSubmit(false);
      setSelectedCoords({ lat, lng });
      setSuggestions([]);
      setSelectedMarker(lat, lng);
    },
    [setSelectedMarker, setUbicacion]
  );

  const verifyAddress = useCallback(async () => {
    const query = ubicacion.trim();

    if (!query) {
      toast.info("Escribe una direccion para verificarla");
      return;
    }

    try {
      const attempts = buildColombiaAddressAttempts(query);
      let coords = null;

      for (const item of attempts) {
        coords = await geocodeAddress(item, true);
        if (coords) break;
      }
      if (!coords) {
        for (const item of attempts) {
          coords = await geocodeAddress(item, false);
          if (coords) break;
        }
      }

      if (!coords) {
        toast.warning("No encontramos esa direccion, pero puedes registrar la alerta igual");
        return;
      }

      setSelectedCoords(coords);
      setSelectedMarker(coords.lat, coords.lng);
      setForceCoordsOnSubmit(false);
      toast.success("Direccion ubicada en el mapa");
    } catch {
      toast.warning("No se pudo verificar la direccion, puedes continuar de todos modos");
    }
  }, [setSelectedMarker, ubicacion]);

  const useMyLocation = useCallback(async () => {
    try {
      setLocatingUser(true);
      const position = await getCurrentPosition();
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));
      await setLocationFromCoords(lat, lng);
      toast.success("Ubicacion actual detectada");
    } catch {
      toast.warning("No se pudo obtener tu ubicacion actual");
    } finally {
      setLocatingUser(false);
    }
  }, [setLocationFromCoords]);

  const handleAddressBlur = useCallback(async () => {
    if (!ubicacion.trim()) return;

    const attempts = buildColombiaAddressAttempts(ubicacion);
    for (const item of attempts) {
      const coords = await geocodeAddress(item, true);
      if (!coords) continue;

      setSelectedCoords(coords);
      setSelectedMarker(coords.lat, coords.lng);
      setForceCoordsOnSubmit(false);
      return;
    }
  }, [setSelectedMarker, ubicacion]);

  const clearLocationSelection = useCallback(() => {
    setForceCoordsOnSubmit(false);
    setSelectedCoords(null);
    setSuggestions([]);
    markerRef.current?.remove();
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
