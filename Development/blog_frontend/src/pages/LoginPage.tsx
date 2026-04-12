import React, { useState } from 'react'
import './LoginPage.css'

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('username:', username, 'password:', password)
    }

    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="login-logo">Moments.</div>
                <div className="login-tagline">Share what matters</div>

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

                    <button type="submit" className="submit-btn">
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
                    <span>Create one</span>
                </div>
            </div>
        </div>
    )
}

export default LoginPage