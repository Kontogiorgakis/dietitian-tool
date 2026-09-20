// Calendar helpers, all in local time (the practice runs in one time zone).

const DAY_MS = 86_400_000;

/** Monday 00:00 of the week containing the date. */
export const startOfWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
};

export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** 2026-09-20, for URLs and date inputs. */
export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Parses 2026-09-20 as a local date; null if malformed. */
export const fromDateKey = (key: string | undefined): Date | null => {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Combines a date key and an HH:MM time into a local Date; null if malformed. */
export const combineDateTime = (dateKey: string, time: string): Date | null => {
  const date = fromDateKey(dateKey);
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!date || !match) return null;
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
};
