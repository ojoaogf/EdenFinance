import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CreateActionButton } from "@/components/ui/create-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as FormLabel } from "@/components/ui/label";
import { Label } from "@/types/finance";
import { Edit2, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const mockLabels: Label[] = [
  { id: "1", name: "Fixo", color: "#5B9A8B" },
  { id: "2", name: "Variável", color: "#445D48" },
  { id: "3", name: "Essencial", color: "#C4A35A" },
  { id: "4", name: "Supérfluo", color: "#9B7E46" },
  { id: "5", name: "Investimento", color: "#6B8A7A" },
];

const presetColors = [
  "#5B9A8B",
  "#445D48",
  "#C4A35A",
  "#9B7E46",
  "#6B8A7A",
  "#7C9885",
  "#8B6F47",
  "#4A6741",
  "#A67C52",
  "#5D7B6F",
];

const Labels = () => {
  const [labels, setLabels] = useState<Label[]>(mockLabels);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [newLabel, setNewLabel] = useState({
    name: "",
    color: presetColors[0],
    description: "",
  });

  const handleSaveLabel = () => {
    if (!newLabel.name) {
      toast.error("Digite um nome para a etiqueta");
      return;
    }

    if (editingLabel) {
      setLabels(
        labels.map((l) =>
          l.id === editingLabel.id
            ? {
                ...l,
                name: newLabel.name,
                color: newLabel.color,
                description: newLabel.description,
              }
            : l,
        ),
      );
      toast.success("Etiqueta atualizada!");
    } else {
      const label: Label = {
        id: Date.now().toString(),
        name: newLabel.name,
        color: newLabel.color,
        description: newLabel.description,
      };
      setLabels([...labels, label]);
      toast.success("Etiqueta criada!");
    }

    setIsDialogOpen(false);
    setEditingLabel(null);
    setNewLabel({ name: "", color: presetColors[0], description: "" });
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabel(label);
    setNewLabel({
      name: label.name,
      color: label.color,
      description: label.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteLabel = (id: string) => {
    setLabels(labels.filter((l) => l.id !== id));
    toast.success("Etiqueta removida");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLabel(null);
    setNewLabel({ name: "", color: presetColors[0], description: "" });
  };

  return (
    <AppLayout
      title="Etiquetas"
      subtitle="Organize suas transações com etiquetas personalizadas"
    >
      {/* Info Card */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">
              Sistema de Etiquetas
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use etiquetas para categorizar suas transações de forma
              personalizada. Você pode criar etiquetas como "Fixo", "Variável",
              "Essencial" ou qualquer outra que faça sentido para sua
              organização financeira.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Suas Etiquetas ({labels.length})
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <CreateActionButton
              size="sm"
              label="Nova Etiqueta"
              onClick={() => setIsDialogOpen(true)}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLabel ? "Editar Etiqueta" : "Nova Etiqueta"}
              </DialogTitle>
              <DialogDescription>
                {editingLabel
                  ? "Atualize as informações da etiqueta."
                  : "Crie uma nova etiqueta para organizar suas transações."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <FormLabel htmlFor="name">Nome</FormLabel>
                <Input
                  id="name"
                  value={newLabel.name}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, name: e.target.value })
                  }
                  placeholder="Ex: Fixo, Variável, Essencial..."
                />
              </div>
              <div className="grid gap-2">
                <FormLabel>Cor</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full transition-all ${
                        newLabel.color === color
                          ? "ring-2 ring-ring ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabel({ ...newLabel, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <FormLabel htmlFor="description">
                  Descrição (opcional)
                </FormLabel>
                <Input
                  id="description"
                  value={newLabel.description}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, description: e.target.value })
                  }
                  placeholder="Uma breve descrição da etiqueta..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSaveLabel}>
                {editingLabel ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Labels Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {labels.map((label) => (
          <div
            key={label.id}
            className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg"
                  style={{ backgroundColor: label.color }}
                />
                <div>
                  <h4 className="font-semibold text-card-foreground">
                    {label.name}
                  </h4>
                  {label.description && (
                    <p className="text-sm text-muted-foreground">
                      {label.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditLabel(label)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDeleteLabel(label.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                <Tag className="mr-1 h-3 w-3" />
                {label.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Preview da etiqueta
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Labels;
