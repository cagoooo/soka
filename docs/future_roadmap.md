# 🚀 Soka Education EXPO - Future Optimization Roadmap

## ✅ Completed Milestones

### **v1.0.4 - UI/UX & Privacy Overhaul** (Current)
- **隱私強化**：
  - 🗑️ **資料極簡化**：移除電話與 Email 欄位，僅保留姓名，大幅降低個資門檻。
  - 🛡️ **安全的顯示**：票券與後台匯出同步移除敏感資訊。
- **極致 UI/UX 體驗**：
  - 🌈 **動態進度條**：剩餘名額視覺化，搭配「⚡即將額滿」、「🔥最後搶購」動態標籤。
  - 🚫 **完售特效 (Sold Out)**：RWD 響應式完售戳章、虛線邊框與禁制互動，創造強烈稀缺感。
  - 📝 **完整說明**：解除 CSS 截斷限制，支援多段落排版，提升閱讀性。
  - ⚡ **即時同步**：Firestore `onSnapshot` 實現秒殺級別的跨裝置狀態更新。

### **v1.0.2 - Data & Stability**
- ✅ **Excel 匯出修正**：包含欄位對應修復與資料清洗。
- ✅ **資料庫重置 2.0**：支援 Session Storage 與 Local Storage 的遠端同步重置。

---

## 📅 Phase 3: Smart Campus Integration (Suggested v1.1.0)

### 1. 📱 QR Check-in System (現場快速通關)
**目標**：解決活動當天 500+ 人次的簽到擁塞問題。
- **Admin 端 (Scanner)**：
    - 在後台新增「掃描模式」，開啟手機鏡頭讀取 QRCode。
    - **離線支援**：若活動現場網路不穩，可先暫存本機，連線後自動上傳。
    - **聲光回饋**：掃描成功顯示綠色大勾勾並發出「嗶」聲 (HTML5 Audio)。
- **User 端 (Ticket)**：
    - 點擊票券可放大 QR Code (Lightbox 效果) 方便掃描。
    - 下載票券圖片功能 (html2canvas) 方便存到相簿。

### 2. 📊 Dashboard 2.0 (戰情中心)
**目標**：將現有的資料列表升級為視覺化決策看板。
- **即時數據牆**：
    - 大螢幕模式 (Kiosk Mode)：適合投影在活動現場，顯示「目前已報名人數」、「最熱門場次」。
- **深度分析圖表**：
    - **系級參與度熱力圖**：哪些科系的學生最捧場？
    - **報名時間軸**：分析宣傳貼文發出後的流量轉化率 (Spike Analysis)。

### 3. ⚡ Edge Performance & PWA
**目標**：讓網頁像原生 App 一樣順暢。
- **Code Splitting**：
    - 目前 `index.js` 超過 500kB (Vite 警告)。建議實作 `React.lazy()` 將 AdminDashboard 與 TicketView 拆分載入，加快首頁開啟速度。
- **PWA 離線瀏覽**：
    - 設定 Service Worker 快取策略 (`StaleWhileRevalidate`)，讓使用者在無網路時仍能打開電子票券查閱場次。

### 4. 🎨 Micro-Interactions (微互動優化)
- **Skeleton Loading**：
    - 在讀取 Firebase 資料時 (Loading 狀態)，使用「骨架屏」代替轉圈圈，提升體感速度。
- **Toast Notifications**：
    - 將目前的 `window.alert` (阻斷式) 全面升級為 Toast (如 `react-hot-toast`)，右上角滑出的精緻通知。

---

## 🛠️ Technical Debt (技術債與維護)
1.  **Environment Variables Types**：為 `import.meta.env` 建立 TypeScript 定義檔，避免 `any` 類型。
2.  **Firestore Rules**：目前規則可能較為寬鬆，建議上線前鎖定為 `allow write: if request.auth != null` 並限制欄位格式。
3.  **Error Boundaries**：增加 React Error Boundary，當單一元件崩潰時 (如圖表套件錯誤) 不會導致整頁白屏。

### 📌 建議優先順序
1.  **Code Splitting** (效能優化，CP 值最高，避免使用者載入太久流失)
2.  **QR Check-in** (活動現場必要功能)
3.  **Toast Notifications** (大幅提升質感)
