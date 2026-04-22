import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

export type MultiStateBadgeStatus = "idle" | "loading" | "success" | "error";

export interface MultiStateBadgeProps extends ButtonProps {
  status?: MultiStateBadgeStatus;
  successText?: string;
  errorText?: string;
}

export const MultiStateBadge = React.forwardRef<
  HTMLButtonElement,
  MultiStateBadgeProps
>(
  (
    {
      status = "idle",
      children,
      className,
      successText,
      errorText,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        className={cn("relative overflow-hidden transition-all", className)}
        disabled={disabled || status !== "idle"}
        {...props}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              {children}
            </motion.div>
          )}
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center gap-2 font-medium"
            >
              <Check className="h-4 w-4" />
              {successText && <span>{successText}</span>}
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center gap-2 font-medium"
            >
              <X className="h-4 w-4" />
              {errorText && <span>{errorText}</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  },
);
MultiStateBadge.displayName = "MultiStateBadge";
