import React from 'react'
import { useNavigate } from 'react-router-dom'

interface NavbarProps {
    showBack?: boolean      // show ← Back button
    backTo?: string         // where back goes — default '/'
    showAvatar?: boolean    // show avatar in top right
    showLogout?: boolean    // show sign out button
    onLogout?: () => void   // logout handler
}

/**
 * Navbar — shared top navigation bar.
 *
 * Used in: FeedPage, ProfilePage, PostFormPage
 * Props control which elements are shown — flexible for each page.
 */
const Navbar: React.FC<NavbarProps> = ({
    showBack = false,
    backTo = '/',
    showAvatar = false,
    showLogout = false,
    onLogout,
}) => {
    const navigate = useNavigate()
    const avatar = localStorage.getItem('userAvatar')
    const navUsername = localStorage.getItem('userUsername') || 'U'

    return (
        <nav className="navbar">
            {/* left side — back button or empty space */}
            {showBack ? (
                <button className="nav-back" onClick={() => navigate(backTo)}>
                    ← Back
                </button>
            ) : (
                <div style={{ width: '60px' }} />
            )}

            {/* center — logo */}
            <div className="nav-logo">Moments.</div>

            {/* right side — avatar or empty space */}
            {showAvatar ? (
                <div className="nav-actions">
                    {showLogout && (
                        <button className="logout-btn" onClick={onLogout}>
                            Sign out
                        </button>
                    )}
                    <div className="nav-avatar" onClick={() => navigate('/profile')}>
                        {avatar
                            ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : navUsername[0].toUpperCase()
                        }
                    </div>
                </div>
            ) : (
                <div style={{ width: '60px' }} />
            )}
        </nav>
    )
}

export default Navbar