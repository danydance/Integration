import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import './RegisterPage.css'

/**
 * RegisterPage — registration page for new users.
 *
 * Flow:
 * 1. User enters username, password and confirm password
 * 2. Frontend validates before sending to API:
 *    - Passwords must match
 *    - Password must be at least 8 characters
 * 3. Calls POST /api/auth/register/ → gets token and user info
 * 4. Saves token and userId to localStorage
 * 5. Navigates to feed
 * 
 * localStorage keys set here:
 * - token
 * - userId
 */

const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    /**
     * handleSubmit — validates inputs then calls the register API.
     */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Check passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        // Check minimum length
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        setLoading(true)
        try {
            const response = await register(username, password)
            // Save token and go to feed
            localStorage.setItem('token', response.token)
            if (response.user) {
                localStorage.setItem('userId', String(response.user.id))
            }
            navigate('/')
        } catch (err: any) {
            // Username already taken or other error
            if (err?.username) {
                setError(err.username[0])
            } else {
                setError('Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-bg">
            <div className="register-card">
                <div className="register-logo">Insta Beck</div>
                <div className="register-tagline">Share all your life secrets.</div>
                
                {/* Error message — shown for both frontend and API errors */}
                {error && <div className="register-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Confirm password — validated client side before API call */}
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

                    {/* Disabled while request is in flight to prevent double submit */}
                    <div className="form-group">
                        <label>Password check</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Create account
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line" />
                    <div className="divider-text">or</div>
                    <div className="divider-line" />
                </div>

                <div className="login-link">
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')}>Sign in</span>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage