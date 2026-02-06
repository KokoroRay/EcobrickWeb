

// --- Types ---
type LineData = { date: string; value: number };
type BarData = { label: string; value: number; color?: string };
type PieData = { label: string; value: number; color: string };

// --- 1. Line Chart (Growth Trend) ---
export const LineChart = ({ data, title, color = "#20803F" }: { data: LineData[]; title?: string; color?: string }) => {
    if (data.length === 0) return <ChartPlaceholder message="Chưa có dữ liệu theo thời gian" />;

    const height = 250;
    const width = 600;
    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 10;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * chartWidth + padding;
        const y = height - padding - (d.value / maxValue) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="chart-container">
            {title && <h4 className="chart-title">{title}</h4>}
            <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
                {/* Grid & Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-Axis Labels (Simple) */}
                <text x={padding - 10} y={padding} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(maxValue)}</text>
                <text x={padding - 10} y={height - padding} textAnchor="end" fontSize="10" fill="#94a3b8">0</text>

                {/* Path */}
                <polyline fill="none" stroke={color} strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />

                {/* Area Fill (Optional Gradient effect hack) */}
                <polygon
                    points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
                    fill={color}
                    opacity="0.1"
                />

                {/* Dots & Labels */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1 || 1)) * chartWidth + padding;
                    const y = height - padding - (d.value / maxValue) * chartHeight;
                    return (
                        <g key={i} className="chart-tooltip-trigger">
                            <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
                            <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">{d.value}</text>
                            <text x={x} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#64748b">{d.date.slice(5)}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// --- 2. Bar Chart (Top Users / Categories) ---
export const BarChart = ({ data, title }: { data: BarData[]; title?: string }) => {
    if (data.length === 0) return <ChartPlaceholder message="Chưa có dữ liệu so sánh" />;

    const height = 250;
    const width = 600;
    const padding = 40;
    const barGap = 20;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 10;
    const barWidth = (chartWidth - (data.length - 1) * barGap) / data.length;

    return (
        <div className="chart-container">
            {title && <h4 className="chart-title">{title}</h4>}
            <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

                {data.map((d, i) => {
                    const x = padding + i * (barWidth + barGap);
                    const barH = (d.value / maxValue) * chartHeight;
                    const y = height - padding - barH;
                    return (
                        <g key={i}>
                            <rect
                                x={x} y={y}
                                width={barWidth} height={barH}
                                fill={d.color || "#3b82f6"}
                                rx="4"
                                className="chart-bar"
                            />
                            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">{d.value}</text>
                            <text x={x + barWidth / 2} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#64748b" style={{ textTransform: 'capitalize' }}>
                                {d.label.length > 10 ? d.label.slice(0, 8) + '...' : d.label}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    );
};

// --- 3. Pie Chart (Distribution) ---
export const PieChart = ({ data, title }: { data: PieData[]; title?: string }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return <ChartPlaceholder message="Chưa có dữ liệu phân bổ" />;

    const center = { x: 120, y: 125 };
    const radius = 90;
    let startAngle = 0;

    return (
        <div className="chart-container pie-layout" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                {title && <h4 className="chart-title">{title}</h4>}
                <svg viewBox={`0 0 240 250`} className="svg-chart">
                    {data.map((d, i) => {
                        const angle = (d.value / total) * 360;
                        const endAngle = startAngle + angle;

                        // Convert polar to cartesian
                        const x1 = center.x + radius * Math.cos(Math.PI * startAngle / 180);
                        const y1 = center.y + radius * Math.sin(Math.PI * startAngle / 180);
                        const x2 = center.x + radius * Math.cos(Math.PI * endAngle / 180);
                        const y2 = center.y + radius * Math.sin(Math.PI * endAngle / 180);

                        const largeArc = angle > 180 ? 1 : 0;

                        const pathData = `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        startAngle += angle;

                        return (
                            <path
                                key={i}
                                d={pathData}
                                fill={d.color}
                                stroke="white" strokeWidth="2"
                            />
                        );
                    })}
                    {/* Create a donut hole */}
                    <circle cx={center.x} cy={center.y} r={radius * 0.6} fill="white" />
                    <text x={center.x} y={center.y} textAnchor="middle" dy="0.3em" fontSize="16" fontWeight="bold" fill="#334155">{total}</text>
                    <text x={center.x} y={center.y + 15} textAnchor="middle" dy="0.3em" fontSize="10" fill="#94a3b8">Tổng đơn</text>
                </svg>
            </div>

            {/* Custom Legend */}
            <div className="chart-legend" style={{ marginLeft: '1rem' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span style={{ width: '12px', height: '12px', background: d.color, borderRadius: '3px', marginRight: '8px' }}></span>
                        <span style={{ color: '#475569', flex: 1 }}>{d.label}</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{Math.round((d.value / total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- 4. Stacked Bar Chart (Status Trend Over Time) ---
export type StackedBarData = { date: string; approved: number; pending: number; rejected: number };

export const StackedBarChart = ({ data, title }: { data: StackedBarData[]; title?: string }) => {
    if (data.length === 0) return <ChartPlaceholder message="Chưa có dữ liệu xu hướng" />;

    const height = 250;
    const width = 600;
    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barGap = 30; // Wider gap
    const barWidth = (chartWidth - (data.length - 1) * barGap) / data.length;

    // Find max total for scaling
    const maxTotal = Math.max(...data.map(d => d.approved + d.pending + d.rejected)) * 1.1 || 10;

    return (
        <div className="chart-container">
            {title && <h4 className="chart-title">{title}</h4>}
            <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

                {data.map((d, i) => {
                    const x = padding + i * (barWidth + barGap);

                    const hApproved = (d.approved / maxTotal) * chartHeight;
                    const hPending = (d.pending / maxTotal) * chartHeight;
                    const hRejected = (d.rejected / maxTotal) * chartHeight;

                    // Stack from bottom: Approved -> Pending -> Rejected
                    const yApproved = height - padding - hApproved;
                    const yPending = yApproved - hPending;
                    const yRejected = yPending - hRejected;

                    return (
                        <g key={i}>
                            {/* Approved Section */}
                            {d.approved > 0 && (
                                <rect x={x} y={yApproved} width={barWidth} height={hApproved} fill="#22c55e" className="chart-bar"><title>Đã duyệt: {d.approved}</title></rect>
                            )}
                            {/* Pending Section */}
                            {d.pending > 0 && (
                                <rect x={x} y={yPending} width={barWidth} height={hPending} fill="#f59e0b" className="chart-bar"><title>Đang chờ: {d.pending}</title></rect>
                            )}
                            {/* Rejected Section */}
                            {d.rejected > 0 && (
                                <rect x={x} y={yRejected} width={barWidth} height={hRejected} fill="#ef4444" className="chart-bar"><title>Từ chối: {d.rejected}</title></rect>
                            )}

                            {/* X-Axis Label */}
                            <text x={x + barWidth / 2} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#64748b">{d.date.slice(5)}</text>
                            {/* Total Label on Top */}
                            <text x={x + barWidth / 2} y={yRejected - 5} textAnchor="middle" fontSize="10" fill="#334155" fontWeight="bold">
                                {d.approved + d.pending + d.rejected}
                            </text>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform={`translate(${width - 200}, 20)`}>
                    <rect x="0" y="0" width="10" height="10" fill="#22c55e" rx="2" />
                    <text x="15" y="9" fontSize="10" fill="#475569">Thành công</text>
                    <rect x="70" y="0" width="10" height="10" fill="#f59e0b" rx="2" />
                    <text x="85" y="9" fontSize="10" fill="#475569">Đang chờ</text>
                    <rect x="140" y="0" width="10" height="10" fill="#ef4444" rx="2" />
                    <text x="155" y="9" fontSize="10" fill="#475569">Từ chối</text>
                </g>
            </svg>
        </div>
    );
};

const ChartPlaceholder = ({ message }: { message: string }) => (
    <div style={{ height: '250px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '0.5rem' }}>
        <i className="fa-solid fa-chart-pie" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
        <span style={{ fontSize: '0.9rem' }}>{message}</span>
    </div>
);
