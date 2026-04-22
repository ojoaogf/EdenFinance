import { Card, CardContent } from "@/components/ui/card";
import { useSpring, useTransform } from "framer-motion";
import { TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface PortfolioHeroProps {
  totalValue: number;
}

export function PortfolioHero({ totalValue }: PortfolioHeroProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animation for the number
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
    springValue.set(totalValue);
  }, [totalValue, springValue]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [display]);

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Wallet className="h-5 w-5" />
              <span className="terminal-label text-primary-foreground/80">
                Patrimônio Total
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold md:text-6xl">
                R$ {displayValue.toLocaleString("pt-BR")}
              </span>
              <span className="text-lg font-medium opacity-80">
                ,{totalValue.toFixed(2).split(".")[1] || "00"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">
                Rentabilidade (Simulada)
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-300">
                  +12.5%
                </span>
                <span className="text-xs text-emerald-200/80">
                  últimos 12 meses
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
