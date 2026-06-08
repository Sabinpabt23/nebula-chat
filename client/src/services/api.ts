/**
 * API Service
 * 
 * Centralized HTTP client using Axios.
 * All backend communication goes through this module.
 * 
 * Features:
 * - Automatic access token attachment
 * - 401 interception with token refresh and retry
 * - Standardized error handling
 * 
 * Components and hooks never call fetch() directly — they use the functions exported here.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let onTokenRefresh: ((token: string) => void) | null = null;

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

export function onTokenRefreshed(callback: (token: string) => void): void {
    onTokenRefresh = callback;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.post('/auth/refresh');
                const newToken = data.data.accessToken;
                setAccessToken(newToken);
                
                if (onTokenRefresh) {
                    onTokenRefresh(newToken);
                }

                refreshQueue.forEach(({ resolve }) => resolve(newToken));
                refreshQueue = [];

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                refreshQueue.forEach(({ reject }) => reject(refreshError as Error));
                refreshQueue = [];
                setAccessToken(null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;