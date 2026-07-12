import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { SpendingLimit } from "../types/finance";

export function useSpendingLimits(year?: string, month?: string) {
  return useQuery({
    queryKey: ["spending-limits", year, month],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year && year !== "all") params.append("year", year);
      if (month && month !== "all") params.append("month", month);

      const { data } = await api.get<SpendingLimit[]>(
        `/spending-limits?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useUpdateSpendingLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryName,
      limitAmount,
    }: {
      categoryName: string;
      limitAmount: number;
    }) => {
      const { data } = await api.patch<SpendingLimit>(
        `/spending-limits/${encodeURIComponent(categoryName)}`,
        { limitAmount },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spending-limits"] });
    },
  });
}
