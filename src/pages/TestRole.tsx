import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Trang test để kiểm tra role của user hiện tại
 * Truy cập: /test-role
 */
export default function TestRole() {
  const { isAuthenticated, user, userAttributes, role, isLoading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadTokenInfo();
    }
  }, [isAuthenticated]);

  const loadTokenInfo = async () => {
    try {
      const session = await fetchAuthSession();
      setTokenInfo({
        groups: session.tokens?.idToken?.payload['cognito:groups'],
        email: session.tokens?.idToken?.payload.email,
        sub: session.tokens?.idToken?.payload.sub,
        exp: session.tokens?.idToken?.payload.exp,
        iat: session.tokens?.idToken?.payload.iat,
      });
    } catch (error) {
      console.error('Load token error:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>⏳ Đang tải...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🔒 Chưa đăng nhập</h1>
        <p>Vui lòng <a href="/login" style={{ color: '#20803F' }}>đăng nhập</a> để xem thông tin.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <h1 style={{ color: '#20803F', marginBottom: '2rem' }}>🧪 Test Role & Token Info</h1>

      {/* User Info */}
      <section style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d2d2d' }}>👤 Thông tin User</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem', fontWeight: 600, width: '200px' }}>Username:</td>
              <td style={{ padding: '0.75rem' }}>{user?.username || 'N/A'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem', fontWeight: 600 }}>Email:</td>
              <td style={{ padding: '0.75rem' }}>{userAttributes?.email || 'N/A'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem', fontWeight: 600 }}>Name:</td>
              <td style={{ padding: '0.75rem' }}>{userAttributes?.name || 'N/A'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem', fontWeight: 600 }}>Email Verified:</td>
              <td style={{ padding: '0.75rem' }}>
                {userAttributes?.email_verified === 'true' ? (
                  <span style={{ color: '#20803F', fontWeight: 600 }}>✓ Đã xác thực</span>
                ) : (
                  <span style={{ color: '#dc3545', fontWeight: 600 }}>✗ Chưa xác thực</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Role Info */}
      <section style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d2d2d' }}>🔐 Phân quyền (Role)</h2>
        <div style={{ 
          padding: '1.5rem', 
          background: role === 'admin' ? '#f0f9f4' : '#f6f7f9', 
          borderRadius: '8px',
          border: `2px solid ${role === 'admin' ? '#20803F' : '#ddd'}`
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {role === 'admin' ? '👑' : '👤'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: role === 'admin' ? '#20803F' : '#666', marginBottom: '0.5rem' }}>
            {role === 'admin' ? 'ADMIN' : 'USER'}
          </div>
          <div style={{ fontSize: '0.95rem', color: '#666' }}>
            {role === 'admin' 
              ? 'Bạn có quyền truy cập trang /admin' 
              : 'Bạn chỉ có quyền truy cập các trang user (rewards, vouchers, redeem)'}
          </div>
        </div>
      </section>

      {/* Cognito Groups */}
      <section style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d2d2d' }}>👥 Cognito Groups</h2>
        {tokenInfo?.groups && tokenInfo.groups.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tokenInfo.groups.map((group: string) => (
              <span 
                key={group}
                style={{
                  padding: '0.5rem 1rem',
                  background: group === 'admin' ? '#20803F' : '#17a2b8',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {group}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            Không có group nào. Liên hệ admin để được thêm vào group.
          </p>
        )}
      </section>

      {/* Token Info */}
      <section style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d2d2d' }}>🎫 Token Info</h2>
        {tokenInfo ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600, width: '200px' }}>Subject (sub):</td>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem', wordBreak: 'break-all' }}>{tokenInfo.sub}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Email:</td>
                <td style={{ padding: '0.75rem' }}>{tokenInfo.email}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Issued At:</td>
                <td style={{ padding: '0.75rem' }}>{new Date(tokenInfo.iat * 1000).toLocaleString('vi-VN')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Expires At:</td>
                <td style={{ padding: '0.75rem' }}>{new Date(tokenInfo.exp * 1000).toLocaleString('vi-VN')}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Time Remaining:</td>
                <td style={{ padding: '0.75rem' }}>
                  {Math.round((tokenInfo.exp * 1000 - Date.now()) / 1000 / 60)} phút
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Đang tải token info...</p>
        )}
      </section>

      {/* Access Test */}
      <section style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d2d2d' }}>🧪 Test Quyền truy cập</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f6f7f9', borderRadius: '8px' }}>
            <div>
              <strong>/rewards</strong> - Điểm thưởng
            </div>
            <span style={{ color: '#20803F', fontWeight: 600 }}>✓ Có quyền</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f6f7f9', borderRadius: '8px' }}>
            <div>
              <strong>/vouchers</strong> - Voucher của tôi
            </div>
            <span style={{ color: '#20803F', fontWeight: 600 }}>✓ Có quyền</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f6f7f9', borderRadius: '8px' }}>
            <div>
              <strong>/redeem</strong> - Đổi quà
            </div>
            <span style={{ color: '#20803F', fontWeight: 600 }}>✓ Có quyền</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f6f7f9', borderRadius: '8px' }}>
            <div>
              <strong>/admin</strong> - Quản trị
            </div>
            {role === 'admin' ? (
              <span style={{ color: '#20803F', fontWeight: 600 }}>✓ Có quyền</span>
            ) : (
              <span style={{ color: '#dc3545', fontWeight: 600 }}>✗ Không có quyền</span>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <a 
          href="/admin"
          style={{
            padding: '0.75rem 1.5rem',
            background: role === 'admin' ? '#20803F' : '#999',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: role === 'admin' ? 'pointer' : 'not-allowed'
          }}
        >
          Thử truy cập /admin
        </a>
        <button 
          onClick={loadTokenInfo}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Token Info
        </button>
      </section>

      {/* Raw JSON */}
      <details style={{ marginTop: '2rem' }}>
        <summary style={{ 
          cursor: 'pointer', 
          padding: '1rem', 
          background: '#f6f7f9', 
          borderRadius: '8px',
          fontWeight: 600
        }}>
          📋 View Raw JSON
        </summary>
        <pre style={{ 
          marginTop: '1rem',
          padding: '1rem', 
          background: '#2d2d2d', 
          color: '#f6f7f9',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.85rem'
        }}>
          {JSON.stringify({
            user,
            userAttributes,
            role,
            tokenInfo
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
