const BASE_URL = 'http://127.0.0.1:8000/api'

export const getToken = (): string | null => {
    return localStorage.getItem('token')
}

export const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const isFormData = options.body instanceof FormData

    const headers: HeadersInit = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
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