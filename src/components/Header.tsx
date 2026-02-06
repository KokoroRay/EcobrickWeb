import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssetPath } from '../utils/assets';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `navbar-link${isActive ? ' active' : ''}`;

export default function Header() {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, user, userAttributes, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getInitials = () => {
    if (userAttributes?.name) {
      const names = userAttributes.name.split(' ');
      return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (userAttributes?.email) {
      return userAttributes.email[0].toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="header" data-header>
      <div className="container">
        <div className="overlay" data-overlay></div>
        <Link to="/" className="logo">
          <img
            src={getAssetPath('LogoEBcolor.png')}
            width={60}
            height={60}
            alt="Ecobrick logo"
          />
        </Link>

        <nav className="navbar" data-navbar>
          <ul className="navbar-list">
            <li className="navbar-item">
              <NavLink to="/" className={navLinkClass}>
                Trang chủ
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/about" className={navLinkClass}>
                Về chúng tôi
              </NavLink>
            </li>
            <li className="navbar-item dropdown">
              <NavLink to="/products" className={navLinkClass}>
                Sản phẩm
              </NavLink>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/products/gach-xanh">Gạch Mini</Link>
                </li>
                <li>
                  <Link to="/products/gach-vang">Gạch Standard</Link>
                </li>
                <li>
                  <Link to="/products/gach-do">Gạch Premium</Link>
                </li>
              </ul>
            </li>
            <li className="navbar-item">
              <NavLink to="/process" className={navLinkClass}>
                Quy trình
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/contact" className={navLinkClass}>
                Liên hệ
              </NavLink>
            </li>
            <li className="navbar-item dropdown">
              <span className="navbar-link">Cách thức hoạt động</span>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/how-it-works">Cách thức hoạt động</Link>
                </li>
                <li>
                  <Link to="/rewards">Điểm & Ưu đãi</Link>
                </li>
              </ul>
            </li>
          </ul>

          <ul className="nav-action-list">
            <li className="search-wrapper">
              <div className="search-bar">
                <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="search-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button
                  type="button"
                  className="search-close"
                  onClick={() => setQuery('')}
                  aria-label="Xóa tìm kiếm"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
            </li>
            <li>
              {isAuthenticated ? (
                <div className="user-menu" ref={dropdownRef}>
                  <button
                    className="user-avatar-btn"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label="User menu"
                  >
                    <div className="user-avatar">
                      {getInitials()}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-avatar large">
                          {getInitials()}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{userAttributes?.name || user?.username}</div>
                          <div className="user-email">{userAttributes?.email}</div>
                        </div>
                      </div>

                      <div className="user-dropdown-divider"></div>

                      <ul className="user-dropdown-menu">
                        <li>
                          <Link to="/rewards" onClick={() => setShowDropdown(false)}>
                            <i className="fa-solid fa-gift"></i>
                            <span>Điểm thưởng</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/vouchers" onClick={() => setShowDropdown(false)}>
                            <i className="fa-solid fa-ticket"></i>
                            <span>Voucher của tôi</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/redeem" onClick={() => setShowDropdown(false)}>
                            <i className="fa-solid fa-trophy"></i>
                            <span>Đổi quà</span>
                          </Link>
                        </li>
                      </ul>

                      <div className="user-dropdown-divider"></div>

                      <button className="user-dropdown-logout" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink to="/login" className="nav-action-btn">
                  <i className="fa-solid fa-user" aria-hidden="true"></i>
                  <span className="nav-action-text">Đăng nhập</span>
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
