-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spending_limits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_name" TEXT NOT NULL,
    "limit_amount" DECIMAL(14,2) NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spending_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_categories_user_type" ON "categories"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "uq_categories_user_name_type" ON "categories"("user_id", "name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "uq_spending_limits_user_category" ON "spending_limits"("user_id", "category_name");

-- Normalize existing transaction categories to canonical names.
-- Mirrors the approach used in 20260422233000_normalize_payment_types for payment_type,
-- collapsing casing/accent/whitespace variants (the root cause of the "Outros" duplication)
-- and renaming the legacy plural "Investimentos" to the new canonical "Investimento".
UPDATE "transactions"
SET "category" = CASE
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('ministerio', 'ministério') THEN 'Ministério'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('alimentacao', 'alimentação', 'mercado', 'restaurante') THEN 'Alimentação'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('moradia', 'aluguel', 'casa') THEN 'Moradia'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('transporte', 'uber', 'gasolina') THEN 'Transporte'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('educacao', 'educação', 'escola', 'curso') THEN 'Educação'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('saude', 'saúde', 'farmacia', 'farmácia', 'medico', 'médico') THEN 'Saúde'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('lazer') THEN 'Lazer'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('entretenimento', 'cinema') THEN 'Entretenimento'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('compras', 'shopping') THEN 'Compras'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('viagem') THEN 'Viagem'
  WHEN "type" = 'expense' AND lower(btrim("category")) IN ('investimento', 'investimentos') THEN 'Investimento'
  WHEN "type" = 'income' AND lower(btrim("category")) IN ('salario', 'salário', 'pagamento') THEN 'Salário'
  WHEN "type" = 'income' AND lower(btrim("category")) IN ('freelance', 'freela', 'projeto') THEN 'Freelance'
  ELSE 'Outros'
END;

-- Seed the canonical category list for every user that already has data,
-- so the whitelist enforced by the application matches what already exists.
INSERT INTO "categories" ("user_id", "name", "type")
SELECT DISTINCT u.user_id, c.name, c.type
FROM (
  SELECT user_id FROM "transactions"
  UNION
  SELECT user_id FROM "goals"
  UNION
  SELECT user_id FROM "investments"
) u
CROSS JOIN (
  VALUES
    ('Salário', 'income'),
    ('Freelance', 'income'),
    ('Outros', 'income'),
    ('Ministério', 'expense'),
    ('Alimentação', 'expense'),
    ('Moradia', 'expense'),
    ('Transporte', 'expense'),
    ('Educação', 'expense'),
    ('Saúde', 'expense'),
    ('Lazer', 'expense'),
    ('Entretenimento', 'expense'),
    ('Compras', 'expense'),
    ('Viagem', 'expense'),
    ('Investimento', 'expense'),
    ('Outros', 'expense')
) AS c(name, type)
ON CONFLICT ("user_id", "name", "type") DO NOTHING;

-- Seed default spending limits (expense categories only) for every user that already has data.
INSERT INTO "spending_limits" ("user_id", "category_name", "limit_amount")
SELECT DISTINCT u.user_id, c.category_name, c.limit_amount
FROM (
  SELECT user_id FROM "transactions"
  UNION
  SELECT user_id FROM "goals"
  UNION
  SELECT user_id FROM "investments"
) u
CROSS JOIN (
  VALUES
    ('Educação', 100.00),
    ('Entretenimento', 270.00),
    ('Ministério', 1775.00),
    ('Moradia', 2500.00),
    ('Transporte', 350.00),
    ('Alimentação', 1300.00),
    ('Outros', 400.00),
    ('Investimento', 4500.00),
    ('Compras', 700.00),
    ('Lazer', 300.00),
    ('Saúde', 500.00)
) AS c(category_name, limit_amount)
ON CONFLICT ("user_id", "category_name") DO NOTHING;
