import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, reviewsApi } from '@/api';
import type { CreateReviewInput, Paginated, Review } from '@/api';

/**
 * Reviews for a product.
 *
 * The rows were always there — the storefront just never read them. It rendered
 * the denormalised `rating` and `reviewCount` columns and nothing else, so the
 * text customers had written was stored and never shown (spec G-04).
 */
export const useProductReviews = (
  productId: string | undefined,
  query: { page?: number; limit?: number } = {},
) =>
  useQuery<Paginated<Review>>({
    queryKey: ['reviews', productId, query],
    queryFn: () => productsApi.reviews(productId as string, query),
    enabled: Boolean(productId),
    placeholderData: (previous) => previous,
  });

/**
 * Submits a review — the customer-facing write path that never existed, despite
 * the table, its RLS policies and two triggers all being built for it (G-03).
 *
 * `isVerifiedPurchase` is deliberately not in the input: the server decides it
 * by looking for a delivered order containing the product, because it is a
 * trust badge and a client must not be able to award itself one.
 */
export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewsApi.create(input),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({
        queryKey: ['reviews', review.productId],
      });
      // The product's rating and review count are recalculated server-side in
      // the same transaction, so both catalogue views need re-reading.
      void queryClient.invalidateQueries({ queryKey: ['product'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
