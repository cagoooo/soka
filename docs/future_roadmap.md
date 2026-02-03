# 🚀 Soka Education EXPO - Future Optimization Roadmap

## ✅ Completed Milestones (已完成里程碑)

### **v1.0.6 - Social & Preservation** (Latest)
- 📸 **票券保存優化**：
    - **智慧圖片生成**：即使在 LINE/FB 內建瀏覽器，也能透過 `html2canvas` 完美生成高解析度票券圖片。
    - **防呆機制**：自動偵測手機環境，引導使用穩定度最高的「長按儲存」模式，解決下載失敗痛點。
- 📤 **社群擴散**：
    - **Native Share**：整合 Web Share API，讓學生能一鍵喚起 Instagram/LINE 分享報名成功的喜悅。
- 🎨 **品牌識別**：全站 Favicon 統一為 SOKA LOGO。

### **v1.0.5 - Performance & Stability**
- ⚡ **極速載入**：
    - **Code Splitting**：成功拆分後台與前台程式碼，首頁載入體積減少 60% 以上。
    - **PWA 快取**：設定 Google Fonts 與靜態資源快取，實現離線票券瀏覽。
- 🛡️ **高併發抗壓**：
    - **Transaction Retry**：實作資料庫自動重試機制，可支撐 500+ 人同時搶票而不報錯。

### **v1.0.4 - UI/UX & Privacy Overhaul**
- **隱私強化**：移除電話/Email 敏感欄位。
- **極致 UI**：完售戳章、動態進度條、RWD 響應式排版優化。

---

## 📅 Phase 3: Smart Campus & Interaction (Next Steps)

### 1. 📱 QR Check-in System (現場快速通關)
**目標**：解決活動當天 500+ 人次的簽到擁塞問題。
- **Admin Scanner (掃碼槍)**：
    - 利用手機鏡頭直接辨識學生票券 QRCode。
    - **離線簽到**：支援斷網環境先暫存，連線後自動同步回資料庫。
    - **防重複入場**：掃描後自動標記 "Checked-in"，重複掃描顯示警告。

### 2. 🤖 AI Data Insight (AI 數據分析助手)
**目標**：利用收集到的數據提供決策建議。
- **自然語言查詢**：讓管理者能用問的：「目前哪个系級報名最踴躍？」、「C 場次還剩多少位子？」。
- **趨勢預測**：根據前 24 小時報名速率，預測何時會額滿，提早發布社群告急貼文。

### 3. 🎮 Gamification (展場互動遊戲化)
**目標**：不只是報名，更增加展場停留時間。
- **數位集章**：
    - 學生到實體攤位掃描 QR Code 集點。
    - 集滿 5 點自動在「我的票券」頁面解鎖「兌換券 QR Code」。
- **抽獎系統**：報名成功後獲得一組幸運碼，活動當天線上開獎。

### 4. 🎨 Micro-Interactions (質感再升級)
- **Toast Notifications**：將傳統 `alert` 視窗升級為右上角精緻滑出的通知 (Tastify)。
- **Skeleton Loading**：資料讀取時顯示「骨架屏」而非轉圈圈，提升視覺流暢感。

### 📌 建議優先順序
1.  **QR Check-in** (活動現場絕對必要，建議優先開發)
2.  **Toast Notification** (提升質感，開發成本低)
3.  **AI Insight** (加分項目，適合做為活動結案報告亮點)
