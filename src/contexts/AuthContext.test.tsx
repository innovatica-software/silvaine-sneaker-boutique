import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenStorage } from '@/api';
import AdminRoute from '@/components/AdminRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider, useAuth } from './AuthContext';

/**
 * Authorization is the part of this migration most likely to break silently:
 * 34 RLS policies became application code, and the client-side half of that is
 * these guards. They are UX only — the API enforces the same rules again — but
 * a guard that lets the wrong person render the admin panel is still a bug.
 */

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const customer = {
  id: 'user-1',
  email: 'marco@example.com',
  roles: ['customer'],
  fullName: 'Marco Rossi',
  emailVerified: true,
};

const admin = { ...customer, id: 'user-2', roles: ['customer', 'admin'] };

let fetchMock: ReturnType<typeof vi.fn>;

const renderWithAuth = (ui: React.ReactNode, initialPath = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  tokenStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  tokenStorage.clear();
});

const Probe = () => {
  const { user, loading, isAuthenticated, isAdmin, signIn, signOut } = useAuth();

  if (loading) return <div>loading</div>;

  return (
    <div>
      <span data-testid="state">
        {isAuthenticated ? `in:${user?.email}` : 'out'}
      </span>
      <span data-testid="admin">{isAdmin ? 'admin' : 'not-admin'}</span>
      <button onClick={() => void signIn('marco@example.com', 'password12')}>
        sign in
      </button>
      <button onClick={() => void signOut()}>sign out</button>
    </div>
  );
};

describe('AuthProvider', () => {
  it('starts signed out when there is no stored session, without calling the API', async () => {
    renderWithAuth(<Probe />);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('restores a session by exchanging the stored token for the real user', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });
    fetchMock.mockResolvedValueOnce(jsonResponse(customer));

    renderWithAuth(<Probe />);

    await waitFor(() =>
      expect(screen.getByTestId('state')).toHaveTextContent('in:marco@example.com'),
    );

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/auth/me');
  });

  it('discards a stored token the server no longer accepts', async () => {
    tokenStorage.write({ accessToken: 'stale', refreshToken: 'dead' });
    // The 401 triggers a refresh attempt, which also fails.
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    renderWithAuth(<Probe />);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
    expect(tokenStorage.read()).toBeNull();
  });

  it('stores the token pair on sign-in and exposes the roles from the response', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresIn: 900,
        tokenType: 'Bearer',
        user: admin,
      }),
    );

    renderWithAuth(<Probe />);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));

    await userEvent.click(screen.getByText('sign in'));

    await waitFor(() =>
      expect(screen.getByTestId('state')).toHaveTextContent('in:marco@example.com'),
    );

    // The admin flag comes straight from the login response — no second
    // `has_role` round-trip, which is what the old client needed.
    expect(screen.getByTestId('admin')).toHaveTextContent('admin');
    expect(tokenStorage.read()).toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
  });

  it('clears the stored session on sign-out', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(customer))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    renderWithAuth(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId('state')).toHaveTextContent('in:marco@example.com'),
    );

    await userEvent.click(screen.getByText('sign out'));

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
    expect(tokenStorage.read()).toBeNull();
  });
});

const Guarded = () => (
  <Routes>
    <Route path="/login" element={<div>login page</div>} />
    <Route path="/" element={<div>home page</div>} />
    <Route
      path="/account"
      element={
        <ProtectedRoute>
          <div>account page</div>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <div>admin panel</div>
        </AdminRoute>
      }
    />
  </Routes>
);

describe('route guards', () => {
  it('sends a signed-out visitor from /account to the login page', async () => {
    renderWithAuth(<Guarded />, '/account');

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
    expect(screen.queryByText('account page')).not.toBeInTheDocument();
  });

  it('lets a signed-in customer reach /account', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });
    fetchMock.mockResolvedValueOnce(jsonResponse(customer));

    renderWithAuth(<Guarded />, '/account');

    await waitFor(() => expect(screen.getByText('account page')).toBeInTheDocument());
  });

  it('sends a signed-out visitor from /admin to the login page', async () => {
    renderWithAuth(<Guarded />, '/admin');

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
    expect(screen.queryByText('admin panel')).not.toBeInTheDocument();
  });

  it('turns a customer away from /admin even when typed directly', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });
    fetchMock.mockResolvedValueOnce(jsonResponse(customer));

    renderWithAuth(<Guarded />, '/admin');

    await waitFor(() => expect(screen.getByText('home page')).toBeInTheDocument());
    expect(screen.queryByText('admin panel')).not.toBeInTheDocument();
  });

  it('lets an admin through to /admin', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });
    fetchMock.mockResolvedValueOnce(jsonResponse(admin));

    renderWithAuth(<Guarded />, '/admin');

    await waitFor(() => expect(screen.getByText('admin panel')).toBeInTheDocument());
  });

  it('does not bounce a signed-in customer while the session is still restoring', async () => {
    tokenStorage.write({ accessToken: 'a', refreshToken: 'b' });

    // Held open so the guard renders during the restore, which is exactly when
    // a premature redirect would fire on every page refresh.
    let release: (value: Response) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        release = resolve;
      }),
    );

    renderWithAuth(<Guarded />, '/account');

    expect(screen.queryByText('login page')).not.toBeInTheDocument();

    release(jsonResponse(customer));

    await waitFor(() => expect(screen.getByText('account page')).toBeInTheDocument());
  });
});
