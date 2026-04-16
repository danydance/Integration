import React, { useState } from 'react'
import { Post } from '../types'
import { likePost, unlikePost } from '../api/likes'
import { deletePost, updatePost } from '../api/posts'
import CommentList from './CommentList'

interface PostCardProps {
    post: Post
    currentUserId: number
    onDelete: (postId: number) => void
    onUpdate: (postId: number, caption: string) => void
    onLikeToggle: (postId: number, liked: boolean) => void
    onCommentCountChange: (postId: number, delta: number) => void
}

/**
 * PostCard — displays a single post with all interactions.
 * Receives one post from FeedPage as a prop.
 * Handles: like, edit caption, delete post, comments.
 */
const getTimeAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    currentUserId,
    onDelete,
    onUpdate,
    onLikeToggle,
    onCommentCountChange,
}) => {
    const [editing, setEditing] = useState<boolean>(false)
    const [editCaption, setEditCaption] = useState<string>('')
    const [liked, setLiked] = useState<boolean>(post.has_liked)
    const [likes, setLikes] = useState<number>(post.likes)

    const handleLike = async () => {
        try {
            if (liked) {
                await unlikePost(post.id)
                setLiked(false)
                setLikes(prev => prev - 1)
            } else {
                await likePost(post.id)
                setLiked(true)
                setLikes(prev => prev + 1)
            }
            onLikeToggle(post.id, !liked)
        } catch (err) {
            console.error('Like failed', err)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Delete this post?')) return
        try {
            await deletePost(post.id)
            onDelete(post.id)
        } catch (err) {
            console.error('Delete failed', err)
        }
    }

    const handleUpdate = async () => {
        try {
            await updatePost(post.id, editCaption)
            onUpdate(post.id, editCaption)
            setEditing(false)
        } catch (err) {
            console.error('Update failed', err)
        }
    }

    return (
        <div className="post-card">

            {/* HEADER */}
            <div className="post-header">
                <div className="post-avatar">
                    {post.author_username[0].toUpperCase()}
                </div>
                <div>
                    <div className="post-username">{post.author_username}</div>
                    <div className="post-time">{getTimeAgo(post.created_at)}</div>
                </div>
                {post.author === currentUserId && (
                    <button className="delete-btn" onClick={handleDelete}>🗑️</button>
                )}
            </div>

            {/* IMAGE */}
            {post.image && (
                <div className="post-image">
                    <img src={post.image} alt="post" />
                </div>
            )}

            {/* ACTIONS */}
            <div className="post-actions">
                <button
                    className={`action-btn ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {liked ? '❤️' : '🤍'}
                    <span className="action-count">{likes}</span>
                </button>
                <button className="action-btn-comment" disabled>
                    💬
                    <span className="action-count">{post.comments}</span>
                </button>
            </div>

            {/* CAPTION */}
            <div className="post-caption">
                {editing ? (
                    <div className="edit-caption-row">
                        <input
                            className="edit-caption-input"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate()
                                if (e.key === 'Escape') setEditing(false)
                            }}
                            autoFocus
                        />
                        <button className="edit-save-btn" onClick={handleUpdate}>Save</button>
                        <button className="edit-cancel-btn" onClick={() => setEditing(false)}>✕</button>
                    </div>
                ) : (
                    <>
                        <strong>{post.author_username}</strong>
                        {post.caption}
                        {post.author === currentUserId && (
                            <button
                                className="edit-btn-inline"
                                onClick={() => {
                                    setEditing(true)
                                    setEditCaption(post.caption)
                                }}
                            >
                                ✏️
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* COMMENTS */}
            <CommentList
                postId={post.id}
                commentCount={post.comments}
                currentUserId={currentUserId}
                onCommentAdded={() => onCommentCountChange(post.id, 1)}
                onCommentDeleted={() => onCommentCountChange(post.id, -1)}
            />

        </div>
    )
}

export default PostCard