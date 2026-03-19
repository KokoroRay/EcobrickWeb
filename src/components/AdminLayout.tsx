import { ReactNode } from 'react';
import AdminNavbar from './AdminNavbar';
import { NavLink } from 'react-router-dom';

type AdminLayoutProps = {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
};

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
    const menuItems = [
        { id: 'overview', icon: 'fa-chart-pie', label: 'Tổng quan' },
        { id: 'orders', icon: 'fa-box-open', label: 'Quản lý Đơn' },
        { id: 'users', icon: 'fa-users', label: 'Người dùng' },
        { id: 'products', icon: 'fa-box', label: 'Sản phẩm' },
        { id: 'vouchers', icon: 'fa-ticket', label: 'Voucher & Cấu hình' },
    ];

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-body">
                <aside className="admin-idx-sidebar">
                    <div className="admin-side-top">
                        <div className="admin-side-title">Điều hướng</div>
                    <nav className="admin-side-nav">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`admin-nav-link ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => onTabChange(item.id)}
                            >
                                <i className={`fa-solid ${item.icon} nav-icon`}></i>
                                <span>{item.label}</span>
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
