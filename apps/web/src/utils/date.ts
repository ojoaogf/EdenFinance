export const toLocalDateFromDateOnly = (value: string) => {
  const dateOnly = value.slice(0, 10);
  return new Date(`${dateOnly}T12:00:00`);
};

export const formatDateOnlyPtBR = (
  value: string,
  options?: Intl.DateTimeFormatOptions,
) => toLocalDateFromDateOnly(value).toLocaleDateString("pt-BR", options);
