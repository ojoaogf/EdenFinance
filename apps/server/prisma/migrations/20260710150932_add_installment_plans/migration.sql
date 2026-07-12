-- CreateTable
CREATE TABLE "installment_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "payment_type" TEXT,
    "installment_amount" DECIMAL(14,2) NOT NULL,
    "total_installments" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "installment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_installment_plans_user" ON "installment_plans"("user_id");

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "installment_plan_id" UUID,
ADD COLUMN "installment_number" INTEGER,
ADD COLUMN "installment_total" INTEGER;

-- CreateIndex
CREATE INDEX "idx_transactions_installment_plan" ON "transactions"("installment_plan_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_plan_id_fkey" FOREIGN KEY ("installment_plan_id") REFERENCES "installment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
