import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export type AdminAction = 'LOGIN' | 'LOGIN_FAILURE' | 'SEED_DATA' | 'EXPORT_EXCEL' | 'VIEW_DASHBOARD' | 'REGISTRATION_CONTROL';

export interface AdminLog {
    id?: string;
    timestamp: Timestamp;
    action: AdminAction;
    status: 'SUCCESS' | 'FAILURE';
    details: string;
    userAgent: string;
}

const LOGS_COLLECTION = 'admin_logs';

/**
 * 寫入一條管理員操作日誌
 */
export const addAdminLog = async (
    action: AdminAction,
    status: 'SUCCESS' | 'FAILURE',
    details: string
) => {
    try {
        await addDoc(collection(db, LOGS_COLLECTION), {
            timestamp: serverTimestamp(),
            action,
            status,
            details,
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error("Failed to add admin log:", error);
    }
};

/**
 * 獲取最近的日誌紀錄
 */
export const getRecentLogs = async (count: number = 20): Promise<AdminLog[]> => {
    try {
        const q = query(
            collection(db, LOGS_COLLECTION),
            orderBy('timestamp', 'desc'),
            limit(count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AdminLog));
    } catch (error) {
        console.error("Failed to fetch admin logs:", error);
        return [];
    }
};
