import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-bottom-link${isActive ? ' active' : ''}`;

export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  return (
    <nav className="mobile-bottom-nav" aria-label="Điều hướng nhanh">
      <NavLink to="/" className={mobileNavLinkClass}>
        <i className="fa-solid fa-house" aria-hidden="true"></i>
        <span>Trang chủ</span>
      </NavLink>

      <NavLink to="/products" className={mobileNavLinkClass}>
        <i className="fa-solid fa-box" aria-hidden="true"></i>
        <span>Sản phẩm</span>
      </NavLink>

      <NavLink to="/products" className={mobileNavLinkClass}>
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <span>Tìm kiếm</span>
      </NavLink>

      <NavLink to="/cart" className={mobileNavLinkClass}>
        <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
        <span>Giỏ hàng</span>
        {cartCount > 0 && <span className="mobile-bottom-badge">{cartCount}</span>}
      </NavLink>

      <NavLink to={isAuthenticated ? '/profile' : '/login'} className={mobileNavLinkClass}>
        <i className="fa-solid fa-user" aria-hidden="true"></i>
        <span>{isAuthenticated ? 'Tài khoản' : 'Đăng nhập'}</span>
      </NavLink>
    </nav>
  );
}
