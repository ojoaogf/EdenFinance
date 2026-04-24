export const formatCurrencyBRL = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatCurrencyInput = (rawValue: string) => {
  const digits = rawValue.replace(/\D/g, "");
  const cents = Number(digits || "0");
  return formatCurrencyBRL(cents / 100);
};

export const parseCurrencyToNumber = (value: string | number) => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return NaN;
    return Math.round(value * 100) / 100;
  }

  const sanitized = value.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!sanitized) return NaN;

  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");

  let normalized = sanitized;

  if (hasComma && hasDot) {
    // Use the rightmost separator as decimal and strip thousand separators.
    const lastComma = sanitized.lastIndexOf(",");
    const lastDot = sanitized.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";

    normalized = sanitized
      .split(thousandSeparator)
      .join("")
      .replace(decimalSeparator, ".");
  } else if (hasComma) {
    normalized = sanitized.replace(/\./g, "").replace(",", ".");
  } else if (hasDot) {
    normalized = sanitized.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return NaN;

  return Math.round(parsed * 100) / 100;
};
