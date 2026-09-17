import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { errorMessage, wishlistApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

const TOAST_STYLE = {
  background: '#141414',
  border: '1px solid rgba(201,169,110,0.2)',
  color: '#F5F5F5',
};

/**
 * Saved products for the signed-in customer.
 *
 * The toggle is a single server call now. Previously the browser read its own
 * cached array, decided whether this was an add or a remove, and issued the
 * matching write — so two quick clicks could both see "not saved" and both try
 * to insert, hitting the unique constraint.
 */
export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.productIds(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });

  const toggleWishlist = useMutation({
    mutationFn: (productId: string) => wishlistApi.toggle(productId),
    onSuccess: (result) => {
      // The server's answer is authoritative, so the cache is patched from it
      // rather than from what the button assumed.
      queryClient.setQueryData<string[]>(['wishlist'], (current = []) =>
        result.inWishlist
          ? [...new Set([...current, result.productId])]
          : current.filter((id) => id !== result.productId),
      );

      toast.success(
        result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
        { style: TOAST_STYLE },
      );
    },
    onError: (error) => {
      toast.error(errorMessage(error, 'Could not update your wishlist.'), {
        style: TOAST_STYLE,
      });
    },
  });

  const isWishlisted = (productId: string) => wishlistItems.includes(productId);

  return { wishlistItems, isLoading, toggleWishlist, isWishlisted };
};

/** The full saved-product records, for a wishlist page. */
export const useWishlistItems = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['wishlist', 'items'],
    queryFn: () => wishlistApi.items(),
    enabled: isAuthenticated,
  });
};
