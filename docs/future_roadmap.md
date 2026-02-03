# 🚀 Soka Education EXPO - Future Optimization Roadmap

## ✅ Completed Milestones (已完成里程碑)

### **v1.0.7 - Post-Booking Experience (User Fidelity)** (Current)
- 🔒 **選課鎖定機制 (Lock Logic)**：
    - **防呆鎖定**：已報名用者自動鎖定選課區塊，防止誤觸或重複提交。
    - **視覺階層優化**：
        - **Highlight Focus**：已選課程保留 **100% 全彩與立體感**，並強制顯示打勾 (✓)，營造「持有感」。
        - **Dimmed Background**：未選課程自動轉為 **灰階半透明**，創造強烈視覺對比，一眼識別報名內容。
- 🧭 **導航流暢度**：
    - **狀態按鈕**：首頁新增「🎉 已完成報名」動態按鈕，整合 RWD 手機版型。
    - **無縫切換**：修正「返回首頁」邏輯，不再強制重整頁面，保留應用程式狀態。

### **v1.0.6 - Social & Preservation**
- 📸 **票券保存優化**：
    - **智慧圖片生成**：即使在 LINE/FB 內建瀏覽器，也能透過 `html2canvas` 完美生成高解析度票券圖片。
    - **防呆機制**：自動偵測手機環境，引導使用穩定度最高的「長按儲存」模式。
- 📤 **社群擴散**：
    - **Native Share**：整合 Web Share API，一鍵喚起 Instagram/LINE 分享。

### **v1.0.5 - Performance & Stability**
- ⚡ **極速載入**：Code Splitting 拆分後台與前台，首頁載入體積減少 60%。
- 🛡️ **高併發抗壓**：實作 Firestore Transaction Retry 機制，支撐 500+ 人同時搶票。

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

### 2. 📊 Admin Power-Up (後台十倍速進化)
**目標**：讓管理員不只是看，還能「控」。
- **Export to Excel/CSV**：一鍵匯出報名名單，方便教務處進行後續點名或保險作業。
- **Real-time Monitoring**：
    - 改用 Firestore `onSnapshot` 監聽模式，實現真正「秒級」的儀表板更新，看著數字即時跳動。
- **Seed Reset**：一鍵「重置場次餘額」功能 (目前已有按鈕，可再強化防誤觸機制)。

### 3. 🤖 AI Data Insight (AI 數據分析助手)
**目標**：利用收集到的數據提供決策建議。
- **自然語言查詢**：讓管理者能用問的：「目前哪个系級報名最踴躍？」、「C 場次還剩多少位子？」。
- **趨勢預測**：根據前 24 小時報名速率，預測何時會額滿，提早發布社群告急貼文。

### 4. 🎮 Gamification (展場互動遊戲化)
**目標**：不只是報名，更增加展場停留時間。
- **數位集章**：學生到實體攤位掃描 QR Code 集點，集滿 5 點自動在「我的票券」頁面解鎖「兌換券」。
- **幸運碼系統**：報名成功後獲得一組 Unique ID，活動當天大螢幕即時抽獎。

### 5. 🏗️ Engineering Excellence (工程體質優化)
- **Lazy Retry Component**：針對網路不穩定的校園環境，強化 Lazy Load 的自動重試機制 (已初步實作，可模組化)。
- **Unit Testing**：針對 `SessionSelection` 和 `bookingService` 撰寫單元測試，確保搶票邏輯 (A+B 互斥、名額扣除) 100% 正確。
- **Accessibility (a11y)**：為鎖定狀態的卡片加入 `aria-disabled` 標籤，提升無障礙體驗。

### 📌 建議優先順序
1.  **Admin Export** (行政作業急需，建議優先開發)
2.  **QR Check-in** (活動現場絕對必要)
3.  **Real-time Monitoring** (提升管理體驗)
4.  **Unit Testing** (確保系統長治久安)
