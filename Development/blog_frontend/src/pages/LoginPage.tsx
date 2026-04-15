import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { getProfile } from '../api/profile'
import './LoginPage.css'

/**
 * LoginPage.
 *
 * Flow:
 * 1. User enters username and password
 * 2. Calls POST /api/auth/login/ and gets a token
 * 3. Saves token to localStorage
 * 4. Fetches user list to find current users id saves to localStorage
 * 5. Fetches profile to get avatar → saves to localStorage
 * 6. Plays transition animation then navigates to feed
 *
 * localStorage keys set here:
 * - token    
 * - userId
 * - userAvatar
 * - userUsername
 */

const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    // Leaving - triggers the push-up animation
    const [leaving, setLeaving] = useState<boolean>(false)

    
    /**
     * handleSubmit - handles login form submission
     * 
     * After a successful login we need three pieces of data :
     * 1. token 
     * 2. userID
     * 3. avatar
     * 
     * We save all three to localStorage
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Login and save token
            const response = await login(username, password)
            localStorage.setItem('token', response.token)

            // Get user id
            const { getUsers } = await import('../api/auth')
            const usersData = await getUsers()
            const currentUser = usersData.users.find(u => u.username === username)
            if (currentUser) {
                localStorage.setItem('userId', String(currentUser.id))

                // Fetch profile and save avatar
                const profile = await getProfile(currentUser.id)
                if (profile.profile_picture) {
                    const avatar = profile.profile_picture.startsWith('http')
                        ? profile.profile_picture
                        : `http://127.0.0.1:8000${profile.profile_picture}`
                    localStorage.setItem('userAvatar', avatar)
                }
                localStorage.setItem('userUsername', profile.username)
            }
            // Play animation then navigate
            setLeaving(true)
            setTimeout(() => navigate('/'), 800)
        } catch (err: any) {
            setError('Invalid username or password.')
            setLoading(false)
        }
    }

    return (
        <div className="login-bg">

            {/* FAKE POSTS sliding up from below for animation */}
            <div className={`posts-preview ${leaving ? 'slide-up' : ''}`}>
                <div className="fake-post" />
                <div className="fake-post" />
                <div className="fake-post" />
            </div>

            {/* LOGIN CARD gets pushed up */}
            <div className={`login-card ${leaving ? 'push-up' : ''}`}>
                <div className="login-logo">Insta Beck</div>
                <div className="login-tagline">Share what matters</div>

                {/* ERROR message - only when login fails */}
                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* Disable during loading so there wont be a double submit */}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || leaving}
                    >
                        Sign in
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line" />
                    <div className="divider-text">or</div>
                    <div className="divider-line" />
                </div>

                <div className="register-link">
                    Don't have an account?{' '}
                    <span onClick={() => navigate('/register')}>Create one</span>
                </div>
            </div>
        </div>
    )
}

export default LoginPage