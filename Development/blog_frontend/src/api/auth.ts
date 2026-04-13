import { request } from './client'

export const login = (username: string, password: string) => {
    return request<{ token: string }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    })
}

export const register = (username: string, password: string) => {
    return request<{ token: string, user: { id: number, username: string } }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    })
}

export const logout = () => {
    return request<{ message: string }>('/auth/logout/', {
        method: 'DELETE',
    })
}

export const getUsers = () => {
    return request<{ users: { id: number, username: string }[] }>('/users/')
}