import { useMemo } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { LineChart, BarChart, PieChart } from '../../components/AdminCharts';

export default function AdminOverview() {
    const { allUsers, pendingDonations, adminDailyTimeline } = useRewards();

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

    // 1. Line Chart: Daily plastic volume over last 7 days
    const requestTrendData = useMemo(() => {
        if (adminDailyTimeline.length > 0) {
            return adminDailyTimeline.map((item) => ({
                date: item.date,
                value: Number((item.value || 0).toFixed(2)),
            }));
        }

        const donationsFromHistory = allUsers
            .flatMap((u) => u.history)
            .filter((h) => h.type === 'donate' && !!h.createdAt)
            .map((h) => ({
                createdAt: h.createdAt,
                kg: Number(h.kg || 0),
            }));

        const donationsFromPending = pendingDonations.map((d) => ({
            createdAt: d.createdAt,
            kg: Number(d.kg || 0),
        }));

        const donations = [...donationsFromHistory, ...donationsFromPending]
            .filter((d) => !Number.isNaN(new Date(d.createdAt).getTime()))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const grouped: Record<string, number> = {};
        donations.forEach(d => {
            const date = d.createdAt.split('T')[0];
            grouped[date] = (grouped[date] || 0) + d.kg;
        });

        // Always return a 7-day timeline to avoid empty-state chart flicker.
        const timeline = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const key = date.toISOString().slice(0, 10);
            return {
                date: key,
                value: Number((grouped[key] || 0).toFixed(2)),
            };
        });

        return timeline;
    }, [allUsers, pendingDonations, adminDailyTimeline]);

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

        const pendingData = Object.entries(grouped)
            .map(([label, value]) => ({
                label,
                value: Number(value.toFixed(1)),
                color: '#91c7d4'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        if (pendingData.length > 0) {
            return pendingData;
        }

        return [...allUsers]
            .sort((a, b) => b.totalKg - a.totalKg)
            .slice(0, 5)
            .map((u) => ({
                label: u.name,
                value: Number((u.totalKg || 0).toFixed(1)),
                color: '#9ccddb'
            }));
    }, [pendingDonations, allUsers]);

    // 5. Revenue metrics: Today and 7-day statistics
    const revenueMetrics = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        
        // Collect all donation records from user histories
        const allDonations = allUsers
            .flatMap((u) => u.history)
            .filter((h) => h.type === 'donate' && !!h.createdAt);

        // Today's revenue (points issued today)
        const todayDonations = allDonations.filter((h) => h.createdAt.split('T')[0] === today);
        const todayPoints = todayDonations.reduce((sum, h) => sum + (h.points || 0), 0);
        const todayKg = todayDonations.reduce((sum, h) => sum + (h.kg || 0), 0);

        // Last 7 days revenue
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysDate = sevenDaysAgo.toISOString().split('T')[0];

        const sevenDaysDonations = allDonations.filter((h) => {
            const donateDate = h.createdAt.split('T')[0];
            return donateDate >= sevenDaysDate && donateDate <= today;
        });

        const sevenDaysPoints = sevenDaysDonations.reduce((sum, h) => sum + (h.points || 0), 0);
        const sevenDaysKg = sevenDaysDonations.reduce((sum, h) => sum + (h.kg || 0), 0);
        const sevenDaysAvgPoints = sevenDaysDonations.length > 0 ? sevenDaysPoints / 7 : 0;

        return {
            todayPoints: Number(todayPoints.toFixed(0)),
            todayKg: Number(todayKg.toFixed(2)),
            sevenDaysPoints: Number(sevenDaysPoints.toFixed(0)),
            sevenDaysKg: Number(sevenDaysKg.toFixed(2)),
            sevenDaysAvgPoints: Number(sevenDaysAvgPoints.toFixed(0)),
        };
    }, [allUsers]);

    // 6. Revenue over 7 days for daily comparison chart
    const revenueChartData = useMemo(() => {
        const today = new Date();
        const timeline = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - index));
            return date;
        });

        const revenueByDate: Record<string, number> = {};
        
        // Aggregate points by date from all users' history
        allUsers.forEach((user) => {
            user.history
                .filter((h) => h.type === 'donate' && !!h.createdAt)
                .forEach((h) => {
                    const dateKey = h.createdAt.split('T')[0];
                    revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + (h.points || 0);
                });
        });

        return timeline.map((date) => {
            const dateKey = date.toISOString().split('T')[0];
            return {
                date: dateKey,
                value: revenueByDate[dateKey] || 0,
            };
        });
    }, [allUsers]);

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
                <article className="insight-card glass-card">
                    <div className="insight-title">Doanh thu hôm nay</div>
                    <div className="insight-value">{revenueMetrics.todayPoints.toLocaleString()}</div>
                    <div className="insight-meta"><i className="fa-solid fa-star"></i> {revenueMetrics.todayKg.toFixed(2)} kg</div>
                </article>
                <article className="insight-card glass-card">
                    <div className="insight-title">Doanh thu 7 ngày</div>
                    <div className="insight-value">{revenueMetrics.sevenDaysPoints.toLocaleString()}</div>
                    <div className="insight-meta">Trung bình {revenueMetrics.sevenDaysAvgPoints.toLocaleString()} điểm/ngày</div>
                </article>
                <article className="insight-card glass-card">
                    <div className="insight-title">So sánh doanh thu</div>
                    <div className="insight-value" style={{ fontSize: '1.35rem', color: revenueMetrics.todayPoints > revenueMetrics.sevenDaysAvgPoints ? '#20803F' : '#d85d5d' }}>
                        {revenueMetrics.sevenDaysAvgPoints > 0 ? `${((revenueMetrics.todayPoints / revenueMetrics.sevenDaysAvgPoints) * 100).toFixed(0)}%` : 'N/A'}
                    </div>
                    <div className="insight-meta">So với trung bình 7 ngày</div>
                </article>
            </div>

            <div className="chart-grid">
                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <LineChart
                        title="Khối lượng nhựa theo ngày (7 ngày gần nhất)"
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
                        title={pendingDonations.length > 0 ? 'Khối lượng chờ duyệt theo thành viên' : 'Khối lượng đóng góp theo thành viên'}
                        data={pendingByUserData}
                    />
                </div>

                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <LineChart
                        title="Doanh thu điểm thưởng theo ngày (7 ngày gần nhất)"
                        data={revenueChartData}
                        color="#6fb8c9"
                    />
                </div>
            </div>
        </div>
    );
}
