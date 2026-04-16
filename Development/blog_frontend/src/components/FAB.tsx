import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * FAB — floating action button for creating a new post.
 *
 * Used in: FeedPage, ProfilePage
 * Navigates to /create and passes the current page as state
 * so CreatePost knows where to go back to.
 */
const FAB: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = () => {
        // pass current page as state so PostFormPage knows where to go back
        navigate('/create', { state: { from: location.pathname } })
    }

    return (
        <button className="fab" onClick={handleClick}>
            +
        </button>
    )
}

export default FAB