import { useMemo } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { LineChart, BarChart, PieChart } from '../../components/AdminCharts';

export default function AdminOverview() {
    const { allUsers, pendingDonations } = useRewards();

    const totalUsers = allUsers.length;
    const activeContributors = allUsers.filter(u => u.totalKg > 0).length;
    const totalKg = allUsers.reduce((sum, u) => sum + (u.totalKg || 0), 0);
    const totalPoints = allUsers.reduce((sum, u) => sum + u.points, 0);
    const pendingOrders = pendingDonations.length;
    const pendingKg = pendingDonations.reduce((sum, item) => sum + (item.kg || 0), 0);
    const avgKgPerContributor = activeContributors > 0 ? totalKg / activeContributors : 0;
    const avgPointsPerUser = totalUsers > 0 ? totalPoints / totalUsers : 0;
    const contributionRate = totalUsers > 0 ? (activeContributors / totalUsers) * 100 : 0;

    const topContributor = useMemo(() => {
        if (allUsers.length === 0) {
            return null;
        }
        return [...allUsers].sort((a, b) => b.totalKg - a.totalKg)[0] || null;
    }, [allUsers]);

    // --- Chart Data Preparation ---

    // 1. Line Chart: New requests over last 7 days
    const requestTrendData = useMemo(() => {
        const donations = [...pendingDonations]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const grouped: Record<string, number> = {};
        donations.forEach(d => {
            const date = d.createdAt.split('T')[0];
            grouped[date] = (grouped[date] || 0) + d.kg;
        });

        const timeline = Object.keys(grouped).map(date => ({
            date,
            value: grouped[date]
        }));

        if (timeline.length === 1) {
            const prevDate = new Date(timeline[0].date);
            prevDate.setDate(prevDate.getDate() - 1);
            return [{ date: prevDate.toISOString().slice(0, 10), value: 0 }, ...timeline];
        }
        return timeline.slice(-7);
    }, [pendingDonations]);

    // 2. Pie Chart: User quality segmentation
    const userSegmentData = useMemo(() => {
        const highImpact = allUsers.filter(u => u.totalKg >= 20).length;
        const mediumImpact = allUsers.filter(u => u.totalKg >= 5 && u.totalKg < 20).length;
        const newMembers = allUsers.filter(u => u.totalKg > 0 && u.totalKg < 5).length;
        const inactive = allUsers.filter(u => u.totalKg <= 0).length;

        return [
            { label: 'Đóng góp cao', value: highImpact, color: '#20803F' },
            { label: 'Đóng góp đều', value: mediumImpact, color: '#60a5fa' },
            { label: 'Mới bắt đầu', value: newMembers, color: '#f59e0b' },
            { label: 'Chưa đóng góp', value: inactive, color: '#64748b' }
        ].filter(d => d.value > 0);
    }, [allUsers]);

    // 3. Bar Chart: Top contributors
    const topUsersData = useMemo(() => {
        return [...allUsers]
            .sort((a, b) => b.totalKg - a.totalKg)
            .slice(0, 5)
            .map(u => ({
                label: u.name,
                value: Number(u.totalKg.toFixed(1)),
                color: '#5daec2'
            }))
            .filter(d => d.value > 0);
    }, [allUsers]);

    // 4. Bar chart: pending workload by user
    const pendingByUserData = useMemo(() => {
        const grouped: Record<string, number> = {};
        pendingDonations.forEach((item) => {
            const key = item.userName || item.userId;
            grouped[key] = (grouped[key] || 0) + item.kg;
        });

        return Object.entries(grouped)
            .map(([label, value]) => ({
                label,
                value: Number(value.toFixed(1)),
                color: '#91c7d4'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [pendingDonations]);

    return (
        <div className="overview-shell">
            <div className="admin-page-header">
                <div>
                    <h2 className="admin-page-title">Tổng quan hệ thống</h2>
                    <p className="admin-page-desc">Bảng điều hành theo thời gian thực cho vận hành, tác động môi trường và tăng trưởng thành viên.</p>
                </div>
                <div className="overview-header-chip">
                    <i className="fa-solid fa-circle-check"></i>
                    Dữ liệu đồng bộ từ backend
                </div>
            </div>

            <div className="stats-container modern-kpis">
                <div className="stat-widget glass-card">
                    <span className="stat-label">Tổng thành viên</span>
                    <span className="stat-number">{totalUsers.toLocaleString()}</span>
                    <span className="stat-subtext"><i className="fa-solid fa-users"></i> {activeContributors} thành viên đã đóng góp</span>
                </div>

                <div className="stat-widget glass-card">
                    <span className="stat-label">Nhựa đã thu gom</span>
                    <span className="stat-number">{totalKg.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>kg</span></span>
                    <span className="stat-subtext"><i className="fa-solid fa-leaf"></i> Trung bình {avgKgPerContributor.toFixed(1)}kg / thành viên đóng góp</span>
                </div>

                <div className="stat-widget glass-card">
                    <span className="stat-label">Tổng điểm thưởng</span>
                    <span className="stat-number">{totalPoints.toLocaleString()}</span>
                    <span className="stat-subtext"><i className="fa-solid fa-sack-dollar"></i> Trung bình {avgPointsPerUser.toFixed(0)} điểm / user</span>
                </div>

                <div className="stat-widget glass-card stat-widget-warning">
                    <span className="stat-label">Cần xử lý</span>
                    <span className="stat-number" style={{ color: pendingOrders > 0 ? '#b45309' : '#0f172a' }}>{pendingOrders}</span>
                    <span className="stat-subtext" style={{ color: '#b45309' }}><i className="fa-solid fa-hourglass-half"></i> {pendingKg.toFixed(1)}kg đang chờ duyệt</span>
                </div>
            </div>

            <div className="overview-insights-row">
                <article className="insight-card glass-card">
                    <div className="insight-title">Tỷ lệ thành viên có đóng góp</div>
                    <div className="insight-value">{contributionRate.toFixed(1)}%</div>
                    <div className="insight-meta">Mức tham gia cộng đồng hiện tại</div>
                </article>
                <article className="insight-card glass-card">
                    <div className="insight-title">Người đóng góp hàng đầu</div>
                    <div className="insight-value" style={{ fontSize: '1.35rem' }}>{topContributor ? topContributor.name : 'Chưa có dữ liệu'}</div>
                    <div className="insight-meta">{topContributor ? `${topContributor.totalKg.toFixed(1)} kg` : '0 kg'}</div>
                </article>
                <article className="insight-card glass-card">
                    <div className="insight-title">Năng suất xử lý hiện tại</div>
                    <div className="insight-value">{pendingOrders === 0 ? 'Ổn định' : 'Cần xử lý'}</div>
                    <div className="insight-meta">{pendingOrders === 0 ? 'Không có tồn đọng' : `${pendingOrders} yêu cầu mở`}</div>
                </article>
            </div>

            <div className="chart-grid">
                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <LineChart
                        title="Khối lượng yêu cầu mới theo ngày (7 ngày gần nhất)"
                        data={requestTrendData}
                        color="#4ea2b7"
                    />
                </div>

                <div className="chart-card">
                    <BarChart
                        title="Top 5 thành viên đóng góp (kg)"
                        data={topUsersData}
                    />
                </div>

                <div className="chart-card">
                    <PieChart
                        title="Cấu trúc nhóm thành viên"
                        data={userSegmentData}
                    />
                </div>

                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <BarChart
                        title="Khối lượng chờ duyệt theo thành viên"
                        data={pendingByUserData}
                    />
                </div>
            </div>
        </div>
    );
}
