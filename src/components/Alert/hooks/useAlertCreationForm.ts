import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import alertsService from "../../../services/alertsService";
import geoService from "../../../services/geoService";
import locationsService from "../../../services/locationsService";
import type { BarrioOption, ComunaOption } from "../../../types/Location";
import type { Coords } from "../createAlertWorkspace.utils";

const DEFAULT_CATEGORY = "Agua";
const DEFAULT_PRIORITY = "Media";
const MAX_EVIDENCE_IMAGES = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ReverseAddress = {
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

type ReversePayload = {
  display_name?: string;
  address?: ReverseAddress;
};

type SubmitAlertOptions = {
  selectedCoords: Coords | null;
  forceCoordsOnSubmit: boolean;
  onSuccess?: () => Promise<void> | void;
};

const buildLocationValue = (
  ubicacion: string,
  selectedCoords: Coords | null,
  forceCoordsOnSubmit: boolean
): string | undefined => {
  const clean = ubicacion.trim();

  if (selectedCoords && (forceCoordsOnSubmit || !clean)) {
    return `Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
  }

  if (selectedCoords && clean) {
    return `${clean} | Punto en mapa: ${selectedCoords.lat}, ${selectedCoords.lng}`;
  }

  if (clean) return clean;

  return undefined;
};

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const uniqueNonEmpty = (values: Array<string | undefined | null>): string[] => {
  const items = values
    .map((value) => String(value || "").trim())
    .filter((value) => value.length > 0);
  return Array.from(new Set(items));
};

const splitAddressCandidates = (value: string): string[] => {
  const chunks = value
    .split(/[,\-|]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return Array.from(new Set(chunks));
};

const parseComunaIdFromCandidates = (
  candidates: string[],
  comunas: ComunaOption[]
): number | null => {
  const validComunaIds = new Set(comunas.map((item) => item.id_comuna));

  for (const candidate of candidates) {
    const match = normalizeText(candidate).match(/\bcomuna\s*(\d{1,2})\b/);
    if (!match) continue;

    const id = Number(match[1]);
    if (validComunaIds.has(id)) return id;
  }

  return null;
};

const matchComunaByName = (candidates: string[], comunas: ComunaOption[]): number | null => {
  const normalizedCandidates = candidates.map(normalizeText).filter(Boolean);
  for (const comuna of comunas) {
    const comunaName = normalizeText(comuna.nombre);
    if (!comunaName) continue;

    const found = normalizedCandidates.some(
      (candidate) => candidate === comunaName || candidate.includes(comunaName)
    );
    if (found) return comuna.id_comuna;
  }

  return null;
};

const matchBarrioByName = (
  candidates: string[],
  barrios: BarrioOption[]
): BarrioOption | null => {
  if (barrios.length === 0 || candidates.length === 0) return null;

  const normalizedCandidates = candidates.map(normalizeText).filter(Boolean);
  if (normalizedCandidates.length === 0) return null;

  for (const candidate of normalizedCandidates) {
    const exact = barrios.find((item) => normalizeText(item.nombre) === candidate);
    if (exact) return exact;
  }

  for (const candidate of normalizedCandidates) {
    const inclusive = barrios.find((item) => {
      const barrioName = normalizeText(item.nombre);
      return (
        (candidate.length >= 5 && barrioName.includes(candidate)) ||
        (barrioName.length >= 5 && candidate.includes(barrioName))
      );
    });
    if (inclusive) return inclusive;
  }

  return null;
};

const extractAddressCandidates = (payload: ReversePayload): string[] => {
  const address = payload.address || {};
  const fields = uniqueNonEmpty([
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.road,
    address.residential,
    payload.display_name,
  ]);

  const splitted = fields.flatMap(splitAddressCandidates);
  return Array.from(new Set([...fields, ...splitted]));
};

export const useAlertCreationForm = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(DEFAULT_CATEGORY);
  const [prioridad, setPrioridad] = useState(DEFAULT_PRIORITY);
  const [ubicacion, setUbicacion] = useState("");
  const [comunas, setComunas] = useState<ComunaOption[]>([]);
  const [barrios, setBarrios] = useState<BarrioOption[]>([]);
  const [comunaId, setComunaId] = useState("");
  const [barrioId, setBarrioId] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const barriosCacheRef = useRef<Map<number, BarrioOption[]>>(new Map());
  const autoResolutionRequestRef = useRef(0);

  const getBarriosByComuna = useCallback(async (idComuna: number): Promise<BarrioOption[]> => {
    const cached = barriosCacheRef.current.get(idComuna);
    if (cached) {
      return cached;
    }

    const data = await locationsService.listBarriosByComuna(idComuna);
    barriosCacheRef.current.set(idComuna, data);
    return data;
  }, []);

  useEffect(() => {
    const loadComunas = async () => {
      try {
        setLoadingLocations(true);
        const data = await locationsService.listComunas();
        setComunas(data);
        barriosCacheRef.current.clear();

        if (data.length > 0) {
          setComunaId(String(data[0].id_comuna));
        }
      } catch {
        toast.error("No se pudieron cargar las comunas");
      } finally {
        setLoadingLocations(false);
      }
    };

    void loadComunas();
  }, []);

  useEffect(() => {
    const numericComuna = Number(comunaId);
    if (!Number.isInteger(numericComuna) || numericComuna <= 0) {
      setBarrios([]);
      setBarrioId("");
      return;
    }

    const loadBarrios = async () => {
      try {
        const data = await getBarriosByComuna(numericComuna);
        setBarrios(data);

        setBarrioId((current) => {
          const exists = data.some((item) => String(item.id_barrio) === current);
          if (exists) return current;
          return data[0] ? String(data[0].id_barrio) : "";
        });
      } catch {
        setBarrios([]);
        setBarrioId("");
        toast.error("No se pudieron cargar los barrios de la comuna");
      }
    };

    void loadBarrios();
  }, [comunaId, getBarriosByComuna]);

  const selectEvidence = useCallback((files: File[]): boolean => {
    if (!files.length) {
      setEvidencias([]);
      return true;
    }

    if (files.length > MAX_EVIDENCE_IMAGES) {
      toast.warning(`Puedes subir m\u00E1ximo ${MAX_EVIDENCE_IMAGES} im\u00E1genes`);
      setEvidencias([]);
      return false;
    }

    const invalidType = files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      toast.warning("Solo se permiten im\u00E1genes JPG, PNG o WEBP");
      setEvidencias([]);
      return false;
    }

    const oversized = files.some((file) => file.size > 20 * 1024 * 1024);
    if (oversized) {
      toast.warning("Cada imagen no puede superar 20MB");
      setEvidencias([]);
      return false;
    }

    setEvidencias(files);
    return true;
  }, []);

  const handleEvidenceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const wasSelected = selectEvidence(files);

      if (!wasSelected) {
        e.target.value = "";
      }
    },
    [selectEvidence]
  );

  const handleEvidenceDrop = useCallback(
    (files: File[]) => {
      selectEvidence(files);
    },
    [selectEvidence]
  );

  const onComunaChange = useCallback((value: string) => {
    setComunaId(value);
  }, []);

  const autoSelectAdministrativeLocation = useCallback(
    async (coords: Coords) => {
      if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
        return;
      }

      if (comunas.length === 0) {
        return;
      }

      const requestId = autoResolutionRequestRef.current + 1;
      autoResolutionRequestRef.current = requestId;

      let reversePayload: ReversePayload;
      try {
        reversePayload = (await geoService.reverse(coords.lat, coords.lng)) as ReversePayload;
      } catch {
        return;
      }

      if (autoResolutionRequestRef.current !== requestId) {
        return;
      }

      const candidates = extractAddressCandidates(reversePayload);
      if (candidates.length === 0) {
        return;
      }

      const comunaById = parseComunaIdFromCandidates(candidates, comunas);
      const comunaByName = matchComunaByName(candidates, comunas);
      const currentComuna = Number(comunaId);
      const fallbackComuna = Number.isInteger(currentComuna) ? currentComuna : null;
      const resolvedComuna = comunaById ?? comunaByName ?? fallbackComuna;

      if (resolvedComuna && Number.isInteger(resolvedComuna)) {
        try {
          const comunaBarrios = await getBarriosByComuna(resolvedComuna);
          if (autoResolutionRequestRef.current !== requestId) {
            return;
          }

          const matchedBarrio = matchBarrioByName(candidates, comunaBarrios);
          setComunaId(String(resolvedComuna));
          if (matchedBarrio) {
            setBarrioId(String(matchedBarrio.id_barrio));
          }

          return;
        } catch {
          return;
        }
      }

      for (const comuna of comunas) {
        let comunaBarrios: BarrioOption[];
        try {
          comunaBarrios = await getBarriosByComuna(comuna.id_comuna);
        } catch {
          continue;
        }

        if (autoResolutionRequestRef.current !== requestId) {
          return;
        }

        const matchedBarrio = matchBarrioByName(candidates, comunaBarrios);
        if (!matchedBarrio) continue;

        setComunaId(String(comuna.id_comuna));
        setBarrioId(String(matchedBarrio.id_barrio));
        return;
      }
    },
    [comunaId, comunas, getBarriosByComuna]
  );

  const submitAlert = useCallback(
    async ({ selectedCoords, forceCoordsOnSubmit, onSuccess }: SubmitAlertOptions) => {
      if (!titulo.trim() || !descripcion.trim() || !categoria.trim()) {
        toast.error("T\u00EDtulo, descripci\u00F3n y categor\u00EDa son obligatorios");
        return;
      }

      const parsedComunaId = Number(comunaId);
      const parsedBarrioId = Number(barrioId);
      if (!Number.isInteger(parsedComunaId) || !Number.isInteger(parsedBarrioId)) {
        toast.error("Selecciona una comuna y un barrio v\u00E1lidos");
        return;
      }

      const locationValue = buildLocationValue(ubicacion, selectedCoords, forceCoordsOnSubmit);

      try {
        setSubmitting(true);
        await alertsService.create({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          categoria: categoria.trim(),
          prioridad: prioridad.trim() || undefined,
          id_comuna: parsedComunaId,
          id_barrio: parsedBarrioId,
          ubicacion: locationValue,
          evidencias,
        });

        toast.success("Alerta creada correctamente");
        setTitulo("");
        setDescripcion("");
        setCategoria(DEFAULT_CATEGORY);
        setPrioridad(DEFAULT_PRIORITY);
        setUbicacion("");
        setComunaId((prev) => prev || (comunas[0] ? String(comunas[0].id_comuna) : ""));
        setBarrioId((prev) => prev || (barrios[0] ? String(barrios[0].id_barrio) : ""));
        setEvidencias([]);

        if (onSuccess) {
          await onSuccess();
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "No se pudo crear la alerta");
        } else {
          toast.error("Error inesperado al crear la alerta");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [barrios, barrioId, categoria, comunaId, comunas, descripcion, evidencias, prioridad, titulo, ubicacion]
  );

  return {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    categoria,
    setCategoria,
    prioridad,
    setPrioridad,
    ubicacion,
    setUbicacion,
    comunas,
    barrios,
    comunaId,
    barrioId,
    onComunaChange,
    setBarrioId,
    autoSelectAdministrativeLocation,
    loadingLocations,
    evidencias,
    submitting,
    handleEvidenceChange,
    handleEvidenceDrop,
    submitAlert,
  };
};
