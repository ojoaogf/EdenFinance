CREATE INDEX IF NOT EXISTS "idx_transactions_user_date"
ON "transactions" ("user_id", "date");

CREATE INDEX IF NOT EXISTS "idx_transactions_user_type_date"
ON "transactions" ("user_id", "type", "date");

CREATE INDEX IF NOT EXISTS "idx_investments_user_date"
ON "investments" ("user_id", "date");

CREATE INDEX IF NOT EXISTS "idx_goals_user_deadline"
ON "goals" ("user_id", "deadline");
