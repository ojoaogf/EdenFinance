import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  meta?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  trendData?: number[]; // Array de valores para o sparkline
}

const variantStyles = {
  default: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  danger: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  info: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

const chartColors = {
  default: "hsl(var(--muted-foreground))",
  success: "hsl(var(--chart-3))",
  warning: "hsl(var(--primary))",
  danger: "hsl(var(--chart-2))",
  info: "hsl(var(--chart-1))",
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  meta,
  icon: Icon,
  variant = "default",
  trendData = [],
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  // Prepare data for recharts
  const chartData = trendData.length
    ? trendData.map((val, i) => ({ i, val }))
    : [];

  return (
    <Card
      variant={variantStyles[variant]}
      className="group relative overflow-hidden p-4"
    >
      <div className="relative z-10 flex justify-between">
        <div className="space-y-1">
          <p className="terminal-label">
            {title}
          </p>
          <h3 className="terminal-title text-2xl">
            {value}
          </h3>

          {change !== undefined && (
            <div className="flex items-center gap-2 pt-1">
              <div
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              </div>
              {changeLabel && (
                <span className="text-xs text-muted-foreground/80">
                  {changeLabel}
                </span>
              )}
            </div>
          )}

          {meta && (
            <div className="pt-1 text-xs text-muted-foreground/80">{meta}</div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            iconStyles[variant],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-14 opacity-30 transition-opacity duration-300 group-hover:opacity-45">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id={`gradient-${variant}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColors[variant]}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors[variant]}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={chartColors[variant]}
                strokeWidth={2}
                fill={`url(#gradient-${variant})`}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
