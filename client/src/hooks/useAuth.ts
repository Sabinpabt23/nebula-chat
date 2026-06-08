/**
 * useAuth Hook
 * 
 * Orchestrates authentication flows by combining the API service
 * and auth store. Components call these functions — they never
 * call api.post() or useAuthStore directly.
 * 
 * Provides: sendOtp, verifyOtp, googleLogin, logout, refreshToken
 */
import { useCallback } from 'react';
import api, { setAccessToken, onTokenRefreshed } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { type ApiResponse, type AuthTokens } from '../types';

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

    const logout = useCallback(async (): Promise<void> => {
        await api.post('/auth/logout');
        setAccessToken(null);
        clearAuth();
    }, [clearAuth]);

    const triggerGoogleLogin = useCallback(async (): Promise<void> => {
    // Open Google OAuth popup, get credential, then call the API
    // This keeps popup logic out of the UI component
    throw new Error('Google login not yet configured. Set VITE_GOOGLE_CLIENT_ID in .env');
     }, [googleLogin]);

    return { sendOtp, verifyOtp, triggerGoogleLogin, logout };

}