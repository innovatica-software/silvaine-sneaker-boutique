import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api';
import type { Profile, UpdateProfileInput } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

/**
 * The customer's own profile.
 *
 * `profiles` always carried nine address and contact columns and an UPDATE
 * policy, but the only code that ever read it was the admin customer list —
 * customers had no way to set their own name, phone or address, which is why
 * checkout re-collected the whole address every single time (spec G-06).
 */
export const useProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(input),
    onSuccess: async (profile) => {
      queryClient.setQueryData(['profile'], profile);
      // The header greets the customer by name, and that comes from /auth/me.
      await refreshUser();
    },
  });
};
