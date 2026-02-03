import { QRCodeSVG } from 'qrcode.react';
import { useSlots } from '../hooks/useSlots';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserDetails } from '../services/bookingService';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import { isMobile } from '../utils/userAgent';
import toast from 'react-hot-toast';

interface TicketViewProps {
    bookingId: string;
    userDetails: UserDetails;
    selectedSlotIds: string[];
    onClose?: () => void;
}

export const TicketView = ({ bookingId, userDetails, selectedSlotIds, onClose }: TicketViewProps) => {
    const { slots } = useSlots();
    const [secretCount, setSecretCount] = useState(0);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Map IDs to full slot objects
    const mySlots = selectedSlotIds.map(id => slots.find(s => s.id === id)).filter(Boolean);

    const generateImage = async (): Promise<string | null> => {
        const ticketElement = document.getElementById('digital-ticket');
        if (!ticketElement) return null;

        const loadingList = toast.loading('生成圖片中...');
        try {
            const canvas = await html2canvas(ticketElement, {
                scale: 3, // High resolution for crisp text
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            toast.dismiss(loadingList);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Image generation failed:', error);
            toast.error('圖片生成失敗，請稍後再試。', { id: loadingList });
            return null;
        }
    };

    const handleDownload = async () => {
        const image = await generateImage();
        if (!image) return;

        // If mobile, show modal for long-press
        if (isMobile()) {
            setGeneratedImage(image);
            toast('請長按圖片進行儲存', { icon: '👆' });
            return;
        }

        // Desktop: Direct download
        const link = document.createElement('a');
        link.href = image;
        link.download = `Soka_Ticket_${bookingId.slice(0, 8)}.png`;
        link.click();
        toast.success('票券下載成功！');
    };

    const handleShare = async () => {
        const image = await generateImage();
        if (!image) return;

        try {
            // Convert DataURL to Blob
            const res = await fetch(image);
            const blob = await res.blob();
            const file = new File([blob], "Soka_Ticket.png", { type: "image/png" });

            if (navigator.share) {
                await navigator.share({
                    title: '2026 創價・教育 EXPO 報名成功！',
                    text: `我是 ${userDetails.name}，我已經報名參加 2026 創價教育展！快來一起參加！`,
                    files: [file]
                });
            } else {
                toast.error('您的裝置不支援原生分享，請使用下載功能。');
            }
        } catch (error) {
            console.error('Share failed:', error);
            // Fallback for systems that allow text sharing but not files (rare but handling it)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: '2026 創價・教育 EXPO',
                        text: `我已經報名參加 2026 創價教育展！\n活動網站: ${window.location.origin}/soka/`,
                        url: `${window.location.origin}/soka/`
                    });
                } catch (e) {
                    // Share cancelled or failed
                }
            } else {
                toast.error('分享失敗，請嘗試截圖分享。');
            }
        }
    };

    const handleSecretClick = () => {
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        if (newCount === 5) {
            const pwd = prompt("Admin Reset: Please enter password");
            if (pwd === 'soka2026' || pwd === 'admin') {
                localStorage.removeItem('soka_ticket_2026');
                toast.success('Device lock cleared! Reloading...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Invalid password');
                setSecretCount(0);
            }
        }
    };

    return (
        <div style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                id="digital-ticket"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="ticket-container"
                style={{
                    maxWidth: '400px', // Slightly narrower for better phone fit
                    width: '100%',
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '30px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Header Line */}
                <div style={{ height: '8px', background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', position: 'absolute', top: 0, left: 0, right: 0 }} />

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: '15px 0 5px', color: '#1e293b', fontWeight: 800 }}>2026 創價・教育 EXPO</h2>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>Digital Ticket</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '25px 0' }}>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <QRCodeSVG
                            value={bookingId}
                            size={180}
                            level="H"
                            includeMargin={true}
                            fgColor="#334155"
                        />
                    </div>
                </div>

                <div
                    style={{ textAlign: 'center', marginBottom: '30px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={handleSecretClick}
                >
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Booking ID</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold', color: '#334155', letterSpacing: '1px' }}>
                        {bookingId.slice(0, 8).toUpperCase()}
                    </div>
                </div>

                <div style={{ borderTop: '2px dashed #e2e8f0', margin: '30px -40px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-15px', top: '-12px', width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: '-15px', top: '-12px', width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%' }} />
                </div>

                <div className="ticket-details">
                    <h3 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>👤</span> 參加者資訊
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>姓名</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{userDetails.name}</span>
                    </div>


                    <h3 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📅</span> 預約場次
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {mySlots.map(slot => (
                            <div key={slot?.id} style={{ padding: '12px 16px', background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', borderRadius: '12px', fontSize: '0.9rem', borderLeft: '4px solid #818cf8' }}>
                                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>{slot?.title}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem' }}>
                                    <span>📍 {slot?.location}</span>
                                    <span>⏰ {slot?.startTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '25px', marginBottom: '5px' }}>
                    憑此票卷入場，請妥善保存 🎟️
                </p>
            </motion.div>

            {/* Actions Area */}
            <div style={{ marginTop: '25px', display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownload}
                            className="btn-primary"
                            style={{
                                flex: 2,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                                border: 'none',
                                borderRadius: '16px',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '14px'
                            }}
                        >
                            <span>💾</span> 儲存票券
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleShare}
                            className="btn-primary"
                            style={{
                                flex: 2,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                                border: 'none',
                                borderRadius: '16px',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '14px'
                            }}
                        >
                            <span>📤</span> 分享
                        </motion.button>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '16px', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                        暫時關閉
                    </motion.button>
                </div>
            </div>

            {/* Mobile Save Image Modal */}
            <AnimatePresence>
                {generatedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setGeneratedImage(null)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.85)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', padding: '15px', borderRadius: '16px', textAlign: 'center', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <h3 style={{ margin: '0 0 10px', color: '#334155' }}>長按圖片儲存 👇</h3>
                            <img src={generatedImage} alt="Ticket" style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <button
                                onClick={() => setGeneratedImage(null)}
                                style={{ marginTop: '15px', padding: '10px 30px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#475569', width: '100%' }}
                            >
                                關閉 (Close)
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
