export const PAYMENT_TYPES = ["Crédito", "Pix/Débito"] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const normalizePaymentType = (value?: string): PaymentType | "" => {
  if (!value) return "";

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (
    normalized === "pix" ||
    normalized === "debito" ||
    normalized === "pix/debito" ||
    normalized === "vee"
  ) {
    return "Pix/Débito";
  }

  if (normalized === "credito") {
    return "Crédito";
  }

  return "";
};
