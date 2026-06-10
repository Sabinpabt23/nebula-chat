/**
 * Error Utility
 * 
 * Extracts user-friendly error messages from API responses.
 * Falls back to a default message if the backend didn't provide one.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return axiosError.response?.data?.message || fallback;
    }
    if (error instanceof Error) {
        return error.message || fallback;
    }
    return fallback;
}