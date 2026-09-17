import { apiRequest, tokenStorage } from './client';
import type { AuthSession, AuthUser } from './types';

/**
 * Replaces the eight `supabase.auth.*` call sites, plus the two `has_role` RPC
 * round-trips — roles now arrive inside the login response and `/auth/me`, so
 * the admin check costs nothing extra.
 */
export const authApi = {
  register(input: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<AuthSession> {
    return apiRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: input,
      anonymous: true,
    });
  },

  login(input: { email: string; password: string }): Promise<AuthSession> {
    return apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: input,
      anonymous: true,
    });
  },

  me(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/auth/me');
  },

  /**
   * Revokes the refresh token server-side — something Supabase handled and that
   * a stateless JWT cannot do on its own. The local tokens are cleared whatever
   * the server says, so a failed call still signs the person out of this
   * browser.
   */
  async logout(): Promise<void> {
    const tokens = tokenStorage.read();

    if (tokens) {
      try {
        await apiRequest<void>('/auth/logout', {
          method: 'POST',
          body: { refreshToken: tokens.refreshToken },
        });
      } catch {
        // An expired or already-revoked token is not worth surfacing.
      }
    }

    tokenStorage.clear();
  },

  /** Always resolves, whether or not the address exists (no enumeration). */
  forgotPassword(email: string): Promise<void> {
    return apiRequest<void>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      anonymous: true,
    });
  },

  /**
   * The token now arrives as a `?token=` query parameter. Under Supabase it
   * came back in the URL *hash* and was consumed invisibly by the SDK; with no
   * SDK there is nothing to consume it, so the link format changed with it.
   */
  resetPassword(input: { token: string; password: string }): Promise<void> {
    return apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: input,
      anonymous: true,
    });
  },

  changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return apiRequest<void>('/auth/password', {
      method: 'PATCH',
      body: input,
    });
  },

  verifyEmail(token: string): Promise<void> {
    return apiRequest<void>('/auth/verify-email', {
      method: 'POST',
      body: { token },
      anonymous: true,
    });
  },
};
