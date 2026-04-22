/*
  Warnings:

  - You are about to drop the column `category_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "investments" DROP CONSTRAINT "investments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "category_id",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "profiles";
