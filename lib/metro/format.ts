// Numbers use the comma as the decimal separator (72,4). Units follow with a hair of space.

const GREEK_MONTHS_SHORT = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαΐ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];

export const formatNum = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(decimals).replace(".", ",");
};

/** A change, always with its sign: −5,6 or +1,8. Uses the real minus sign. */
export const formatChange = (value: number, decimals = 1): string => {
  const abs = formatNum(Math.abs(value), decimals);
  if (Math.abs(value) < 10 ** -decimals / 2) return abs;
  return value < 0 ? `−${abs}` : `+${abs}`;
};

/** Accepts "72,4", "72.4" and " 72 ". Returns null for anything that is not a number. */
export const parseDecimal = (raw: string): number | null => {
  const trimmed = raw.trim().replace(",", ".");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

/** 12 Σεπ */
export const formatDayMonth = (date: Date): string =>
  `${date.getDate()} ${GREEK_MONTHS_SHORT[date.getMonth()]}`;

/** 12 Σεπ 2026 */
export const formatDate = (date: Date): string => `${formatDayMonth(date)} ${date.getFullYear()}`;

/** ΩΩ:ΛΛ, for the autosave stamp. */
export const formatTime = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export const ageAt = (birthDate: Date, at: Date = new Date()): number => {
  let age = at.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    at.getMonth() < birthDate.getMonth() ||
    (at.getMonth() === birthDate.getMonth() && at.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

export const fullName = (client: { firstName: string; lastName: string }): string =>
  `${client.firstName} ${client.lastName}`;
