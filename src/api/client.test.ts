import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  API_BASE_URL,
  ApiError,
  apiRequest,
  errorMessage,
  resolveAssetUrl,
  SESSION_EXPIRED_EVENT,
  tokenStorage,
} from './client';

/**
 * The API client is the one piece every feature depends on, and the piece with
 * no equivalent before the migration — the Supabase SDK did all of this. These
 * cover the parts that fail quietly if they break: credentials, the refresh
 * retry, and turning a failure into something renderable.
 */

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const emptyResponse = (status = 204) => new Response(null, { status });

/** Awaits a rejection and hands back a typed ApiError, failing if none came. */
async function captureError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }

  throw new Error('Expected the request to reject, but it resolved.');
}

describe('apiRequest', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    tokenStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    tokenStorage.clear();
  });

  it('sends no Authorization header when signed out', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiRequest('/products');

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('attaches the stored access token', async () => {
    tokenStorage.write({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiRequest('/profile/me');

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer access-1',
    );
  });

  it('skips credentials entirely for anonymous requests', async () => {
    tokenStorage.write({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));

    await apiRequest('/products', { anonymous: true });

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('drops empty query parameters instead of sending blanks', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));

    await apiRequest('/products', {
      query: { page: 1, search: '', category: undefined, isNew: false },
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/products?page=1&isNew=false`);
  });

  it('refreshes once on a 401 and replays the original request', async () => {
    tokenStorage.write({ accessToken: 'stale', refreshToken: 'refresh-1' });

    fetchMock
      .mockResolvedValueOnce(emptyResponse(401))
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: 'fresh', refreshToken: 'refresh-2' }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 'user-1' }));

    const result = await apiRequest<{ id: string }>('/auth/me');

    expect(result).toEqual({ id: 'user-1' });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    // The rotated pair must be persisted, or the next refresh presents a token
    // the server has already revoked.
    expect(tokenStorage.read()).toEqual({
      accessToken: 'fresh',
      refreshToken: 'refresh-2',
    });

    const [, retryInit] = fetchMock.mock.calls[2];
    expect((retryInit.headers as Record<string, string>).Authorization).toBe(
      'Bearer fresh',
    );
  });

  it('clears the session and announces expiry when the refresh is rejected', async () => {
    tokenStorage.write({ accessToken: 'stale', refreshToken: 'dead' });

    fetchMock
      .mockResolvedValueOnce(emptyResponse(401))
      .mockResolvedValueOnce(emptyResponse(401));

    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    await expect(apiRequest('/auth/me')).rejects.toBeInstanceOf(ApiError);

    expect(tokenStorage.read()).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it('issues a single refresh for concurrent 401s', async () => {
    tokenStorage.write({ accessToken: 'stale', refreshToken: 'refresh-1' });

    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/auth/refresh')) {
        return Promise.resolve(
          jsonResponse({ accessToken: 'fresh', refreshToken: 'refresh-2' }),
        );
      }

      const authorised = fetchMock.mock.calls.some(([callUrl]) =>
        String(callUrl).endsWith('/auth/refresh'),
      );

      return Promise.resolve(
        authorised ? jsonResponse({ ok: true }) : emptyResponse(401),
      );
    });

    await Promise.all([
      apiRequest('/orders/me'),
      apiRequest('/wishlist'),
      apiRequest('/profile/me'),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).endsWith('/auth/refresh'),
    );

    // Three refreshes would mean two of them presenting an already-rotated
    // token, and the customer being signed out moments after a good refresh.
    expect(refreshCalls).toHaveLength(1);
  });

  it('surfaces validation arrays as a readable message plus details', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          statusCode: 400,
          error: 'Bad Request',
          message: ['price must be a positive number', 'name should not be empty'],
        },
        400,
      ),
    );

    const error = await captureError(
      apiRequest('/admin/products', { method: 'POST', body: {} }),
    );

    expect(error.status).toBe(400);
    expect(error.message).toBe('price must be a positive number');
    expect(error.details).toHaveLength(2);
  });

  it('reports an unreachable server as a network error, not a crash', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const error = await captureError(apiRequest('/products'));

    expect(error.isNetwork).toBe(true);
    expect(error.message).toMatch(/connection/i);
  });

  it('returns null for a 204 rather than failing to parse it', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });
    fetchMock.mockResolvedValueOnce(emptyResponse(204));

    await expect(apiRequest('/wishlist/abc')).resolves.toBeNull();
  });
});

describe('resolveAssetUrl', () => {
  it('points storage paths at the API, not the frontend origin', () => {
    expect(resolveAssetUrl('/uploads/products/a.jpg')).toContain(
      '/uploads/products/a.jpg',
    );
    expect(resolveAssetUrl('/uploads/products/a.jpg')).not.toBe(
      '/uploads/products/a.jpg',
    );
  });

  it('leaves absolute URLs from a CDN alone', () => {
    const url = 'https://cdn.example.com/products/a.jpg';
    expect(resolveAssetUrl(url)).toBe(url);
  });

  it('leaves the frontend placeholder alone', () => {
    // It is served by the SPA, not the API — rewriting it would 404.
    expect(resolveAssetUrl('/placeholder.svg')).toBe('/placeholder.svg');
  });

  it('falls back to the placeholder for a missing URL', () => {
    expect(resolveAssetUrl(null)).toBe('/placeholder.svg');
  });
});

describe('errorMessage', () => {
  it('prefers the API message', () => {
    expect(errorMessage(new ApiError(409, 'Already reviewed.'))).toBe(
      'Already reviewed.',
    );
  });

  it('falls back for a thrown non-error', () => {
    expect(errorMessage('boom', 'Fallback.')).toBe('Fallback.');
  });
});
