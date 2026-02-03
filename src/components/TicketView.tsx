import { QRCodeSVG } from 'qrcode.react';
import { useSlots } from '../hooks/useSlots';
import { motion } from 'framer-motion';
import type { UserDetails } from '../services/bookingService';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface TicketViewProps {
    bookingId: string;
    userDetails: UserDetails;
    selectedSlotIds: string[];
    onClose?: () => void;
}

export const TicketView = ({ bookingId, userDetails, selectedSlotIds, onClose }: TicketViewProps) => {
    const { slots } = useSlots();
    const [secretCount, setSecretCount] = useState(0);

    // Map IDs to full slot objects
    const mySlots = selectedSlotIds.map(id => slots.find(s => s.id === id)).filter(Boolean);

    const handleDownload = async () => {
        const ticketElement = document.getElementById('digital-ticket');
        if (!ticketElement) return;

        try {
            const canvas = await html2canvas(ticketElement, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Soka_Ticket_${bookingId.slice(0, 8)}.png`;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            alert('圖片下載失敗，請嘗試截圖保存。');
        }
    };

    const handleSecretClick = () => {
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        if (newCount === 5) {
            const pwd = prompt("Admin Reset: Please enter password");
            if (pwd === 'soka2026' || pwd === 'admin') {
                localStorage.removeItem('soka_ticket_2026');
                alert('Device lock cleared! Reloading...');
                window.location.reload();
            } else {
                alert('Invalid password');
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

            {/* Actions Area - Separate from the capture area */}
            <div style={{ marginTop: '25px', display: 'flex', gap: '15px', width: '100%', maxWidth: '400px' }}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    style={{ flex: 1, padding: '14px', border: '2px solid #e2e8f0', borderRadius: '16px', background: 'white', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}
                >
                    返回
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="btn-primary"
                    style={{
                        flex: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                        border: 'none',
                        borderRadius: '16px',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span>📥</span> 下載圖片 (Save)
                </motion.button>
            </div>
        </div>
    );
};
