import { apiRequest, resolveAssetUrl } from './client';
import { withResolvedImages } from './products.api';
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
  ProductImage,
  ProductInput,
  Review,
  Role,
} from './types';

interface PageQuery {
  page?: number;
  limit?: number;
}

function withResolvedItemImages(order: Order): Order {
  if (!order.items) return order;

  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productImage: item.productImage
        ? resolveAssetUrl(item.productImage)
        : null,
    })),
  };
}

/**
 * The back office surface. Every one of these used to be a direct PostgREST
 * call from a component with no server-side authorization beyond RLS; each is
 * now an `/admin/*` route behind `@Roles('admin')`.
 */
export const adminApi = {
  stats(): Promise<AdminStats> {
    return apiRequest<AdminStats>('/admin/stats');
  },

  analytics(months = 6): Promise<AnalyticsOverview> {
    return apiRequest<AnalyticsOverview>('/admin/analytics/overview', {
      query: { months },
    });
  },

  salesByCategory(months = 6): Promise<CategorySales[]> {
    return apiRequest<CategorySales[]>('/admin/analytics/sales-by-category', {
      query: { months },
    });
  },

  // --- products -------------------------------------------------------------

  async products(query: AdminProductQuery = {}): Promise<Paginated<Product>> {
    const page = await apiRequest<Paginated<Product>>('/admin/products', {
      query: {
        page: query.page,
        limit: query.limit,
        search: query.search,
        category: query.category,
        sort: query.sort,
        isActive: query.isActive,
      },
    });

    return { ...page, data: page.data.map(withResolvedImages) };
  },

  /**
   * Product and images are saved together in one server-side transaction. The
   * old flow inserted the product, then deleted every image row, then
   * re-inserted them — three unguarded round-trips that could leave a product
   * with no images at all if the tab was closed in between.
   */
  async createProduct(input: ProductInput): Promise<Product> {
    return withResolvedImages(
      await apiRequest<Product>('/admin/products', {
        method: 'POST',
        body: input,
      }),
    );
  },

  async updateProduct(
    id: string,
    input: Partial<ProductInput>,
  ): Promise<Product> {
    return withResolvedImages(
      await apiRequest<Product>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: input,
      }),
    );
  },

  /** 409 when the product appears in any order — deactivate it instead. */
  deleteProduct(id: string): Promise<void> {
    return apiRequest<void>(`/admin/products/${id}`, { method: 'DELETE' });
  },

  /** Real file upload, which the admin UI never had — it took pasted URLs. */
  async uploadProductImage(
    id: string,
    file: File,
    altText?: string,
  ): Promise<ProductImage> {
    const form = new FormData();
    form.append('file', file);
    if (altText) form.append('altText', altText);

    const image = await apiRequest<ProductImage>(
      `/admin/products/${id}/images/upload`,
      { method: 'POST', formData: form },
    );

    return { ...image, url: resolveAssetUrl(image.url) };
  },

  async addProductImage(
    id: string,
    input: { url: string; altText?: string; sortOrder?: number },
  ): Promise<ProductImage> {
    const image = await apiRequest<ProductImage>(
      `/admin/products/${id}/images`,
      { method: 'POST', body: input },
    );

    return { ...image, url: resolveAssetUrl(image.url) };
  },

  deleteProductImage(id: string, imageId: string): Promise<void> {
    return apiRequest<void>(`/admin/products/${id}/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  inventory(query: PageQuery = {}): Promise<Paginated<InventoryItem>> {
    return apiRequest<Paginated<InventoryItem>>('/admin/inventory', { query });
  },

  // --- categories -----------------------------------------------------------

  categories(): Promise<Category[]> {
    return apiRequest<Category[]>('/admin/categories');
  },

  createCategory(input: CategoryInput): Promise<Category> {
    return apiRequest<Category>('/admin/categories', {
      method: 'POST',
      body: input,
    });
  },

  /** The update the old admin never offered, despite the policy existing. */
  updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
    return apiRequest<Category>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: input,
    });
  },

  deleteCategory(id: string): Promise<void> {
    return apiRequest<void>(`/admin/categories/${id}`, { method: 'DELETE' });
  },

  // --- orders ---------------------------------------------------------------

  async orders(
    query: PageQuery & { status?: OrderStatus; paymentStatus?: PaymentStatus } = {},
  ): Promise<Paginated<Order>> {
    const page = await apiRequest<Paginated<Order>>('/admin/orders', { query });
    return { ...page, data: page.data.map(withResolvedItemImages) };
  },

  async order(id: string): Promise<Order> {
    return withResolvedItemImages(await apiRequest<Order>(`/admin/orders/${id}`));
  },

  /** Rejected with 422 when the transition is not allowed. */
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiRequest<Order>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    return apiRequest<Order>(`/admin/orders/${id}/payment-status`, {
      method: 'PATCH',
      body: { paymentStatus },
    });
  },

  // --- people ---------------------------------------------------------------

  customers(
    query: PageQuery & { search?: string } = {},
  ): Promise<Paginated<Customer>> {
    return apiRequest<Paginated<Customer>>('/admin/customers', { query });
  },

  userRoles(userId: string): Promise<Role[]> {
    return apiRequest<Role[]>(`/admin/users/${userId}/roles`);
  },

  grantRole(userId: string, role: Role): Promise<Role[]> {
    return apiRequest<Role[]>(`/admin/users/${userId}/roles`, {
      method: 'POST',
      body: { role },
    });
  },

  revokeRole(userId: string, role: Role): Promise<Role[]> {
    return apiRequest<Role[]>(`/admin/users/${userId}/roles/${role}`, {
      method: 'DELETE',
    });
  },

  // --- reviews and enquiries ------------------------------------------------

  reviews(query: PageQuery = {}): Promise<Paginated<Review>> {
    return apiRequest<Paginated<Review>>('/admin/reviews', { query });
  },

  deleteReview(id: string): Promise<void> {
    return apiRequest<void>(`/admin/reviews/${id}`, { method: 'DELETE' });
  },

  contactMessages(
    query: PageQuery & { isHandled?: boolean } = {},
  ): Promise<Paginated<ContactMessage>> {
    return apiRequest<Paginated<ContactMessage>>('/admin/contact-messages', {
      query,
    });
  },

  setContactMessageHandled(
    id: string,
    isHandled: boolean,
  ): Promise<ContactMessage> {
    return apiRequest<ContactMessage>(`/admin/contact-messages/${id}`, {
      method: 'PATCH',
      body: { isHandled },
    });
  },
};
