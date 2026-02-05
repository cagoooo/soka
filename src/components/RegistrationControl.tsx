import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { addAdminLog } from '../services/adminLogService';
import { useRegistrationStatus } from '../hooks/useRegistrationStatus';

interface RegistrationConfig {
    registrationOpenTime: string;
    registrationCloseTime: string;
    manualOverride: boolean;
    isManuallyOpen: boolean;
}

// 預設設定值
const DEFAULT_CONFIG: RegistrationConfig = {
    registrationOpenTime: '2026-02-06T00:00:00.000Z', // 2026/02/06 08:00 TWN
    registrationCloseTime: '2026-02-06T16:00:00.000Z', // 2026/02/07 00:00 TWN
    manualOverride: false,
    isManuallyOpen: false,
};

/**
 * 報名時間控制面板
 * 管理者可以：
 * 1. 查看目前報名狀態
 * 2. 手動開啟/關閉報名
 * 3. 修改報名時間設定
 */
export const RegistrationControl = () => {
    const [config, setConfig] = useState<RegistrationConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // 用於編輯的暫存值
    const [editOpenTime, setEditOpenTime] = useState('');
    const [editCloseTime, setEditCloseTime] = useState('');

    // 即時狀態
    const registrationStatus = useRegistrationStatus();

    // 載入設定
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const docRef = doc(db, 'system', 'registrationConfig');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as RegistrationConfig;
                    setConfig(data);
                } else {
                    // 文件不存在，建立預設設定
                    await setDoc(docRef, DEFAULT_CONFIG);
                    setConfig(DEFAULT_CONFIG);
                }
            } catch (error) {
                console.error('Failed to load registration config:', error);
                setConfig(DEFAULT_CONFIG);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    // UTC 轉台灣時間字串（用於 datetime-local input）
    const utcToLocalInput = (utcString: string): string => {
        const date = new Date(utcString);
        // 轉為台灣時間 (UTC+8)
        const offset = 8 * 60; // 分鐘
        const localDate = new Date(date.getTime() + offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
    };

    // 本地時間字串轉 UTC
    const localInputToUtc = (localString: string): string => {
        // localString 格式為 "2026-02-06T08:00"（使用者輸入的台灣時間）
        // 需要減去 8 小時得到 UTC
        const date = new Date(localString);
        const offset = 8 * 60; // 分鐘
        const utcDate = new Date(date.getTime() - offset * 60 * 1000);
        return utcDate.toISOString();
    };

    // 手動切換報名狀態
    const handleToggleManual = async () => {
        if (!config) return;

        setSaving(true);
        try {
            const docRef = doc(db, 'system', 'registrationConfig');

            if (config.manualOverride) {
                // 關閉手動模式，恢復自動時間控制
                await updateDoc(docRef, { manualOverride: false, isManuallyOpen: false });
                setConfig({ ...config, manualOverride: false, isManuallyOpen: false });
                addAdminLog('REGISTRATION_CONTROL', 'SUCCESS', '取消手動控制，恢復自動時間判斷');
            } else {
                // 開啟手動模式，目前狀態取反
                const newIsOpen = registrationStatus.status !== 'open';
                await updateDoc(docRef, { manualOverride: true, isManuallyOpen: newIsOpen });
                setConfig({ ...config, manualOverride: true, isManuallyOpen: newIsOpen });
                addAdminLog('REGISTRATION_CONTROL', 'SUCCESS', `開啟手動控制，報名狀態設為: ${newIsOpen ? '開放' : '關閉'}`);
            }
        } catch (error) {
            console.error('Failed to toggle manual mode:', error);
            alert('操作失敗，請稍後再試');
        } finally {
            setSaving(false);
        }
    };

    // 快速開關（在手動模式下）
    const handleQuickToggle = async () => {
        if (!config || !config.manualOverride) return;

        setSaving(true);
        try {
            const docRef = doc(db, 'system', 'registrationConfig');
            const newIsOpen = !config.isManuallyOpen;
            await updateDoc(docRef, { isManuallyOpen: newIsOpen });
            setConfig({ ...config, isManuallyOpen: newIsOpen });
            addAdminLog('REGISTRATION_CONTROL', 'SUCCESS', `手動${newIsOpen ? '開放' : '關閉'}報名`);
        } catch (error) {
            console.error('Failed to toggle registration:', error);
            alert('操作失敗');
        } finally {
            setSaving(false);
        }
    };

    // 進入編輯模式
    const handleStartEdit = () => {
        if (!config) return;
        setEditOpenTime(utcToLocalInput(config.registrationOpenTime));
        setEditCloseTime(utcToLocalInput(config.registrationCloseTime));
        setEditMode(true);
    };

    // 儲存時間設定
    const handleSaveTime = async () => {
        if (!editOpenTime || !editCloseTime) {
            alert('請填寫完整時間');
            return;
        }

        const openUtc = localInputToUtc(editOpenTime);
        const closeUtc = localInputToUtc(editCloseTime);

        if (new Date(openUtc) >= new Date(closeUtc)) {
            alert('關閉時間必須晚於開放時間');
            return;
        }

        setSaving(true);
        try {
            const docRef = doc(db, 'system', 'registrationConfig');
            await updateDoc(docRef, {
                registrationOpenTime: openUtc,
                registrationCloseTime: closeUtc,
            });
            setConfig(prev => prev ? { ...prev, registrationOpenTime: openUtc, registrationCloseTime: closeUtc } : null);
            setEditMode(false);
            addAdminLog('REGISTRATION_CONTROL', 'SUCCESS', `更新報名時間：開放 ${editOpenTime} / 關閉 ${editCloseTime}`);
        } catch (error) {
            console.error('Failed to save time settings:', error);
            alert('儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    // 格式化時間顯示
    const formatTime = (utcString: string): string => {
        const date = new Date(utcString);
        return date.toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            weekday: 'short',
        });
    };

    // 取得目前狀態標籤
    const getStatusBadge = () => {
        if (registrationStatus.status === 'loading') {
            return <span className="status-badge status-loading">載入中</span>;
        }
        if (config?.manualOverride) {
            return config.isManuallyOpen
                ? <span className="status-badge status-open">手動開放 ✋</span>
                : <span className="status-badge status-closed">手動關閉 ✋</span>;
        }
        switch (registrationStatus.status) {
            case 'before':
                return <span className="status-badge status-before">尚未開放 ⏰</span>;
            case 'open':
                return <span className="status-badge status-open">開放中 ✅</span>;
            case 'closed':
                return <span className="status-badge status-closed">已截止 🔒</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>載入報名設定中...</div>;
    }

    return (
        <div className="registration-control-panel">
            {/* Header */}
            <h3 style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⏱️ 報名時間控制
                {getStatusBadge()}
            </h3>

            {/* Time Display */}
            <div className="time-display-grid">
                <div className="time-item">
                    <span className="time-label">📅 開放時間</span>
                    <span className="time-value">{config ? formatTime(config.registrationOpenTime) : '--'}</span>
                </div>
                <div className="time-item">
                    <span className="time-label">📅 關閉時間</span>
                    <span className="time-value">{config ? formatTime(config.registrationCloseTime) : '--'}</span>
                </div>
            </div>

            {/* Edit Mode */}
            {editMode && (
                <div className="edit-time-section">
                    <div className="edit-row">
                        <label>開放時間（台灣時間）</label>
                        <input
                            type="datetime-local"
                            value={editOpenTime}
                            onChange={(e) => setEditOpenTime(e.target.value)}
                            disabled={saving}
                        />
                    </div>
                    <div className="edit-row">
                        <label>關閉時間（台灣時間）</label>
                        <input
                            type="datetime-local"
                            value={editCloseTime}
                            onChange={(e) => setEditCloseTime(e.target.value)}
                            disabled={saving}
                        />
                    </div>
                    <div className="edit-actions">
                        <button className="btn-secondary" onClick={() => setEditMode(false)} disabled={saving}>
                            取消
                        </button>
                        <button className="btn-primary" onClick={handleSaveTime} disabled={saving}>
                            {saving ? '儲存中...' : '💾 儲存'}
                        </button>
                    </div>
                </div>
            )}

            {/* Control Buttons */}
            {!editMode && (
                <div className="control-buttons">
                    <button className="btn-secondary" onClick={handleStartEdit} disabled={saving}>
                        ✏️ 修改時間
                    </button>

                    {config?.manualOverride ? (
                        <>
                            <button
                                className="btn-primary"
                                style={{ background: config.isManuallyOpen ? '#ef4444' : '#10b981' }}
                                onClick={handleQuickToggle}
                                disabled={saving}
                            >
                                {config.isManuallyOpen ? '🔒 手動關閉' : '✅ 手動開放'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={handleToggleManual}
                                disabled={saving}
                            >
                                🔄 恢復自動
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn-primary"
                            style={{ background: '#f59e0b' }}
                            onClick={handleToggleManual}
                            disabled={saving}
                        >
                            ✋ 手動控制
                        </button>
                    )}
                </div>
            )}

            {/* Inline Styles */}
            <style>{`
        .registration-control-panel {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-loading { background: #e2e8f0; color: #64748b; }
        .status-before { background: #fef3c7; color: #92400e; }
        .status-open { background: #d1fae5; color: #065f46; }
        .status-closed { background: #fee2e2; color: #991b1b; }

        .time-display-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .time-item {
          background: rgba(99, 102, 241, 0.05);
          padding: 15px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .time-label {
          font-size: 0.85rem;
          color: #64748b;
        }

        .time-value {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
        }

        .edit-time-section {
          background: rgba(245, 158, 11, 0.1);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .edit-row {
          margin-bottom: 15px;
        }

        .edit-row label {
          display: block;
          font-size: 0.9rem;
          color: #475569;
          margin-bottom: 5px;
        }

        .edit-row input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 1rem;
        }

        .edit-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .control-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .control-buttons button {
          flex: 1;
          min-width: 120px;
        }

        @media (max-width: 480px) {
          .control-buttons {
            flex-direction: column;
          }
          .control-buttons button {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
};
