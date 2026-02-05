import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export type RegistrationStatusType = 'loading' | 'before' | 'open' | 'closed';

export interface RegistrationCountdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export interface RegistrationConfig {
    registrationOpenTime: string;   // ISO 8601 UTC
    registrationCloseTime: string;  // ISO 8601 UTC
    manualOverride: boolean;        // 是否手動控制
    isManuallyOpen: boolean;        // 手動開放狀態
}

export interface RegistrationStatus {
    status: RegistrationStatusType;
    openTime: Date | null;
    closeTime: Date | null;
    countdown: RegistrationCountdown | null;
    config: RegistrationConfig | null;
    error: string | null;
}

// 預設時間設定（台灣時間 UTC+8）
// 開放時間：2026/02/06 08:00 TWN = 2026/02/06 00:00 UTC
// 關閉時間：2026/02/07 00:00 TWN = 2026/02/06 16:00 UTC
const DEFAULT_CONFIG: RegistrationConfig = {
    registrationOpenTime: '2026-02-06T00:00:00.000Z',
    registrationCloseTime: '2026-02-06T16:00:00.000Z',
    manualOverride: false,
    isManuallyOpen: false,
};

/**
 * 計算倒數時間
 */
const calculateCountdown = (targetTime: Date): RegistrationCountdown | null => {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();

    if (diff <= 0) return null;

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    return { days, hours, minutes, seconds };
};

/**
 * 計算報名狀態
 */
const calculateStatus = (
    config: RegistrationConfig,
    now: Date
): RegistrationStatusType => {
    // 手動覆蓋模式
    if (config.manualOverride) {
        return config.isManuallyOpen ? 'open' : 'closed';
    }

    const openTime = new Date(config.registrationOpenTime);
    const closeTime = new Date(config.registrationCloseTime);

    if (now < openTime) return 'before';
    if (now >= closeTime) return 'closed';
    return 'open';
};

/**
 * Hook: 監控報名系統開放狀態
 * - 從 Firestore 讀取時間設定
 * - 即時計算目前狀態
 * - 提供倒數計時功能
 */
export const useRegistrationStatus = (): RegistrationStatus => {
    const [config, setConfig] = useState<RegistrationConfig | null>(null);
    const [status, setStatus] = useState<RegistrationStatusType>('loading');
    const [countdown, setCountdown] = useState<RegistrationCountdown | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 計算狀態與倒數
    const updateStatus = useCallback(() => {
        if (!config) return;

        const now = new Date();
        const newStatus = calculateStatus(config, now);
        setStatus(newStatus);

        // 只有在「未開放」狀態才顯示倒數
        if (newStatus === 'before') {
            const openTime = new Date(config.registrationOpenTime);
            setCountdown(calculateCountdown(openTime));
        } else {
            setCountdown(null);
        }
    }, [config]);

    // 監聽 Firestore 設定變更
    useEffect(() => {
        const configRef = doc(db, 'system', 'registrationConfig');

        const unsubscribe = onSnapshot(
            configRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as RegistrationConfig;
                    setConfig(data);
                    setError(null);
                } else {
                    // 如果文件不存在，使用預設設定
                    console.log('registrationConfig not found, using defaults');
                    setConfig(DEFAULT_CONFIG);
                }
            },
            (err) => {
                console.error('Failed to fetch registration config:', err);
                setError('無法載入系統設定');
                // 使用預設設定作為 fallback
                setConfig(DEFAULT_CONFIG);
            }
        );

        return () => unsubscribe();
    }, []);

    // 每秒更新狀態（用於倒數計時）
    useEffect(() => {
        if (!config) return;

        // 立即更新一次
        updateStatus();

        // 設定每秒更新
        const interval = setInterval(updateStatus, 1000);

        return () => clearInterval(interval);
    }, [config, updateStatus]);

    return {
        status,
        openTime: config ? new Date(config.registrationOpenTime) : null,
        closeTime: config ? new Date(config.registrationCloseTime) : null,
        countdown,
        config,
        error,
    };
};
