import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();

  // Đang tải thông tin xác thực
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #20803F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '1rem' }}>Đang tải...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> redirect về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không phải admin -> hiển thị thông báo
  if (role !== 'admin') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          color: '#dc3545'
        }}>
          🚫
        </div>
        <h2 style={{
          color: '#2d2d2d',
          fontSize: '1.75rem',
          fontWeight: 600
        }}>
          Không có quyền truy cập
        </h2>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          maxWidth: '480px'
        }}>
          Bạn không có quyền truy cập trang này. Chỉ tài khoản Admin mới có thể truy cập trang quản trị.
        </p>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            background: '#20803F',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1a6633'}
          onMouseOut={(e) => e.currentTarget.style.background = '#20803F'}
        >
          Về trang chủ
        </a>
      </div>
    );
  }

  // Là admin -> hiển thị nội dung
  return <>{children}</>;
}
