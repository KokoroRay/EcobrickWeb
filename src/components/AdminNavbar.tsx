import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAssetPath } from '../utils/assets';

export default function AdminNavbar() {
    const { logout, userAttributes, user } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const displayName = userAttributes?.name || user?.username || 'Admin';

    return (
        <header className="admin-header-nav">
            <div className="admin-nav-container">
                <Link to="/admin" className="admin-logo">
                    <img
                        src={getAssetPath('LogoEBcolor.png')}
                        width={40}
                        height={40}
                        alt="Ecobrick Admin"
                    />
                    <span className="logo-text">Ecobrick <span className="logo-badge">Admin</span></span>
                </Link>

                <div className="admin-user-controls">
                    <div
                        className="admin-profile-wrapper"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="admin-profile">
                            <div className="avatar-circle">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <span className="admin-name">{displayName} <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}></i></span>
                        </div>

                        {showProfileMenu && (
                            <div className="admin-profile-dropdown">
                                <div className="dropdown-item" onClick={handleLogout}>
                                    <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
