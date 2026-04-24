import { GoalCard } from "@/components/goals/GoalCard";
import { GoalHealthBar } from "@/components/goals/GoalHealthBar";
import { GoalStats } from "@/components/goals/GoalStats";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CreateActionButton } from "@/components/ui/create-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiStateBadge } from "@/components/ui/multi-state-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartDatePicker } from "@/components/ui/smart-date-picker";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from "@/hooks/use-goals";
import type { FinancialGoal } from "@/types/finance";
import { toDateOnlyString } from "@/utils/date";
import {
  formatCurrencyBRL,
  formatCurrencyInput,
  parseCurrencyToNumber,
} from "@/utils/money";
import { Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const categoryIcons: Record<string, string> = {
  emergency: "🛡️",
  travel: "✈️",
  property: "🏠",
  education: "📚",
  retirement: "🏖️",
  car: "🚗",
  wedding: "💒",
  other: "🎯",
};

const categoryLabels: Record<string, string> = {
  emergency: "Reserva de Emergência",
  travel: "Viagem",
  property: "Imóvel",
  education: "Educação",
  retirement: "Aposentadoria",
  car: "Veículo",
  wedding: "Casamento",
  other: "Outro",
};

const Goals = () => {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    monthlyDeposit: "",
    deadline: "",
    category: "",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingId(null);
      setNewGoal({
        name: "",
        targetAmount: "",
        currentAmount: "",
        monthlyDeposit: "",
        deadline: "",
        category: "",
      });
    }
  }, [isDialogOpen]);

  const handleEdit = (goal: FinancialGoal) => {
    setEditingId(goal.id);
    setNewGoal({
      name: goal.name,
      targetAmount: formatCurrencyBRL(Number(goal.targetAmount)),
      currentAmount: formatCurrencyBRL(Number(goal.currentAmount)),
      monthlyDeposit: formatCurrencyBRL(Number(goal.monthlyDeposit || 0)),
      deadline: goal.deadline.split("T")[0],
      category: goal.category || "other",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      toast.promise(deleteGoal.mutateAsync(id), {
        loading: "Excluindo meta...",
        success: "Meta excluída com sucesso",
        error: "Erro ao excluir meta",
      });
    }
  };

  const handleSaveGoal = async () => {
    if (
      !newGoal.name ||
      !newGoal.targetAmount ||
      !newGoal.deadline ||
      !newGoal.category
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const targetAmount = parseCurrencyToNumber(newGoal.targetAmount);
    const currentAmount = newGoal.currentAmount
      ? parseCurrencyToNumber(newGoal.currentAmount)
      : 0;
    const monthlyDeposit = newGoal.monthlyDeposit
      ? parseCurrencyToNumber(newGoal.monthlyDeposit)
      : 0;

    if (
      !Number.isFinite(targetAmount) ||
      !Number.isFinite(currentAmount) ||
      !Number.isFinite(monthlyDeposit)
    ) {
      toast.error("Valor monetário inválido");
      return;
    }

    const payload = {
      name: newGoal.name,
      targetAmount,
      currentAmount,
      monthlyDeposit,
      deadline: newGoal.deadline,
      category: newGoal.category,
    };

    try {
      if (editingId) {
        await updateGoal.mutateAsync({
          id: editingId,
          ...payload,
        });
        toast.success("Meta atualizada com sucesso!");
      } else {
        await createGoal.mutateAsync(payload);
        toast.success("Meta criada com sucesso!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast.error("Erro ao salvar meta");
    }
  };

  return (
    <AppLayout title="Metas" subtitle="Acompanhe seus objetivos financeiros">
      <div className="mb-8 flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <CreateActionButton label="Nova Meta" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Meta" : "Nova Meta"}
              </DialogTitle>
              <DialogDescription>
                Defina os detalhes do seu objetivo financeiro.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Nome */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, name: e.target.value })
                  }
                  placeholder="Ex: Viagem para Europa, Carro Novo"
                  className="h-11"
                />
              </div>

              {/* Valor Alvo (Destaque) */}
              <div className="grid gap-2">
                <Label htmlFor="targetAmount" className="text-center">
                  Qual o valor total da meta?
                </Label>
                <div className="relative flex justify-center">
                  <span className="absolute left-1/2 -translate-x-[100px] top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="targetAmount"
                    inputMode="numeric"
                    value={newGoal.targetAmount}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        targetAmount: formatCurrencyInput(e.target.value),
                      })
                    }
                    className="h-14 text-center text-2xl font-bold shadow-sm w-full max-w-[240px]"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Valor de Aporte (Secundário Grande) */}
              <div className="grid gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4">
                <Label
                  htmlFor="monthlyDeposit"
                  className="text-center text-primary"
                >
                  Quanto você vai guardar por mês?
                </Label>
                <div className="relative flex justify-center mt-2">
                  <span className="absolute left-1/2 -translate-x-[80px] top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="monthlyDeposit"
                    inputMode="numeric"
                    value={newGoal.monthlyDeposit}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        monthlyDeposit: formatCurrencyInput(e.target.value),
                      })
                    }
                    className="h-12 text-center text-xl font-semibold border-primary/30 w-full max-w-[200px]"
                    placeholder="0,00"
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">
                  Isso define se sua meta estará "No ritmo" ou "Em risco".
                </p>
              </div>

              {/* Grid: Valor Atual + Prazo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentAmount">Valor Já Guardado</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="currentAmount"
                      inputMode="numeric"
                      value={newGoal.currentAmount}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          currentAmount: formatCurrencyInput(e.target.value),
                        })
                      }
                      className="h-11 pl-9"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Prazo</Label>
                  <SmartDatePicker
                    date={
                      newGoal.deadline
                        ? new Date(newGoal.deadline + "T12:00:00")
                        : undefined
                    }
                    onSelect={(date) =>
                      setNewGoal({
                        ...newGoal,
                        deadline: date
                          ? toDateOnlyString(date)
                          : newGoal.deadline,
                      })
                    }
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(value) =>
                    setNewGoal({ ...newGoal, category: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {categoryIcons[key]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <MultiStateBadge
                type="submit"
                onClick={handleSaveGoal}
                status={
                  createGoal.isPending || updateGoal.isPending
                    ? "loading"
                    : "idle"
                }
              >
                {editingId ? "Atualizar Meta" : "Criar Meta"}
              </MultiStateBadge>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {/* KPI Stats */}
        <GoalStats goals={goals} />

        {/* Health Bar */}
        <GoalHealthBar goals={goals} />

        {/* Goals Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando metas...
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card/50 border-dashed">
            <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
            <p className="text-muted-foreground mb-6">
              Comece definindo seus objetivos financeiros para acompanhar seu
              Comece definindo seus objetivos financeiros para acompanhar seu
              progresso.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Criar Primeira Meta
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                categoryIcon={categoryIcons[goal.category || "other"] || "🎯"}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Goals;
