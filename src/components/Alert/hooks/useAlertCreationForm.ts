import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAlertCategories } from "../../../context/useAlertCategories";
import alertsService from "../../../services/alertsService";
import locationsService from "../../../services/locationsService";
import type { BarrioOption, ComunaOption } from "../../../types/Location";
import type { Coords } from "../createAlertWorkspace.utils";
import { reverseGeocode } from "../createAlertWorkspace.utils";
import { resolveAdministrativeLocation } from "../locationResolver.utils";

const DEFAULT_PRIORITY = "Media";
const MAX_EVIDENCE_IMAGES = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type SubmitAlertOptions = {
  selectedCoords: Coords | null;
  forceCoordsOnSubmit: boolean;
  onSuccess?: () => Promise<void> | void;
};

type AlertCreationFieldErrors = {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  evidencias?: string;
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

export const useAlertCreationForm = () => {
  const { categorias, isLoading: loadingCategories } = useAlertCategories();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [prioridad, setPrioridad] = useState(DEFAULT_PRIORITY);
  const [ubicacion, setUbicacion] = useState("");
  const [comunas, setComunas] = useState<ComunaOption[]>([]);
  const [barrios, setBarrios] = useState<BarrioOption[]>([]);
  const [comunaId, setComunaId] = useState("");
  const [barrioId, setBarrioId] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AlertCreationFieldErrors>({});
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
    setCategoriaId((current) => {
      if (
        current &&
        categorias.some((categoria) => String(categoria.id_categoria) === current)
      ) {
        return current;
      }

      return categorias[0] ? String(categorias[0].id_categoria) : "";
    });
  }, [categorias]);

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

  useEffect(() => {
    setFieldErrors((prev) => {
      let next = prev;

      if (prev.titulo && titulo.trim()) {
        next = { ...next, titulo: undefined };
      }

      if (prev.descripcion && descripcion.trim()) {
        next = { ...next, descripcion: undefined };
      }

      if (prev.ubicacion && ubicacion.trim()) {
        next = { ...next, ubicacion: undefined };
      }

      if (prev.evidencias && evidencias.length > 0) {
        next = { ...next, evidencias: undefined };
      }

      return next;
    });
  }, [descripcion, evidencias, titulo, ubicacion]);

  const selectEvidence = useCallback((files: File[]): boolean => {
    if (!files.length) {
      setEvidencias([]);
      return true;
    }

    if (files.length > MAX_EVIDENCE_IMAGES) {
      toast.warning(`Puedes subir maximo ${MAX_EVIDENCE_IMAGES} imagenes`);
      setEvidencias([]);
      return false;
    }

    const invalidType = files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      toast.warning("Solo se permiten imagenes JPG, PNG o WEBP");
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

      const reversePayload = await reverseGeocode(coords.lat, coords.lng);
      if (!reversePayload || autoResolutionRequestRef.current !== requestId) {
        return;
      }

      const currentComuna = Number(comunaId);

      try {
        const resolvedLocation = await resolveAdministrativeLocation({
          payload: reversePayload,
          comunas,
          currentComunaId:
            Number.isInteger(currentComuna) && currentComuna > 0 ? currentComuna : null,
          getBarriosByComuna,
        });

        if (
          autoResolutionRequestRef.current !== requestId ||
          !resolvedLocation
        ) {
          return;
        }

        setComunaId(String(resolvedLocation.comunaId));
        setBarrioId(String(resolvedLocation.barrioId));
      } catch {
        return;
      }
    },
    [comunaId, comunas, getBarriosByComuna]
  );

  const submitAlert = useCallback(
    async ({ selectedCoords, forceCoordsOnSubmit, onSuccess }: SubmitAlertOptions) => {
      const nextErrors: AlertCreationFieldErrors = {};

      if (!titulo.trim()) {
        nextErrors.titulo = "Ingresa un titulo";
      }

      if (!descripcion.trim()) {
        nextErrors.descripcion = "Ingresa una descripcion";
      }

      if (!ubicacion.trim()) {
        nextErrors.ubicacion = "Ingresa o selecciona una direccion";
      }

      if (!evidencias.length) {
        nextErrors.evidencias = "Debes adjuntar al menos una evidencia";
      }

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
        toast.error("Completa los campos obligatorios");
        return;
      }

      const parsedCategoriaId = Number(categoriaId);
      if (!Number.isInteger(parsedCategoriaId) || parsedCategoriaId <= 0) {
        toast.error("La categoria es obligatoria");
        return;
      }

      const parsedComunaId = Number(comunaId);
      const parsedBarrioId = Number(barrioId);
      if (!Number.isInteger(parsedComunaId) || !Number.isInteger(parsedBarrioId)) {
        toast.error("Selecciona una comuna y un barrio validos");
        return;
      }

      const locationValue = buildLocationValue(ubicacion, selectedCoords, forceCoordsOnSubmit);

      try {
        setSubmitting(true);
        await alertsService.create({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          id_categoria: parsedCategoriaId,
          prioridad: prioridad.trim() || undefined,
          id_comuna: parsedComunaId,
          id_barrio: parsedBarrioId,
          ubicacion: locationValue || ubicacion.trim(),
          evidencias,
        });

        toast.success("Alerta creada correctamente");
        setTitulo("");
        setDescripcion("");
        setCategoriaId(categorias[0] ? String(categorias[0].id_categoria) : "");
        setPrioridad(DEFAULT_PRIORITY);
        setUbicacion("");
        setComunaId((prev) => prev || (comunas[0] ? String(comunas[0].id_comuna) : ""));
        setBarrioId((prev) => prev || (barrios[0] ? String(barrios[0].id_barrio) : ""));
        setEvidencias([]);
        setFieldErrors({});

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
    [
      barrios,
      barrioId,
      categoriaId,
      categorias,
      comunaId,
      comunas,
      descripcion,
      evidencias,
      prioridad,
      titulo,
      ubicacion,
    ]
  );

  return {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    categoriaId,
    setCategoriaId,
    categorias,
    loadingCategories,
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
    fieldErrors,
    submitting,
    handleEvidenceChange,
    handleEvidenceDrop,
    submitAlert,
  };
};
