import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartDatePicker } from "@/components/ui/smart-date-picker";
import { StatusPill } from "@/components/ui/status-pill";
import { PAYMENT_TYPES } from "@/constants/payment-types";
import {
  getTransactionCategoryIcon,
  resolveCategoryIcon,
} from "@/constants/transaction-category-ui";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateInstallmentPlan,
  useDeleteInstallmentPlan,
  useInstallmentPlans,
  useUpdateInstallmentPlan,
} from "@/hooks/use-installment-plans";
import type { InstallmentPlan } from "@/types/finance";
import { toDateOnlyString } from "@/utils/date";
import {
  formatCurrencyBRL,
  formatCurrencyInput,
  parseCurrencyToNumber,
} from "@/utils/money";
import { CalendarClock, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getApiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && typeof message[0] === "string")
    return message[0];
  return null;
};

interface EmptyFormState {
  description: string;
  category: string;
  paymentType: string;
  installmentAmount: string;
  totalInstallments: string;
  startDate: Date | undefined;
}

const emptyForm: EmptyFormState = {
  description: "",
  category: "",
  paymentType: "",
  installmentAmount: "",
  totalInstallments: "",
  startDate: new Date(),
};

const PlanCard = ({
  plan,
  onEdit,
  onDelete,
}: {
  plan: InstallmentPlan;
  onEdit: (plan: InstallmentPlan) => void;
  onDelete: (plan: InstallmentPlan) => void;
}) => {
  const percent = (plan.paidInstallments / plan.totalInstallments) * 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-lg leading-none">
            {getTransactionCategoryIcon(plan.category, "expense")}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-card-foreground">
              {plan.description}
            </p>
            <p className="text-xs text-muted-foreground">{plan.category}</p>
          </div>
        </div>
        <StatusPill tone={plan.status === "concluido" ? "success" : "info"}>
          {plan.status === "concluido" ? "CONCLUÍDO" : "ATIVO"}
        </StatusPill>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {plan.paidInstallments} de {plan.totalInstallments} parcelas
          </span>
          <span>{formatCurrency(plan.installmentAmount)} /mês</span>
        </div>
        <Progress value={percent} className="h-1.5" />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <CalendarClock className="h-3 w-3" />
          {plan.nextDueDate
            ? `Próxima: ${formatDateLabel(plan.nextDueDate)}`
            : "Todas as parcelas lançadas"}
        </span>
        <span className="font-semibold text-foreground">
          Restam {formatCurrency(plan.remainingAmount)}
        </span>
      </div>

      <div className="mt-3 flex justify-end gap-1 border-t border-border/60 pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(plan)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const InstallmentPlans = () => {
  const { data: plans = [] } = useInstallmentPlans();
  const { data: categories = [] } = useCategories();
  const createPlan = useCreateInstallmentPlan();
  const updatePlan = useUpdateInstallmentPlan();
  const deletePlan = useDeleteInstallmentPlan();

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InstallmentPlan | null>(null);
  const [form, setForm] = useState<EmptyFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<InstallmentPlan | null>(
    null,
  );

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
    setForm(emptyForm);
  };

  const handleCreateClick = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleEditClick = (plan: InstallmentPlan) => {
    setEditingPlan(plan);
    setForm({
      description: plan.description,
      category: plan.category,
      paymentType: plan.paymentType || "",
      installmentAmount: formatCurrencyBRL(plan.installmentAmount),
      totalInstallments: String(plan.totalInstallments),
      startDate: new Date(`${plan.startDate}T12:00:00`),
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim() || !form.category) {
      toast.error("Preencha a descrição e a categoria");
      return;
    }
    if (!form.paymentType) {
      toast.error("Selecione a forma de pagamento");
      return;
    }

    if (editingPlan) {
      updatePlan.mutate(
        {
          id: editingPlan.id,
          description: form.description.trim(),
          category: form.category,
          paymentType: form.paymentType,
        },
        {
          onSuccess: () => {
            toast.success(
              "Parcelamento atualizado. As parcelas futuras foram ajustadas.",
            );
            closeForm();
          },
          onError: (error) => {
            toast.error(
              getApiErrorMessage(error) || "Erro ao atualizar parcelamento",
            );
          },
        },
      );
      return;
    }

    const amount = parseCurrencyToNumber(form.installmentAmount);
    const totalInstallments = Number(form.totalInstallments);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Informe um valor de parcela válido");
      return;
    }
    if (!Number.isInteger(totalInstallments) || totalInstallments < 2) {
      toast.error("A quantidade de parcelas deve ser no mínimo 2");
      return;
    }
    if (!form.startDate) {
      toast.error("Selecione a data da primeira parcela");
      return;
    }

    createPlan.mutate(
      {
        description: form.description.trim(),
        category: form.category,
        paymentType: form.paymentType,
        installmentAmount: amount,
        totalInstallments,
        startDate: toDateOnlyString(form.startDate),
      },
      {
        onSuccess: () => {
          toast.success(
            `Parcelamento criado! ${totalInstallments} lançamentos gerados automaticamente.`,
          );
          closeForm();
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(error) || "Erro ao criar parcelamento",
          );
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deletePlan.mutate(deleteTarget.id, {
      onSuccess: (result: { deletedInstallments?: number }) => {
        toast.success(
          `Parcelamento removido. ${result?.deletedInstallments ?? 0} parcela(s) futura(s) excluída(s); as já lançadas foram mantidas.`,
        );
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(error) || "Erro ao remover parcelamento",
        );
      },
    });
  };

  const activePlans = plans.filter((p) => p.status === "ativo");
  const completedPlans = plans.filter((p) => p.status === "concluido");

  return (
    <AppLayout
      title="Parcelamentos"
      subtitle="Contas parceladas com lançamento automático das parcelas"
    >
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Repeat className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">
              Contas Parceladas
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre uma conta parcelada uma única vez e o sistema lança
              automaticamente todas as parcelas mensais como transações
              normais. Editar ou excluir um parcelamento afeta apenas as
              parcelas futuras — as já lançadas permanecem no seu histórico.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Seus Parcelamentos ({plans.length})
        </h3>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}
        >
          <DialogTrigger asChild>
            <CreateActionButton
              size="sm"
              label="Novo Parcelamento"
              onClick={handleCreateClick}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Editar Parcelamento" : "Novo Parcelamento"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Valor, quantidade de parcelas e data não podem ser alterados. A mudança afeta apenas as parcelas futuras."
                  : "As parcelas serão lançadas automaticamente, uma por mês, a partir da data informada."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!editingPlan && (
                <div className="flex justify-center py-2">
                  <div className="relative w-full max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="plan-amount"
                      type="text"
                      inputMode="numeric"
                      value={form.installmentAmount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          installmentAmount: formatCurrencyInput(
                            e.target.value,
                          ),
                        })
                      }
                      className="h-14 pl-10 text-center text-2xl font-bold shadow-sm"
                      placeholder="0,00"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="plan-description">Descrição</Label>
                <Input
                  id="plan-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="h-11"
                  placeholder="Ex: Financiamento do notebook"
                />
              </div>

              <p className="terminal-label pt-1">Detalhes</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="right"
                      align="start"
                      className="max-h-[500px] w-[200px]"
                    >
                      {expenseCategories.length > 0 ? (
                        expenseCategories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {resolveCategoryIcon(c, "expense")} {c.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          Nenhuma categoria disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Pagamento</Label>
                  <Select
                    value={form.paymentType}
                    onValueChange={(v) => setForm({ ...form, paymentType: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!editingPlan && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan-total">Qtd. parcelas</Label>
                    <Input
                      id="plan-total"
                      type="number"
                      min={2}
                      max={120}
                      value={form.totalInstallments}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          totalInstallments: e.target.value,
                        })
                      }
                      className="h-11"
                      placeholder="12"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data da 1ª parcela</Label>
                    <SmartDatePicker
                      date={form.startDate}
                      onSelect={(d) => setForm({ ...form, startDate: d })}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createPlan.isPending || updatePlan.isPending}
              >
                {editingPlan ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Repeat}
            title="Nenhum parcelamento cadastrado"
            description="Cadastre sua primeira conta parcelada para começar."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg">
                Ativos ({activePlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px] pr-3">
                <div className="space-y-3">
                  {activePlans.length === 0 ? (
                    <EmptyState
                      icon={Repeat}
                      title="Nenhum parcelamento ativo"
                      size="compact"
                    />
                  ) : (
                    activePlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={handleEditClick}
                        onDelete={setDeleteTarget}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg">
                Concluídos ({completedPlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px] pr-3">
                <div className="space-y-3">
                  {completedPlans.length === 0 ? (
                    <EmptyState
                      icon={Repeat}
                      title="Nenhum parcelamento concluído"
                      size="compact"
                    />
                  ) : (
                    completedPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={handleEditClick}
                        onDelete={setDeleteTarget}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir parcelamento?</AlertDialogTitle>
            <AlertDialogDescription>
              As parcelas já lançadas (
              {deleteTarget?.paidInstallments ?? 0}) serão mantidas no seu
              histórico. Apenas as {deleteTarget?.remainingInstallments ?? 0}{" "}
              parcela(s) futura(s) serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-background hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default InstallmentPlans;
