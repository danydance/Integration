import React, { useState } from 'react'
import { getComments, createComment, deleteComment, updateComment } from '../api/comments'
import { Comment } from '../types'

interface CommentListProps {
    postId: number
    commentCount: number
    currentUserId: number
    onCommentAdded: () => void    
    onCommentDeleted: () => void  
}

/**
 * CommentList — handles all comment interactions for a single post.
 *
 * Features:
 * - Toggle show/hide comments
 * - Fetch comments from API on first open
 * - Add new comment
 * - Edit own comment inline
 * - Delete own comment
 *
 * Used in: PostCard
 */
const CommentList: React.FC<CommentListProps> = ({
    postId,
    commentCount,
    currentUserId,
    onCommentAdded,
    onCommentDeleted,
}) => {
    const [open, setOpen] = useState<boolean>(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [input, setInput] = useState<string>('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editContent, setEditContent] = useState<string>('')

    /**
     * handleToggle — fetches comments on first open.
     */
    const handleToggle = async () => {
        if (open) {
            setOpen(false)
            return
        }
        try {
            const data = await getComments(postId)
            setComments(data.comments)
            setOpen(true)
        } catch (err) {
            console.error('Failed to load comments', err)
        }
    }

    /**
     * handleSubmit — posts a new comment.
     */
    const handleSubmit = async () => {
        if (!input.trim()) return
        try {
            const newComment = await createComment(postId, input)
            setInput('')
            setComments(prev => [...prev, newComment])
            onCommentAdded()
        } catch (err) {
            console.error('Comment failed', err)
        }
    }

    /**
     * handleDelete — deletes a comment after confirmation.
     */
    const handleDelete = async (commentId: number) => {
        if (!window.confirm('Delete this comment?')) return
        try {
            await deleteComment(postId, commentId)
            setComments(prev => prev.filter(c => c.id !== commentId))
            onCommentDeleted()
        } catch (err) {
            console.error('Delete comment failed', err)
        }
    }

    /**
     * handleUpdate — saves an edited comment.
     */
    const handleUpdate = async (commentId: number) => {
        try {
            await updateComment(postId, commentId, editContent)
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, content: editContent } : c
            ))
            setEditingId(null)
        } catch (err) {
            console.error('Update comment failed', err)
        }
    }

    return (
        <>
            {/* TOGGLE — only shown if post has comments */}
            {commentCount > 0 && (
                <div className="post-comments-preview" onClick={handleToggle}>
                    {open
                        ? 'Hide comments'
                        : `View all ${commentCount} comment${commentCount > 1 ? 's' : ''}`
                    }
                </div>
            )}

            {/* COMMENTS LIST — only rendered when open */}
            {open && (
                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment.id} className="comment-row">
                            <div className="comment-content">
                                <strong>{comment.author_username}</strong>

                                {/* show edit input if this comment is being edited */}
                                {editingId === comment.id ? (
                                    <div className="edit-comment-row">
                                        <input
                                            className="edit-comment-input"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdate(comment.id)
                                                if (e.key === 'Escape') setEditingId(null)
                                            }}
                                            autoFocus
                                        />
                                        <button className="edit-save-btn" onClick={() => handleUpdate(comment.id)}>Save</button>
                                        <button className="edit-cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <span>{comment.content}</span>
                                        {/* edit pencil only visible to comment owner */}
                                        {comment.author === currentUserId && (
                                            <button
                                                className="edit-btn-inline"
                                                onClick={() => {
                                                    setEditingId(comment.id)
                                                    setEditContent(comment.content)
                                                }}
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* delete button only visible to comment owner and not while editing */}
                            {comment.author === currentUserId && editingId !== comment.id && (
                                <button
                                    className="delete-comment-btn"
                                    onClick={() => handleDelete(comment.id)}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* COMMENT INPUT — always visible */}
            <div className="comment-input-row">
                <input
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                />
                <button className="comment-submit" onClick={handleSubmit}>
                    Post
                </button>
            </div>
        </>
    )
}

export default CommentList