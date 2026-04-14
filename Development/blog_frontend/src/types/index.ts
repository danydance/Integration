/**
 * All the interfaces represents the models from the API
 */
export interface User {
    id: number
    username: string
    date_joined: string
}

export interface Profile {
    id: number
    username: string
    bio: string
    profile_picture: string | null // Null if no picture uploaded
    created_at: string
}

export interface Post {
    id: number
    author: number              // user id
    author_username: string     // username for display
    image: string | null        // absolute URL after fixImageUrl - null if no image
    caption: string
    created_at: string          
    updated_at: string
    liked: boolean              // total like count - from backend Serializer
    likes: number               // total comment count - from backend Serializer
    comments: number            // managed locally in frontend state
}

export interface Comment {
    id: number
    author: number
    author_username: string
    content: string
    created_at: string
}

export interface Like {
    id: number
    post: number
    user: number
}

export interface PaginatedPosts {
    count: number               // total number of posts in database
    total_pages: number
    current_page: number
    page_size: number
    next: number | null         // next page number - null if on last page
    previous: number | null     // previous page number - null if on first page
    posts: Post[]
}

export interface AuthResponse {
    token: string
    user?: User
}