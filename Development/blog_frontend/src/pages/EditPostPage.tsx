import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, updatePost } from '../api/posts'
import { Post } from '../types'
import './EditPostPage.css'

const MEDIA_URL = 'http://127.0.0.1:8000'

/**
 * EditPostPage — edit an existing post.
 *
 * Flow:
 * 1. Reads post id from URL params
 * 2. Fetches the post data
 * 3. Pre-fills caption and shows existing image
 * 4. User can update caption and optionally change image
 * 5. On save → PATCH /api/posts/<id>/ → navigate back to profile
 */
const EditPostPage: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()  // reads :id from URL
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const [post, setPost] = useState<Post | null>(null)
    const [caption, setCaption] = useState<string>('')
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    // fetch post on mount
    useEffect(() => {
        fetchPost()
    }, [])

    const fetchPost = async () => {
        try {
            const data = await getPost(Number(id))
            setPost(data)
            setCaption(data.caption)
            // fix image URL if relative
            setPreview(
                data.image
                    ? data.image.startsWith('http')
                        ? data.image
                        : `${MEDIA_URL}${data.image}`
                    : null
            )
        } catch (err) {
            setError('Failed to load post.')
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG and WEBP are allowed.')
            return
        }

        if (file.size > 1000 * 1024 * 1024) {
            setError('Image must be under 1000MB.')
            return
        }

        setError('')
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        if (!id) return
        setSaving(true)
        try {
            await updatePost(Number(id), caption, imageFile || undefined)
            navigate('/profile')
        } catch (err) {
            setError('Failed to save post.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="edit-post-bg">
                <div style={{ color: '#555', textAlign: 'center', paddingTop: '100px' }}>
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <div className="edit-post-bg">
            <nav className="navbar">
                <button className="nav-back" onClick={() => navigate('/profile')}>
                    ← Back
                </button>
                <div className="nav-logo">Insta Beck</div>
                <div style={{ width: '60px' }} />
            </nav>

            <div className="edit-post-page">

                {/* IMAGE — shows existing image, click to change */}
                <div
                    className="upload-area"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {preview ? (
                        <>
                            <img src={preview} alt="post" />
                            <button
                                type="button"
                                className="change-photo-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    fileInputRef.current?.click()
                                }}
                            >
                                📷 Change photo
                            </button>
                        </>
                    ) : (
                        <div className="upload-text">No image</div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                />

                {error && <div className="edit-error">{error}</div>}

                {/* CAPTION */}
                <div className="form-group">
                    <label>Caption</label>
                    <textarea
                        rows={3}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                    />
                </div>

                <button
                    className="submit-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save changes'}
                </button>

            </div>
        </div>
    )
}

export default EditPostPage