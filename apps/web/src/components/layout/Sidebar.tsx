import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { CreateActionButton } from "@/components/ui/create-action-button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const isFeatureEnabled = (value: unknown) => value === "true" || value === "1";

const GOALS_ENABLED = isFeatureEnabled(import.meta.env.VITE_FEATURE_GOALS);
const INVESTMENTS_ENABLED = isFeatureEnabled(
  import.meta.env.VITE_FEATURE_INVESTMENTS,
);

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ArrowLeftRight, label: "Transações", href: "/transactions" },
  ...(INVESTMENTS_ENABLED
    ? [{ icon: TrendingUp, label: "Investimentos", href: "/investments" }]
    : []),
  ...(GOALS_ENABLED ? [{ icon: Target, label: "Metas", href: "/goals" }] : []),
  { icon: FileBarChart, label: "Relatórios", href: "/reports" },
  //{ icon: Tags, label: "Etiquetas", href: "/labels" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border/70 bg-sidebar/95 backdrop-blur-sm transition-[width] duration-300",
        collapsed ? "w-20" : "w-44",
      )}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "relative border-b border-sidebar-border/70 py-5",
            collapsed ? "px-3" : "px-6",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              collapsed ? "Expandir menu lateral" : "Recolher menu lateral"
            }
            aria-expanded={!collapsed}
            onClick={onToggleCollapse}
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center",
            )}
          ></div>
        </div>

        <nav
          className={cn("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-md py-3 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2" : "gap-3 px-4",
                "text-sidebar-foreground/75 hover:bg-primary/5 hover:text-primary",
              )}
              activeClassName="bg-primary/10 text-primary shadow-neon-sm"
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className={cn("pb-3", collapsed ? "px-2" : "px-4")}>
          {collapsed ? (
            <Button
              onClick={() => navigate("/transactions?new=1")}
              variant="default"
              size="icon"
              className="w-full rounded-xl"
              aria-label="Nova Transação"
              title="Nova Transação"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <CreateActionButton
              onClick={() => navigate("/transactions?new=1")}
              fullWidth
              label="Nova Transação"
            />
          )}
        </div>

        <div
          className={cn(
            "border-t border-sidebar-border/70",
            collapsed ? "p-2" : "p-4",
          )}
        >
          <div className="mb-3 space-y-1">
            <button
              onClick={() => signOut()}
              className={cn(
                "flex w-full items-center rounded-md py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
              )}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && "Logout"}
            </button>
          </div>

          <div
            className={cn(
              "flex items-center rounded-lg bg-sidebar-accent/60 p-3",
              collapsed ? "justify-center" : "gap-3",
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {profile?.fullName ? getInitials(profile.fullName) : "EF"}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {profile?.fullName || "Carregando..."}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {profile?.email || ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
