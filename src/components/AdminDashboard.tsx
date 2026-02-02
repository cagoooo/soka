import { useEffect, useState } from 'react';
import { getAllBookings, type BookingRecord } from '../services/bookingService';
import { SeedButton } from './SeedButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const AdminDashboard = () => {
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const data = await getAllBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            alert("載入資料失敗");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    // 1. Prepare Chart Data (Session Popularity)
    const slotCounts: Record<string, number> = {};
    bookings.forEach(b => {
        b.slots.forEach(slotId => {
            slotCounts[slotId] = (slotCounts[slotId] || 0) + 1;
        });
    });

    const chartData = Object.keys(slotCounts).map(key => ({
        name: key,
        count: slotCounts[key]
    })).sort((a, b) => b.name.localeCompare(a.name)); // Sort by ID usually groups types

    // 2. Excel Export Logic
    const handleExport = () => {
        const exportData = bookings.map(b => ({
            姓名: b.name,
            電話: b.phone,
            報名時間: b.timestamp?.toDate ? format(b.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
            選課ID: b.slots.join(', '),
            狀態: b.status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `Soka_Expo_Bookings_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>載入中...</div>;
    }

    return (
        <div style={{ textAlign: 'left', width: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, textAlign: 'left', fontSize: '1.5rem' }}>📊 即時看板 Dashboard</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={refreshData} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        🔄 刷新
                    </button>
                    <button onClick={handleExport} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#10b981' }}>
                        📥 匯出 Excel
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center', margin: 0 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{bookings.length}</div>
                    <div style={{ color: '#64748b' }}>總報名人數</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center', margin: 0 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {Object.values(slotCounts).reduce((a, b) => a + b, 0)}
                    </div>
                    <div style={{ color: '#64748b' }}>總選課人次</div>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', height: '300px' }}>
                <h3 style={{ marginBottom: '10px' }}>場次熱門度統計</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name.includes('A') ? '#818cf8' : entry.name.includes('B') ? '#fb923c' : '#34d399'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* System Tools */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '20px', marginTop: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '15px' }}>🛠️ 系統工具 (System Tools)</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#ef4444' }}>⚠️ 資料庫重置</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                            此操作將會清空所有場次與報名資料，請謹慎使用。
                        </p>
                    </div>
                    <div>
                        <SeedButton />
                    </div>
                </div>
            </div>

        </div>
    );
};
