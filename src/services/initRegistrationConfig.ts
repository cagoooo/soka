/**
 * Firestore 報名時間設定初始化腳本
 * 
 * 執行方式：在 Firebase Console 的 Firestore Database 中
 * 建立 Collection: system
 * 建立 Document: registrationConfig
 * 
 * 或使用此腳本透過 Firebase Admin SDK 執行
 */

// Firestore Document Path: system/registrationConfig
const registrationConfig = {
    // 報名開放時間：2026/02/06 08:00 (台灣時間 UTC+8)
    // 轉換為 UTC: 2026/02/06 00:00
    registrationOpenTime: "2026-02-06T00:00:00.000Z",

    // 報名關閉時間：2026/02/07 00:00 (台灣時間 UTC+8) = 2月6日晚上12點
    // 轉換為 UTC: 2026/02/06 16:00
    registrationCloseTime: "2026-02-06T16:00:00.000Z",

    // 手動覆蓋模式：設為 true 時，系統將使用 isManuallyOpen 而非自動時間判斷
    manualOverride: false,

    // 手動開放狀態：僅在 manualOverride 為 true 時有效
    isManuallyOpen: false
};

console.log("請在 Firebase Console 的 Firestore Database 中建立以下設定：");
console.log("========================================");
console.log("Collection: system");
console.log("Document ID: registrationConfig");
console.log("----------------------------------------");
console.log("Fields:");
console.log(JSON.stringify(registrationConfig, null, 2));
console.log("========================================");

export default registrationConfig;
