import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/profile'
import { getPosts } from '../api/posts'
import { Profile, Post } from '../types'
import './ProfilePage.css'

const MEDIA_URL = 'http://127.0.0.1:8000'



/**
 * ProfilePage - shows the current users profile and their posts.
 * 
 * Features: 
 * - Shows avatar, username, boi and posts
 * - Inline editing
 * - Avatar change
 * - Post grid
 * 
 * API :
 * - Profile GET /api/users/<id>/profile
 * - Posts GET /api/posts/ 
 */
const ProfilePage: React.FC = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Profile state
    const [profile, setProfile] = useState<Profile | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Edit mode state
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

    // Fetch profile and posts 
    useEffect(() => {
        fetchProfile()
        fetchUserPosts()
    }, [])

    /**
     * fetchProfile - loads the current users profile from the API.
     */
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

            // Save to localStorage so feed can use it
            if (picUrl) localStorage.setItem('userAvatar', picUrl)
            localStorage.setItem('userUsername', data.username)

        } catch (err) {
            console.error('Failed to load profile', err)
        } finally {
            setLoading(false)
        }
    }

    /**
     * fetchUserPosts - loads all posts and filters to only the current users.
     */
    const fetchUserPosts = async () => {
        try {
            const data = await getPosts()
            // Filter only current user's posts
            const id = getUserId()
            setPosts(data.posts.filter(p => p.author === id))
        } catch (err) {
            console.error('Failed to load posts', err)
        }
    }

    /** 
     * handleAvatarChange - runs when user picks a new avatar file.
    */
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }
    /**
     * handleSave - sends update profile to the API.
     */
    const handleSave = async () => {
        try {
            const id = getUserId()
            const updated = await updateProfile(
                id,
                bio,
                avatarFile || undefined // Undefined means keep existing picture
            )
            setProfile(updated)
            setEditing(false)
            setAvatarFile(null)
        } catch (err) {
            setError('Failed to update profile.')
        }
    }

    /**
     * handleCancel - discard all edits and resets to original values.
     */
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
    // Show loading screen while profile is being fetched.
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
                    {/* Avatar - clickable only in edit mode. */}
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
                                {/* Edit mode — bio becomes a textarea */}
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
                                {/* view mode — show username and bio as text */}
                                <div className="profile-username">{username}</div>
                                <div className="profile-bio">{bio || 'No bio yet'}</div>
                            </>
                        )}

                        {/* post count — uses filtered posts length from fetchUserPosts */}
                        <div className="profile-stats">
                            <div className="stat">
                                <div className="stat-number">{posts.length}</div>
                                <div className="stat-label">Posts</div>
                            </div>
                        </div>

                        {/* buttons switch between edit mode and view mode */}
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

                {/* POST GRID*/}
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
                                {/* overlay shows likes and comments on hover */}
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