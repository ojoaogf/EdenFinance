import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "../types/finance";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => ({
      id: user?.id ?? "",
      email: user?.email ?? "",
      fullName:
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.fullName as string | undefined) ??
        undefined,
      isApproved: true,
    }),
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { fullName: string }) => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: response, error } = await supabase.auth.updateUser({
        data: { full_name: data.fullName },
      });

      if (error) {
        throw error;
      }

      return response.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
