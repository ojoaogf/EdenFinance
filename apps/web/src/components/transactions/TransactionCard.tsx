import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Transaction } from "@/types/finance";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CreditCard,
  Edit2,
  FileText,
  Paperclip,
  QrCode,
  Share2,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";

interface TransactionCardProps {
  transaction: Transaction;
  categoryName: string;
  categoryIcon: string;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionCard({
  transaction,
  categoryName,
  categoryIcon,
  onDelete,
  onEdit,
}: TransactionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock Payment Method inference
  const getPaymentMethod = () => {
    if (transaction.paymentType) {
      const type = transaction.paymentType.toLowerCase();
      if (type.includes("pix"))
        return { label: transaction.paymentType, icon: QrCode };
      if (type.includes("crédito"))
        return { label: transaction.paymentType, icon: CreditCard };
      if (type.includes("débito"))
        return { label: transaction.paymentType, icon: CreditCard };
      return { label: transaction.paymentType, icon: Wallet };
    }

    // Fallback if no payment type
    const tags = transaction.tags || [];
    if (tags.some((t) => t.toLowerCase().includes("pix")))
      return { label: "Pix", icon: QrCode };
    if (tags.some((t) => t.toLowerCase().includes("crédito")))
      return { label: "Crédito", icon: CreditCard };
    if (tags.some((t) => t.toLowerCase().includes("débito")))
      return { label: "Débito", icon: CreditCard };
    return { label: "Conta", icon: Wallet };
  };

  const { label: paymentLabel, icon: PaymentIcon } = getPaymentMethod();
  const hasAttachments = transaction.tags?.includes("anexo"); // Mock trigger
  const isSplit = transaction.tags?.includes("split"); // Mock trigger

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group">
      <div
        className={cn(
          "relative flex items-center gap-4 p-4 rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20",
          isOpen && "shadow-md border-primary/20 bg-muted/30",
        )}
      >
        {/* Icon */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-inset",
              transaction.type === "income"
                ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 ring-rose-500/20",
            )}
          >
            {categoryIcon}
          </div>
        </div>

        {/* Main Info */}
        <div
          className="flex-1 min-w-0 grid gap-1 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">
              {transaction.description}
            </h3>
            {transaction.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 h-5"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <PaymentIcon className="h-3 w-3" />
              {paymentLabel}
            </span>
            <span>•</span>
            <span>{categoryName}</span>
            {hasAttachments && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-primary">
                  <Paperclip className="h-3 w-3" />1 anexo
                </span>
              </>
            )}
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={cn(
                "font-bold text-lg tabular-nums",
                transaction.type === "income"
                  ? "text-emerald-600"
                  : "text-rose-600",
              )}
            >
              {transaction.type === "income" ? "+" : "-"}
              {Number(transaction.amount).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            {isSplit && (
              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Share2 className="h-3 w-3" />
                Split
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(transaction)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-background hover:bg-destructive/90"
                    onClick={() => onDelete(transaction.id)}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="mt-2 ml-16 p-4 rounded-xl bg-muted/50 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1">
                Detalhes do Pagamento
              </p>
              <div className="flex items-center gap-2 font-medium">
                <PaymentIcon className="h-4 w-4" />
                {paymentLabel}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Data e Hora</p>
              <p className="font-medium">
                {transaction.createdAt
                  ? new Date(transaction.createdAt).toLocaleString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : new Date(transaction.date).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </p>
            </div>
          </div>

          {hasAttachments && (
            <div>
              <p className="text-muted-foreground mb-2">Anexos</p>
              <div className="flex gap-2">
                <div className="h-16 w-16 rounded-lg bg-background border flex items-center justify-center cursor-pointer hover:border-primary">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
