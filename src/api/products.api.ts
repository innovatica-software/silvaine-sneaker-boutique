import { apiRequest, resolveAssetUrls } from './client';
import type {
  Paginated,
  Product,
  ProductQuery,
  Review,
} from './types';

/**
 * Image URLs are resolved here rather than in each component: the API stores
 * host-independent paths, and exactly one place should know how to turn them
 * back into something an `<img src>` can load.
 */
export function withResolvedImages(product: Product): Product {
  return { ...product, images: resolveAssetUrls(product.images) };
}

function toQuery(query: ProductQuery): Record<string, string | number | boolean | undefined> {
  return {
    page: query.page,
    limit: query.limit,
    category: query.category,
    search: query.search,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    isNew: query.isNew,
    isBestSeller: query.isBestSeller,
    isTrending: query.isTrending,
  };
}

export const productsApi = {
  /**
   * Filtering, sorting and paging all happen on the server now. The old
   * storefront downloaded every active product on each visit and filtered in
   * the browser, which was fine at 15 products and would not have been at
   * 1,500.
   */
  async list(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const page = await apiRequest<Paginated<Product>>('/products', {
      query: toQuery(query),
      anonymous: true,
    });

    return { ...page, data: page.data.map(withResolvedImages) };
  },

  async bySlug(slug: string): Promise<Product> {
    return withResolvedImages(
      await apiRequest<Product>(`/products/${encodeURIComponent(slug)}`, {
        anonymous: true,
      }),
    );
  },

  reviews(
    productId: string,
    query: { page?: number; limit?: number } = {},
  ): Promise<Paginated<Review>> {
    return apiRequest<Paginated<Review>>(`/products/${productId}/reviews`, {
      query,
      anonymous: true,
    });
  },
};
