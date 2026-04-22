import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { MonthlyReport } from "@/types/finance";
import { useId, useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

interface CashFlowSectionProps {
  monthlyReports: MonthlyReport[];
  viewMode?: "year" | "month";
  year?: string;
  month?: string;
  title?: string;
  description?: string;
  emptyMessage?: string;
  height?: number;
  showZeroLine?: boolean;
  className?: string;
}

const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCurrencyCompact = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });

const formatMonthShort = (monthKey: string) => {
  const [y, m] = monthKey.split("-");
  const year = Number(y);
  const month = Number(m);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return monthKey;
  }
  return `${monthLabels[month - 1]}/${String(year).slice(-2)}`;
};

export function CashFlowSection({
  monthlyReports,
  viewMode,
  year,
  month,
  title = "Fluxo de Caixa",
  description,
  emptyMessage = "Sem dados para exibir",
  height = 300,
  showZeroLine = true,
  className,
}: CashFlowSectionProps) {
  const chartId = useId().replace(/:/g, "");

  const filteredMonthlyReports = useMemo(() => {
    if (viewMode === "month" && year && month) {
      const monthKey = `${year}-${month.padStart(2, "0")}`;
      return monthlyReports.filter((r) => r.month === monthKey);
    }
    return monthlyReports;
  }, [monthlyReports, viewMode, year, month]);

  const computedDescription = useMemo(() => {
    if (description) return description;
    if (viewMode === "month" && year && month) {
      return `${monthLabels[Number(month) - 1] ?? month}/${year}`;
    }
    if (year) return `Ano ${year}`;
    return "Últimos 12 meses";
  }, [description, viewMode, year, month]);

  const chartData = useMemo(
    () =>
      [...filteredMonthlyReports]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((item) => ({
          ...item,
          income: Number(item.income) || 0,
          expenses: Number(item.expenses) || 0,
          balance: (Number(item.income) || 0) - (Number(item.expenses) || 0),
        })),
    [filteredMonthlyReports],
  );

  const totalBalance = useMemo(
    () => chartData.reduce((sum, item) => sum + item.balance, 0),
    [chartData],
  );

  const config = useMemo<ChartConfig>(
    () => ({
      income: { label: "Receitas", color: "hsl(var(--chart-3))" },
      expenses: { label: "Despesas", color: "hsl(var(--chart-2))" },
      balance: { label: "Saldo", color: "hsl(var(--primary))" },
    }),
    [],
  );

  const incomeGradientId = `income-${chartId}`;
  const expensesGradientId = `expenses-${chartId}`;

  return (
    <Card className={cn("h-full p-6", className)}>
      <CardHeader className="p-0 pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {computedDescription} •{" "}
          <span
            className={
              totalBalance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }
          >
            {formatCurrency(totalBalance)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full" style={{ height }}>
          {chartData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted/50" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <ChartContainer
              config={config}
              className="h-full w-full aspect-auto"
            >
              <ComposedChart
                data={chartData}
                margin={{ top: 18, right: 20, left: 50, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={incomeGradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-income)"
                      stopOpacity={0.85}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-income)"
                      stopOpacity={0.25}
                    />
                  </linearGradient>
                  <linearGradient
                    id={expensesGradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-expenses)"
                      stopOpacity={0.85}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-expenses)"
                      stopOpacity={0.25}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/20"
                  vertical={false}
                />
                {showZeroLine && (
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--border))"
                    strokeDasharray="4 4"
                  />
                )}
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  className="text-xs font-medium fill-muted-foreground"
                  tickFormatter={(value) => formatMonthShort(String(value))}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  className="text-xs font-medium fill-muted-foreground"
                  tickFormatter={(value) =>
                    formatCurrencyCompact(Number(value))
                  }
                />
                <ChartTooltip
                  cursor={{ fill: "transparent" }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(label) =>
                        formatMonthShort(String(label))
                      }
                      formatter={(value, name) => {
                        const label =
                          name === "income"
                            ? "Receitas"
                            : name === "expenses"
                              ? "Despesas"
                              : "Saldo";

                        return (
                          <div className="flex flex-1 items-center justify-between gap-8 text-xs">
                            <span className="text-muted-foreground">
                              {label}
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {formatCurrency(Number(value))}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <ChartLegend
                  verticalAlign="top"
                  content={<ChartLegendContent />}
                />
                <Bar
                  dataKey="income"
                  fill={`url(#${incomeGradientId})`}
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="expenses"
                  fill={`url(#${expensesGradientId})`}
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-balance)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--color-balance)" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
