import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/profile'
import { getPosts } from '../api/posts'
import { Profile, Post } from '../types'
import './ProfilePage.css'

const MEDIA_URL = 'http://127.0.0.1:8000'

const ProfilePage: React.FC = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState<Profile | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [editing, setEditing] = useState<boolean>(false)
    const [username, setUsername] = useState<string>('')
    const [bio, setBio] = useState<string>('')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [error, setError] = useState<string>('')

    // Get user id from token
    const getUserId = (): number => {
        const id = localStorage.getItem('userId')
        return id ? parseInt(id) : 1
    }

    useEffect(() => {
        fetchProfile()
        fetchUserPosts()
    }, [])

    const fetchProfile = async () => {
        try {
            const id = getUserId()
            const data = await getProfile(id)
            setProfile(data)
            setUsername(data.username)
            setBio(data.bio)

            const picUrl = data.profile_picture
                ? data.profile_picture.startsWith('http')
                    ? data.profile_picture
                    : `${MEDIA_URL}${data.profile_picture}`
                : null

            setAvatarPreview(picUrl)

            // save to localStorage so feed can use it
            if (picUrl) localStorage.setItem('userAvatar', picUrl)
            localStorage.setItem('userUsername', data.username)

        } catch (err) {
            console.error('Failed to load profile', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserPosts = async () => {
        try {
            const data = await getPosts()
            // filter only current user's posts
            const id = getUserId()
            setPosts(data.posts.filter(p => p.author === id))
        } catch (err) {
            console.error('Failed to load posts', err)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        try {
            const id = getUserId()
            const updated = await updateProfile(
                id,
                bio,
                avatarFile || undefined
            )
            setProfile(updated)
            setEditing(false)
            setAvatarFile(null)
        } catch (err) {
            setError('Failed to update profile.')
        }
    }

    const handleCancel = () => {
        if (profile) {
            setUsername(profile.username)
            setBio(profile.bio)
            setAvatarPreview(
                profile.profile_picture
                    ? `${MEDIA_URL}${profile.profile_picture}`
                    : null
            )
        }
        setAvatarFile(null)
        setEditing(false)
    }

    if (loading) {
        return (
            <div className="profile-bg">
                <div style={{ color: '#555', textAlign: 'center', paddingTop: '100px' }}>
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <div className="profile-bg">
            <nav className="navbar">
                <button className="nav-back" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div className="nav-logo">Moments.</div>
                <div style={{ width: '60px' }} />
            </nav>

            <div className="profile-page">
                <div className="profile-header">

                    <div
                        className="profile-avatar"
                        onClick={() => editing && fileInputRef.current?.click()}
                    >
                        {avatarPreview
                            ? <img src={avatarPreview} alt="avatar" />
                            : username[0]?.toUpperCase()
                        }
                        {editing && <div className="avatar-overlay">📷</div>}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                    />

                    <div className="profile-info">
                        {editing ? (
                            <>

                                <div className="field-label">Bio</div>
                                <textarea
                                    className="bio-input"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={2}
                                />
                                {error && <div style={{ color: '#e07070', fontSize: '12px', marginBottom: '8px' }}>{error}</div>}
                            </>
                        ) : (
                            <>
                                <div className="profile-username">{username}</div>
                                <div className="profile-bio">{bio || 'No bio yet'}</div>
                            </>
                        )}

                        <div className="profile-stats">
                            <div className="stat">
                                <div className="stat-number">{posts.length}</div>
                                <div className="stat-label">Posts</div>
                            </div>
                        </div>

                        {editing ? (
                            <div className="btn-row">
                                <button className="save-btn" onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </div>
                        ) : (
                            <button className="edit-btn" onClick={() => setEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="posts-grid-title">Posts</div>
                {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#555555', fontSize: '14px', padding: '40px 0' }}>
                        No posts yet
                    </div>
                ) : (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <div key={post.id} className="grid-item">
                                {post.image && <img src={post.image} alt="post" />}
                                <div className="grid-item-overlay">
                                    <span>❤️ {post.likes}</span>
                                    <span>💬 {post.comments}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage