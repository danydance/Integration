import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const token = localStorage.getItem('token')
    return token ? element : <Navigate to="/login" />
}

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<PrivateRoute element={<FeedPage />} />} />
                <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
                <Route path="/create" element={<PrivateRoute element={<CreatePostPage />} />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App