# 🚀 Soka Education EXPO - Future Optimization Roadmap

## 1. 🛡️ Admin Dashboard (管理員後台 2.0)
目前雖然已有基本的登入驗證，但功能較為陽春。建議建立一個完整的儀表板：
- **可視化數據圖表**：
    - 使用 `Recharts` 或 `Chart.js` 顯示各場次報名即時狀況（圓餅圖、長條圖）。
    - 每日報名趨勢圖。
- **名單管理**：
    - 完整的報名者列表（Data Grid）。
    - 支援 **Excel / CSV 匯出** 功能，方便行政作業。
    - 單筆資料編輯/刪除功能（處理誤報或取消需求）。
- **簽到系統**：
    - 為每位報名者生成 **QR Code**。
    - 活動當天管理員可使用手機掃描 QR Code 進行快速簽到。

## 2. ⚡ Real-time & Performance (效能與即時性)
- **Firestore Snapshot (即時監聽)**：
    - 目前需手動重新整理才能看到剩餘名額變化。
    - 建議改用 `onSnapshot` 實現**即時名額更新**。當有人報名成功，所有人的畫面名額會自動扣減，無需刷新。
- **PWA (Progressive Web App)**：
    - 加入 `manifest.json` 與 Service Worker。
    - 讓使用者可以將網站「安裝」到手機桌面，提供接近原生 App 的體驗。
    - 支援離線瀏覽基本資訊。

## 3. 🎨 Advanced UX (使用者體驗再升級)
- **Skeleton Loading (骨架屏)**：
    - 在資料載入時（Loading...），顯示與卡片形狀相符的灰色閃爍骨架，提升質感並減少等待的焦慮感。
- **Dark Mode (深色模式)**：
    - 雖然目前是 Aurora 風格，但可設計一套對應的深色極光主題，適應不同使用者的裝置設定。
- **Map Integration (地圖導航)**：
    - 在場次卡片上加入「查看位置」按鈕，點擊彈出校園平面圖或 Google Maps 導引。

## 4. 🔒 Security & Validation (安全與驗證)
- **Zod Schema Validation**：
    - 引入 `zod` 強化表單驗證（例如更嚴格的手機格式、學號格式檢查）。
- **Firebase Auth (正式驗證)**：
    - 從目前的簡易密碼驗證升級為 Firebase Authentication (Email/Password 或 Google Sign-In)，便於管理多位管理員權限。
- **Rate Limiting**：
    - 防止單一 IP 短時間內大量請求，保護資料庫額度。

## 5. 📱 Marketing & Social (行銷與社群)
- **OG Tags (Open Graph)**：
    - 設定 FB/Line 分享時的預覽圖片與標題，增加點擊率。
- **Ticket Wallet**:
    - 報名成功後，允許使用者將「入場券」加入 Apple Wallet 或 Google Wallet。

---

### Suggested Next Step (建議下一步)
優先順序建議：
1. **Excel 匯出功能** (行政作業最急需)
2. **即時名額更新** (提升使用者搶票體驗)
3. **OG Tags 分享優化** (提升活動曝光度)
