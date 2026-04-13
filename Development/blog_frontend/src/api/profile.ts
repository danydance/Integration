import { request } from './client'
import { Like } from '../types'

export const getLikes = (postId: number) => {
    return request<{ count: number, users: Like[] }>(`/posts/${postId}/likes/`)
}

export const likePost = (postId: number) => {
    return request<Like>(`/posts/${postId}/likes/`, {
        method: 'POST',
    })
}

export const unlikePost = (postId: number) => {
    return request<void>(`/posts/${postId}/likes/`, {
        method: 'DELETE',
    })
}