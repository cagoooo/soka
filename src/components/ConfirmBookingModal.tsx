import { motion, AnimatePresence } from 'framer-motion';
import { useSlots } from '../hooks/useSlots';

interface ConfirmBookingModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    selectedIds: string[];
}

export const ConfirmBookingModal = ({ isOpen, onConfirm, onCancel, selectedIds }: ConfirmBookingModalProps) => {
    const { slots } = useSlots();

    const selectedSlots = selectedIds
        .map(id => slots.find(s => s.id === id))
        .filter(Boolean);

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '400px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            textAlign: 'left'
                        }}
                    >
                        <h2 style={{ margin: '0 0 15px', color: '#1e293b', fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                            最後確認 🛡️
                        </h2>

                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>
                            請確認您選擇的場次：
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', maxHeight: '40vh', overflowY: 'auto' }}>
                            {selectedSlots.map(slot => (
                                <div key={slot?.id} style={{
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderLeft: '4px solid #6366f1'
                                }}>
                                    <div style={{ fontWeight: 700, color: '#334155' }}>{slot?.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>📍 {slot?.location}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '12px', marginBottom: '25px', fontSize: '0.9rem', color: '#be123c', border: '1px solid #fda4af' }}>
                            ⚠️ <b>重要提醒</b>：<br />
                            報名成功後，本裝置將會綁定票券，<b>無法再次報名或修改</b>。請務必確認！
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '12px',
                                    background: 'white',
                                    color: '#64748b',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                再想想
                            </button>
                            <button
                                onClick={onConfirm}
                                style={{
                                    flex: 1.5,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                確定送出 ✅
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
