import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '../api/posts'
import { likePost, unlikePost } from '../api/likes'
import { createComment } from '../api/comments'
import { logout } from '../api/auth'
import { PaginatedPosts, Post } from '../types'
import { getComments } from '../api/comments'
import './FeedPage.css'
import { deletePost } from '../api/posts'
import { deleteComment } from '../api/comments'
import { updatePost } from '../api/posts'
import { updateComment } from '../api/comments'

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
    const avatar = localStorage.getItem('userAvatar')
    const navUsername = localStorage.getItem('userUsername') || 'U'
    const [openComments, setOpenComments] = useState<{ [key: number]: boolean }>({})
    const [postComments, setPostComments] = useState<{ [key: number]: any[] }>({})
    const [editingPost, setEditingPost] = useState<number | null>(null)
    const [editPostCaption, setEditPostCaption] = useState<string>('')
    const [editingComment, setEditingComment] = useState<number | null>(null)
    const [editCommentContent, setEditCommentContent] = useState<string>('')


    const currentUserId = parseInt(localStorage.getItem('userId') || '0')

    const handleUpdatePost = async (postId: number) => {
        try {
            await updatePost(postId, editPostCaption)
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, caption: editPostCaption } : p
            ))
            setEditingPost(null)
        } catch (err) {
            console.error('Update post failed', err)
        }
    }

    const handleUpdateComment = async (postId: number, commentId: number) => {
        try {
            await updateComment(postId, commentId, editCommentContent)
            setPostComments({
                ...postComments,
                [postId]: postComments[postId].map((c: any) =>
                    c.id === commentId ? { ...c, content: editCommentContent } : c
                )
            })
            setEditingComment(null)
        } catch (err) {
            console.error('Update comment failed', err)
        }
    }


    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Delete this post?')) return
        try {
            await deletePost(postId)
            setPosts(posts.filter(p => p.id !== postId))
        } catch (err) {
            console.error('Delete post failed', err)
        }
    }

    const handleDeleteComment = async (postId: number, commentId: number) => {
        if (!window.confirm('Delete this comment?')) return
        try {
            await deleteComment(postId, commentId)
            // remove from list
            setPostComments({
                ...postComments,
                [postId]: postComments[postId].filter((c: any) => c.id !== commentId)
            })
            // update count
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, comments: p.comments - 1 } : p
            ))
        } catch (err) {
            console.error('Delete comment failed', err)
        }
    }
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
            const newComment = await createComment(postId, content)
            setComments({ ...comments, [postId]: '' })

            // update comment count
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, comments: p.comments + 1 } : p
            ))

            // add new comment to the list if comments are open
            if (openComments[postId]) {
                setPostComments({
                    ...postComments,
                    [postId]: [...(postComments[postId] || []), newComment]
                })
            }
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

    const handleToggleComments = async (postId: number) => {
        // if already open — close it
        if (openComments[postId]) {
            setOpenComments({ ...openComments, [postId]: false })
            return
        }

        // fetch comments then open
        try {
            const data = await getComments(postId)
            setPostComments({ ...postComments, [postId]: data.comments })
            setOpenComments({ ...openComments, [postId]: true })
        } catch (err) {
            console.error('Failed to load comments', err)
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
                        {avatar
                            ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : navUsername[0].toUpperCase()
                        }
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
                            {/* only show delete to post owner */}
                            {post.author === currentUserId && (
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeletePost(post.id)}
                                >
                                    🗑️
                                </button>
                            )}
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
                            {editingPost === post.id ? (
                                <div className="edit-caption-row">
                                    <input
                                        className="edit-caption-input"
                                        value={editPostCaption}
                                        onChange={(e) => setEditPostCaption(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdatePost(post.id)
                                            if (e.key === 'Escape') setEditingPost(null)
                                        }}
                                        autoFocus
                                    />
                                    <button className="edit-save-btn" onClick={() => handleUpdatePost(post.id)}>Save</button>
                                    <button className="edit-cancel-btn" onClick={() => setEditingPost(null)}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <strong>{post.author_username}</strong>
                                    {post.caption}
                                    {post.author === currentUserId && (
                                        <button
                                            className="edit-btn-inline"
                                            onClick={() => {
                                                setEditingPost(post.id)
                                                setEditPostCaption(post.caption)
                                            }}
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {post.comments > 0 && (
                            <div
                                className="post-comments-preview"
                                onClick={() => handleToggleComments(post.id)}
                            >
                                {openComments[post.id]
                                    ? 'Hide comments'
                                    : `View all ${post.comments} comment${post.comments > 1 ? 's' : ''}`
                                }
                            </div>
                        )}

                        {/* COMMENTS LIST */}
                       {openComments[post.id] && postComments[post.id] && (
                            <div className="comments-list">
                                {postComments[post.id].map((comment: any) => (
                                    <div key={comment.id} className="comment-row">
                                        <div className="comment-content">
                                            <strong>{comment.author_username}</strong>
                                            {editingComment === comment.id ? (
                                                <div className="edit-comment-row">
                                                    <input
                                                        className="edit-comment-input"
                                                        value={editCommentContent}
                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateComment(post.id, comment.id)
                                                            if (e.key === 'Escape') setEditingComment(null)
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button className="edit-save-btn" onClick={() => handleUpdateComment(post.id, comment.id)}>Save</button>
                                                    <button className="edit-cancel-btn" onClick={() => setEditingComment(null)}>✕</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>{comment.content}</span>
                                                    {comment.author === currentUserId && (
                                                        <button
                                                            className="edit-btn-inline"
                                                            onClick={() => {
                                                                setEditingComment(comment.id)
                                                                setEditCommentContent(comment.content)
                                                            }}
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {comment.author === currentUserId && editingComment !== comment.id && (
                                            <button
                                                className="delete-comment-btn"
                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
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