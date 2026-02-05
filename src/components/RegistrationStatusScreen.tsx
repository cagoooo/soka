import { useState } from 'react';
import type { RegistrationCountdown } from '../hooks/useRegistrationStatus';
import { AdminLoginModal } from './AdminLoginModal';

interface RegistrationStatusScreenProps {
  status: 'before' | 'closed';
  countdown: RegistrationCountdown | null;
  openTime: Date | null;
  closeTime: Date | null;
}

/**
 * 報名狀態提示畫面
 * - 報名尚未開放 (before): 顯示倒數計時
 * - 報名已截止 (closed): 顯示截止訊息
 */
export const RegistrationStatusScreen = ({
  status,
  countdown,
  openTime,
  closeTime,
}: RegistrationStatusScreenProps) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  // 隱藏式管理員登入：點擊圖示 5 次觸發
  const handleIconTap = () => {
    const now = Date.now();
    // 如果距離上次點擊超過 2 秒，重置計數
    if (now - lastTapTime > 2000) {
      setTapCount(1);
    } else {
      const newCount = tapCount + 1;
      setTapCount(newCount);

      // 達到 5 次點擊，開啟登入視窗
      if (newCount >= 5) {
        setShowAdminLogin(true);
        setTapCount(0);
      }
    }
    setLastTapTime(now);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--';
    return date.toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCountdownUnit = (value: number, label: string) => (
    <div className="countdown-unit">
      <span className="countdown-value">{String(value).padStart(2, '0')}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );

  return (
    <div className="container">
      <div className="glass-card status-screen">
        {/* Header */}
        <h1>2026 創價・教育 EXPO</h1>
        <h2>教育實踐趴 - 線上選課</h2>

        {/* Status Icon - 點擊 5 次可開啟隱藏的管理員登入 */}
        <div className="status-icon-wrapper">
          {status === 'before' ? (
            <div
              className="status-icon before"
              onClick={handleIconTap}
              style={{ cursor: 'default', userSelect: 'none' }}
            >
              <span role="img" aria-label="時鐘">⏰</span>
            </div>
          ) : (
            <div
              className="status-icon closed"
              onClick={handleIconTap}
              style={{ cursor: 'default', userSelect: 'none' }}
            >
              <span role="img" aria-label="關閉">🔒</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {status === 'before' ? (
          <>
            <h3 className="status-title">報名尚未開放</h3>
            <p className="status-description">
              報名將於 <strong>{formatTime(openTime)}</strong> 開始
            </p>

            {/* Countdown Timer */}
            {countdown && (
              <div className="countdown-container">
                <p className="countdown-header">距離開放還有</p>
                <div className="countdown-grid">
                  {formatCountdownUnit(countdown.days, '天')}
                  <span className="countdown-separator">:</span>
                  {formatCountdownUnit(countdown.hours, '時')}
                  <span className="countdown-separator">:</span>
                  {formatCountdownUnit(countdown.minutes, '分')}
                  <span className="countdown-separator">:</span>
                  {formatCountdownUnit(countdown.seconds, '秒')}
                </div>
              </div>
            )}

            {/* Deadline Reminder */}
            <div className="deadline-reminder">
              <span className="deadline-icon">⚠️</span>
              <p className="deadline-text">
                報名截止時間：<strong>{formatTime(closeTime)}</strong>
              </p>
              <p className="deadline-hint">
                請於開放後儘速完成報名，以免錯過時間！
              </p>
            </div>
          </>
        ) : (
          <>
            <h3 className="status-title">報名已截止</h3>
            <p className="status-description">
              感謝您的關注！本次報名已經結束。
            </p>
            <p className="status-note">
              如有任何問題，請聯繫主辦單位。
            </p>
          </>
        )}

        {/* Footer - 移除 Admin Access，改用隱藏式登入 */}
        <footer className="status-footer">
          <a
            href="https://cagoooo.github.io/Akai/"
            target="_blank"
            rel="noopener noreferrer"
            className="akai-badge"
          >
            ✨ Made by 阿凱老師
          </a>
        </footer>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />

      {/* CSS Styles */}
      <style>{`
        .status-screen {
          text-align: center;
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
          padding: 50px 35px;
          box-sizing: border-box;
          background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%);
          border: 2px solid rgba(99, 102, 241, 0.15);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.8) inset,
            0 0 80px rgba(99, 102, 241, 0.1);
        }

        .status-screen h1 {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 5px;
          text-align: center;
        }

        .status-screen h2 {
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 10px;
          text-align: center;
        }

        .status-icon-wrapper {
          margin: 35px 0 25px;
          text-align: center;
        }

        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          font-size: 3.5rem;
          position: relative;
        }

        .status-icon.before {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%);
          box-shadow: 
            0 12px 35px rgba(245, 158, 11, 0.45),
            0 0 0 8px rgba(245, 158, 11, 0.15);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .status-icon.before::after {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 3px solid rgba(245, 158, 11, 0.3);
          animation: ripple 2s ease-out infinite;
        }

        .status-icon.closed {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 
            0 12px 35px rgba(239, 68, 68, 0.45),
            0 0 0 8px rgba(239, 68, 68, 0.15);
        }

        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 12px 35px rgba(245, 158, 11, 0.45),
              0 0 0 8px rgba(245, 158, 11, 0.15);
          }
          50% { 
            transform: scale(1.08);
            box-shadow: 
              0 16px 45px rgba(245, 158, 11, 0.55),
              0 0 0 12px rgba(245, 158, 11, 0.2);
          }
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .status-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 25px auto 15px;
          background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          display: block;
          width: 100%;
          letter-spacing: 2px;
        }

        .status-description {
          color: #475569;
          font-size: 1.05rem;
          margin-bottom: 30px;
          word-break: keep-all;
          text-align: center;
        }

        .status-description strong {
          color: #1e40af;
          font-weight: 700;
        }

        .status-note {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .countdown-container {
          background: rgba(30, 58, 95, 0.05);
          border-radius: 16px;
          padding: 25px 15px;
          margin: 20px 0;
        }

        .countdown-header {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 15px;
        }

        .countdown-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
        }

        .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
          flex: 0 0 auto;
        }

        .countdown-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1e3a5f;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .countdown-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        .countdown-separator {
          font-size: 1.8rem;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .deadline-reminder {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
        }

        .deadline-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 8px;
        }

        .deadline-text {
          margin: 0;
          font-size: 0.95rem;
          color: #92400e;
        }

        .deadline-text strong {
          color: #dc2626;
          font-weight: 700;
        }

        .deadline-hint {
          margin: 8px 0 0 0;
          font-size: 0.85rem;
          color: #b45309;
        }

        .status-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .status-footer .akai-badge {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
        }

        .status-footer .akai-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        /* RWD 響應式設計 - 平板 */
        @media (max-width: 768px) {
          .status-screen {
            padding: 35px 25px;
          }
          .status-icon {
            width: 90px;
            height: 90px;
            font-size: 2.5rem;
          }
          .status-title {
            font-size: 1.4rem;
          }
          .countdown-value {
            font-size: 1.8rem;
          }
          .countdown-unit {
            min-width: 48px;
          }
          .countdown-separator {
            font-size: 1.5rem;
          }
        }

        /* RWD 響應式設計 - 手機 */
        @media (max-width: 480px) {
          .status-screen {
            padding: 30px 20px;
          }
          .status-screen h1 {
            font-size: 1.3rem;
          }
          .status-screen h2 {
            font-size: 1rem;
          }
          .status-icon {
            width: 80px;
            height: 80px;
            font-size: 2.2rem;
          }
          .status-title {
            font-size: 1.25rem;
          }
          .status-description {
            font-size: 0.95rem;
          }
          .countdown-container {
            padding: 20px 12px;
          }
          .countdown-value {
            font-size: 1.5rem;
          }
          .countdown-unit {
            min-width: 42px;
          }
          .countdown-separator {
            font-size: 1.2rem;
            margin-bottom: 12px;
          }
          .countdown-label {
            font-size: 0.7rem;
          }
        }

        /* RWD 響應式設計 - 極小螢幕 */
        @media (max-width: 360px) {
          .countdown-value {
            font-size: 1.3rem;
          }
          .countdown-unit {
            min-width: 38px;
          }
          .countdown-separator {
            font-size: 1rem;
            margin: 0 2px;
          }
          .countdown-grid {
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};
