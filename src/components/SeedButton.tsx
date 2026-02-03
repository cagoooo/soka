import { writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const SeedButton = () => {
    const handleSeed = async () => {
        const message = `⚠️ 危險操作警告 ⚠️\n\n1. 所有「報名資料」與「場次紀錄」將被永久刪除。\n2. 所有已報名使用者的裝置將被「解除鎖定」，允許重新選課。\n\n確定要執行系統完全重置嗎？`;
        if (!confirm(message)) return;

        const batch = writeBatch(db);

        try {
            // 1. Delete ALL existing Bookings
            const bookingsRef = collection(db, 'bookings');
            const bookingsSnapshot = await getDocs(bookingsRef);
            bookingsSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 2. Clear ALL existing Slots (to be safe against ID changes)
            const slotsRef = collection(db, 'slots');
            const slotsSnapshot = await getDocs(slotsRef);
            slotsSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 3. Seed New Slots
            // Data parsed from 2026《創價・教育EXPO》線上報名選課.htm
            const sessions = [
                // A Sessions
                { id: '2F_A', type: 'A', location: '二樓', title: '躍動潛能：音樂與生命的對話', description: '登上舞台親自執棒，指揮天谷樂團演奏。民眾實際體驗指揮流程，近距離感受音樂。', capacity: 50, booked: 0, startTime: '20分鐘' },
                { id: '3F_A', type: 'A', location: '三樓', title: '正向教養攤位 (4攤)', description: '參與正向教養情境模擬，四種體驗活動，練習溫和堅定對話。透過實際操作，掌握尊重與合作的教養技巧。', capacity: 180, booked: 0, startTime: '20分鐘' },
                { id: '5F_A', type: 'A', location: '五樓', title: '創價 OPEN SPACE：無劇本思維冒險', description: '透過互動參與實踐創價理念，探索人本教育新模式。在活動中將價值創造轉化為具體行動。', capacity: 120, booked: 0, startTime: '20分鐘' },

                // B Sessions
                { id: '2F_B', type: 'B', location: '二樓', title: '躍動潛能：音樂與生命的對話', description: '登上舞台親自執棒，指揮天谷樂團演奏。民眾實際體驗指揮流程，近距離感受音樂。', capacity: 50, booked: 0, startTime: '20分鐘' },
                { id: '3F_B', type: 'B', location: '三樓', title: '專業課程攤位 (4攤)', description: '進入創價教育專業課堂，表演藝術、音樂、資訊、永續桌遊，實踐人本教學策略。親自操作教育方案，提升現場引導與溝通能力。', capacity: 180, booked: 0, startTime: '20分鐘' },
                { id: '5F_B', type: 'B', location: '五樓', title: '創價 OPEN SPACE：無劇本思維冒險', description: '透過互動參與實踐創價理念，探索人本教育新模式。在活動中將價值創造轉化為具體行動。', capacity: 120, booked: 0, startTime: '20分鐘' },

                // C Session
                { id: '6F_C', type: 'C', location: '六樓會三', title: '《優雅接住，情緒的浪》', description: '解析學生爆發情緒特徵，學習三階段緩降策略。透過 SEL 社會情緒學習實務，建立穩定校園支持環境。', capacity: 60, booked: 0, startTime: '40分鐘' },

                // D Session
                { id: '6F_D', type: 'D', location: '六樓會四', title: '《從餐桌到生命的美利善》', description: '探討畜牧業現況與食材選擇，破除飲食迷思。引導建立負責任的生命態度，將永續教育落實於生活。', capacity: 60, booked: 0, startTime: '40分鐘' }
            ];

            sessions.forEach(session => {
                const ref = doc(db, 'slots', session.id);
                batch.set(ref, {
                    ...session,
                    endTime: ''
                });
            });

            // 4. Update System Config with Reset Timestamp
            // This allows clients to know they should clear their local storage
            const systemRef = doc(db, 'system', 'config');
            batch.set(systemRef, {
                lastReset: new Date().toISOString() // Use ISO string for easier client-side comparison
            });

            await batch.commit();
            alert('系統已重置！所有報名資料已清除，場次已恢復初始狀態。');

            // Reload to refresh the dashboard
            window.location.reload();

        } catch (e) {
            console.error(e);
            alert('重置失敗 Error seeding data');
        }
    };

    return (
        <button onClick={handleSeed} className="btn-primary" style={{ margin: '20px auto', display: 'block' }}>
            初始化系統資料 (Initialize DB)
        </button>
    );
};
