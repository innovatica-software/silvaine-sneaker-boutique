import { apiRequest } from './client';
import type { Category, StoreSettings } from './types';

export const categoriesApi = {
  list(): Promise<Category[]> {
    return apiRequest<Category[]>('/categories', { anonymous: true });
  },
};

export const settingsApi = {
  /**
   * The shipping rule, currency and low-stock threshold that used to be
   * hardcoded in four separate frontend files. Fetching them means the figure
   * the customer sees in the cart and the one the server charges at checkout
   * come from the same place.
   */
  get(): Promise<StoreSettings> {
    return apiRequest<StoreSettings>('/settings', { anonymous: true });
  },
};
