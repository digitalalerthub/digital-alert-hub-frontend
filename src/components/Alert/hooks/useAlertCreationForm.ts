import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import alertsService from "../../../services/alertsService";
import locationsService from "../../../services/locationsService";
import type { BarrioOption, ComunaOption } from "../../../types/Location";
import type { Coords } from "../createAlertWorkspace.utils";

const DEFAULT_CATEGORY = "Agua";
const DEFAULT_PRIORITY = "Media";
const MAX_EVIDENCE_IMAGES = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  useEffect(() => {
    const loadComunas = async () => {
      try {
        setLoadingLocations(true);
        const data = await locationsService.listComunas();
        setComunas(data);

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
        const data = await locationsService.listBarriosByComuna(numericComuna);
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
  }, [comunaId]);

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

  const submitAlert = useCallback(
    async ({ selectedCoords, forceCoordsOnSubmit, onSuccess }: SubmitAlertOptions) => {
      if (!titulo.trim() || !descripcion.trim() || !categoria.trim()) {
        toast.error("Titulo, descripcion y categoria son obligatorios");
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
    loadingLocations,
    evidencias,
    submitting,
    handleEvidenceChange,
    handleEvidenceDrop,
    submitAlert,
  };
};
