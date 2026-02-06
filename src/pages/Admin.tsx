import { useState } from 'react';
import './admin/admin.css';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';
import AdminOrders from './admin/AdminOrders';
import AdminVouchers from './admin/AdminVouchers';
import AdminLayout from '../components/AdminLayout';

type AdminTab = 'overview' | 'users' | 'orders' | 'vouchers';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'orders': return <AdminOrders />;
      case 'vouchers': return <AdminVouchers />;
      default: return <AdminOverview />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}
