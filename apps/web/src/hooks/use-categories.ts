import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Category, TransactionType } from "../types/finance";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories");
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      type: TransactionType;
      icon?: string;
      isTransfer?: boolean;
    }) => {
      const { data } = await api.post<Category>("/categories", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      icon?: string;
      isTransfer?: boolean;
    }) => {
      const { data: response } = await api.patch<Category>(
        `/categories/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spending-limits"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reassignToCategoryId,
    }: {
      id: string;
      reassignToCategoryId?: string;
    }) => {
      const params = new URLSearchParams();
      if (reassignToCategoryId) {
        params.set("reassignToCategoryId", reassignToCategoryId);
      }
      const query = params.toString();
      const { data } = await api.delete(
        `/categories/${id}${query ? `?${query}` : ""}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spending-limits"] });
    },
  });
}
