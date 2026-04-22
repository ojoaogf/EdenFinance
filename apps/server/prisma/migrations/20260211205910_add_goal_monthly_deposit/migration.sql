/*
  Warnings:

  - You are about to drop the column `monthly_contribution` on the `goals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "goals" DROP COLUMN "monthly_contribution",
ADD COLUMN     "monthly_deposit" DECIMAL(14,2) NOT NULL DEFAULT 0;
