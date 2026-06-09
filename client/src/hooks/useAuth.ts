/**
 * useAuth Hook
 * 
 * Orchestrates authentication flows by combining the API service
 * and auth store. Components call these functions — they never
 * call api.post() or useAuthStore directly.
 * 
 * Provides: sendOtp, verifyOtp, triggerGoogleLogin, logout
 */
import { useCallback } from 'react';
import api, { setAccessToken, onTokenRefreshed } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { type ApiResponse, type AuthTokens } from '../types';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    prompt: (callback?: (notification: { isNotDisplayed: () => boolean }) => void) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

export function useAuth() {
    const { setAuth, clearAuth } = useAuthStore();

    onTokenRefreshed((newToken: string) => {
        useAuthStore.getState().setAccessToken(newToken);
    });

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

    const googleLogin = useCallback(async (credential: string): Promise<void> => {
        const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/google', { credential });
        const { accessToken, user } = data.data!;
        setAccessToken(accessToken);
        setAuth(user, accessToken);
    }, [setAuth]);

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

        const handleMessage = (event: MessageEvent) => {
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
        };

        window.addEventListener('message', handleMessage);
    });
}, [googleLogin]);

    const logout = useCallback(async (): Promise<void> => {
        await api.post('/auth/logout');
        setAccessToken(null);
        clearAuth();
    }, [clearAuth]);

    return { sendOtp, verifyOtp, triggerGoogleLogin, logout };
}