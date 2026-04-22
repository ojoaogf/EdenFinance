import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { MultiStateBadge } from "@/components/ui/multi-state-badge";

const Settings = () => {
  const { theme, setTheme } = useTheme();
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
      <div className="max-w-4xl space-y-8">
        {/* Profile Section */}
        <section className="rounded-xl border border-border bg-card p-6">
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

        {/* Appearance Section */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Aparência</h3>
              <p className="text-sm text-muted-foreground">
                Personalize a interface
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Settings;
