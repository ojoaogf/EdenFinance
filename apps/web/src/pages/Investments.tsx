import { DonutChart } from "@/components/dashboard/DonutChart";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartDatePicker } from "@/components/ui/smart-date-picker";
import {
  useCreateInvestment,
  useDeleteInvestment,
  useInvestments,
  useInvestmentSummary,
} from "@/hooks/use-investments";
import { formatDateOnlyPtBR } from "@/utils/date";
import { BarChart3, Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  stock: "📈 Ações",
  fund: "🏢 Fundos",
  crypto: "₿ Criptomoedas",
  fixed_income: "💰 Renda Fixa",
  real_estate: "🏙️ FIIs",
};

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const Investments = () => {
  const { data: investments = [], isLoading: isLoadingInvestments } =
    useInvestments();
  const { data: summary = [], isLoading: isLoadingSummary } =
    useInvestmentSummary();
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "",
    amount: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Totais baseados no Resumo
  const totalInvested = summary.reduce(
    (sum, item) => sum + Number(item.totalInvested),
    0,
  );

  // Data for allocation pie chart (Agrupado por Tipo)
  const allocationData = Object.entries(
    summary.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + Number(item.totalInvested);
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([type, value]) => ({
    name: typeLabels[type] || type,
    value,
  }));

  // Data for portfolio composition (Agrupado por Nome)
  const compositionData = summary.map((item) => ({
    name: item.name,
    value: Number(item.totalInvested),
  }));

  const handleAddInvestment = () => {
    if (
      !newInvestment.name ||
      !newInvestment.amount ||
      !newInvestment.quantity ||
      !newInvestment.type
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createInvestment.mutate(
      {
        name: newInvestment.name,
        type: newInvestment.type,
        amount: parseFloat(
          newInvestment.amount.replace(/\./g, "").replace(",", "."),
        ),
        quantity: parseFloat(newInvestment.quantity.replace(",", ".")),
        date: newInvestment.date,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewInvestment({
            name: "",
            type: "",
            amount: "",
            quantity: "",
            date: new Date().toISOString().split("T")[0],
          });
          toast.success("Aporte registrado com sucesso!");
        },
        onError: () => {
          toast.error("Erro ao registrar aporte");
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este aporte?")) {
      deleteInvestment.mutate(id, {
        onSuccess: () => toast.success("Aporte removido"),
        onError: () => toast.error("Erro ao remover aporte"),
      });
    }
  };

  return (
    <AppLayout
      title="Investimentos"
      subtitle="Acompanhe sua carteira de ativos"
    >
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-primary/50 bg-card p-4 shadow-neon-sm hover:border-primary transition-all duration-300 hover:shadow-neon">
          <div className="mb-2 flex items-center justify-between">
            <p className="terminal-label">Total Investido</p>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
            <p className="terminal-title text-2xl text-primary">
            R${" "}
            {totalInvested.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="rounded-xl border border-primary/50 bg-card p-4 shadow-neon-sm hover:border-primary transition-all duration-300 hover:shadow-neon">
          <div className="mb-2 flex items-center justify-between">
            <p className="terminal-label">Total de Ativos</p>
            <BarChart3 className="h-4 w-4 text-chart-1" />
          </div>
          <p className="terminal-title text-2xl">{summary.length}</p>
        </div>
        <div className="rounded-xl border border-primary/50 bg-card p-4 flex items-center justify-between shadow-neon-sm hover:border-primary transition-all duration-300 hover:shadow-neon">
          <div className="flex flex-col gap-1">
            <p className="terminal-label">Novo Aporte</p>
            <p className="text-xs text-muted-foreground">
              Registre suas compras
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 w-10 p-0 md:w-auto md:px-4 rounded-full md:rounded-lg">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Registrar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Novo Aporte</DialogTitle>
                <DialogDescription>
                  Registre a compra de um ativo para sua carteira.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Valor Total (Destaque) */}
                <div className="flex justify-center py-2">
                  <div className="relative w-full max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      value={newInvestment.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const numericValue = Number(value) / 100;
                        const formatted = numericValue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                        setNewInvestment({
                          ...newInvestment,
                          amount: formatted,
                        });
                      }}
                      className="h-14 pl-10 text-center text-2xl font-bold shadow-sm"
                      placeholder="0,00"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Ativo</Label>
                  <Input
                    id="name"
                    value={newInvestment.name}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ex: PETR4, Tesouro Selic"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newInvestment.type}
                    onValueChange={(value) =>
                      setNewInvestment({ ...newInvestment, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="right"
                      align="start"
                      className="max-h-[500px] w-[200px]"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="text"
                    inputMode="decimal"
                    value={newInvestment.quantity}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        quantity: e.target.value.replace(/[^0-9.,]/g, ""),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Data</Label>
                  <SmartDatePicker
                    date={
                      newInvestment.date
                        ? new Date(newInvestment.date + "T12:00:00")
                        : undefined
                    }
                    onSelect={(date) =>
                      setNewInvestment({
                        ...newInvestment,
                        date: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAddInvestment}
                  disabled={createInvestment.isPending}
                >
                  {createInvestment.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[400px]">
          {isLoadingSummary ? (
            <div className="flex h-full items-center justify-center">
              Carregando...
            </div>
          ) : (
            <DonutChart
              title="Alocação por Tipo"
              data={allocationData}
              colors={chartColors}
              emptyMessage="Sem investimentos registrados"
            />
          )}
        </div>

        <div className="rounded-xl border border-primary/50 bg-card p-6 shadow-neon-sm hover:border-primary transition-all duration-300 hover:shadow-neon">
          <h3 className="terminal-title mb-4 text-lg">
            Composição da Carteira (Top 10)
          </h3>
          <div className="h-[300px] w-full">
            {isLoadingSummary ? (
              <div className="flex h-full items-center justify-center">
                Carregando...
              </div>
            ) : compositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={compositionData.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString("pt-BR")}`,
                      "Valor Investido",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="rounded-xl border border-primary/50 bg-card shadow-neon-sm hover:border-primary transition-all duration-300 hover:shadow-neon">
        <div className="p-6">
          <h3 className="terminal-title text-lg">Histórico de Aportes</h3>
        </div>
        {isLoadingInvestments ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando aportes...
          </div>
        ) : investments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum aporte registrado.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{investment.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {typeLabels[investment.type] || investment.type}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDateOnlyPtBR(investment.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      R${" "}
                      {Number(investment.amount).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(investment.quantity)} cotas
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(investment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Investments;
