import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreatePostPage.css'

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [caption, setCaption] = useState<string>('')
    const [error, setError] = useState<string>('')

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // validate type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG and WEBP images are allowed.')
            return
        }

        // validate size — 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be under 5MB.')
            return
        }

        setError('')
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!image) {
            setError('Please select an image.')
            return
        }

        // will connect to API later
        console.log('creating post:', { image, caption })
        navigate('/')
    }

    return (
        <div className="create-bg">

            {/* NAVBAR */}
            <nav className="navbar">
                <button className="nav-back" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div className="nav-logo">Moments.</div>
                <div style={{ width: '60px' }} />
            </nav>

            <div className="create-page">
                <form onSubmit={handleSubmit}>

                    {/* UPLOAD AREA */}
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

                    {/* hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                    />

                    {/* ERROR */}
                    {error && <div className="create-error">{error}</div>}

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

                    <button type="submit" className="submit-btn">
                        Share Post
                    </button>

                </form>
            </div>
        </div>
    )
}

export default CreatePostPage