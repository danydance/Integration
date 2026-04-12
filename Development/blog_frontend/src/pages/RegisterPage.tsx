import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RegisterPage.css'

const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // check passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        // check minimum length
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        console.log('username:', username, 'password:', password)
    }

    return (
        <div className="register-bg">
            <div className="register-card">
                <div className="register-logo">Insta 2.0</div>
                <div className="register-tagline">Share all your life secrets.</div>

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