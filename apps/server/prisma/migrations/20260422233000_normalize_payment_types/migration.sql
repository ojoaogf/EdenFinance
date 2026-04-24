UPDATE "transactions"
SET "payment_type" = CASE
  WHEN "payment_type" IS NULL OR btrim("payment_type") = '' THEN NULL
  WHEN lower(btrim("payment_type")) IN ('pix', 'débito', 'debito', 'pix/débito', 'pix/debito', 'vee') THEN 'Pix/Débito'
  WHEN lower(btrim("payment_type")) IN ('crédito', 'credito') THEN 'Crédito'
  ELSE "payment_type"
END;
