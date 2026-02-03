import { useEffect, useState } from 'react';
import { getAllBookings, subscribeToBookings, type BookingRecord } from '../services/bookingService';
import { SeedButton } from './SeedButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const AdminDashboard = () => {
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load + Real-time subscription
    useEffect(() => {
        const unsubscribe = subscribeToBookings((data) => {
            setBookings(data);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Manual refresh is technically not needed for data, but can be useful to force-check network if stuck
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
    })).sort((a, b) => a.name.localeCompare(b.name)); // Sort by ID ascending (2F -> 6F)

    // 2. Excel Export Logic (Advanced Multi-Sheet)
    const handleExport = () => {
        if (bookings.length === 0) {
            alert("目前沒有報名資料可匯出");
            return;
        }

        const wb = XLSX.utils.book_new();

        // Helper to format a booking for Excel
        const formatBooking = (b: BookingRecord) => {
            let dateStr = 'N/A';
            if (b.timestamp && typeof b.timestamp.toDate === 'function') {
                dateStr = format(b.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss');
            } else if (b.timestamp) {
                dateStr = String(b.timestamp);
            }
            return {
                'ID': b.id ? b.id.substring(0, 8).toUpperCase() : '',
                姓名: b.name,
                報名時間: dateStr,
                選課ID: b.slots.join(', '),
                狀態: '已報名',
                簽到: ''  // Empty column for manual check-in
            };
        };

        // Sort bookings by timestamp (Ascending: Earliest first)
        const sortedBookings = [...bookings].sort((a, b) => {
            const timeA = a.timestamp && typeof a.timestamp.toMillis === 'function' ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp && typeof b.timestamp.toMillis === 'function' ? b.timestamp.toMillis() : 0;
            return timeA - timeB;
        });

        // --- Sheet 1: Master List (總覽) ---
        const masterData = sortedBookings.map(formatBooking);
        const wsMaster = XLSX.utils.json_to_sheet(masterData);
        XLSX.utils.book_append_sheet(wb, wsMaster, "總覽 (Master)");

        // --- Sheet 2~N: Individual Slot Lists (各場次分流) ---
        // 1. Identify all unique active slots present in current bookings
        const uniqueSlots = new Set<string>();
        bookings.forEach(b => b.slots.forEach(s => uniqueSlots.add(s)));
        const sortedSlots = Array.from(uniqueSlots).sort();

        // 2. Create a sheet for each slot
        sortedSlots.forEach(slotId => {
            // Filter bookings that include this specific slot (using the Sorted Bookings)
            const slotBookings = sortedBookings
                .filter(b => b.slots.includes(slotId))
                .map(formatBooking);

            if (slotBookings.length > 0) {
                const wsSlot = XLSX.utils.json_to_sheet(slotBookings);
                // Sheet name limit is 31 chars, slotIds like '6F_A' are safe
                XLSX.utils.book_append_sheet(wb, wsSlot, slotId);
            }
        });

        // Write file
        XLSX.writeFile(wb, `Soka_Expo_Bookings_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    };

    // 3. PDF / Print Export Logic (Native Browser Print for A4)
    const handleExportPDF = () => {
        if (bookings.length === 0) {
            alert("目前沒有報名資料可匯出");
            return;
        }

        // Sort bookings by timestamp (Ascending)
        const sortedBookings = [...bookings].sort((a, b) => {
            const timeA = a.timestamp && typeof a.timestamp.toMillis === 'function' ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp && typeof b.timestamp.toMillis === 'function' ? b.timestamp.toMillis() : 0;
            return timeA - timeB;
        });

        // Prepare Data Groups (By Slot)
        const uniqueSlots = new Set<string>();
        bookings.forEach(b => b.slots.forEach(s => uniqueSlots.add(s)));
        const sortedSlots = Array.from(uniqueSlots).sort();

        // Helper to get descriptive title
        const getSlotTitle = (slotId: string) => {
            if (slotId.startsWith('2F')) return '躍動潛能：音樂與生命的對話';
            if (slotId.startsWith('3F')) return '正向教養攤位*4攤 / 專業課程攤位*4攤';
            if (slotId.startsWith('5F')) return '創價 OPEN SPACE：無劇本思維冒險';
            if (slotId === '6F_C') return '《優雅接住，情緒的浪》';
            if (slotId === '6F_D') return '《從餐桌到生命的美利善》';
            return slotId; // Fallback
        };

        // Generate HTML Content
        let printContent = `
            <html>
            <head>
                <title>Soka Expo 2026 - 簽到表</title>
                <style>
                    @media print {
                        @page { size: A4 portrait; margin: 1cm; }
                        body { font-family: "Microsoft JhengHei", sans-serif; -webkit-print-color-adjust: exact; }
                        .page-break { page-break-after: always; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #000; padding: 8px; font-size: 12pt; text-align: center; vertical-align: middle; }
                        td { height: 50px; } /* Taller rows for signing */
                        th { background-color: #f0f0f0; font-weight: bold; height: 40px; }
                        .sign-col { width: 150px; } /* Fixed width for signature */
                        h2 { text-align: center; margin-bottom: 5px; font-size: 18pt; padding-bottom: 5px; }
                        h3 { text-align: center; margin-top: 0; margin-bottom: 15px; font-size: 14pt; font-weight: normal; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        .meta-info { text-align: right; font-size: 10pt; margin-bottom: 5px; color: #666; }
                    }
                    /* Screen styles for preview (optional) */
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #333; padding: 10px; text-align: center; }
                    td { height: 50px; }
                    h2, h3 { text-align: center; }
                </style>
            </head>
            <body>
        `;

        // Generate a table for each slot
        sortedSlots.forEach((slotId, index) => {
            // Get bookings for this slot
            const slotBookings = sortedBookings.filter(b => b.slots.includes(slotId));
            if (slotBookings.length === 0) return;

            // Page break before every slot except the first one
            if (index > 0) printContent += `<div class="page-break"></div>`;

            // Metadata Header
            const slotTitle = getSlotTitle(slotId);
            printContent += `
                <div class="meta-info">列印時間: ${format(new Date(), 'yyyy-MM-dd HH:mm')}</div>
                <h2>${slotId}</h2>
                <h3>${slotTitle} - 簽到表 (共 ${slotBookings.length} 人)</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 100px;">ID</th>
                            <th style="width: 120px;">姓名</th>
                            <th style="width: 160px;">報名時間</th>
                            <th>選課 ID</th>
                            <th class="sign-col">簽到</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Rows
            slotBookings.forEach(b => {
                let dateStr = 'N/A';
                if (b.timestamp && typeof b.timestamp.toDate === 'function') {
                    dateStr = format(b.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss');
                }
                const shortId = b.id ? b.id.substring(0, 8).toUpperCase() : '';

                printContent += `
                    <tr>
                        <td style="font-family: monospace; font-weight: bold; letter-spacing: 1px;">${shortId}</td>
                        <td style="font-size: 14pt; font-weight: 500;">${b.name}</td>
                        <td>${dateStr}</td>
                        <td style="font-size: 10pt;">${b.slots.join(', ')}</td>
                        <td></td> <!-- Empty for Signature -->
                    </tr>
                `;
            });

            printContent += `
                    </tbody>
                </table>
            `;
        });

        printContent += `</body></html>`;

        // Open Print Window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            // Wait for content to load then print
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                // Optional: printWindow.close(); // Keep open for user to manually close if needed
            }, 500);
        } else {
            alert('請允許開啟彈跳視窗以進行列印');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>載入中...</div>;
    }

    return (
        <div style={{ textAlign: 'left', width: '100%' }}>

            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, textAlign: 'left', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📊 即時看板
                        <span className="live-badge">
                            <span className="live-dot"></span> LIVE
                        </span>
                    </h2>
                </div>
                <div className="dashboard-actions">
                    <button onClick={refreshData} className="btn-secondary mobile-icon-btn">
                        <span className="icon">🔄</span> <span className="text">強制刷新</span>
                    </button>
                    <button onClick={handleExport} className="btn-primary mobile-icon-btn" style={{ background: '#10b981' }}>
                        <span className="icon">📥</span> <span className="text">匯出 Excel</span>
                    </button>
                    <button onClick={handleExportPDF} className="btn-primary mobile-icon-btn" style={{ background: '#6366f1' }}>
                        <span className="icon">🖨️</span> <span className="text">匯出 PDF</span>
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
            <div className="glass-card" style={{ padding: '24px', marginBottom: '30px', height: '450px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', color: '#475569', flexShrink: 0 }}>📊 場次熱門度統計</h3>
                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: '#cbd5e1' }}
                                dy={10}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'rgba(255, 255, 255, 0.95)' }}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name.includes('A') ? '#818cf8' : entry.name.includes('B') ? '#fb923c' : '#34d399'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* System Tools */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '20px', marginTop: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '15px' }}>🛠️ 系統工具 (System Tools)</h3>
                <div className="system-tools-card">
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
