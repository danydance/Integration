import { request } from './client'
import { Post, PaginatedPosts } from '../types'

export const getPosts = (page: number = 1): Promise<PaginatedPosts> => {
    return request<PaginatedPosts>(`/posts/?page=${page}`)
}

export const createPost = (image: File, caption: string): Promise<Post> => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('caption', caption)
    return request<Post>('/posts/', {
        method: 'POST',
        body: formData,
    })
}

export const deletePost = (id: number): Promise<void> => {
    return request<void>(`/posts/${id}/`, {
        method: 'DELETE',
    })
}