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

/**
 * Fim do dia de hoje (23:59:59.999 UTC), usado como corte "passado/hoje x futuro".
 * Como as datas são sempre gravadas ao meio-dia UTC (parseDateOnlyToUtcNoon), comparar
 * contra o instante exato de "agora" faria um lançamento de hoje parecer "futuro" antes
 * do meio-dia UTC. Usar o fim do dia UTC evita esse viés de fuso/horário.
 */
export const getEndOfTodayUtc = () => {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
};

/** Chave "YYYY-MM" (UTC) a partir de uma data. */
export const formatMonthKeyUtc = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

export const getCurrentMonthKeyUtc = () => formatMonthKeyUtc(new Date());

/** Próxima chave "YYYY-MM" após a informada. */
export const nextMonthKey = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  return formatMonthKeyUtc(new Date(Date.UTC(year, month - 1 + 1, 1)));
};

/**
 * Constrói a data (meio-dia UTC) de um dia específico dentro do mês "YYYY-MM",
 * ajustando automaticamente para o último dia do mês caso o dia informado não
 * exista nele (ex: dia 31 em fevereiro vira o último dia de fevereiro).
 */
export const getClampedMonthDateUtc = (
  monthKey: string,
  dayOfMonth: number,
) => {
  const [year, month] = monthKey.split('-').map(Number);
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const clampedDay = Math.min(Math.max(dayOfMonth, 1), lastDayOfMonth);
  return new Date(Date.UTC(year, month - 1, clampedDay, 12, 0, 0, 0));
};
