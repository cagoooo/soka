# 🚀 Soka Education EXPO - Future Optimization Roadmap

## ✅ Completed Milestones (已完成里程碑)

### **v1.1.0 - Engineering Excellence (工程體質優化)** (Current)
- 🏗️ **Core Stability**：
    - **PWA Offline Mode**：強化 Service Worker 快取策略，並啟用 Firestore Persistence。實測在飛航模式下，仍能秒開票券並顯示 QR Code，確保地下室/電梯無訊號也暢行無阻。
    - **Unit Testing**：引入 `Vitest` 測試框架，為核心訂票邏輯 (`bookingService`) 建立單元測試，防止未來修改功能時發生邏輯倒退 (Regression)。
    - **Accessibility (a11y)**：全面導入 ARIA 標準 (ROLE, LABEL)，支援鍵盤 Tab 導航與螢幕閱讀器，打造友善包容的數位校園環境。

### **v1.0.9 - Administrative Precision (行政優化)**
- 🖨️ **Smart PDF Export**：
    - **Native A4 Layout**：針對瀏覽器原生列印功能優化，去除多餘 UI，只保留核心表格。
    - **Header Mapping**：將系統代號 (2F_A) 自動轉換為完整活動名稱 (如「躍動潛能...」)，清晰易讀。
    - **Signature Space**：每列高度強制設定為 50px，提供充足的手寫簽名空間。
    - **Page Break Logic**：智慧分頁，確保每個場次的簽到表獨立一頁，方便分發給不同負責人。


### **v1.0.8 - Admin Supercharge (後台進化)**
- 📊 **Admin Dashboard Plus**：
    - **Live Monitor**：導入 Firestore `onSnapshot`，實現儀表板「秒級」自動更新，搭配紅點動畫 (Live Badge) 掌握即時戰況。
    - **Excel Export**：一鍵匯出完整報名名單 (.xlsx)，自動格式化欄位 (姓名、場次、時間)，優化行政作業流程。
    - **RWD Optimization**：優化後台按鈕與工具列在手機/電腦版面的顯示，確保操作體驗一致。
    - **Social Card Polish**：優化 LINE/Facebook 分享卡片，加入吸睛標題與急迫感文案，提升點擊率。

### **v1.0.7 - Post-Booking Experience (User Fidelity)**
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

## 📅 Phase 3: Smart Campus & Interaction (Next Steps Ideas)

以下是建議可以繼續開發的優化方向，您可以依據需求挑選優先順序：

### 1. 📱 QR Check-in System (現場快速通關)
**目標**：解決活動當天 500+ 人次的簽到擁塞問題，只需一台手機即可運作。
- **Admin Scanner (掃碼槍)**：
    - 在 Admin Dashboard 新增「掃描模式」，利用手機鏡頭直接辨識學生票券 QRCode。
    - **即時回饋**：掃描成功發出「嗶」聲並顯示綠色勾勾，重複掃描顯示紅色警告。
    - **離線簽到能力**：為了應對活動現場網路擁塞，支援將簽到數據暫存在 LocalStorage，連線恢復後自動同步上傳。
    - **儀表板連動**：Admin Dashboard 新增「實到人數」欄位，與報名人數對比，計算出席率。

### 2. 📩 Automated Notification (自動化通知)
**目標**：降低活動當天 No-show (缺席) 率，提升活動參與度。
- **Email/Calendar Integration**：
    - 雖然目前不收集 email，但若未來需要，可串接 **Firebase Extensions (Trigger Email)**。
    - 當學生報名成功，自動寄送一封包含 `.ics` 行事曆檔案的信件，讓學生一鍵加入 Google Calendar。
- **Line Notify (進階)**：
    - 可研究串接 LINE Notify API，讓學生訂閱通知，活動前 30 分鐘自動推播提醒。

