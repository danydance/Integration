import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FeedPage.css'

interface Post {
    id: number
    author: number
    author_username: string
    image: string | null
    caption: string
    created_at: string
    likes: number
    liked: boolean
    comments: number
}

const DUMMY_POSTS: Post[] = [
    {
        id: 1,
        author: 1,
        author_username: 'danielbeck',
        image: 'https://picsum.photos/600/600?random=1',
        caption: 'Beautiful sunset from the mountains 🏔️',
        created_at: '2026-04-12T10:00:00Z',
        likes: 12,
        liked: true,
        comments: 3,
    },
    {
        id: 2,
        author: 2,
        author_username: 'john_doe',
        image: 'https://picsum.photos/600/600?random=2',
        caption: 'Morning coffee ☕',
        created_at: '2026-04-12T07:00:00Z',
        likes: 8,
        liked: false,
        comments: 1,
    },
]

const getTimeAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const FeedPage: React.FC = () => {
    const navigate = useNavigate()  // ← moved INSIDE the component
    const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS)
    const [comments, setComments] = useState<{ [key: number]: string }>({})

    const handleLike = (postId: number) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.liked ? post.likes - 1 : post.likes + 1
                }
            }
            return post
        }))
    }

    const handleCommentChange = (postId: number, value: string) => {
        setComments({ ...comments, [postId]: value })
    }

    const handleCommentSubmit = (postId: number) => {
        console.log('comment on post', postId, ':', comments[postId])
        setComments({ ...comments, [postId]: '' })
    }

    return (
        <div className="feed-bg">
            <nav className="navbar">
                <div className="nav-logo">Moments.</div>
                <div className="nav-actions">
                    <div className="nav-avatar" onClick={() => navigate('/profile')}>D</div>
                </div>
            </nav>

            <div className="feed">
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
                                onClick={() => handleLike(post.id)}
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
            </div>

            <button className="fab" onClick={() => console.log('create post')}>
                +
            </button>
        </div>
    )
}

export default FeedPage