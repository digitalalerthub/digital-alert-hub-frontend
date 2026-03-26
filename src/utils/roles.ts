export type CanonicalRoleName = "administrador" | "ciudadano" | "jac";

const ROLE_ALIASES: Record<CanonicalRoleName, readonly string[]> = {
  administrador: ["administrador", "admin"],
  ciudadano: ["ciudadano"],
  jac: ["jac"],
};

export const normalizeRoleName = (value: unknown): string => {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const getCanonicalRoleName = (value: unknown): CanonicalRoleName | null => {
  const normalized = normalizeRoleName(value);
  if (!normalized) return null;

  for (const [canonicalName, aliases] of Object.entries(ROLE_ALIASES) as Array<
    [CanonicalRoleName, readonly string[]]
  >) {
    if (aliases.includes(normalized)) {
      return canonicalName;
    }
  }

  return null;
};

export const isAdminRole = (value: unknown): boolean =>
  getCanonicalRoleName(value) === "administrador";

export const isJacRole = (value: unknown): boolean =>
  getCanonicalRoleName(value) === "jac";
