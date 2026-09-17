import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  authApi,
  SESSION_EXPIRED_EVENT,
  tokenStorage,
  type AuthSession,
  type AuthUser,
} from '@/api';

interface AuthContextValue {
  user: AuthUser | null;
  /** True only while the session is being restored on first load. */
  loading: boolean;
  isAuthenticated: boolean;
  /** Read from the JWT claims in the session response — no extra round-trip. */
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Holds the signed-in identity for the whole app.
 *
 * Under Supabase this wrapped `onAuthStateChange` and `getSession()`, and the
 * question "is this person an admin?" cost a separate `has_role` RPC that was
 * cached for ten minutes — long enough that a revoked admin kept their menu.
 * Roles now travel inside the access token and are re-read from `/auth/me` on
 * every page load, so the window is one token lifetime instead.
 *
 * Client-side role state is convenience only. It decides what to *render*;
 * every `/admin/*` route is enforced again by `RolesGuard` on the server, and
 * the API is the boundary that matters.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  /** Per-user caches must not survive a change of user. */
  const resetCaches = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['wishlist'] });
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.removeQueries({ queryKey: ['profile'] });
    queryClient.removeQueries({ queryKey: ['admin'] });
  }, [queryClient]);

  const adopt = useCallback(
    (session: AuthSession): AuthUser => {
      tokenStorage.write({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      resetCaches();
      setUser(session.user);
      return session.user;
    },
    [resetCaches],
  );

  // Session restoration. A stored token is not proof of a live session — it may
  // be expired or revoked — so it is exchanged for the real user before the app
  // treats anyone as signed in.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!tokenStorage.read()) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const current = await authApi.me();
        if (!cancelled) setUser(current);
      } catch {
        // apiRequest already tried to refresh; reaching here means the session
        // is genuinely gone.
        tokenStorage.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, []);

  // Raised by the API client when a refresh fails mid-session.
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      resetCaches();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [resetCaches]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) =>
      adopt(await authApi.register({ email, password, fullName })),
    [adopt],
  );

  const signIn = useCallback(
    async (email: string, password: string) =>
      adopt(await authApi.login({ email, password })),
    [adopt],
  );

  const signOut = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    resetCaches();
  }, [resetCaches]);

  const requestPasswordReset = useCallback(
    (email: string) => authApi.forgotPassword(email),
    [],
  );

  const resetPassword = useCallback(
    (token: string, password: string) =>
      authApi.resetPassword({ token, password }),
    [],
  );

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.read()) return;

    try {
      setUser(await authApi.me());
    } catch {
      /* the client has already handled an invalid session */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isAdmin: user?.roles.includes('admin') ?? false,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    }),
    [
      user,
      loading,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
