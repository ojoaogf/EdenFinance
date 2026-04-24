const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

const formatUtcDateParts = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateOnlyToUtcNoon = (value: string) => {
  if (DATE_ONLY_REGEX.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return parsed;
};

export const formatDateOnlyFromDbDate = (value: Date) => {
  // DATE columns can be materialized at midnight in different DB timezones.
  // Shift to noon UTC before extracting parts to keep the intended calendar day.
  const normalized = new Date(value.getTime() + TWELVE_HOURS_IN_MS);
  return formatUtcDateParts(normalized);
};
