import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Button } from "./components/ui/button";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Goals from "./pages/Goals";
import Index from "./pages/Index";
import Investments from "./pages/Investments";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";

const queryClient = new QueryClient();

const isFeatureEnabled = (value: unknown) => value === "true" || value === "1";

const GOALS_ENABLED = isFeatureEnabled(import.meta.env.VITE_FEATURE_GOALS);
const INVESTMENTS_ENABLED = isFeatureEnabled(
  import.meta.env.VITE_FEATURE_INVESTMENTS,
);

const AwaitingApproval = () => {
  const { signOut } = useAuth();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
        <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
      </div>
      <h1 className="text-2xl font-bold">Aguardando Aprovação</h1>
      <p className="max-w-md text-muted-foreground">
        Sua conta foi criada com sucesso, mas precisa ser aprovada por um
        administrador antes de você acessar o sistema.
      </p>
      <Button onClick={signOut} variant="outline">
        Voltar ao Login
      </Button>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investments"
                element={
                  <ProtectedRoute>
                    {INVESTMENTS_ENABLED ? (
                      <Investments />
                    ) : (
                      <Navigate to="/" replace />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    {GOALS_ENABLED ? <Goals /> : <Navigate to="/" replace />}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              {/*<Route
              path="/labels"
              element={
                <ProtectedRoute>
                  <Labels />
                </ProtectedRoute>
              }
            />*/}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
