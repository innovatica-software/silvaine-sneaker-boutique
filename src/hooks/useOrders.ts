import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, ordersApi } from '@/api';
import type { CreateOrderInput, Order, OrderStatus, Paginated } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

/** The customer's own order history — a page the app never had before. */
export const useMyOrders = (
  query: { page?: number; limit?: number; status?: OrderStatus } = {},
) => {
  const { isAuthenticated } = useAuth();

  return useQuery<Paginated<Order>>({
    queryKey: ['orders', 'mine', query],
    queryFn: () => ordersApi.mine(query),
    enabled: isAuthenticated,
    placeholderData: (previous) => previous,
  });
};

/**
 * One order, by id. Ownership is checked server-side, so a guessed id belonging
 * to someone else comes back 403 rather than rendering.
 */
export const useOrder = (id: string | undefined) => {
  const { isAuthenticated } = useAuth();

  return useQuery<Order>({
    queryKey: ['orders', 'detail', id],
    queryFn: () => ordersApi.byId(id as string),
    enabled: isAuthenticated && Boolean(id),
    retry: (failureCount, error) =>
      error instanceof ApiError && (error.isNotFound || error.isForbidden)
        ? false
        : failureCount < 2,
  });
};

/**
 * Places an order.
 *
 * The request carries product ids, sizes and quantities — never a price. Every
 * monetary value on the response was computed by the server from the database,
 * which is the whole point of the endpoint existing.
 *
 * The product cache is invalidated on success because placing an order
 * decrements stock, and a stale "3 left" badge would be wrong the moment the
 * confirmation renders.
 */
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.create(input),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', 'detail', order.id], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};
