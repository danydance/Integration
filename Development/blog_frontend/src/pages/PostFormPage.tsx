import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { createPost, getPost, updatePost } from '../api/posts'
import '../styles/global.css'
import Navbar from '../components/Navbar'

const MEDIA_URL = 'http://127.0.0.1:8000'

/**
 * PostFormPage — handles both creating and editing a post.
 *
 * Create mode: /create
 * - No existing data
 * - Calls createPost() on submit
 * - Navigates back to where user came from after success
 *
 * Edit mode: /edit/:id
 * - Fetches existing post data and pre-fills form
 * - Calls updatePost() on submit
 * - Navigates back to profile after success
 *
 * Mode is determined by whether :id param exists in the URL.
 */

const PostFormPage: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams<{ id: string }>()

    // if id exists in URL — we are in edit mode
    const isEditMode = !!id

    // where to go back — passed as state from the previous page
    const backTo = location.state?.from || '/'

    const fileInputRef = useRef<HTMLInputElement>(null)

    const [caption, setCaption] = useState<string>('')
    const [preview, setPreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState<boolean>(isEditMode) // only load if edit mode
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    // fetch existing post data in edit mode
    useEffect(() => {
        if (isEditMode) {
            fetchPost()
        }
    }, [])

    const fetchPost = async () => {
        try {
            const data = await getPost(Number(id))
            setCaption(data.caption)
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

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be under 5MB.')
            return
        }

        setError('')
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // create mode requires an image
        if (!isEditMode && !imageFile) {
            setError('Please select an image.')
            return
        }

        setSaving(true)
        try {
            if (isEditMode) {
                await updatePost(Number(id), caption, imageFile || undefined)
                navigate('/profile')
            } else {
                await createPost(imageFile!, caption)
                navigate(backTo)
            }
        } catch (err) {
            setError(`Failed to ${isEditMode ? 'save' : 'create'} post.`)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="upload-page-bg">
                <div style={{ color: '#555', textAlign: 'center', paddingTop: '100px' }}>
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <div className="upload-page-bg">
            <Navbar
                showBack
                backTo={isEditMode ? '/profile' : backTo}
            />

            <div className="upload-page-content">
                <form onSubmit={handleSubmit}>

                    {/* IMAGE UPLOAD AREA */}
                    <div
                        className="upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="preview" />
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
                            <>
                                <div className="upload-icon">🖼️</div>
                                <div className="upload-text">Click to upload a photo</div>
                                <div className="upload-subtext">JPEG, PNG or WEBP — max 5MB</div>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                    />

                    {error && <div className="form-error">{error}</div>}

                    {/* CAPTION */}
                    <div className="form-group">
                        <label>Caption</label>
                        <textarea
                            rows={3}
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={saving}
                    >
                        {saving
                            ? (isEditMode ? 'Saving...' : 'Sharing...')
                            : (isEditMode ? 'Save changes' : 'Share Post')
                        }
                    </button>

                </form>
            </div>
        </div>
    )
}

export default PostFormPage