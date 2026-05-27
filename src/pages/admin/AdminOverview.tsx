import { useMemo, useState } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { LineChart, BarChart, PieChart } from '../../components/AdminCharts';

type ChartKey = 'daily' | 'weekly' | 'top' | 'pending' | 'segment';

export default function AdminOverview() {
    const { allUsers, pendingDonations, adminDailyTimeline } = useRewards();
    const [featuredChart, setFeaturedChart] = useState<ChartKey | null>(null);

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

    // 1. Line Chart: Weekly plastic volume over last 7 days
    const weeklyTrendData = useMemo(() => {
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

    // 1.5 Line Chart: Daily plastic volume by hour (24 hours)
    const dailyHourlyStats = useMemo(() => {
        const toLocalDateKey = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const parseDonation = (createdAt: string, kg: number) => {
            const parsed = new Date(createdAt);
            if (Number.isNaN(parsed.getTime())) {
                return null;
            }

            return {
                createdAt,
                kg,
                parsed,
                dateKey: toLocalDateKey(parsed),
                hourKey: `${String(parsed.getHours()).padStart(2, '0')}:00`,
            };
        };

        const donationsFromHistory = allUsers
            .flatMap((u) => u.history)
            .filter((h) => h.type === 'donate' && !!h.createdAt)
            .map((h) => parseDonation(String(h.createdAt), Number(h.kg || 0)))
            .filter((item): item is NonNullable<typeof item> => item !== null);

        const donationsFromPending = pendingDonations
            .filter((d) => !!d.createdAt)
            .map((d) => parseDonation(String(d.createdAt), Number(d.kg || 0)))
            .filter((item): item is NonNullable<typeof item> => item !== null);

        const allDonations = [...donationsFromHistory, ...donationsFromPending]
            .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());

        const todayKey = toLocalDateKey(new Date());
        let sourceDateKey = todayKey;
        let selected = allDonations.filter((item) => item.dateKey === sourceDateKey);

        if (selected.length === 0 && allDonations.length > 0) {
            sourceDateKey = allDonations[allDonations.length - 1].dateKey;
            selected = allDonations.filter((item) => item.dateKey === sourceDateKey);
        }

        const grouped: Record<string, number> = {};
        selected.forEach((item) => {
            grouped[item.hourKey] = (grouped[item.hourKey] || 0) + item.kg;
        });

        const timeline = Array.from({ length: 24 }, (_, index) => {
            const key = `${String(index).padStart(2, '0')}:00`;
            return {
                date: key,
                value: Number((grouped[key] || 0).toFixed(2)),
            };
        });

        return {
            timeline,
            sourceDateKey,
            isToday: sourceDateKey === todayKey,
            hasData: selected.length > 0,
        };
    }, [allUsers, pendingDonations]);

    const dailyHourlyData = dailyHourlyStats.timeline;

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

    const peakDailyHour = useMemo(() => {
        if (dailyHourlyData.length === 0) {
            return '00:00';
        }
        return dailyHourlyData.reduce((peak, current) => (current.value > peak.value ? current : peak), dailyHourlyData[0]).date;
    }, [dailyHourlyData]);

    const weeklyPeakDay = useMemo(() => {
        if (weeklyTrendData.length === 0) {
            return 'N/A';
        }
        return weeklyTrendData.reduce((peak, current) => (current.value > peak.value ? current : peak), weeklyTrendData[0]).date;
    }, [weeklyTrendData]);

    const getChartOrder = (chart: ChartKey) => {
        const baseOrder: Record<ChartKey, number> = {
            daily: 1,
            weekly: 2,
            top: 3,
            pending: 4,
            segment: 5,
        };

        if (!featuredChart) {
            return baseOrder[chart];
        }

        if (chart === featuredChart) {
            return 1;
        }

        return baseOrder[chart] + 1;
    };

    const showCombineOn = featuredChart === 'daily' ? 'weekly' : featuredChart === 'weekly' ? 'daily' : null;

    const chartDetail = (chart: ChartKey) => {
        if (chart === 'daily') {
            const todayTotal = dailyHourlyData.reduce((sum, point) => sum + point.value, 0);
            if (!dailyHourlyStats.hasData) {
                return 'Chưa có dữ liệu đóng góp theo giờ trong hệ thống.';
            }

            const dayLabel = dailyHourlyStats.isToday ? 'hôm nay' : `ngày ${dailyHourlyStats.sourceDateKey}`;
            return `${todayTotal.toFixed(2)}kg ${dayLabel} • Cao điểm: ${peakDailyHour} • 24 khung giờ`;
        }
        if (chart === 'weekly') {
            const weekTotal = weeklyTrendData.reduce((sum, point) => sum + point.value, 0);
            const avg = weeklyTrendData.length > 0 ? weekTotal / weeklyTrendData.length : 0;
            return `${weekTotal.toFixed(2)}kg / 7 ngày • TB ${avg.toFixed(2)}kg/ngày • Đỉnh: ${weeklyPeakDay}`;
        }
        if (chart === 'top') {
            const totalTop = topUsersData.reduce((sum, point) => sum + point.value, 0);
            return `${totalTop.toFixed(1)}kg từ nhóm top 5 • Dẫn đầu: ${topUsersData[0]?.label || 'N/A'}`;
        }
        if (chart === 'segment') {
            const activeSegments = userSegmentData.reduce((sum, point) => sum + point.value, 0);
            const high = userSegmentData.find((item) => item.label === 'Đóng góp cao')?.value || 0;
            return `${activeSegments} thành viên đã phân loại • Nhóm đóng góp cao: ${high}`;
        }
        const totalPending = pendingByUserData.reduce((sum, point) => sum + point.value, 0);
        return `${pendingOrders} yêu cầu mở • ${totalPending.toFixed(1)}kg cần xử lý`;
    };

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

            <div className={`chart-grid ${featuredChart ? 'has-featured' : ''}`}>
                <div
                    className={`chart-card is-selectable ${featuredChart === 'daily' ? 'is-featured' : ''}`}
                    style={{ order: getChartOrder('daily') }}
                    onClick={() => setFeaturedChart('daily')}
                >
                    <div className="chart-card-head">
                        <span className="chart-kicker">Realtime 24H</span>
                        <span className="chart-badge">
                            {dailyHourlyStats.isToday ? 'Từng giờ' : `Ngày gần nhất ${dailyHourlyStats.sourceDateKey}`}
                        </span>
                    </div>
                    <LineChart
                        title="Khối lượng nhựa theo ngày (24 giờ)"
                        data={dailyHourlyData}
                        color="#4ea2b7"
                        xAxisMode="time"
                        showValueLabels={featuredChart === 'daily'}
                    />
                    {featuredChart === 'daily' && (
                        <div className="chart-focus-meta">{chartDetail('daily')}</div>
                    )}
                    {showCombineOn === 'daily' && (
                        <button
                            type="button"
                            className="chart-combine-btn"
                            onClick={(event) => {
                                event.stopPropagation();
                                setFeaturedChart(null);
                            }}
                            aria-label="Kết hợp biểu đồ ngày và tuần"
                            title="Kết hợp biểu đồ ngày và tuần"
                        >
                            <i className="fa-solid fa-object-group"></i>
                        </button>
                    )}
                </div>

                <div
                    className={`chart-card is-selectable ${featuredChart === 'weekly' ? 'is-featured' : ''}`}
                    style={{ order: getChartOrder('weekly') }}
                    onClick={() => setFeaturedChart('weekly')}
                >
                    <div className="chart-card-head">
                        <span className="chart-kicker">7-Day Trend</span>
                        <span className="chart-badge">Theo tuần</span>
                    </div>
                    <LineChart
                        title="Khối lượng nhựa theo tuần (7 ngày gần nhất)"
                        data={weeklyTrendData}
                        color="#6fb8c9"
                        showValueLabels={featuredChart === 'weekly'}
                    />
                    {featuredChart === 'weekly' && (
                        <div className="chart-focus-meta">{chartDetail('weekly')}</div>
                    )}
                    {showCombineOn === 'weekly' && (
                        <button
                            type="button"
                            className="chart-combine-btn"
                            onClick={(event) => {
                                event.stopPropagation();
                                setFeaturedChart(null);
                            }}
                            aria-label="Kết hợp biểu đồ ngày và tuần"
                            title="Kết hợp biểu đồ ngày và tuần"
                        >
                            <i className="fa-solid fa-object-group"></i>
                        </button>
                    )}
                </div>

                <div
                    className={`chart-card is-selectable ${featuredChart === 'top' ? 'is-featured' : ''}`}
                    style={{ order: getChartOrder('top') }}
                    onClick={() => setFeaturedChart('top')}
                >
                    <div className="chart-card-head">
                        <span className="chart-kicker">Contributor Ranking</span>
                        <span className="chart-badge">Top 5</span>
                    </div>
                    <BarChart
                        title="Top 5 thành viên đóng góp (kg)"
                        data={topUsersData}
                    />
                    {featuredChart === 'top' && (
                        <div className="chart-focus-meta">{chartDetail('top')}</div>
                    )}
                </div>

                <div
                    className={`chart-card is-selectable ${featuredChart === 'pending' ? 'is-featured' : ''}`}
                    style={{ order: getChartOrder('pending') }}
                    onClick={() => setFeaturedChart('pending')}
                >
                    <div className="chart-card-head">
                        <span className="chart-kicker">Processing Queue</span>
                        <span className="chart-badge">Đang chờ duyệt</span>
                    </div>
                    <BarChart
                        title="Khối lượng chờ duyệt theo thành viên"
                        data={pendingByUserData}
                    />
                    {featuredChart === 'pending' && (
                        <div className="chart-focus-meta">{chartDetail('pending')}</div>
                    )}
                </div>

                <div
                    className={`chart-card is-selectable ${featuredChart === 'segment' ? 'is-featured' : ''}`}
                    style={{ order: getChartOrder('segment') }}
                    onClick={() => setFeaturedChart('segment')}
                >
                    <div className="chart-card-head">
                        <span className="chart-kicker">Audience Composition</span>
                        <span className="chart-badge">Phân bổ nhóm</span>
                    </div>
                    <PieChart
                        title="Cấu trúc nhóm thành viên"
                        data={userSegmentData}
                    />
                    {featuredChart === 'segment' && (
                        <div className="chart-focus-meta">{chartDetail('segment')}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
