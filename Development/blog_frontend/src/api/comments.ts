import { request } from './client'
import { Comment } from '../types'

// Get all comments for a specific post
export const getComments = (postId: number) => {
    return request<{ comments: Comment[] }>(`/posts/${postId}/comments/`)
}

// Add a new comment to a post
export const createComment = (postId: number, content: string) => {
    return request<Comment>(`/posts/${postId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    })
}

// Delete a comment - only the author/owner can do this
export const deleteComment = (postId: number, id: number) => {
    return request<void>(`/posts/${postId}/comments/${id}/`, {
        method: 'DELETE',
    })
}

// Update a comments content - only the author/owner can do this
export const updateComment = (postId: number, id: number, content: string) => {
    return request<Comment>(`/posts/${postId}/comments/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
    })
}