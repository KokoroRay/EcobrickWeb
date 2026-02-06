import { useMemo } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { LineChart, BarChart, PieChart, StackedBarChart, StackedBarData } from '../../components/AdminCharts';

export default function AdminOverview() {
    const { allUsers } = useRewards();

    const totalUsers = allUsers.length;
    // Calculate verified stats (only Approved donations count)
    const totalKg = allUsers.flatMap(u => u.history)
        .filter(h => h.type === 'donate' && h.status === 'approved')
        .reduce((sum, h) => sum + (h.kg || 0), 0);

    const totalPoints = allUsers.reduce((sum, u) => sum + u.points, 0);
    const pendingOrders = allUsers.flatMap(u => u.history).filter(h => h.status === 'pending').length;

    // --- Chart Data Preparation ---

    // 1. Line Chart: Growth Trend (Last 7 days/entries)
    const growthData = useMemo(() => {
        const donations = allUsers.flatMap(u => u.history)
            .filter(h => h.type === 'donate' && h.status === 'approved')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const grouped: Record<string, number> = {};
        donations.forEach(d => {
            const date = d.createdAt.split('T')[0]; // Simple standard date part
            grouped[date] = (grouped[date] || 0) + (d.kg || 0);
        });

        const timeline = Object.keys(grouped).map(date => ({
            date,
            value: grouped[date]
        }));

        // Mock data point if too sparse to show line
        if (timeline.length === 1) {
            const prevDate = new Date(timeline[0].date);
            prevDate.setDate(prevDate.getDate() - 1);
            return [{ date: prevDate.toISOString().slice(0, 10), value: 0 }, ...timeline];
        }
        return timeline.slice(-7);
    }, [allUsers]);

    // 2. Pie Chart: Order Status Distribution
    const statusData = useMemo(() => {
        const allHistory = allUsers.flatMap(u => u.history).filter(h => h.type === 'donate');
        const approved = allHistory.filter(h => h.status === 'approved').length;
        const pending = allHistory.filter(h => h.status === 'pending').length;
        const rejected = allHistory.filter(h => h.status === 'rejected').length;

        return [
            { label: 'Thành công', value: approved, color: '#22c55e' }, // Green-500
            { label: 'Đang chờ', value: pending, color: '#f59e0b' },   // Amber-500
            { label: 'Từ chối', value: rejected, color: '#ef4444' }    // Red-500
        ].filter(d => d.value > 0);
    }, [allUsers]);

    // 3. Bar Chart: Top 5 Users (Leaderboard)
    const topUsersData = useMemo(() => {
        return [...allUsers]
            .sort((a, b) => b.totalKg - a.totalKg)
            .slice(0, 5)
            .map(u => ({
                label: u.name,
                value: Number(u.totalKg.toFixed(1)),
                color: '#3b82f6' // Blue-500
            }))
            .filter(d => d.value > 0);
    }, [allUsers]);

    // 4. Stacked Bar Chart Data (Status Trend)
    const statusTrendData = useMemo(() => {
        const donations = allUsers.flatMap(u => u.history)
            .filter(h => h.type === 'donate')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const grouped: Record<string, { approved: number, pending: number, rejected: number }> = {};

        donations.forEach(d => {
            const date = d.createdAt.split('T')[0];
            if (!grouped[date]) grouped[date] = { approved: 0, pending: 0, rejected: 0 };

            if (d.status === 'approved') grouped[date].approved++;
            else if (d.status === 'pending') grouped[date].pending++;
            else if (d.status === 'rejected') grouped[date].rejected++;
        });

        const timeline: StackedBarData[] = Object.keys(grouped).map(date => ({
            date,
            ...grouped[date]
        }));

        return timeline.slice(-7); // Last 7 days
    }, [allUsers]);

    return (
        <div>
            <div className="admin-page-header">
                <h2 className="admin-page-title">Tổng quan hệ thống</h2>
                <p className="admin-page-desc">Báo cáo hiệu suất và chỉ số tác động xã hội.</p>
            </div>

            {/* Quick Stats Rows */}
            <div className="stats-container">
                <div className="stat-widget">
                    <span className="stat-label">Tổng thành viên</span>
                    <span className="stat-number">{totalUsers}</span>
                    <span className="stat-subtext"><i className="fa-solid fa-arrow-trend-up"></i> Thành viên tích cực</span>
                </div>

                <div className="stat-widget">
                    <span className="stat-label">Nhựa đã thu gom</span>
                    <span className="stat-number">{totalKg.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>kg</span></span>
                    <span className="stat-subtext"><i className="fa-solid fa-leaf"></i> Tác động môi trường</span>
                </div>

                <div className="stat-widget">
                    <span className="stat-label">Tổng điểm thưởng</span>
                    <span className="stat-number">{totalPoints.toLocaleString()}</span>
                    <span className="stat-subtext">Điểm lưu hành</span>
                </div>

                <div className="stat-widget" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="stat-label">Cần xử lý</span>
                    <span className="stat-number" style={{ color: pendingOrders > 0 ? '#b45309' : '#0f172a' }}>{pendingOrders}</span>
                    <span className="stat-subtext" style={{ color: '#b45309' }}>Yêu cầu quy đổi mới</span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="chart-grid">
                {/* 1. Main Growth Line Chart */}
                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <LineChart
                        title="Tăng trưởng thu gom nhựa (7 ngày gần nhất)"
                        data={growthData}
                    />
                </div>

                {/* 2. Top Users Bar Chart */}
                <div className="chart-card">
                    <BarChart
                        title="Top 5 Thành viên đóng góp"
                        data={topUsersData}
                    />
                </div>

                {/* 3. Status Distribution Pie Chart */}
                <div className="chart-card">
                    <PieChart
                        title="Tỷ lệ trạng thái đơn (Phân bổ)"
                        data={statusData}
                    />
                </div>

                {/* 4. Status Trend Stacked Bar Chart (NEW) */}
                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <StackedBarChart
                        title="Xu hướng xử lý đơn theo ngày"
                        data={statusTrendData}
                    />
                </div>
            </div>
        </div>
    );
}
