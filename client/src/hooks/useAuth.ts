/**
 * useAuth Hook
 *
 * Orchestrates authentication flows by combining the API service
 * and auth store. Components call these functions — they never
 * call api.post() or useAuthStore directly.
 *
 * Provides: sendOtp, verifyOtp, triggerGoogleLogin, logout
 *
 * Note: Session restore (refreshAuth) is handled once at app level
 * by AuthProvider. This hook does not duplicate that responsibility.
 */
import { useCallback } from 'react';
import api, { setAccessToken } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { type ApiResponse, type AuthTokens } from '../types';
import { disconnectSocket } from '../services/socket';

export function useAuth() {
    const { setAuth, clearAuth } = useAuthStore();

    // ── OTP flow ──────────────────────────────────────────────────────────

    const sendOtp = useCallback(async (email: string): Promise<ApiResponse> => {
        const { data } = await api.post('/auth/otp/send', { email });
        return data;
    }, []);

    const verifyOtp = useCallback(async (email: string, code: string): Promise<void> => {
        const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/otp/verify', { email, code });
        const { accessToken, user } = data.data!;
        setAccessToken(accessToken);
        setAuth(user, accessToken);
    }, [setAuth]);

    // ── Google OAuth flow ─────────────────────────────────────────────────

    /**
     * Exchanges a Google ID token credential for a Nebula Chat session.
     * Called internally by triggerGoogleLogin after the popup resolves.
     */
    const googleLogin = useCallback(async (credential: string): Promise<void> => {
        const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/google', { credential });
        const { accessToken, user } = data.data!;
        setAccessToken(accessToken);
        setAuth(user, accessToken);
    }, [setAuth]);

    /**
     * Opens the Google OAuth popup. Resolves when the user completes
     * sign-in and the credential has been verified by the backend.
     */
    const triggerGoogleLogin = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId) {
                reject(new Error('Google Client ID not configured'));
                return;
            }

            const redirectUri = `${window.location.origin}/google-callback.html`;
            const googleUrl =
                `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${encodeURIComponent(clientId)}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=token id_token&` +
                `scope=openid email profile&` +
                `nonce=${Date.now()}&` +
                `prompt=select_account`;

            const popup = window.open(
                googleUrl,
                'google-login',
                'width=500,height=600,left=200,top=100'
            );

            if (!popup) {
                reject(new Error('Popup blocked. Please allow popups for this site.'));
                return;
            }

            function handleMessage(event: MessageEvent) {
                if (event.origin !== window.location.origin) return;
                if (event.data?.type !== 'google-login') return;

                window.removeEventListener('message', handleMessage);

                if (event.data.error) {
                    reject(new Error(event.data.error));
                    return;
                }

                if (event.data.credential) {
                    googleLogin(event.data.credential).then(resolve).catch(reject);
                } else {
                    reject(new Error('No credential received from Google.'));
                }
            }

            window.addEventListener('message', handleMessage);
        });
    }, [googleLogin]);

    // ── Logout ────────────────────────────────────────────────────────────

    const logout = useCallback(async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } finally {
            // Always clear local state even if the server call fails,
            // so the client is never stuck in a half-authenticated state.
            setAccessToken(null);
            clearAuth();
            disconnectSocket();
        }
    }, [clearAuth]);

    return { sendOtp, verifyOtp, triggerGoogleLogin, logout };
}