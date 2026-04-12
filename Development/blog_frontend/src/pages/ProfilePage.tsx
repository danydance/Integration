import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'

interface Post {
    id: number
    image: string
    likes: number
    comments: number
}

interface Profile {
    id: number
    username: string
    bio: string
    profile_picture: string | null
    posts_count: number
    total_likes: number
}

const DUMMY_PROFILE: Profile = {
    id: 1,
    username: 'danielbeck',
    bio: 'Capturing moments one photo at a time 📸',
    profile_picture: 'https://picsum.photos/80/80?random=10',
    posts_count: 6,
    total_likes: 248,
}

const DUMMY_POSTS: Post[] = [
    { id: 1, image: 'https://picsum.photos/200/200?random=1', likes: 12, comments: 3 },
    { id: 2, image: 'https://picsum.photos/200/200?random=2', likes: 8, comments: 1 },
    { id: 3, image: 'https://picsum.photos/200/200?random=3', likes: 24, comments: 5 },
    { id: 4, image: 'https://picsum.photos/200/200?random=4', likes: 6, comments: 2 },
    { id: 5, image: 'https://picsum.photos/200/200?random=5', likes: 18, comments: 4 },
    { id: 6, image: 'https://picsum.photos/200/200?random=6', likes: 31, comments: 7 },
]

const ProfilePage: React.FC = () => {
    const navigate = useNavigate()
    const [profile] = useState<Profile>(DUMMY_PROFILE)
    const [posts] = useState<Post[]>(DUMMY_POSTS)
    const [editing, setEditing] = useState<boolean>(false)
    const [bio, setBio] = useState<string>(DUMMY_PROFILE.bio)

    return (
        <div className="profile-bg">

            {/* NAVBAR */}
            <nav className="navbar">
                <button className="nav-back" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div className="nav-logo">Moments.</div>
                <div style={{ width: '60px' }} />
            </nav>

            <div className="profile-page">

                {/* PROFILE HEADER */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile.profile_picture
                            ? <img src={profile.profile_picture} alt="avatar" />
                            : profile.username[0].toUpperCase()
                        }
                    </div>
                    <div className="profile-info">
                        <div className="profile-username">{profile.username}</div>

                        {editing ? (
                            <textarea
                                className="bio-input"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={2}
                            />
                        ) : (
                            <div className="profile-bio">{bio}</div>
                        )}

                        <div className="profile-stats">
                            <div className="stat">
                                <div className="stat-number">{profile.posts_count}</div>
                                <div className="stat-label">Posts</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">{profile.total_likes}</div>
                                <div className="stat-label">Likes</div>
                            </div>
                        </div>

                        <button
                            className="edit-btn"
                            onClick={() => setEditing(!editing)}
                        >
                            {editing ? 'Save' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* POST GRID */}
                <div className="posts-grid-title">Posts</div>
                <div className="posts-grid">
                    {posts.map(post => (
                        <div
                            key={post.id}
                            className="grid-item"
                            onClick={() => console.log('open post', post.id)}
                        >
                            <img src={post.image} alt="post" />
                            <div className="grid-item-overlay">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.comments}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default ProfilePage