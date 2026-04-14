import { request } from './client'
import { Like } from '../types'

// Get likes for a post - returns count and list of users who liked
export const getLikes = (postId: number) => {
    return request<{ count: number, users: Like[] }>(`/posts/${postId}/likes/`)
}

// Like a post - returns the created like object
export const likePost = (postId: number) => {
    return request<Like>(`/posts/${postId}/likes/`, {
        method: 'POST',
    })
}

// Unlike a post
export const unlikePost = (postId: number) => {
    return request<void>(`/posts/${postId}/likes/`, {
        method: 'DELETE',
    })
}