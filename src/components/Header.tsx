import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssetPath } from '../utils/assets';
import { useCart } from '../context/CartContext';
import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `navbar-link${isActive ? ' active' : ''}`;

export default function Header() {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, userAttributes, logout, role } = useAuth();
  const { cartCount } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Logic for User Menu dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleScroll = () => {
      // If scrolling, maybe we want to close specific dropdowns? 
      // Or if the issue is that "Cách thức hoạt động" dropdown gets detached.
      // Usually CSS hover dropdowns are fine. If it's JS controlled, we might need to close.
      // User said "lost dropdown on scroll". If it's hover, it shouldn't be "lost" unless fixed position issues.
      // If they mean the User Menu (JS controlled), let's render it relatively or fixed properly.
      // For now, let's keep it simple.
      if (showDropdown) setShowDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
      <div className="container" style={{ position: 'relative' }}>
        {isMobileMenuOpen && <div className="mobile-backdrop" onClick={closeMobileMenu}></div>}
        <Link to="/" className="logo">
          <img
            src={getAssetPath('LogoEBcolor.png')}
            width={60}
            height={60}
            alt="Ecobrick logo"
          />
        </Link>

        <button
          className="nav-open-btn"
          type="button"
          aria-label="Mở menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <i className="fa-solid fa-bars" aria-hidden="true"></i>
        </button>

        {/* --- Navbar --- */}
        <nav className={`navbar ${isMobileMenuOpen ? 'active' : ''}`} data-navbar>
          <button
            className="nav-close-btn"
            type="button"
            aria-label="Đóng menu"
            onClick={closeMobileMenu}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
          <ul className="navbar-list">
            <li className="navbar-item">
              <NavLink to="/" className={navLinkClass} onClick={closeMobileMenu}>
                Trang chủ
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/about" className={navLinkClass} onClick={closeMobileMenu}>
                Về chúng tôi
              </NavLink>
            </li>

            {/* Products Dropdown - CSS Hover */}
            <li className="navbar-item dropdown">
              <NavLink to="/products" className={navLinkClass} onClick={closeMobileMenu}>
                Sản phẩm
              </NavLink>
              <ul className="dropdown-menu">
                <li><Link to="/products/gach-mosaic-xanh" onClick={closeMobileMenu}>Gạch Mosaic</Link></li>
                <li><Link to="/products/tam-op-ecoterrazzo" onClick={closeMobileMenu}>Tấm Ốp Tường</Link></li>
                <li><Link to="/products/khoi-nhua-hdpe" onClick={closeMobileMenu}>Nhựa Ép Khối</Link></li>
              </ul>
            </li>

            <li className="navbar-item">
              <NavLink to="/process" className={navLinkClass} onClick={closeMobileMenu}>
                Quy trình
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/contact" className={navLinkClass} onClick={closeMobileMenu}>
                Liên hệ
              </NavLink>
            </li>

            {/* How It Works Dropdown - CSS Hover */}
            <li className="navbar-item dropdown">
              <span className="navbar-link">Cách thức hoạt động</span>
              <ul className="dropdown-menu">
                <li><Link to="/how-it-works" onClick={closeMobileMenu}>Hướng dẫn</Link></li>
                <li><Link to="/rewards" onClick={closeMobileMenu}>Điểm & Ưu đãi</Link></li>
              </ul>
            </li>
          </ul>

          {/* --- Actions --- */}
          <ul className="nav-action-list">
            {/* Search */}
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
                {query && (
                  <button
                    type="button"
                    className="search-close"
                    onClick={() => setQuery('')}
                    aria-label="Xóa tìm kiếm"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </li>

            {/* Cart Icon */}
            <li>
              <Link to="/cart" className="nav-action-btn" style={{ position: 'relative', border: 'none', padding: '0.6rem' }} onClick={closeMobileMenu}>
                <i className="fa-solid fa-cart-shopping" style={{ fontSize: '1.2rem' }}></i>
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {/* User Menu */}
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

                  {/* Manual JS Dropdown */}
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
                        {role === 'admin' && (
                          <li>
                            <Link to="/admin" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                              <span>Trang quản trị</span>
                            </Link>
                          </li>
                        )}
                        <li>
                          <Link to="/profile" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                            <span>Hồ sơ của tôi</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/rewards" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                            <span>Điểm thưởng</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/history" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                            <span>Lịch sử hoạt động</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/vouchers" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                            <span>Voucher của tôi</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/redeem" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                            <span>Đổi quà</span>
                          </Link>
                        </li>
                      </ul>

                      <div className="user-dropdown-divider"></div>

                      <button className="user-dropdown-logout" onClick={handleLogout}>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink to="/login" className="nav-action-btn" onClick={closeMobileMenu}>
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
