import { request } from './client'
import { Post, PaginatedPosts } from '../types'

// Server returns image URLs like /media/posts/photo.jpg
const MEDIA_URL = 'http://127.0.0.1:8000'

const fixImageUrl = (post: Post): Post => ({
    ...post,
    image: post.image
        ? post.image.startsWith('http')
            ? post.image
            : `${MEDIA_URL}${post.image}` 
        : null,
    liked: false // Liked is manage locally in the frontend
})

//Get paginated posts - default page 1
export const getPosts = async (page: number = 1): Promise<PaginatedPosts> => {
    const data = await request<PaginatedPosts>(`/posts/?page=${page}`)
    return {
        ...data,
        posts: data.posts.map(fixImageUrl)
    }
}

// Get a single Post
export const getPost = (id: number): Promise<Post> => {
    return request<Post>(`/posts/${id}/`)
}

// Create a new post
export const createPost = (image: File, caption: string): Promise<Post> => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('caption', caption)
    return request<Post>('/posts/', {
        method: 'POST',
        body: formData,
    })
}

// Delete a post permanently
export const deletePost = (id: number): Promise<void> => {
    return request<void>(`/posts/${id}/`, {
        method: 'DELETE',
    })
}

// Update a posts caption
export const updatePost = (id: number, caption: string, image?: File): Promise<Post> => {
    const formData = new FormData()
    formData.append('caption', caption)
    if (image) {
        formData.append('image', image)
    }
    return request<Post>(`/posts/${id}/`, {
        method: 'PATCH',
        body: formData,
    })
}