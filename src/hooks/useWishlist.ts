import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map((item) => item.product_id);
    },
    enabled: !!user,
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be logged in');
      const isWishlisted = wishlistItems.includes(productId);
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        return { added: false };
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { added: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to update wishlist');
    },
  });

  const isWishlisted = (productId: string) => wishlistItems.includes(productId);

  return { wishlistItems, toggleWishlist, isWishlisted };
};
