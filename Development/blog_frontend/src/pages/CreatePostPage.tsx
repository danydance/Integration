import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../api/posts'
import './CreatePostPage.css'

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [caption, setCaption] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG and WEBP images are allowed.')
            return
        }

        if (file.size > 1000 * 1024 * 1024) {
            setError('Image must be under 5MB.')
            return
        }

        setError('')
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

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