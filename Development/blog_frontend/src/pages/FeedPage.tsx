import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '../api/posts'
import { logout } from '../api/auth'
import { PaginatedPosts, Post } from '../types'
import PostCard from '../components/PostCard'
import Navbar from '../components/Navbar'
import FAB from '../components/FAB'
import '../styles/FeedPage.css'

/**
 * The Big FeedPage lol
 * 
 * Shows all posts in reverse order with : 
 * - Like / unlike
 * - View, add, edit and delete comments
 * - Pagination (load more...)
 * - Logout
 * - Navigate to profile and create post
 */
const FeedPage: React.FC = () => {
    const navigate = useNavigate()

    // Auth & user info
    // Reads from localStorage
    const currentUserId = parseInt(localStorage.getItem('userId') || '0')

    // Posts state
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const [hasNext, setHasNext] = useState<boolean>(false)

    
    

    // Fetches posts on first render
    useEffect(() => {
        fetchPosts()
    }, [])

    
    /** 
     * fetchPosts - loads the next page of posts from the API.
     * Adds to existing posts (pagination).
     * Increments page number after each successful fetch
    */
    const fetchPosts = async () => {
        try {
            setLoading(true)
            const data: PaginatedPosts = await getPosts(page)
            setPosts(prev => [...prev, ...data.posts])
            setHasNext(data.next !== null)
            setPage(prev => prev + 1)
        } catch (err) {
            setError('Failed to load posts.')
        } finally {
            setLoading(false)
        }
    }

    /**
     * handleLogout - calls logout API endpoint then clears localStorage and redirects to login.
     */
    const handleLogout = async () => {
        try {
            await logout()
        } catch (err) {
            console.error('Logout failed', err)
        } finally {
            localStorage.removeItem('token')
            navigate('/login')
        }
    }

    

    return (
        <div className="feed-bg">
            {/* NAVBAR */}
            <Navbar 
                showAvatar
                showLogout
                onLogout={handleLogout}
            />

            <div className="feed">
                {/* Show loading only on initial load not when loading more */}
                {loading && posts.length === 0 && (
                    <div className="feed-loading">Loading posts...</div>
                )}

                {error && (
                    <div className="feed-error">{error}</div>
                )}

                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        onDelete={(postId) =>
                            setPosts(posts.filter(p => p.id !== postId))
                        }
                        onUpdate={(postId, caption) =>
                            setPosts(posts.map(p =>
                                p.id === postId ? { ...p, caption } : p
                            ))
                        }
                        onLikeToggle={(postId, liked) =>
                            setPosts(posts.map(p =>
                                p.id === postId
                                    ? { ...p, has_liked: liked, likes: liked ? p.likes + 1 : p.likes - 1 }
                                    : p
                            ))
                        }
                        onCommentCountChange={(postId, delta) =>
                            setPosts(posts.map(p =>
                                p.id === postId
                                    ? { ...p, comments: p.comments + delta }
                                    : p
                            ))
                        }
                    />
                ))}

                {/* LOAD MORE - only shown if there are more pages to show */}
                {hasNext && (
                    <button className="load-more-btn" onClick={fetchPosts}>
                        {loading ? 'Loading...' : 'Load more'}
                    </button>
                )}
            </div>

            {/* The + button for creating a new post */}
            <FAB />
        </div>
    )
}

export default FeedPage