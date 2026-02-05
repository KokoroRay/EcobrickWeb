import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `navbar-link${isActive ? ' active' : ''}`;

export default function Header() {
  const [query, setQuery] = useState('');

  return (
    <header className="header" data-header>
      <div className="container">
        <div className="overlay" data-overlay></div>
        <Link to="/" className="logo">
          <img
            src={`${import.meta.env.BASE_URL}Logo%20EB%20m%C3%A0u.png`}
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
            <li className="navbar-item">
              <NavLink to="/how-it-works" className={navLinkClass}>
                Cách thức hoạt động
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/rewards" className={navLinkClass}>
                Điểm & Ưu đãi
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
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
              <NavLink to="/login" className="nav-action-btn">
                <i className="fa-solid fa-user" aria-hidden="true"></i>
                <span className="nav-action-text">Đăng nhập</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
