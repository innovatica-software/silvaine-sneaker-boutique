/**
 * The single door between this app and the Silvano API.
 *
 * It replaces `@supabase/supabase-js`, which used to be imported directly by
 * ten different files. Everything the SDK did for free — attaching credentials,
 * refreshing an expired token, turning a failure into something a component can
 * render — has to live somewhere now, and it lives here rather than being
 * scattered across components.
 */

const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

/** Normalised once: every join below assumes no trailing slash. */
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Origin the API is served from, used to resolve the root-relative image paths
 * the local storage driver returns (`/uploads/products/x.jpg`). With the S3
 * driver the API returns absolute URLs and this is never consulted.
 */
export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

const STORAGE_KEY = 'silvaine_auth';
const UPLOADS_PREFIX = '/uploads/';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// --- token storage ----------------------------------------------------------

/**
 * localStorage, matching what the Supabase client did before it
 * (`storage: localStorage, persistSession: true`) and what the API's
 * token-in-body contract expects.
 *
 * The trade-off is deliberate and worth stating plainly: a token in
 * localStorage is readable by any script that manages to run on this origin.
 * Moving the refresh token into an httpOnly cookie would remove that exposure,
 * and is the change to make if the threat model ever justifies the extra
 * cookie/CSRF handling on both sides.
 */
export const tokenStorage = {
  read(): AuthTokens | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<AuthTokens>;

      return parsed.accessToken && parsed.refreshToken
        ? { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
        : null;
    } catch {
      return null;
    }
  },

  write(tokens: AuthTokens): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } catch {
      // Private browsing or a full quota. The session still works for this
      // page load; it simply will not survive a reload.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing useful to do */
    }
  },
};

/**
 * Fired when a refresh fails and the session is gone for good, so `AuthContext`
 * can drop its user without every caller having to handle it.
 */
export const SESSION_EXPIRED_EVENT = 'silvaine:session-expired';

function announceSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

// --- errors -----------------------------------------------------------------

/**
 * Every failure reaches the UI as one of these, so a component never has to
 * guess whether it is holding a `Response`, an `Error` or a parsed body.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Field-level messages from class-validator, when the API sent an array. */
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  /** A network failure, or an origin that refused the request outright. */
  get isNetwork(): boolean {
    return this.status === 0;
  }
}

interface ApiErrorBody {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

function toApiError(status: number, body: unknown): ApiError {
  if (typeof body === 'object' && body !== null) {
    const parsed = body as ApiErrorBody;

    if (Array.isArray(parsed.message)) {
      return new ApiError(
        status,
        parsed.message[0] ?? parsed.error ?? 'Request failed.',
        parsed.message,
      );
    }

    if (typeof parsed.message === 'string') {
      return new ApiError(status, parsed.message);
    }

    if (typeof parsed.error === 'string') {
      return new ApiError(status, parsed.error);
    }
  }

  return new ApiError(status, defaultMessageFor(status));
}

function defaultMessageFor(status: number): string {
  if (status === 0) return 'Cannot reach the server. Check your connection.';
  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have access to this.';
  if (status === 404) return 'Not found.';
  if (status === 429) return 'Too many attempts. Try again shortly.';
  if (status >= 500) return 'Something went wrong on our side.';
  return 'Request failed.';
}

// --- request ----------------------------------------------------------------

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /**
   * Serialised into a query string; null/undefined/'' entries are dropped.
   *
   * Typed as a readonly index rather than `Record<…>` so a plain interface
   * (`{ page?: number }`) can be passed without TypeScript demanding an index
   * signature on it.
   */
  query?: { readonly [key: string]: string | number | boolean | undefined | null };
  /** Skips the Authorization header and the refresh dance entirely. */
  anonymous?: boolean;
  signal?: AbortSignal;
  /** Sent as-is; the browser sets the multipart boundary. */
  formData?: FormData;
}

/**
 * Exactly one refresh runs at a time. Without this, a page that fires five
 * queries on mount would answer one expired token with five refresh calls, four
 * of which present an already-rotated token and fail — logging the user out
 * moments after a successful refresh.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const current = tokenStorage.read();
  if (!current) return null;

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });

      if (!response.ok) {
        tokenStorage.clear();
        announceSessionExpired();
        return null;
      }

      const tokens = (await response.json()) as AuthTokens;
      tokenStorage.write(tokens);

      return tokens.accessToken;
    } catch {
      // A network blip is not proof the session is invalid, so the tokens are
      // left alone and the caller simply sees the original failure.
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  if (!query) return url;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }

  const serialised = params.toString();

  return serialised ? `${url}?${serialised}` : url;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return text === '' ? null : text;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function send(
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {};

  if (!options.formData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.formData ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
    signal: options.signal,
  });
}

/**
 * Issues a request, retrying once through `/auth/refresh` on a 401.
 *
 * The retry is what replaces the Supabase client's `autoRefreshToken`. Access
 * tokens live 15 minutes, so without it a tab left open over lunch would fail
 * its next action for no reason the user could understand.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const tokens = options.anonymous ? null : tokenStorage.read();

  let response: Response;

  try {
    response = await send(path, options, tokens?.accessToken ?? null);
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    throw new ApiError(0, defaultMessageFor(0));
  }

  if (response.status === 401 && tokens && !options.anonymous) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      try {
        response = await send(path, options, refreshed);
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') throw error;
        throw new ApiError(0, defaultMessageFor(0));
      }
    }
  }

  const body = await parseBody(response);

  if (!response.ok) throw toApiError(response.status, body);

  return body as T;
}

// --- helpers ----------------------------------------------------------------

/**
 * Resolves an image path the API returned into something an `<img>` can load.
 *
 * The API stores a storage key and composes a root-relative URL, which keeps
 * the database free of any hostname — the strategy the migration spec
 * recommends. The cost is that the browser would otherwise resolve
 * `/uploads/...` against the *frontend* origin, so only that prefix is
 * rewritten. `/placeholder.svg` is a frontend asset and is deliberately left
 * alone, as is any absolute URL an S3/CDN driver returns.
 */
export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder.svg';
  if (url.startsWith(UPLOADS_PREFIX)) return `${API_ORIGIN}${url}`;
  return url;
}

export function resolveAssetUrls(urls: string[] | undefined | null): string[] {
  return (urls ?? []).map(resolveAssetUrl);
}

/** Turns anything thrown into a sentence worth showing a person. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
