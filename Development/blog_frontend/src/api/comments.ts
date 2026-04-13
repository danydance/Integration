import { request } from './client'
import { Comment } from '../types'

export const getComments = (postId: number) => {
    return request<{ comments: Comment[] }>(`/posts/${postId}/comments/`)
}

export const createComment = (postId: number, content: string) => {
    return request<Comment>(`/posts/${postId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    })
}

export const deleteComment = (postId: number, id: number) => {
    return request<void>(`/posts/${postId}/comments/${id}/`, {
        method: 'DELETE',
    })
}