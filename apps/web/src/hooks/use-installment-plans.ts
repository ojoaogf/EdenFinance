import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { InstallmentPlan } from "../types/finance";

export interface CreateInstallmentPlanPayload {
  description: string;
  category: string;
  paymentType?: string;
  installmentAmount: number;
  totalInstallments: number;
  startDate: string;
}

export interface UpdateInstallmentPlanPayload {
  description?: string;
  category?: string;
  paymentType?: string;
}

export function useInstallmentPlans() {
  return useQuery({
    queryKey: ["installment-plans"],
    queryFn: async () => {
      const { data } = await api.get<InstallmentPlan[]>("/installment-plans");
      return data;
    },
  });
}

const invalidateAfterMutation = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: ["installment-plans"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["expenses-by-category"] });
  queryClient.invalidateQueries({ queryKey: ["monthly-evolution"] });
  queryClient.invalidateQueries({ queryKey: ["spending-limits"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
};

export function useCreateInstallmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInstallmentPlanPayload) => {
      const { data } = await api.post<InstallmentPlan>(
        "/installment-plans",
        payload,
      );
      return data;
    },
    onSuccess: () => invalidateAfterMutation(queryClient),
  });
}

export function useUpdateInstallmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateInstallmentPlanPayload & { id: string }) => {
      const { data: response } = await api.patch<InstallmentPlan>(
        `/installment-plans/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => invalidateAfterMutation(queryClient),
  });
}

export function useDeleteInstallmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/installment-plans/${id}`);
      return data;
    },
    onSuccess: () => invalidateAfterMutation(queryClient),
  });
}
