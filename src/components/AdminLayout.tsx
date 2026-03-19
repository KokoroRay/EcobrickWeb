import { ReactNode, useState } from 'react';
import AdminNavbar from './AdminNavbar';

type AdminLayoutProps = {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
};

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const menuItems = [
        { id: 'overview', icon: 'fa-chart-pie', label: 'Tổng quan' },
        { id: 'orders', icon: 'fa-box-open', label: 'Quản lý Đơn' },
        { id: 'users', icon: 'fa-users', label: 'Người dùng' },
        { id: 'products', icon: 'fa-box', label: 'Sản phẩm' },
        { id: 'vouchers', icon: 'fa-ticket', label: 'Voucher & Cấu hình' },
    ];

    const toggleSidebarState = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-body">
                <aside
                    className={`admin-idx-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
                >
                    <div className="admin-side-top">
                        <div className="admin-side-title">Điều hướng</div>
                        <button
                            type="button"
                            className="admin-side-pin"
                            aria-label={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
                            title={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                            onClick={toggleSidebarState}
                        >
                            <i className={`fa-solid ${isSidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
                        </button>
                    <nav className="admin-side-nav">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`admin-nav-link ${activeTab === item.id ? 'active' : ''}`}
                                title={item.label}
                                onClick={() => onTabChange(item.id)}
                            >
                                <i className={`fa-solid ${item.icon} nav-icon`}></i>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    </div>
                    <div className="admin-side-foot">
                        <div className="admin-side-tip">
                            <i className="fa-solid fa-shield-heart"></i>
                            Dữ liệu vận hành bảo mật qua AWS Cognito
                        </div>
                        <div className="admin-version">v1.2.0 • Ecobrick Admin</div>
                    </div>
                </aside>
                <main className="admin-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
