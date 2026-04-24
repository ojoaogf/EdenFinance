export const toLocalDateFromDateOnly = (value: string) => {
  const dateOnly = value.slice(0, 10);
  return new Date(`${dateOnly}T12:00:00`);
};

export const toDateOnlyString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateOnlyPtBR = (
  value: string,
  options?: Intl.DateTimeFormatOptions,
) => toLocalDateFromDateOnly(value).toLocaleDateString("pt-BR", options);
