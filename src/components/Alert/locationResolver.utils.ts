import type { BarrioOption, ComunaOption } from "../../types/Location";
import type { ReverseGeocodeResponse } from "./createAlertWorkspace.utils";

type ResolveAdministrativeLocationArgs = {
  payload: ReverseGeocodeResponse;
  comunas: ComunaOption[];
  currentComunaId?: number | null;
  getBarriosByComuna: (idComuna: number) => Promise<BarrioOption[]>;
};

type AdministrativeSelection = {
  comunaId: number;
  barrioId: number;
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
    .split(/[,\-|/]/g)
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

const matchComunaByName = (
  candidates: string[],
  comunas: ComunaOption[]
): number | null => {
  const normalizedCandidates = candidates.map(normalizeText).filter(Boolean);

  for (const comuna of comunas) {
    const comunaName = normalizeText(comuna.nombre);
    if (!comunaName) continue;

    const found = normalizedCandidates.some(
      (candidate) =>
        candidate === comunaName ||
        candidate.includes(comunaName) ||
        comunaName.includes(candidate)
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
        (candidate.length >= 4 && barrioName.includes(candidate)) ||
        (barrioName.length >= 4 && candidate.includes(barrioName))
      );
    });

    if (inclusive) return inclusive;
  }

  return null;
};

const extractAddressCandidates = (payload: ReverseGeocodeResponse): string[] => {
  const address = payload.address || {};
  const componentCandidates = (payload.components || []).flatMap((component) =>
    uniqueNonEmpty([component.long_name, component.short_name])
  );

  const fields = uniqueNonEmpty([
    address.neighbourhood,
    address.neighborhood,
    address.suburb,
    address.city_district,
    address.sublocality,
    address.sublocality_level_1,
    address.administrative_area_level_3,
    address.administrative_area_level_2,
    address.route,
    address.road,
    address.residential,
    payload.display_name,
    ...componentCandidates,
  ]);

  const splitted = fields.flatMap(splitAddressCandidates);
  return Array.from(new Set([...fields, ...splitted]));
};

export const resolveAdministrativeLocation = async ({
  payload,
  comunas,
  currentComunaId,
  getBarriosByComuna,
}: ResolveAdministrativeLocationArgs): Promise<AdministrativeSelection | null> => {
  if (comunas.length === 0) {
    return null;
  }

  const candidates = extractAddressCandidates(payload);
  if (candidates.length === 0) {
    return null;
  }

  const comunaById = parseComunaIdFromCandidates(candidates, comunas);
  const comunaByName = matchComunaByName(candidates, comunas);

  const orderedComunaIds = Array.from(
    new Set(
      [
        comunaById,
        comunaByName,
        currentComunaId && Number.isInteger(currentComunaId) && currentComunaId > 0
          ? currentComunaId
          : null,
        ...comunas.map((item) => item.id_comuna),
      ].filter(
        (value): value is number =>
          typeof value === "number" && Number.isInteger(value) && value > 0
      )
    )
  );

  for (const idComuna of orderedComunaIds) {
    const barrios = await getBarriosByComuna(idComuna);
    const matchedBarrio = matchBarrioByName(candidates, barrios);

    if (matchedBarrio) {
      return {
        comunaId: idComuna,
        barrioId: matchedBarrio.id_barrio,
      };
    }
  }

  return null;
};
