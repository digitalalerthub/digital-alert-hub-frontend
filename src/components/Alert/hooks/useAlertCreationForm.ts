import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import alertsService from "../../../services/alertsService";
import type { Coords } from "../createAlertWorkspace.utils";

const DEFAULT_CATEGORY = "Seguridad";
const DEFAULT_PRIORITY = "Media";

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
  const [evidencia, setEvidencia] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEvidenceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setEvidencia(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.warning("La evidencia no puede superar 20MB");
      e.target.value = "";
      setEvidencia(null);
      return;
    }

    setEvidencia(file);
  }, []);

  const submitAlert = useCallback(
    async ({ selectedCoords, forceCoordsOnSubmit, onSuccess }: SubmitAlertOptions) => {
      if (!titulo.trim() || !descripcion.trim() || !categoria.trim()) {
        toast.error("Titulo, descripcion y categoria son obligatorios");
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
          ubicacion: locationValue,
          evidencia: evidencia || undefined,
        });

        toast.success("Alerta creada correctamente");
        setTitulo("");
        setDescripcion("");
        setCategoria(DEFAULT_CATEGORY);
        setPrioridad(DEFAULT_PRIORITY);
        setUbicacion("");
        setEvidencia(null);

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
    [categoria, descripcion, evidencia, prioridad, titulo, ubicacion]
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
    evidencia,
    submitting,
    handleEvidenceChange,
    submitAlert,
  };
};
