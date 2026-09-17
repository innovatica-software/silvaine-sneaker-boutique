/**
 * The API contract, as TypeScript.
 *
 * This replaces `src/integrations/supabase/types.ts` — 568 generated lines that
 * described database *tables*. These describe the DTOs the API actually
 * returns, which is a different and more useful thing: the server decides the
 * shape, and nothing here leaks a column the storefront has no business seeing.
 *
 * Kept hand-written and small rather than generated from the OpenAPI document,
 * because only this slice is consumed. If it ever drifts, `npm run build` on
 * the API publishes the spec at `/docs-json` to check against.
 */

// --- envelopes --------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// --- auth -------------------------------------------------------------------

export type Role = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  roles: Role[];
  fullName: string | null;
  emailVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthSession extends TokenPair {
  user: AuthUser;
}

// --- catalogue --------------------------------------------------------------

export interface ProductColor {
  name: string;
  hex: string;
}

/**
 * Already flattened by the API: `category` is the name, `images` is a sorted
 * array of URLs, and `discountPrice` is absent rather than null. The old
 * client-side `mapProduct` that did all of this is gone.
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  category: string;
  categoryId?: string | null;
  price: number;
  discountPrice?: number;
  stock: number;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  /**
   * Active products in this category. Present on the public listing, which the
   * shop sidebar needs now that it can no longer count a locally-held
   * catalogue. Absent on the admin listing.
   */
  productCount?: number;
  createdAt: string;
}

export type ProductSort =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'popularity'
  | 'rating';

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  isNew?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
}

export interface AdminProductQuery extends ProductQuery {
  isActive?: boolean;
}

export interface ProductInput {
  name: string;
  slug?: string;
  description?: string;
  brand?: string;
  sku?: string;
  categoryId?: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  sizes?: string[];
  colors?: ProductColor[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
  images?: string[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  isLowStock: boolean;
  isActive: boolean;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

// --- orders -----------------------------------------------------------------

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Which statuses an order can legally move to next. Mirrors
 * `ORDER_STATUS_TRANSITIONS` on the API so the admin dropdown only offers moves
 * the server will accept — the server still rejects anything else with a 422,
 * this only keeps the UI from presenting a dead end.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  shippingPhone: string | null;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

/** Deliberately carries no prices — the server computes every total. */
export interface CreateOrderInput {
  items: {
    productId: string;
    size?: string;
    color?: string;
    quantity: number;
  }[];
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone?: string;
  paymentMethod?: string;
  notes?: string;
}

// --- reviews ----------------------------------------------------------------

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorName: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  body?: string;
}

// --- profile and customers --------------------------------------------------

export interface Profile {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateProfileInput = Partial<
  Pick<
    Profile,
    | 'fullName'
    | 'avatarUrl'
    | 'phone'
    | 'addressLine1'
    | 'addressLine2'
    | 'city'
    | 'state'
    | 'postalCode'
    | 'country'
  >
>;

/** Includes the email address, which PostgREST could never expose. */
export interface Customer {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  /** Projected into the same flattened shape as every other product. */
  product: Product;
}

// --- admin dashboard --------------------------------------------------------

export interface RecentOrder {
  id: string;
  status: OrderStatus;
  total: number;
  shipping_name: string | null;
  created_at: string;
}

/** snake_case is the original `get_admin_stats()` contract, preserved. */
export interface AdminStats {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  low_stock_products: number;
  pending_orders: number;
  recent_orders: RecentOrder[];
}

export interface AnalyticsPoint {
  monthKey: string;
  month: string;
  revenue: number;
  grossValue: number;
  orders: number;
  newCustomers: number;
}

export interface AnalyticsOverview {
  series: AnalyticsPoint[];
  totalRevenue: number;
  totalGrossValue: number;
  totalOrders: number;
  totalNewCustomers: number;
  averageOrderValue: number;
}

export interface CategorySales {
  name: string;
  value: number;
  revenue: number;
}

// --- settings and contact ---------------------------------------------------

export interface StoreSettings {
  storeName: string;
  brand: string;
  currency: string;
  currencySymbol: string;
  defaultCountry: string;
  shippingCost: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  taxRate: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isHandled: boolean;
  createdAt: string;
}

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}
