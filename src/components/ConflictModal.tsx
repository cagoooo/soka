import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
}

export const ConflictModal = ({ isOpen, onConfirm, onCancel, title = "更換方案提醒", message = "切換至此方案將會清除目前已選的場次。確定要繼續嗎？" }: Props) => {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(31, 41, 55, 0.7)',
                        zIndex: 9999, // Super high z-index
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(12px)',
                        padding: '20px'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onCancel();
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '32px',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.5)',
                            background: 'rgba(255,255,255,0.85)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            // Ensure modal content itself doesn't overflow viewport height awkwardly
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '16px',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                            animation: 'bounce 1s infinite'
                        }}>
                            ⚠️
                        </div>
                        <h3 style={{
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            marginBottom: '12px',
                            background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            color: '#4b5563',
                            marginBottom: '32px',
                            lineHeight: '1.6',
                            fontSize: '1.1rem'
                        }}>
                            {message}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={onCancel}
                                className="btn-secondary"
                                style={{
                                    padding: '16px',
                                    fontSize: '1.1rem',
                                    background: '#f3f4f6',
                                    border: '1px solid #e5e7eb',
                                    color: '#374151'
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={onConfirm}
                                className="btn-primary"
                                style={{
                                    padding: '16px',
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                                }}
                            >
                                確定更換
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
