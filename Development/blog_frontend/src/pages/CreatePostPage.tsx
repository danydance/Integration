import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../api/posts'
import './CreatePostPage.css'

/**
 * CreatePostPage - page for creating a new post.
 * 
 * Flow : 
 * 1. User clicks the upload button
 * 2. User selects and image
 * 3. User writes a caption
 * 4. User clicks Share Post - calls POST /api/posts/
 * 5. navigates back to feed
 * 
 * Validation (frontend):
 * - File type must JPEG, PNG or WEBP
 * - File size under 1000MB
 * - Is required
 */

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate()

    // ref to the hidden file input - triggered programmatically when upload area is clicked
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [image, setImage] = useState<File | null>(null)       // Actual file to upload
    const [preview, setPreview] = useState<string | null>(null) // local URL for preview
    const [caption, setCaption] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    /**
     * handleImageSelect — runs when user picks a file.
     * Validates type and size before showing preview.
     */
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG and WEBP images are allowed.')
            return
        }

        // Validate file size - max 1000MB
        if (file.size > 1000 * 1024 * 1024) {
            setError('Image must be under 5MB.')
            return
        }

        setError('')
        setImage(file)
        // createObjectURL creates a temporary local URL for the file - no upload yet
        setPreview(URL.createObjectURL(file))
    }

    /**
     * handleSubmit - sends the post to the API.
     * Uses FormData because were sending a file along text.
     * On success navigates back to feed.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!image) {
            setError('Please select an image.')
            return
        }

        setLoading(true)
        try {
            await createPost(image, caption)
            navigate('/')
        } catch (err: any) {
            setError('Failed to create post. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="create-bg">
            <nav className="navbar">
                <button className="nav-back" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div className="nav-logo">Moments.</div>
                <div style={{ width: '60px' }} />
            </nav>

            <div className="create-page">
                <form onSubmit={handleSubmit}>
                    {/* 
                        Upload area - clicking it triggers the hidden file input.
                        Shows preview image once a file is selected.
                        Shows placeholder text and icon before selection.
                    */}

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
                                        // stopPropagation prevents the click from
                                        // bubbling up to the upload-area div
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

                    {/*
                        Hidden file input - never shown to the user directly.
                        Triggered by clicking the upload area or change photo button
                    */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                    />
                    {/* Only shown when theres a validation or API error */}
                    {error && <div className="create-error">{error}</div>}

                    <div className="form-group">
                        <label>Caption</label>
                        <textarea
                            rows={3}
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>
                    
                    {/* Disabled while request is happaning to prevent double submit */}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Sharing...' : 'Share Post'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default CreatePostPage