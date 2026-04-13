import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '../api/posts'
import { likePost, unlikePost } from '../api/likes'
import { createComment } from '../api/comments'
import { logout } from '../api/auth'
import { PaginatedPosts, Post } from '../types'
import './FeedPage.css'

const getTimeAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const FeedPage: React.FC = () => {
    const navigate = useNavigate()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [comments, setComments] = useState<{ [key: number]: string }>({})
    const [page, setPage] = useState<number>(1)
    const [hasNext, setHasNext] = useState<boolean>(false)

    useEffect(() => {
        fetchPosts()
    }, [])

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

    const handleLike = async (post: Post) => {
        try {
            if (post.liked) {
                await unlikePost(post.id)
            } else {
                await likePost(post.id)
            }
            setPosts(posts.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        liked: !p.liked,
                        likes: p.liked ? p.likes - 1 : p.likes + 1
                    }
                }
                return p
            }))
        } catch (err) {
            console.error('Like failed', err)
        }
    }

    const handleCommentChange = (postId: number, value: string) => {
        setComments({ ...comments, [postId]: value })
    }

    const handleCommentSubmit = async (postId: number) => {
        const content = comments[postId]
        if (!content?.trim()) return
        try {
            await createComment(postId, content)
            setComments({ ...comments, [postId]: '' })
            // update comment count
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, comments: p.comments + 1 } : p
            ))
        } catch (err) {
            console.error('Comment failed', err)
        }
    }

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
            <nav className="navbar">
                <div className="nav-logo">Moments.</div>
                <div className="nav-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        Sign out
                    </button>
                    <div className="nav-avatar" onClick={() => navigate('/profile')}>
                        D
                    </div>
                </div>
            </nav>

            <div className="feed">
                {loading && posts.length === 0 && (
                    <div className="feed-loading">Loading posts...</div>
                )}

                {error && (
                    <div className="feed-error">{error}</div>
                )}

                {posts.map(post => (
                    <div key={post.id} className="post-card">
                        <div className="post-header">
                            <div className="post-avatar">
                                {post.author_username[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="post-username">{post.author_username}</div>
                                <div className="post-time">{getTimeAgo(post.created_at)}</div>
                            </div>
                        </div>

                        {post.image && (
                            <div className="post-image">
                                <img src={post.image} alt="post" />
                            </div>
                        )}

                        <div className="post-actions">
                            <button
                                className={`action-btn ${post.liked ? 'liked' : ''}`}
                                onClick={() => handleLike(post)}
                            >
                                {post.liked ? '❤️' : '🤍'}
                                <span className="action-count">{post.likes}</span>
                            </button>
                            <button className="action-btn">
                                💬
                                <span className="action-count">{post.comments}</span>
                            </button>
                        </div>

                        <div className="post-caption">
                            <strong>{post.author_username}</strong>
                            {post.caption}
                        </div>

                        {post.comments > 0 && (
                            <div className="post-comments-preview">
                                View all {post.comments} comment{post.comments > 1 ? 's' : ''}
                            </div>
                        )}

                        <div className="comment-input-row">
                            <input
                                className="comment-input"
                                placeholder="Add a comment..."
                                value={comments[post.id] || ''}
                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCommentSubmit(post.id)
                                }}
                            />
                            <button
                                className="comment-submit"
                                onClick={() => handleCommentSubmit(post.id)}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                ))}

                {hasNext && (
                    <button className="load-more-btn" onClick={fetchPosts}>
                        {loading ? 'Loading...' : 'Load more'}
                    </button>
                )}
            </div>

            <button className="fab" onClick={() => navigate('/create')}>
                +
            </button>
        </div>
    )
}

export default FeedPage