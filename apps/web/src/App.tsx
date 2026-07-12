import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ColorThemeProvider } from "./contexts/ColorThemeContext";
import Goals from "./pages/Goals";
import InstallmentPlans from "./pages/InstallmentPlans";
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
        <ColorThemeProvider>
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
                      <Reports />
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
                  element={<Navigate to="/" replace />}
                />
                <Route
                  path="/categories"
                  element={<Navigate to="/settings" replace />}
                />
                <Route
                  path="/installment-plans"
                  element={
                    <ProtectedRoute>
                      <InstallmentPlans />
                    </ProtectedRoute>
                  }
                />
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
        </ColorThemeProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
