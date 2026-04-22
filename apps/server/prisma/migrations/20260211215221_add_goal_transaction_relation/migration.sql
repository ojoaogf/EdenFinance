-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "deposit_day" INTEGER;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "goal_id" UUID;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
