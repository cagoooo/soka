# 🚀 Soka Education EXPO - Future Optimization Roadmap

## ✅ Completed (v1.1.0)
- **行政管理**：
    - ✅ **Excel / CSV 匯出功能**：`xlsx` 套件整合，一鍵匯出完整報名名單。
    - ✅ **資料庫重置工具**：Seed Button 一鍵還原。
- **行銷推廣**：
    - ✅ **OG Tags (Open Graph)**：設定 `og:image` (SOKA.jpg) 與標題描述，FB/LINE 分享預覽圖。
- **使用者體驗**：
    - ✅ **即時搶票 (`onSnapshot`)**：Firestore Real-time Listener，名額變化零時差。
    - ✅ **UI 排版優化**：C/D 場次併排 (Grid Layout)，RWD 適配。

---

## 📅 Phase 3: Advanced Automation (v1.2.0 - Planned)

### 1. 💌 Email Automation (自動化信件)
*   **目標**：降低人工通知成本，提升專業度。
*   **技術**：Firebase Cloud Functions (Trigger Email)。
*   **功能**：
    *   **報名成功信**：包含票券 QR Code 連結、活動時間、場地引導。
    *   **行前通知信**：活動前 24 小時自動發送提醒。
    *   **額滿候補通知**：(若未來開啟候補機制) 當有名額釋出時自動通知。

### 2. 📱 QR Check-in System (現場簽到 App)
*   **目標**：活動當天快速消化排隊人潮，即時掌握此到率。
*   **技術**：`react-qr-reader` (Webcam 掃描) + Admin Dashboard 擴充。
*   **功能**：
    *   **掃碼模式**：管理員開啟手機鏡頭，掃描學生票券 QR Code。
    *   **狀態更新**：系統自動將 DB 狀態改為 `Attended` (已簽到)。
    *   **簽到聲光回饋**：成功時發出 "嗶" 聲與綠色勾勾。

### 3. 📊 Advanced Analytics (高階數據分析 - 儀表板擴充)
*   **目標**：將單調的表格轉化為決策洞察。
*   **建議圖表**：
    1.  **報名趨勢圖 (Line Chart)**：
        *   X軸：時間 (小時/天)，Y軸：報名人數。
        *   用途：分析「搶票高峰期」，作為明年宣傳時段參考。
    2.  **系級分佈圓餅圖 (Donut Chart)**：
        *   解析 `department` 欄位。
        *   用途：了解哪個科系最積極，哪個科系需要加強宣傳。
    3.  **場次飽和度儀表板 (Gauge/Progress)**：
        *   以「紅綠燈」顏色顯示各場次額滿率 (例：>90% 紅色警示)。
        *   用途：管理員一秒掌握哪些場次需要緊急加開或調控。
    4.  **選課關聯熱力圖 (Correlation Heatmap)**：
        *   分析「選 A1 的人通常會配 B1 還是 B2？」。
        *   用途：未來的活動場次安排與時間表優化參考。

### 4. 🔒 Authentication & Security (資安升級)
*   **目標**：從目前的簡易驗證升級為標準 Auth。
*   **功能**：
    *   **Admin Accounts**：允許新增多位管理員 (Editor/Viewer 權限分離)。
    *   **Audit Logs**：記錄誰在什麼時候刪除了哪筆資料。

---

### Suggested Next Step (建議下一步)
優先順序建議：
1.  **QR Check-in System** (為了活動當天流程順暢，此為剛需) 📱
2.  **Email Automation** (提升服務貼心度) 💌
3.  **Data Analytics** (活動後結案報告需要) 📊
