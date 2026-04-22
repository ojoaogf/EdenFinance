import { Progress } from "@/components/ui/progress";
import { FinancialGoal } from "@/types/finance";

const categoryIcons: Record<string, string> = {
  emergency: "🛡️",
  travel: "✈️",
  property: "🏠",
  education: "📚",
  vehicle: "🚗",
  other: "🎯",
};

interface GoalsProgressProps {
  goals: FinancialGoal[];
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  return (
    <div className="rounded-xl border border-primary/50 bg-card p-6 shadow-neon-sm hover:border-primary transition-colors duration-300">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Metas Financeiras
          </h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso
          </p>
        </div>
        <a
          href="/goals"
          className="text-sm font-medium text-primary hover:underline"
        >
          Gerenciar
        </a>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">
            Nenhuma meta definida.
          </p>
        ) : (
          goals.map((goal) => {
            const progress =
              (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
            const remaining =
              Number(goal.targetAmount) - Number(goal.currentAmount);
            const deadline = new Date(goal.deadline);
            const today = new Date();
            const daysRemaining = Math.ceil(
              (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            // Backend might not return category, so fallback to 'other'
            const categoryIcon =
              goal.category && categoryIcons[goal.category]
                ? categoryIcons[goal.category]
                : "🎯";

            return (
              <div
                key={goal.id}
                className="space-y-3 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-border hover:bg-background hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcon}</span>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {goal.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {daysRemaining > 0
                          ? `${daysRemaining} dias restantes`
                          : "Prazo expirado"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {progress.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">
                      Faltam R$ {remaining.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      R$ {Number(goal.currentAmount).toLocaleString("pt-BR")}
                    </span>
                    <span>
                      R$ {Number(goal.targetAmount).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
