// Base URL for all API requests
const BASE_URL = 'http://127.0.0.1:8000/api'

// Reads the auth token from localStorage
export const getToken = (): string | null => {
    return localStorage.getItem('token')
}

/**
 * Base fetch wrapper for all API calls. 
 * - Adds Authorization header with token.
 * - Sets Content type to JSON
 * - Throws the error body if response is not ok
 */
export const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const isFormData = options.body instanceof FormData

    const headers: HeadersInit = {
        // Don't set Content-Type for FormData
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        // Attach token if logged in
        ...(getToken() && { 'Authorization': `Token ${getToken()}` }),
        ...options.headers,
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const error = await response.json()
        throw error
    }

    if (response.status === 200 && response.headers.get('content-length') === '0') {
        return {} as T
    }
    
    return response.json()
}