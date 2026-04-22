import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Investment, InvestmentSummary } from "../types/finance";

const isFeatureEnabled = (value: unknown) => value === "true" || value === "1";
const INVESTMENTS_ENABLED = isFeatureEnabled(
  import.meta.env.VITE_FEATURE_INVESTMENTS,
);

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const { data } = await api.get<Investment[]>("/investments");
      return data;
    },
    enabled: INVESTMENTS_ENABLED,
  });
}

export function useInvestmentSummary() {
  return useQuery({
    queryKey: ["investments-summary"],
    queryFn: async () => {
      const { data } = await api.get<InvestmentSummary[]>(
        "/investments/summary",
      );
      return data;
    },
    enabled: INVESTMENTS_ENABLED,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInvestment: Omit<Investment, "id">) => {
      if (!INVESTMENTS_ENABLED) {
        throw new Error("Módulo de investimentos está desativado.");
      }
      const { data } = await api.post("/investments", newInvestment);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["investments-summary"] });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!INVESTMENTS_ENABLED) {
        throw new Error("Módulo de investimentos está desativado.");
      }
      await api.delete(`/investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["investments-summary"] });
    },
  });
}
