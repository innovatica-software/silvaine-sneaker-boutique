import { apiRequest, resolveAssetUrl } from './client';
import type {
  CreateContactMessageInput,
  CreateOrderInput,
  CreateReviewInput,
  Order,
  OrderStatus,
  Paginated,
  Profile,
  Review,
  UpdateProfileInput,
  UpdateReviewInput,
  WishlistItem,
} from './types';

/** Line-item snapshots carry their own image path, resolved the same way. */
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

export const ordersApi = {
  /**
   * The endpoint that did not exist before. Checkout used to fabricate an id
   * client-side, clear the cart and navigate away without touching the network,
   * so no order was ever recorded.
   */
  async create(input: CreateOrderInput): Promise<Order> {
    return withResolvedItemImages(
      await apiRequest<Order>('/orders', { method: 'POST', body: input }),
    );
  },

  async mine(
    query: { page?: number; limit?: number; status?: OrderStatus } = {},
  ): Promise<Paginated<Order>> {
    const page = await apiRequest<Paginated<Order>>('/orders/me', { query });
    return { ...page, data: page.data.map(withResolvedItemImages) };
  },

  async byId(id: string): Promise<Order> {
    return withResolvedItemImages(await apiRequest<Order>(`/orders/${id}`));
  },
};

export const profileApi = {
  get(): Promise<Profile> {
    return apiRequest<Profile>('/profile/me');
  },

  update(input: UpdateProfileInput): Promise<Profile> {
    return apiRequest<Profile>('/profile/me', { method: 'PATCH', body: input });
  },
};

export const wishlistApi = {
  /** Ids only — all the heart states need, and far less to transfer. */
  productIds(): Promise<string[]> {
    return apiRequest<string[]>('/wishlist/product-ids');
  },

  items(): Promise<WishlistItem[]> {
    return apiRequest<WishlistItem[]>('/wishlist');
  },

  /**
   * One call instead of the old read-then-insert-or-delete, which raced with
   * itself if the heart was clicked twice quickly.
   */
  toggle(productId: string): Promise<{ productId: string; inWishlist: boolean }> {
    return apiRequest(`/wishlist/${productId}/toggle`, { method: 'POST' });
  },

  remove(productId: string): Promise<void> {
    return apiRequest<void>(`/wishlist/${productId}`, { method: 'DELETE' });
  },
};

export const reviewsApi = {
  create(input: CreateReviewInput): Promise<Review> {
    return apiRequest<Review>('/reviews', { method: 'POST', body: input });
  },

  update(id: string, input: UpdateReviewInput): Promise<Review> {
    return apiRequest<Review>(`/reviews/${id}`, {
      method: 'PATCH',
      body: input,
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/reviews/${id}`, { method: 'DELETE' });
  },
};

export const contactApi = {
  send(input: CreateContactMessageInput): Promise<{ id: string }> {
    return apiRequest<{ id: string }>('/contact', {
      method: 'POST',
      body: input,
      anonymous: true,
    });
  },
};
