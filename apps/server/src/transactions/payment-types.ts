export const PAYMENT_TYPES = ['Crédito', 'Pix/Débito'] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

const normalizeString = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const normalizePaymentType = (
  value?: string,
): PaymentType | undefined => {
  if (!value) return undefined;

  const normalized = normalizeString(value);
  if (
    normalized === 'pix' ||
    normalized === 'debito' ||
    normalized === 'pix/debito' ||
    normalized === 'vee'
  ) {
    return 'Pix/Débito';
  }

  if (normalized === 'credito') {
    return 'Crédito';
  }

  return undefined;
};
