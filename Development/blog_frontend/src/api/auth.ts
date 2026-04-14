import { request } from './client'

// Login with username and password - returns auth token
export const login = (username: string, password: string) => {
    return request<{ token: string }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    })
}

// Register a new account - returns token and user info
export const register = (username: string, password: string) => {
    return request<{ token: string, user: { id: number, username: string } }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    })
}

// Logout - deletes the token on the server
export const logout = () => {
    return request<{ message: string }>('/auth/logout/', {
        method: 'DELETE',
    })
}

// Get all users - used after login to find the current user's id
export const getUsers = () => {
    return request<{ users: { id: number, username: string }[] }>('/users/')
}