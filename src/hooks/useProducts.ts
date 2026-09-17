import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ApiError, categoriesApi, productsApi, settingsApi } from '@/api';
import type {
  Category,
  Paginated,
  Product,
  ProductQuery,
  StoreSettings,
} from '@/api';

export type { Product, Category, ProductQuery, StoreSettings };

const CATALOGUE_STALE_MS = 1000 * 60 * 5;
const SETTINGS_STALE_MS = 1000 * 60 * 30;

/**
 * Catalogue listing.
 *
 * The query object is part of the cache key, so changing a filter fetches that
 * page rather than refiltering a full catalogue the browser had downloaded.
 * `placeholderData` keeps the previous page on screen while the next one loads,
 * which is what stops the grid from collapsing to a spinner on every keystroke.
 */
export const useProducts = (query: ProductQuery = {}) =>
  useQuery<Paginated<Product>>({
    queryKey: ['products', query],
    queryFn: () => productsApi.list(query),
    staleTime: CATALOGUE_STALE_MS,
    placeholderData: (previous) => previous,
  });

/**
 * The shop grid's infinite scroll, backed by real pagination.
 *
 * The page keeps the same "scroll and more appear" behaviour it always had, but
 * the pages now come from the server one at a time instead of being slices of a
 * full catalogue the browser had already downloaded. Changing a filter starts a
 * new query rather than re-slicing an array.
 */
export const useInfiniteProducts = (
  query: Omit<ProductQuery, 'page'> = {},
  pageSize = 12,
) =>
  useInfiniteQuery({
    queryKey: ['products', 'infinite', { ...query, limit: pageSize }],
    queryFn: ({ pageParam }) =>
      productsApi.list({ ...query, page: pageParam, limit: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    staleTime: CATALOGUE_STALE_MS,
  });

/**
 * A single product by slug.
 *
 * `retry: false` on a 404 matters: the old hook returned `null` for *any*
 * failure, so a network outage and a deleted product were indistinguishable and
 * both rendered "Product Not Found". Here a real 404 resolves immediately and
 * anything else stays an error the page can report honestly.
 */
export const useProduct = (slug: string) =>
  useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => productsApi.bySlug(slug),
    enabled: Boolean(slug),
    retry: (failureCount, error) =>
      error instanceof ApiError && error.isNotFound ? false : failureCount < 2,
  });

export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
    staleTime: 1000 * 60 * 10,
  });

/**
 * Store configuration — currency, shipping rule, low-stock threshold.
 *
 * Long-lived in cache because it only changes on deploy, and every consumer
 * treats it as a display hint: the server recomputes shipping and totals at
 * checkout regardless of what the browser was last told.
 */
export const useSettings = () =>
  useQuery<StoreSettings>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    staleTime: SETTINGS_STALE_MS,
  });

/** Sensible constants for the brief window before settings arrive. */
export const SETTINGS_FALLBACK: StoreSettings = {
  storeName: 'Silvaine',
  brand: 'Silvaine',
  currency: 'EUR',
  currencySymbol: '€',
  defaultCountry: 'IT',
  shippingCost: 15,
  freeShippingThreshold: 500,
  lowStockThreshold: 10,
  taxRate: 0,
};

/** `subtotal >= threshold ? 0 : cost`, mirroring the server's rule. */
export const previewShipping = (
  subtotal: number,
  settings: StoreSettings,
): number =>
  subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
