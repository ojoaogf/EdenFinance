import { Card, type CardVariant } from "@/components/ui/card";
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
  variant?: CardVariant;
  trendData?: number[]; // Array de valores para o sparkline
}

const iconStyles: Record<CardVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  info: "bg-primary/20 text-primary",
};

const chartColors: Record<CardVariant, string> = {
  default: "hsl(var(--muted-foreground))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--destructive))",
  info: "hsl(var(--primary))",
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
    <Card variant={variant} className="group relative overflow-hidden p-4">
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
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
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
