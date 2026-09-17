import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { adminApi } from '@/api';
import type {
  AdminProductQuery,
  AdminStats,
  AnalyticsOverview,
  Category,
  CategoryInput,
  CategorySales,
  ContactMessage,
  Customer,
  InventoryItem,
  Order,
  OrderStatus,
  Paginated,
  PaymentStatus,
  Product,
  ProductInput,
  Review,
  Role,
} from '@/api';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Every admin query is namespaced under `['admin', ...]` so signing out can
 * drop the whole back office in one call.
 */
const key = (...parts: unknown[]) => ['admin', ...parts];

/**
 * Whether the signed-in user is an admin.
 *
 * Kept as a hook for the components that already called it, but it is no longer
 * a network request: roles ride in the JWT and are already in the auth context.
 * The old version was an `rpc('has_role')` round-trip cached for ten minutes,
 * which meant a freshly revoked admin kept their access for that long.
 */
export const useAdminCheck = () => {
  const { isAdmin, loading } = useAuth();
  return { data: isAdmin, isLoading: loading };
};

// --- dashboard --------------------------------------------------------------

export const useAdminStats = () =>
  useQuery<AdminStats>({
    queryKey: key('stats'),
    queryFn: () => adminApi.stats(),
    staleTime: 1000 * 60 * 2,
  });

export const useAdminAnalytics = (months = 6) =>
  useQuery<AnalyticsOverview>({
    queryKey: key('analytics', months),
    queryFn: () => adminApi.analytics(months),
    staleTime: 1000 * 60 * 5,
  });

export const useAdminCategorySales = (months = 6) =>
  useQuery<CategorySales[]>({
    queryKey: key('category-sales', months),
    queryFn: () => adminApi.salesByCategory(months),
    staleTime: 1000 * 60 * 5,
  });

// --- products ---------------------------------------------------------------

export const useAdminProducts = (query: AdminProductQuery = {}) =>
  useQuery<Paginated<Product>>({
    queryKey: key('products', query),
    queryFn: () => adminApi.products(query),
    placeholderData: (previous) => previous,
  });

/**
 * Invalidates both the admin list and the public catalogue: an admin edit is
 * immediately visible in the storefront, and leaving the storefront cache alone
 * was how the old UI could show a product it had just renamed under its old
 * name.
 */
function useCatalogueMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, unknown, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables>({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: key('products') });
      void queryClient.invalidateQueries({ queryKey: key('inventory') });
      void queryClient.invalidateQueries({ queryKey: key('stats') });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['product'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateProduct = () =>
  useCatalogueMutation((input: ProductInput) => adminApi.createProduct(input));

export const useUpdateProduct = () =>
  useCatalogueMutation((input: { id: string; data: Partial<ProductInput> }) =>
    adminApi.updateProduct(input.id, input.data),
  );

/** Refused with 409 when the product appears in any order. */
export const useDeleteProduct = () =>
  useCatalogueMutation((id: string) => adminApi.deleteProduct(id));

export const useUploadProductImage = () =>
  useCatalogueMutation((input: { id: string; file: File; altText?: string }) =>
    adminApi.uploadProductImage(input.id, input.file, input.altText),
  );

export const useAdminInventory = (query: { page?: number; limit?: number } = {}) =>
  useQuery<Paginated<InventoryItem>>({
    queryKey: key('inventory', query),
    queryFn: () => adminApi.inventory(query),
    placeholderData: (previous) => previous,
  });

// --- categories -------------------------------------------------------------

export const useAdminCategories = () =>
  useQuery<Category[]>({
    queryKey: key('categories'),
    queryFn: () => adminApi.categories(),
  });

function useCategoryMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key('categories') });
      // Products carry the category name, and deleting a category orphans them.
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: key('products') });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export const useCreateCategory = () =>
  useCategoryMutation((input: CategoryInput) => adminApi.createCategory(input));

export const useUpdateCategory = () =>
  useCategoryMutation((input: { id: string; data: Partial<CategoryInput> }) =>
    adminApi.updateCategory(input.id, input.data),
  );

