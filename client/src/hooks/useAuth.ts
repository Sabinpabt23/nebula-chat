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

            if (!window.google?.accounts?.id) {
                reject(new Error('Google sign-in library not loaded. Please refresh the page.'));
                return;
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: { credential: string }) => {
                    try {
                        await googleLogin(response.credential);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                },
            });

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    reject(new Error('Google sign-in was cancelled or not displayed.'));
                }
            });
        });
    }, [googleLogin]);

    const logout = useCallback(async (): Promise<void> => {
        await api.post('/auth/logout');
        setAccessToken(null);
        clearAuth();
    }, [clearAuth]);

    return { sendOtp, verifyOtp, triggerGoogleLogin, logout };
}