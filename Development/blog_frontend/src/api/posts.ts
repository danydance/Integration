import { request } from './client'
import { Post, PaginatedPosts } from '../types'

const MEDIA_URL = 'http://127.0.0.1:8000'

const fixImageUrl = (post: Post): Post => ({
    ...post,
    image: post.image
        ? post.image.startsWith('http')
            ? post.image
            : `${MEDIA_URL}${post.image}`
        : null,
    liked: false
})

export const getPosts = async (page: number = 1): Promise<PaginatedPosts> => {
    const data = await request<PaginatedPosts>(`/posts/?page=${page}`)
    return {
        ...data,
        posts: data.posts.map(fixImageUrl)
    }
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

export const updatePost = (id: number, caption: string): Promise<Post> => {
    return request<Post>(`/posts/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ caption }),
    })
}