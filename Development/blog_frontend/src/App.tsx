import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'


const isLoggedIn = (): boolean => {
  return localStorage.getItem('token') !== null
}

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={isLoggedIn() ? <FeedPage /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isLoggedIn() ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/create" element={isLoggedIn() ? <CreatePostPage /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App