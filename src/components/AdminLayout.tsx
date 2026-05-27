import { ReactNode, useState, useEffect, useRef } from 'react';
import AdminNavbar from './AdminNavbar';

type AdminLayoutProps = {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
};

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const lastScrollYRef = useRef(0);

    const menuItems = [
        { id: 'overview', icon: 'fa-chart-pie', label: 'Tổng quan' },
        { id: 'orders', icon: 'fa-box-open', label: 'Quản lý Đơn' },
        { id: 'users', icon: 'fa-users', label: 'Người dùng' },
        { id: 'products', icon: 'fa-box', label: 'Sản phẩm' },
        { id: 'vouchers', icon: 'fa-ticket', label: 'Voucher & Cấu hình' },
    ];

    const isSidebarCollapsed = !(isSidebarPinned || isSidebarHovered);

    // Auto-hide header when scrolling down, re-show on upward scroll.
    useEffect(() => {
        const handleScroll = () => {
            if (!mainContentRef.current) return;
            const currentScrollY = mainContentRef.current.scrollTop;

            if (currentScrollY > lastScrollYRef.current && currentScrollY > 96) {
                setIsNavbarVisible(false);
            } else {
                setIsNavbarVisible(true);
            }

            lastScrollYRef.current = currentScrollY;
        };

        const mainContent = mainContentRef.current;
        if (mainContent) {
            mainContent.addEventListener('scroll', handleScroll);
            return () => mainContent.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div className="admin-layout">
            <AdminNavbar isVisible={isNavbarVisible} />
            <div className="admin-body">
                <aside
                    className={`admin-idx-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
                    onMouseEnter={() => setIsSidebarHovered(true)}
                    onMouseLeave={() => setIsSidebarHovered(false)}
                >
                    <div className="admin-side-top">
                        <div className="admin-side-head">
                            <div className="admin-side-title">Điều hướng</div>
                            <button
                                type="button"
                                className={`admin-side-dock ${isSidebarPinned ? 'active' : ''}`}
                                onClick={() => setIsSidebarPinned((prev) => !prev)}
                                aria-label={isSidebarPinned ? 'Bỏ ghim thanh điều hướng' : 'Ghim thanh điều hướng'}
                                title={isSidebarPinned ? 'Bỏ ghim thanh điều hướng' : 'Ghim thanh điều hướng'}
                            >
                                <i className="fa-solid fa-thumbtack"></i>
                            </button>
                        </div>
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
                <main className="admin-main-content" ref={mainContentRef}>
                    {children}
                </main>
            </div>
        </div>
    );
}
