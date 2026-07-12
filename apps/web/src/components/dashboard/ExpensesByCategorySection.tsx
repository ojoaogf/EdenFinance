import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getCanonicalTransactionCategoryName,
  getTransactionCategoryIcon,
} from "@/constants/transaction-category-ui";
import type { ExpenseByCategory } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DonutChart } from "./DonutChart";

type Variant = "bar" | "donut" | "list";

interface ExpensesByCategorySectionProps {
  data: ExpenseByCategory[];
  variant?: Variant;
  title?: string;
  description?: string;
  emptyMessage?: string;
  topN?: number;
  height?: number;
  className?: string;
}

type CategoryDatum = {
  category: string;
  amount: number;
  percent: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCurrencyCompact = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });

const truncateLabel = (value: string, max = 14) =>
  value.length > max ? `${value.slice(0, max)}…` : value;

const LIST_COLOR = "hsl(var(--primary))";

export function ExpensesByCategorySection({
  data,
  variant = "bar",
  title = "Gastos por Categoria",
  description,
  emptyMessage = "Nenhuma despesa registrada.",
  topN = 6,
  height = 300,
  className,
}: ExpensesByCategorySectionProps) {
  const prepared = useMemo(() => {
    // Merge duplicate raw categories (e.g. casing/legacy variants) that all
    // canonicalize to the same display name, so they don't show up as
    // separate rows with the same label.
    const grouped = new Map<string, number>();
    data.forEach((item) => {
      const category = getCanonicalTransactionCategoryName(
        item.category,
        "expense",
      );
      const amount = Number(item.amount) || 0;
      grouped.set(category, (grouped.get(category) ?? 0) + amount);
    });

    const items = Array.from(grouped.entries())
      .map(([category, amount]) => ({ category, amount }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const toPercent = (list: { category: string; amount: number }[]) =>
      list.map((item) => ({
        category: item.category,
        amount: item.amount,
        percent: total > 0 ? (item.amount / total) * 100 : 0,
      }));

    // The full list (used by the scrollable "list" variant) never
    // truncates categories, so no category is ever merged into a synthetic
    // "Outros" bucket that could collide with a real "Outros" category.
    const full: CategoryDatum[] = toPercent(items);

    // Charts (bar/donut) still cap to topN + a synthetic "Outros" tail for
    // readability, since they don't scroll.
    const head = items.slice(0, Math.max(1, topN));
    const tailTotal = items
      .slice(Math.max(1, topN))
      .reduce((sum, item) => sum + item.amount, 0);
    const chartItems = [...head];
    if (tailTotal > 0) {
      chartItems.push({ category: "Outros (agrupado)", amount: tailTotal });
    }

    return { total, data: toPercent(chartItems), fullData: full };
  }, [data, topN]);

  if (variant === "donut") {
    const donutData = prepared.data.map((item) => ({
      name: item.category,
      value: item.amount,
    }));

    return (
      <div className={className}>
        <DonutChart
          title={title}
          description={
            description ?? `Total no período: ${formatCurrency(prepared.total)}`
          }
          data={donutData}
          emptyMessage={emptyMessage}
        />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <Card className={cn("h-full p-6", className)}>
        <CardHeader className="p-0 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="text-right">
              <p className="terminal-label">Total</p>
              <p className="terminal-title text-2xl text-primary">
                {formatCurrency(prepared.total)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {prepared.fullData.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted/50" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <ScrollArea
              className="h-[320px] pr-3"
              viewportClassName="snap-y snap-mandatory"
            >
              <div className="space-y-1">
                {prepared.fullData.map((item, index) => (
                  <div
                    key={item.category}
                    className="grid snap-start scroll-mt-1 grid-cols-[1.5fr_1.6fr_44px_96px] items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="shrink-0 text-base leading-none">
                        {getTransactionCategoryIcon(item.category, "expense")}
                      </span>
                      <span className="truncate text-sm font-semibold text-foreground">
                        {item.category}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(3, item.percent)}%`,
                          backgroundColor: LIST_COLOR,
                        }}
                      />
                    </div>
                    <span
                      className="text-right text-sm font-bold"
                      style={{ color: LIST_COLOR }}
                    >
                      {item.percent.toFixed(0)}%
                    </span>
                    <span className="text-right text-sm font-semibold text-foreground/90">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}

                <div className="mt-3 flex snap-start flex-wrap gap-4 border-t border-border/60 pt-3">
                  {prepared.fullData.map((item) => (
                    <div
                      key={`${item.category}-legend`}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: LIST_COLOR }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {truncateLabel(item.category, 18)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full p-6", className)}>
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {description ?? `Total no período: ${formatCurrency(prepared.total)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full" style={{ height }}>
          {prepared.data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted/50" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepared.data}
                layout="vertical"
                margin={{ left: 96, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/20"
                  vertical={false}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs font-medium fill-muted-foreground"
                  tickFormatter={(v) => formatCurrencyCompact(Number(v))}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs font-medium fill-muted-foreground"
                  tickFormatter={(v) => truncateLabel(String(v))}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    const raw = p.payload as CategoryDatum;

                    return (
                      <div className="rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md">
                        <p className="mb-3 text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                          {raw.category}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-6 text-sm">
                            <span className="text-muted-foreground">Valor</span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {formatCurrency(raw.amount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-6 text-sm">
                            <span className="text-muted-foreground">
                              Participação
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {raw.percent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
