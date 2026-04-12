import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'



const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<FeedPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/create" element={<CreatePostPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App