### 3. 🤖 AI Data Insight (AI 數據分析助手)
**目標**：利用收集到的數據提供決策建議，讓數據說話。
- **自然語言查詢 (Gemini API Integration)**：
    - 讓管理者能用問的：「目前哪个系級報名最踴躍？」、「C 場次還剩多少位子？」。
    - 將 Firestore 數據轉為 JSON 丟給 LLM 進行分析 (需注意隱私去識別化)。
- **熱力圖分析**：
    - 分析 2F/3F/5F/6F 各時段的報名速率，找出「秒殺場次」與「冷門場次」，作為明年活動規劃參考。

### 4. 🎮 Gamification (展場互動遊戲化)
**目標**：不只是報名，更增加展場停留時間，讓 APP 成為活動當天的導覽員。
- **數位集章 (Digital Stamp Rally)**：
    - 學生到實體攤位 (2F, 3F, 5F) 尋找隱藏的 QR Code。
    - 掃描後，APP 內的「集章卡」會蓋上數位印章。
    - 集滿 5 點自動在「我的票券」頁面解鎖「兌換券」，可至櫃台換取小禮物。
- **幸運碼系統**：
    - 報名成功後獲得一組 Unique ID (如 `#A188`)。
    - 活動閉幕時，在大螢幕上進行數位抽獎，增加留存率。

### 5. 🏗️ Engineering Excellence (工程體質優化)
- **PWA Offline Mode (離線瀏覽)**：
    - 強化 Service Worker 快取策略，讓學生即使在電梯裡、地下室沒訊號，也能順利打開 APP 展示票券。
- **Unit Testing**：
    - 針對 `SessionSelection` 和 `bookingService` 撰寫單元測試，確保搶票邏輯 (A+B 互斥、名額扣除) 100% 正確，避免改 A 壞 B。
- **Accessibility (a11y)**：
    - 為鎖定狀態的卡片加入 `aria-disabled` 標籤，提升無障礙體驗，符合校園網站標準。

### 6. 📊 Real-time Visual Command Center (戰情室應用)
**目標**：為活動當天指揮中心提供一個超大螢幕儀表板。
- **3D Venue Map**：
    - 繪製 2F/3F/5F/6F 的簡單 3D 平面圖，用熱力圖顏色即時顯示各區人流擁擠度 (根據掃碼數據)。
- **Alert System**：
    - 當某個展區人數超過 80% 預警值，大螢幕自動閃爍紅燈，通知工作人員進行人流管制。

### 7. � Post-Event Feedback Loop (活動後回饋閉環)
**目標**：收集質化數據，作為明年活動改進依據。
- **Smart Form**：
    - 活動結束後 (時間觸發)，APP 首頁自動切換為「滿意度調查問卷」。
    - 填寫完畢自動發送「感謝小卡」或「數位證書」到本機相簿，增加填寫誘因。

### 8. 🧠 AI-Driven Resource Allocation (AI 智慧資源調度)
**目標**：透過 AI 預測趨勢，提前預防場次過熱或資源浪費。
- **Popularity Predictor**：根據往年數據與即時報名斜率，AI 自動為特定場次標註「🔥 熱門預警」或「💎 精選名額預告」，引導分散人流。
- **Smart Admin Agent**：整合後台管理助手，管理者可直接詢問：「請幫我總結目前的報名狀況並生成一份給行政主管看的摘要」，由 AI 自動完成。

### 9. 🛡️ Advanced Security & Audit (安全審查與日誌)
- **Admin Activity Log**：詳細紀錄管理員的登入與設定修改紀錄，確保後台操作有跡可循。
- **Security Dashboard**：新增安全性面板，即時顯示 Firebase API Key 的網域限制狀態與讀寫額度預約，預防突發流量或濫用。

### �📌 建議優先順序
1.  **QR Check-in** (活動現場絕對必要，效益最高)
2.  **Gamification** (增加互動性，讓同學不只是來簽到)
3.  **Real-time Visual Command Center** (若有大螢幕展示需求，視覺效果極佳)

