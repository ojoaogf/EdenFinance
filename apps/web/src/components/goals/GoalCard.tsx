import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useDepositGoal } from "@/hooks/use-goals";
import type { FinancialGoal } from "@/types/finance";
import { differenceInDays } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Edit2,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GoalCardProps {
  goal: FinancialGoal;
  categoryIcon: string;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({
  goal,
  categoryIcon,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const daysRemaining = differenceInDays(deadline, today);
  const monthsRemaining = Math.max(daysRemaining / 30, 1);

  const currentAmount = Number(goal.currentAmount);
  const targetAmount = Number(goal.targetAmount);
  const monthlyDeposit = Number(goal.monthlyDeposit || 0);

  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const missingAmount = Math.max(targetAmount - currentAmount, 0);
  const requiredMonthlyDeposit = missingAmount / monthsRemaining;

  // Determinar Status
  let status: "on_track" | "warning" | "risk" = "risk";
  if (monthlyDeposit >= requiredMonthlyDeposit) {
    status = "on_track";
  } else if (monthlyDeposit >= requiredMonthlyDeposit * 0.8) {
    status = "warning";
  }

  const statusConfig = {
    on_track: {
      label: "No ritmo",
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      border: "border-emerald-500/20",
      icon: CheckCircle2,
      progressClass: "bg-emerald-500",
    },
    warning: {
      label: "Atenção",
      color: "text-amber-500",
      bg: "bg-amber-500",
      border: "border-amber-500/20",
      icon: AlertTriangle,
      progressClass: "bg-amber-500",
    },
    risk: {
      label: "Em risco",
      color: "text-rose-500",
      bg: "bg-rose-500",
      border: "border-rose-500/20",
      icon: AlertCircle,
      progressClass: "bg-rose-500",
    },
  };

  const currentStatus = statusConfig[status];
  const depositDiff = monthlyDeposit - requiredMonthlyDeposit;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const depositMutation = useDepositGoal();

  const handleDeposit = async () => {
    if (!depositAmount) return;

    try {
      await depositMutation.mutateAsync({
        id: goal.id,
        amount: parseFloat(depositAmount.replace(/\./g, "").replace(",", ".")),
      });
      setIsDepositModalOpen(false);
      setDepositAmount("");
      toast.success("Aporte realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao realizar aporte");
    }
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = Number(value.replace(/\D/g, "")) / 100;
    return numericValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div
        className={`relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-md ${
          status === "on_track"
            ? "border-border hover:border-emerald-500/30"
            : status === "warning"
              ? "border-amber-500/20 hover:border-amber-500/40"
              : "border-rose-500/20 hover:border-rose-500/40"
        }`}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50 text-2xl ring-1 ring-inset ring-white/10">
              {categoryIcon}
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-none mb-1.5">
                {goal.name}
              </h3>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                {goal.category}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(goal)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold tracking-tight">
              {Math.round(progress)}%
            </span>
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${currentStatus.color} bg-secondary/50 border ${currentStatus.border}`}
            >
              <currentStatus.icon className="h-3.5 w-3.5" />
              {currentStatus.label}
            </div>
          </div>
          <Progress
            value={progress}
            className={`h-2.5 bg-secondary [&>div]:${currentStatus.progressClass}`}
          />
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Valor atual</span>
            </div>
            <p className="text-lg font-bold tracking-tight">
              {formatCurrency(currentAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium">Valor alvo</span>
            </div>
            <p className="text-lg font-bold tracking-tight">
              {formatCurrency(targetAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Falta</span>
            </div>
            <p className="text-lg font-bold tracking-tight">
              {formatCurrency(missingAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Prazo</span>
            </div>
            <p className="text-lg font-bold tracking-tight">
              {daysRemaining > 0 ? `${daysRemaining} dias` : "Vencido"}
            </p>
          </div>
        </div>

        {/* Financial Intelligence */}
        <div className="space-y-4 rounded-xl bg-secondary/10 p-5">
          <p className="terminal-label">
            Inteligência Financeira
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Aporte atual</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(monthlyDeposit)}
                <span className="text-muted-foreground font-normal">/mês</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Aporte necessário</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(requiredMonthlyDeposit)}
                <span className="text-muted-foreground font-normal">/mês</span>
              </span>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Diferença
              </span>
              <span
                className={`font-bold ${
                  depositDiff >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {depositDiff >= 0 ? "+" : ""}
                {formatCurrency(depositDiff)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="mt-6 flex gap-2">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsDepositModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Aporte
          </Button>

          {status !== "on_track" && (
            <Button
              variant="outline"
              size="icon"
              className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600"
              title="Sugerir aumento de aporte"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Novo Aporte</DialogTitle>
            <DialogDescription>
              Adicione um valor para a meta "{goal.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-center">
                Valor do Aporte
              </Label>
              <div className="relative flex justify-center">
                <span className="absolute left-1/2 -translate-x-[80px] top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                  R$
                </span>
                <Input
                  id="amount"
                  inputMode="numeric"
                  value={depositAmount}
                  onChange={(e) =>
                    setDepositAmount(formatCurrencyInput(e.target.value))
                  }
                  className="h-14 text-center text-2xl font-bold shadow-sm w-full max-w-[200px]"
                  placeholder="0,00"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              onClick={handleDeposit}
              disabled={!depositAmount || depositMutation.isPending}
            >
              {depositMutation.isPending
                ? "Confirmando..."
                : "Confirmar Aporte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