export const useDeleteCategory = () =>
  useCategoryMutation((id: string) => adminApi.deleteCategory(id));

// --- orders -----------------------------------------------------------------

export const useAdminOrders = (
  query: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
  } = {},
) =>
  useQuery<Paginated<Order>>({
    queryKey: key('orders', query),
    queryFn: () => adminApi.orders(query),
    placeholderData: (previous) => previous,
  });

export const useAdminOrder = (id: string | undefined) =>
  useQuery<Order>({
    queryKey: key('order', id),
    queryFn: () => adminApi.order(id as string),
    enabled: Boolean(id),
  });

function useOrderMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Order>,
) {
  const queryClient = useQueryClient();

  return useMutation<Order, unknown, TVariables>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key('orders') });
      void queryClient.invalidateQueries({ queryKey: key('order') });
      void queryClient.invalidateQueries({ queryKey: key('stats') });
      void queryClient.invalidateQueries({ queryKey: key('analytics') });
      // Cancelling restores stock, so inventory can change here too.
      void queryClient.invalidateQueries({ queryKey: key('inventory') });
      void queryClient.invalidateQueries({ queryKey: key('products') });
    },
  });
}

export const useUpdateOrderStatus = () =>
  useOrderMutation((input: { id: string; status: OrderStatus }) =>
    adminApi.updateOrderStatus(input.id, input.status),
  );

export const useUpdatePaymentStatus = () =>
  useOrderMutation((input: { id: string; paymentStatus: PaymentStatus }) =>
    adminApi.updatePaymentStatus(input.id, input.paymentStatus),
  );

// --- people -----------------------------------------------------------------

export const useAdminCustomers = (
  query: { page?: number; limit?: number; search?: string } = {},
) =>
  useQuery<Paginated<Customer>>({
    queryKey: key('customers', query),
    queryFn: () => adminApi.customers(query),
    placeholderData: (previous) => previous,
  });

export const useCustomerRoles = (userId: string | undefined) =>
  useQuery<Role[]>({
    queryKey: key('roles', userId),
    queryFn: () => adminApi.userRoles(userId as string),
    enabled: Boolean(userId),
  });

/**
 * Role administration — the path that simply did not exist. `user_roles` had no
 * INSERT, UPDATE or DELETE policy at all, so the first admin had to be created
 * out of band and no one could ever be promoted from inside the app (G-12).
 *
 * The server refuses to remove the last admin, or an admin's own admin role.
 */
function useRoleMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Role[]>,
) {
  const queryClient = useQueryClient();

  return useMutation<Role[], unknown, TVariables>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key('roles') });
      void queryClient.invalidateQueries({ queryKey: key('customers') });
    },
  });
}

export const useGrantRole = () =>
  useRoleMutation((input: { userId: string; role: Role }) =>
    adminApi.grantRole(input.userId, input.role),
  );

export const useRevokeRole = () =>
  useRoleMutation((input: { userId: string; role: Role }) =>
    adminApi.revokeRole(input.userId, input.role),
  );

// --- reviews and enquiries --------------------------------------------------

export const useAdminReviews = (query: { page?: number; limit?: number } = {}) =>
  useQuery<Paginated<Review>>({
    queryKey: key('reviews', query),
    queryFn: () => adminApi.reviews(query),
    placeholderData: (previous) => previous,
  });

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key('reviews') });
      // Deleting a review recalculates the product's rating in the same
      // transaction, so the catalogue figures change with it.
      void queryClient.invalidateQueries({ queryKey: key('products') });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};

export const useAdminContactMessages = (
  query: { page?: number; limit?: number; isHandled?: boolean } = {},
) =>
  useQuery<Paginated<ContactMessage>>({
    queryKey: key('contact-messages', query),
    queryFn: () => adminApi.contactMessages(query),
    placeholderData: (previous) => previous,
  });

export const useSetContactMessageHandled = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; isHandled: boolean }) =>
      adminApi.setContactMessageHandled(input.id, input.isHandled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key('contact-messages') });
    },
  });
};
