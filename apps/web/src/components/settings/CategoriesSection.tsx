import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateActionButton } from "@/components/ui/create-action-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  resolveCategoryIcon,
} from "@/constants/transaction-category-ui";
import type { Category, TransactionType } from "@/types/finance";
import { Edit2, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const getApiErrorPayload = (error: unknown) => {
  const response = (
    error as { response?: { data?: { message?: unknown; usageCount?: number } } }
  )?.response;
  const message = response?.data?.message;
  return {
    message: typeof message === "string" ? message : null,
    usageCount:
      typeof response?.data?.usageCount === "number"
        ? response.data.usageCount
        : undefined,
  };
};

const CategoryColumn = ({
  title,
  type,
  categories,
  onEdit,
  onDelete,
}: {
  title: string;
  type: TransactionType;
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) => (
  <Card className="p-6">
    <CardHeader className="p-0 pb-4">
      <CardTitle className="text-lg">
        {title} ({categories.length})
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <ScrollArea className="h-[345px] pr-3">
        <div className="space-y-2">
          {categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Nenhuma categoria cadastrada"
              description={`Crie a primeira categoria de ${title.toLowerCase()}.`}
              size="compact"
            />
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">
                    {resolveCategoryIcon(category, type)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-card-foreground">
                        {category.name}
                      </p>
                      {category.isTransfer && (
                        <StatusPill tone="info">Transferência</StatusPill>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.usageCount}{" "}
                      {category.usageCount === 1 ? "transação" : "transações"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

export function CategoriesSection() {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formIcon, setFormIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [formIsTransfer, setFormIsTransfer] = useState(false);

  const [reassignConflict, setReassignConflict] = useState<{
    category: Category;
    usageCount: number;
  } | null>(null);
  const [reassignToId, setReassignToId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormName("");
    setFormType("expense");
    setFormIcon(DEFAULT_CATEGORY_ICON);
    setFormIsTransfer(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormType(category.type);
    setFormIcon(resolveCategoryIcon(category, category.type));
    setFormIsTransfer(category.isTransfer);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error("Digite um nome para a categoria");
      return;
    }

    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id,
          name: formName.trim(),
          icon: formIcon,
          isTransfer: formIsTransfer,
        },
        {
          onSuccess: () => {
            toast.success("Categoria atualizada!");
            closeForm();
          },
          onError: (error) => {
            const { message } = getApiErrorPayload(error);
            toast.error(message || "Erro ao atualizar categoria");
          },
        },
      );
    } else {
      createCategory.mutate(
        {
          name: formName.trim(),
          type: formType,
          icon: formIcon,
          isTransfer: formIsTransfer,
        },
        {
          onSuccess: () => {
            toast.success("Categoria criada!");
            closeForm();
          },
          onError: (error) => {
            const { message } = getApiErrorPayload(error);
            toast.error(message || "Erro ao criar categoria");
          },
        },
      );
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteTarget(category);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const category = deleteTarget;

    deleteCategory.mutate(
      { id: category.id },
      {
        onSuccess: () => {
          toast.success("Categoria removida");
          setDeleteTarget(null);
        },
        onError: (error) => {
          const { message, usageCount } = getApiErrorPayload(error);
          if (typeof usageCount === "number") {
            setDeleteTarget(null);
            setReassignConflict({ category, usageCount });
            setReassignToId("");
            return;
          }
          toast.error(message || "Erro ao remover categoria");
        },
      },
    );
  };

  const reassignOptions = reassignConflict
    ? categories.filter(
        (c) =>
          c.type === reassignConflict.category.type &&
          c.id !== reassignConflict.category.id,
      )
    : [];

  const handleConfirmReassign = () => {
    if (!reassignConflict || !reassignToId) return;

    deleteCategory.mutate(
      { id: reassignConflict.category.id, reassignToCategoryId: reassignToId },
      {
        onSuccess: (result: { reassignedTransactions?: number }) => {
          toast.success(
            `Categoria removida. ${result?.reassignedTransactions ?? reassignConflict.usageCount} transações reclassificadas.`,
          );
          setReassignConflict(null);
        },
        onError: (error) => {
          const { message } = getApiErrorPayload(error);
          toast.error(message || "Erro ao reclassificar transações");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Categorias ({categories.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              Toda transação precisa de uma categoria válida cadastrada aqui.
            </p>
          </div>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}
        >
          <DialogTrigger asChild>
            <CreateActionButton
              size="sm"
              label="Nova Categoria"
              onClick={() => setIsFormOpen(true)}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Atualize o nome da categoria. Todas as transações vinculadas serão atualizadas junto."
                  : "Crie uma nova categoria de receita ou despesa."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Nome</Label>
                <Input
                  id="category-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Assinaturas, Pets..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select
                  value={formType}
                  onValueChange={(v: TransactionType) => setFormType(v)}
                  disabled={!!editingCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ícone</Label>
                <IconPicker
                  options={CATEGORY_ICON_OPTIONS}
                  value={formIcon}
                  onChange={setFormIcon}
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor="category-is-transfer">
                    Não contar nos totais
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Para movimentações como investimentos: fica visível no
                    extrato, mas não entra em despesas, economia ou saldo.
                  </p>
                </div>
                <Switch
                  id="category-is-transfer"
                  checked={formIsTransfer}
                  onCheckedChange={setFormIsTransfer}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {editingCategory ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryColumn
          title="Despesas"
          type="expense"
          categories={expenseCategories}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
        <CategoryColumn
          title="Receitas"
          type="income"
          categories={incomeCategories}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      <Dialog
        open={!!reassignConflict}
        onOpenChange={(open) => !open && setReassignConflict(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reclassificar transações</DialogTitle>
            <DialogDescription>
              A categoria "{reassignConflict?.category.name}" possui{" "}
              {reassignConflict?.usageCount}{" "}
              {reassignConflict?.usageCount === 1 ? "transação" : "transações"}{" "}
              vinculadas. Escolha para qual categoria elas devem ser
              reclassificadas antes da exclusão.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Categoria de destino</Label>
              <Select value={reassignToId} onValueChange={setReassignToId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {reassignOptions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhuma outra categoria disponível
                    </SelectItem>
                  ) : (
                    reassignOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {resolveCategoryIcon(c, c.type)} {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignConflict(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReassign}
              disabled={!reassignToId || deleteCategory.isPending}
            >
              Reclassificar e excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deleteTarget?.name}
              "? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-background hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
