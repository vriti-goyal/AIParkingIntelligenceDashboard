export const safeText = (value: unknown, fallback = "Unknown"): string => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

export const formatViolationType = (value: unknown): string => {
  return safeText(value, "Unknown violation")
    .replace(/_/g, " ")
    .replace(/,/g, ", ");
};

export const safeNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};
