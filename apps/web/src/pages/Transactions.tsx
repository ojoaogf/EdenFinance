import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Card, CardContent } from "@/components/ui/card";
import { CreateActionButton } from "@/components/ui/create-action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { TransactionTypeSwitcher } from "@/components/ui/transaction-type-switcher";
import { PAYMENT_TYPES, normalizePaymentType } from "@/constants/payment-types";
import { buildCategoryIconMap } from "@/constants/transaction-category-ui";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import type { Transaction, TransactionType } from "@/types/finance";
import { toDateOnlyString } from "@/utils/date";
import {
  formatCurrencyBRL,
  formatCurrencyInput,
  parseCurrencyToNumber,
} from "@/utils/money";
import { filterTransactionsByPeriod } from "@/utils/report-period";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const startYear = 2026;
const years = Array.from({ length: 5 }, (_, i) => (startYear + i).toString());

const months = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const tagIcons: Record<string, string> = {
  Fixo: "🔒",
  Variável: "🔀",
};

const getApiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;

  if (typeof message === "string") return message;
  if (Array.isArray(message) && typeof message[0] === "string")
    return message[0];
  return null;
};

const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"year" | "month">("month");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "expense" as TransactionType,
    category: "",
    paymentType: "",
    date: toDateOnlyString(new Date()),
    tags: [] as string[],
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingId(null);
      setNewTransaction({
        description: "",
        amount: "",
        type: "expense" as TransactionType,
        category: "",
        paymentType: "",
        date: toDateOnlyString(new Date()),
        tags: [],
      });
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingId(null);
      setIsDialogOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete("new");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!editingId) {
      // Only reset if not editing (keeps category when switching type in new mode)
      setNewTransaction((prev) => ({
        ...prev,
        category: "",
        tags: [],
        paymentType: prev.type === "expense" ? prev.paymentType : "",
      }));
    }
  }, [newTransaction.type, editingId]);

  const filteredCategories = categories.filter(
    (category) =>
      category.type.toLowerCase() === newTransaction.type.toLowerCase(),
  );

  const categoryIcons = useMemo(
    () => buildCategoryIconMap(categories),
    [categories],
  );

  const periodTransactions = useMemo(
    () =>
      filterTransactionsByPeriod(transactions, { viewMode, year, month }),
    [transactions, viewMode, year, month],
  );

  const filteredTransactions = periodTransactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    toast.promise(deleteTransaction.mutateAsync(id), {
      loading: "Excluindo transação...",
      success: "Transação excluída com sucesso",
      error: "Erro ao excluir transação",
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setNewTransaction({
      description: transaction.description,
      amount: formatCurrencyBRL(Number(transaction.amount)),
      type: transaction.type,
      category: transaction.category || "",
      paymentType: normalizePaymentType(transaction.paymentType),
      date: transaction.date.split("T")[0],
      tags: transaction.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = () => {
    if (
      !newTransaction.description ||
      !newTransaction.amount ||
      !newTransaction.category
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const parsedAmount = parseCurrencyToNumber(newTransaction.amount);
    if (!Number.isFinite(parsedAmount)) {
      toast.error("Valor monetário inválido");
      return;
    }

    const payload = {
      description: newTransaction.description,
      amount: parsedAmount,
      type: newTransaction.type,
      category: newTransaction.category,
      paymentType:
        newTransaction.type === "expense"
          ? normalizePaymentType(newTransaction.paymentType) || undefined
          : undefined,
      date: newTransaction.date,
      tags: newTransaction.tags,
    };

    if (editingId) {
      updateTransaction.mutate(
        { id: editingId, ...payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success("Transação atualizada com sucesso!");
          },
          onError: (error) => {
            console.error("Erro ao atualizar transação:", error);
            const message =
              getApiErrorMessage(error) || "Erro ao atualizar transação";
            toast.error(message);
          },
        },
      );
    } else {
      createTransaction.mutate(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success("Transação adicionada com sucesso!");
        },
        onError: (error) => {
          console.error("Erro ao adicionar transação:", error);
          const message =
            getApiErrorMessage(error) || "Erro ao adicionar transação";
          toast.error(message);
        },
      });
    }
  };

  return (
    <AppLayout
      title="Transações"
      subtitle="Gerencie seu fluxo de caixa global em tempo real."
    >
      <Card className="mb-6 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              viewMode === "month"
                ? "bg-primary text-primary-foreground"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensal
          </button>

          <button
            type="button"
            onClick={() => setViewMode("year")}
            className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              viewMode === "year"
                ? "bg-primary text-primary-foreground"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {viewMode === "month" && (
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </Card>

      <TransactionFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <CreateActionButton label="Nova Transação" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Transação" : "Nova Transação"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Edite os detalhes da transação."
                    : "Adicione uma nova receita ou despesa."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <TransactionTypeSwitcher
                    value={newTransaction.type}
                    onChange={(value) =>
                      setNewTransaction({ ...newTransaction, type: value })
                    }
                  />
                </div>

                <div className="flex justify-center py-2">
                  <div className="relative w-full max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      value={newTransaction.amount}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          amount: formatCurrencyInput(e.target.value),
                        })
                      }
                      className="h-14 pl-10 text-center text-2xl font-bold shadow-sm"
                      placeholder="0,00"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="h-11"
                    placeholder="Ex: Salário, Aluguel"
                  />
                </div>

                <p className="terminal-label pt-1">Detalhes</p>

                <div
                  className={cn(
                    "grid gap-4",
                    newTransaction.type === "expense" && "grid-cols-2",
                  )}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) =>
                        setNewTransaction({
                          ...newTransaction,
                          category: value,
                        })
                      }
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
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {categoryIcons[category.name] || "🏷️"}{" "}
                              {category.name}
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

                  {newTransaction.type === "expense" && (
                    <div className="grid gap-2">
                      <Label htmlFor="paymentType">Pagamento</Label>
                      <Select
                        value={newTransaction.paymentType || ""}
                        onValueChange={(value) =>
                          setNewTransaction({
                            ...newTransaction,
                            paymentType: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_TYPES.map((paymentType) => (
                            <SelectItem key={paymentType} value={paymentType}>
                              {paymentType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {newTransaction.type === "expense" && (
                  <div className="grid gap-2">
                    <Label htmlFor="tag">Etiqueta</Label>
                    <Select
                      value={newTransaction.tags?.[0] || ""}
                      onValueChange={(value) =>
                        setNewTransaction({ ...newTransaction, tags: [value] })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione a etiqueta" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        side="right"
                        align="start"
                        className="max-h-[500px] w-[200px]"
                      >
                        <SelectItem value="Fixo">
                          {tagIcons["Fixo"]} Fixo
                        </SelectItem>
                        <SelectItem value="Variável">
                          {tagIcons["Variável"]} Variável
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Data</Label>
                  <div className="w-full">
                    <SmartDatePicker
                      date={
                        newTransaction.date
                          ? new Date(newTransaction.date + "T12:00:00")
                          : undefined
                      }
                      onSelect={(date) =>
                        setNewTransaction({
                          ...newTransaction,
                          date: date
                            ? toDateOnlyString(date)
                            : newTransaction.date,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <MultiStateBadge
                  type="submit"
                  onClick={handleSaveTransaction}
                  status={
                    createTransaction.isPending || updateTransaction.isPending
                      ? "loading"
                      : "idle"
                  }
                >
                  {editingId ? "Atualizar" : "Salvar"}
                </MultiStateBadge>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Transactions List */}
      <Card className="min-h-[400px] overflow-hidden">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando transações...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="Nenhuma transação encontrada"
              description={
                transactions.length === 0
                  ? "Comece adicionando sua primeira transação."
                  : "Nenhuma transação neste período. Tente ajustar o período ou os filtros de busca."
              }
            />
          ) : (
            <ScrollArea className="h-[640px] pr-3">
              <TransactionList
                transactions={filteredTransactions}
                categoryIcons={categoryIcons}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Transactions;
