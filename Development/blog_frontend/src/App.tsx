import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'

/** 
 * PrivateRoute, protects pages that require authentication
 * 
 * Checks if a token exists in localStorage.
 * If yes renders the page.
 * If no redirects to /login.
 * 
 * Not used for : Login, Register
*/
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const token = localStorage.getItem('token')
    return token ? element : <Navigate to="/login" />
}

/**
 * App - root component, sets up all routes. 
 * Public route (without token) : 
 *  /login - LoginPage
 *  /register - RegisterPage
 * 
 * Private routes (with token) : 
 *  / - FeedPage
 *  /profile - ProfilePage
 *  /create - CreatePostPage
 */
const App: React.FC = () => {
    return (
      // BrowserRouter enables URL-based navigation without page reloads
        <BrowserRouter>
            <Routes>
                {/* Public pages - can be entered without token */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Private pages - redirects to login without token */}
                <Route path="/" element={<PrivateRoute element={<FeedPage />} />} />
                <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
                <Route path="/edit/:id" element={<PrivateRoute element={<EditPostPage />} />} />
                <Route path="/create" element={<PrivateRoute element={<CreatePostPage />} />} />

                {/* Catch all unknown routes - redirect to login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App