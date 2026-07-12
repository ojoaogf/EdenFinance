import { AppLayout } from "@/components/layout/AppLayout";
import { CategoriesSection } from "@/components/settings/CategoriesSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COLOR_THEMES } from "@/constants/color-themes";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import { Check, Palette, Tag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { MultiStateBadge } from "@/components/ui/multi-state-badge";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { colorTheme, setColorTheme } = useColorTheme();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (profile?.fullName) {
      setFullName(profile.fullName);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    if (!fullName.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    updateProfile.mutate(
      { fullName },
      {
        onSuccess: () => {
          toast.success("Perfil atualizado com sucesso!");
        },
        onError: () => {
          toast.error("Erro ao atualizar perfil");
        },
      },
    );
  };

  return (
    <AppLayout title="Configurações" subtitle="Personalize sua experiência">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <section className="max-w-3xl rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Informações pessoais da sua conta
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Carregando informações...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado.
                  </p>
                </div>
                <div className="col-span-2 flex justify-end mt-4">
                  <MultiStateBadge
                    onClick={handleSaveProfile}
                    status={updateProfile.isPending ? "loading" : "idle"}
                  >
                    Salvar Alterações
                  </MultiStateBadge>
                </div>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <section className="max-w-4xl rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    Aparência
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha o tema de cores do sistema
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="terminal-label">Tema ativo</p>
                <p className="text-sm font-semibold text-primary">
                  {COLOR_THEMES.find((t) => t.id === colorTheme)?.name}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COLOR_THEMES.map((themeOption) => {
                const isActive = themeOption.id === colorTheme;
                return (
                  <button
                    key={themeOption.id}
                    type="button"
                    onClick={() => setColorTheme(themeOption.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      isActive
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40 hover:bg-muted/40",
                    )}
                  >
                    <span
                      className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/60"
                      style={{
                        background: `conic-gradient(${themeOption.preview.primary} 0deg 180deg, ${themeOption.preview.background} 180deg 360deg)`,
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-card-foreground">
                          {themeOption.name}
                        </span>
                        {isActive && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {themeOption.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <CategoriesSection />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
