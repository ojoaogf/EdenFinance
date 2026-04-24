import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Card, CardContent } from "@/components/ui/card";
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
import { TransactionTypeSwitcher } from "@/components/ui/transaction-type-switcher";
import { CATEGORIES } from "@/constants/categories";
import { PAYMENT_TYPES, normalizePaymentType } from "@/constants/payment-types";
import { TRANSACTION_CATEGORY_ICONS } from "@/constants/transaction-category-ui";
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
import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const categoryIcons: Record<string, string> = {
  ...TRANSACTION_CATEGORY_ICONS,
};

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
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
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

  const filteredCategories = CATEGORIES.filter(
    (category) =>
      category.type.toLowerCase() === newTransaction.type.toLowerCase(),
  );

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = income - expenses;

    return {
      income,
      expenses,
      balance,
      portfolio: income > 0 ? income * 0.42 : 0,
    };
  }, [filteredTransactions]);

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
      {/*<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card variant="info" className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Balanço Total
          </p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">
            {stats.balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Card variant="success" className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Entradas
          </p>
          <p className="mt-1 text-2xl font-extrabold text-chart-3">
            {stats.income.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Card variant="danger" className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Despesas
          </p>
          <p className="mt-1 text-2xl font-extrabold text-chart-2">
            {stats.expenses.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Card variant="warning" className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Investimentos
          </p>
          <p className="mt-1 text-2xl font-extrabold text-primary">
            {stats.portfolio.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
      </div>*/}

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
                      <SelectValue placeholder="Selecione a categoria" />
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
                    <Label htmlFor="paymentType">Tipo de Pagamento</Label>
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
                        <SelectValue placeholder="Selecione o tipo" />
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
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando transações...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="mb-4 rounded-full bg-secondary/50 p-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-medium">
                Nenhuma transação encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== "all"
                  ? "Tente ajustar seus filtros de busca."
                  : "Comece adicionando sua primeira transação."}
              </p>
            </div>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              categoryIcons={categoryIcons}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Transactions;
