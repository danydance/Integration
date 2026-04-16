import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts, deletePost, updatePost } from '../api/posts'
import { likePost, unlikePost } from '../api/likes'
import { getComments, createComment, deleteComment, updateComment } from '../api/comments'
import { logout } from '../api/auth'
import { PaginatedPosts, Post } from '../types'
import '../styles/FeedPage.css'
import Navbar from '../components/Navbar'
import FAB from '../components/FAB'

/**
 * getTimeAgon - converts Date to string of the relative time.
 * Examples : "just now", "5m ago", "3d ago" 
 * Defined outside the component because it doesnt use any state or props.
 */
const getTimeAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

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
    const avatar = localStorage.getItem('userAvatar')
    const navUsername = localStorage.getItem('userUsername') || 'U'
    const currentUserId = parseInt(localStorage.getItem('userId') || '0')

    // Posts state
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const [hasNext, setHasNext] = useState<boolean>(false)

    // Comment state
    // Comments: tracks the input value per post
    const [comments, setComments] = useState<{ [key: number]: string }>({})
    // OpenComments: tracks which posts comments are expanded
    const [openComments, setOpenComments] = useState<{ [key: number]: boolean }>({})
    // PostComments: stores fetched comments per post
    const [postComments, setPostComments] = useState<{ [key: number]: any[] }>({})

    // Editing state
    // EditingPost: id of the post currently being editd
    const [editingPost, setEditingPost] = useState<number | null>(null)
    const [editPostCaption, setEditPostCaption] = useState<string>('')
    //EditingComment: id of the comment currently being edited
    const [editingComment, setEditingComment] = useState<number | null>(null)
    const [editCommentContent, setEditCommentContent] = useState<string>('')
    

    // Fetches posts on first render
    useEffect(() => {
        fetchPosts()
    }, [])

    /**
     * handleUpdatePost - saves and edited post caption.
     */
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

    /**
     * handleUpdateComment - saves and edited comment
     */
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

    /**
     * handleDeletePost - deletes a post after confirmation. 
     */
    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Delete this post?')) return
        try {
            await deletePost(postId)
            setPosts(posts.filter(p => p.id !== postId))
        } catch (err) {
            console.error('Delete post failed', err)
        }
    }

    /**
     * handleDeleteComment - deletes a comment after confirmation. 
     */
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
     * handleLike - toggles like on a post.
     * Calls the API then updates the post in state immediately.
     */
    const handleLike = async (post: Post) => {
        try {
            if (post.has_liked) {
                await unlikePost(post.id)
            } else {
                await likePost(post.id)
            }
            setPosts(posts.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        has_liked: !p.has_liked,
                        likes: p.has_liked ? p.likes - 1 : p.likes + 1
                    }
                }
                return p
            }))
        } catch (err) {
            console.error('Like failed', err)
        }
    }

    // Tracks the comment input value for a specific post
    const handleCommentChange = (postId: number, value: string) => {
        setComments({ ...comments, [postId]: value })
    }

    /**
     * handleCommentSubmit — posts a new comment.
     * After success:
     * - Clears the input
     * - Joins the comment count on the post
     * - Adds the new comment to the open list (if visible)
     */
    const handleCommentSubmit = async (postId: number) => {
        const content = comments[postId]
        if (!content?.trim()) return // Dont submit empty comments
        try {
            const newComment = await createComment(postId, content)
            setComments({ ...comments, [postId]: '' })

            // Update comment count
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, comments: p.comments + 1 } : p
            ))

            // Add new comment to the list if comments are open
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

    /** 
     * handleToggleComments - fetches, shows and hides comments for a post.
     */
    const handleToggleComments = async (postId: number) => {
        if (openComments[postId]) {
            setOpenComments({ ...openComments, [postId]: false })
            return
        }

        // Fetch comments then open
        try {
            const data = await getComments(postId)
            setPostComments({ ...postComments, [postId]: data.comments })
            setOpenComments({ ...openComments, [postId]: true })
        } catch (err) {
            console.error('Failed to load comments', err)
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
                    <div key={post.id} className="post-card">
                        {/* POST HEADER - avatar, username, time, delete button */}
                        <div className="post-header">
                            <div className="post-avatar">
                                {post.author_username[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="post-username">{post.author_username}</div>
                                <div className="post-time">{getTimeAgo(post.created_at)}</div>
                            </div>
                            {/* Only show delete to post owner */}
                            {post.author === currentUserId && (
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeletePost(post.id)}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                        {/* POST IMAGE - only renders if image exists */}
                        {post.image && (
                            <div className="post-image">
                                <img src={post.image} alt="post" />
                            </div>
                        )}

                        {/* Like and Comment counts*/}
                        <div className="post-actions">
                            <button
                                className={`action-btn ${post.has_liked ? 'liked' : ''}`}
                                onClick={() => handleLike(post)}
                            >
                                {post.has_liked ? '❤️' : '🤍'}
                                <span className="action-count">{post.likes}</span>
                            </button>
                            <button className="action-btn-comment" disabled>
                                💬
                                <span className="action-count">{post.comments}</span>
                            </button>
                        </div>

                        {/* CAPTION - shows edit input if this post is being edited */}
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
                                    {/* Edit pencil only visible to post owner */}
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
                        {/* COMMENTS TOGGLE - only shown if post has comments */}
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
                                            {/* Show edit input if this comment is being edited */}
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
                                                    {/* Edit pencil only visible to comment owner */}
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
                                        {/* Delete button only shows to comment owner and not while editing */}
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

                        {/* COMMENT INPUT */}
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