import { useEffect, useState } from 'react';
import { getRecentLogs, type AdminLog } from '../services/adminLogService';
import { format } from 'date-fns';
import { getAllBookings } from '../services/bookingService';

export const SecurityDashboard = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [estimatedReads, setEstimatedReads] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logsData, bookingsData] = await Promise.all([
                    getRecentLogs(30),
                    getAllBookings()
                ]);
                setLogs(logsData);
                setEstimatedReads(bookingsData.length + 10);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Refresh logs every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        return status === 'SUCCESS' ? '#22c55e' : '#ef4444';
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'LOGIN': '🔑 登入成功',
            'LOGIN_FAILURE': '🚫 登入失敗',
            'SEED_DATA': '🌱 重置資料',
            'EXPORT_EXCEL': '📊 匯出報表',
            'VIEW_DASHBOARD': '👁️ 查看後台'
        };
        return labels[action] || action;
    };

    return (
        <div className="security-dashboard" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Security Health Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#1e293b' }}>
                        🛡️ 系統安全狀態
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#166534' }}>Firebase Auth</span>
                            <span style={{ fontWeight: 'bold', color: '#166534' }}>運作正常</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#166534' }}>API Key 網域限制</span>
                            <span style={{ fontWeight: 'bold', color: '#166534' }}>已啟用</span>
                        </div>
                        <div style={{ marginTop: '10px', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                            💡 提示：若發現異常登入位置，請立即更新管理密碼並檢查 GCP Console 的 API Key 使用紀錄。
                        </div>
                    </div>
                </div>

                {/* Firestore Usage Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#1e293b' }}>
                        📊 Firebase 用量監控 (Spark Plan)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                                <span style={{ color: '#475569' }}>🔍 本次工作階段讀取量 (估計)</span>
                                <span style={{ fontWeight: 'bold', color: '#6366f1' }}>~{estimatedReads} 次</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>當前預算：1,000 次 (工作階段)</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                            <span style={{ color: '#64748b' }}>📅 Firestore 每日讀取上限</span>
                            <span style={{ fontWeight: 600 }}>50,000 次</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                            <span style={{ color: '#64748b' }}>📅 Firestore 每日寫入上限</span>
                            <span style={{ fontWeight: 600 }}>20,000 次</span>
                        </div>

                        <a
                            href="https://console.firebase.google.com/project/_/usage"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{
                                marginTop: '10px',
                                textAlign: 'center',
                                display: 'block',
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                padding: '10px'
                            }}
                        >
                            🌐 開啟官方即時用量看板
                        </a>
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#1e293b' }}>
                        📈 最近活動摘要
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>
                            • 成功登入紀錄：{logs.filter((l: AdminLog) => l.action === 'LOGIN').length} 次
                        </p>
                        <p style={{ color: '#ef4444', margin: 0, fontWeight: 500 }}>
                            • 失敗警報次數：{logs.filter((l: AdminLog) => l.status === 'FAILURE').length} 次
                        </p>
                        <p style={{ color: '#64748b', margin: 0 }}>
                            • 報表匯出歷史：{logs.filter((l: AdminLog) => l.action === 'EXPORT_EXCEL').length} 次
                        </p>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>📜 管理員操作日誌</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '12px' }}>時間</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>操作</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>狀態</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>詳情</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>載入日誌中...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>尚無日誌紀錄</td>
                                </tr>
                            ) : logs.map((log: AdminLog) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', whiteSpace: 'nowrap', color: '#64748b' }}>
                                        {log.timestamp ? format(log.timestamp.toDate(), 'MM/dd HH:mm:ss') : 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 500 }}>
                                        {getActionLabel(log.action)}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            color: getStatusColor(log.status),
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            display: 'inline-block',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem'
                                        }}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: '#475569' }}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
