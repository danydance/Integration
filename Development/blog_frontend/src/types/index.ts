export interface User {
    id: number
    username: string
    date_joined: string
}

export interface Profile {
    id: number
    username: string
    bio: string
    profile_picture: string | null
    created_at: string
}

export interface Post {
    id: number
    author: number
    author_username: string
    image: string | null
    caption: string
    created_at: string
    updated_at: string
    liked: boolean
    likes: number
    comments: number
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
    count: number
    total_pages: number
    current_page: number
    page_size: number
    next: number | null
    previous: number | null
    posts: Post[]
}

export interface AuthResponse {
    token: string
    user?: User
}