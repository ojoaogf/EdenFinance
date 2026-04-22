import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ALLOWED_USER_EMAIL =
  (import.meta.env.VITE_ALLOWED_USER_EMAIL as string | undefined)?.trim() ||
  "ojoaogabrielf@gmail.com";

export default function Login() {
  const [email, setEmail] = useState(ALLOWED_USER_EMAIL);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email.trim().toLowerCase() !== ALLOWED_USER_EMAIL.toLowerCase()) {
        throw new Error("Este sistema permite apenas o usuário autorizado.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      navigate("/");
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro ao tentar autenticar.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 md:grid-cols-2">
        <section className="relative hidden overflow-hidden px-12 py-12 md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.28)_0%,transparent_42%),radial-gradient(circle_at_80%_70%,hsl(var(--chart-1)/0.18)_0%,transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.08)_1px,transparent_0)] bg-[size:40px_40px] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-transparent to-background/80" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-card/40 backdrop-blur-sm">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="terminal-title text-2xl text-primary">
                EdenFinance
              </h1>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <h2 className="terminal-title mb-4 text-6xl leading-[1.02]">
              Sistema de Gestão Financeira{" "}
              <span className="text-primary">EdenFinance</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Experimente o próximo nível da evolução da sua gestão financeira
              inteligente com a EdenFinance.
            </p>
          </div>
        </section>

        <section className="relative flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md rounded-[2rem] border border-primary/30 bg-card/70 p-8 shadow-neon backdrop-blur-2xl md:p-10">
            <div className="mb-8">
              <h2 className="terminal-title text-center text-4xl">Bem-vindo</h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="terminal-label">
                  Login
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-primary/20 bg-background/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <Label htmlFor="password" className="terminal-label">
                    Senha
                  </Label>
                  <span className="terminal-label text-primary/80">
                    Esqueceu sua senha?
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-primary/20 bg-background/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-primary/30 bg-background/50"
                />
                Mantenha-me conectado
              </label>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Carregando..." : "Entrar"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
