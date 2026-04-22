import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { FinancialGoal } from "../types/finance";

const isFeatureEnabled = (value: unknown) => value === "true" || value === "1";
const GOALS_ENABLED = isFeatureEnabled(import.meta.env.VITE_FEATURE_GOALS);

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data } = await api.get<FinancialGoal[]>("/goals");
      return data;
    },
    enabled: GOALS_ENABLED,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGoal: Omit<FinancialGoal, "id">) => {
      if (!GOALS_ENABLED) {
        throw new Error("Módulo de metas está desativado.");
      }
      const { data } = await api.post("/goals", newGoal);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!GOALS_ENABLED) {
        throw new Error("Módulo de metas está desativado.");
      }
      await api.delete(`/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<FinancialGoal> & { id: string }) => {
      if (!GOALS_ENABLED) {
        throw new Error("Módulo de metas está desativado.");
      }
      const { data: response } = await api.patch(`/goals/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDepositGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      if (!GOALS_ENABLED) {
        throw new Error("Módulo de metas está desativado.");
      }
      const { data } = await api.post(`/goals/${id}/deposit`, { amount });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] }); // Atualiza extrato também
    },
  });
}
