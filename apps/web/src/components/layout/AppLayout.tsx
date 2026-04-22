import { Settings, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppLayout({
  children,
  title,
  subtitle,
  actions,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("edenfinance:sidebar-collapsed");
    if (saved === "1") setIsSidebarCollapsed(true);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(
        "edenfinance:sidebar-collapsed",
        next ? "1" : "0",
      );
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
      />
      <main
        className={
          isSidebarCollapsed
            ? "ml-20 transition-[margin] duration-300"
            : "ml-64 transition-[margin] duration-300"
        }
      >
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="relative w-full max-w-md">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-start justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <h1 className="terminal-title text-lg text-primary">
                      EdenFinance
                    </h1>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/settings"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-primary"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <div className="h-8 w-px bg-border/60" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Última atualização
                </p>
                <p className="text-sm font-medium text-foreground">
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="terminal-title text-3xl">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">{actions}</div>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
