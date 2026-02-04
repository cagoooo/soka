import { useState } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminLoginModal = ({ isOpen, onClose }: Props) => {
    const [password, setPassword] = useState('');
    const { login } = useBooking();
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            onClose();
            setPassword('');
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', zIndex: 3000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="glass-card"
                        style={{
                            maxWidth: '350px',
                            width: '90%',
                            padding: '30px',
                            border: '1px solid rgba(255,255,255,0.4)',
                            background: 'rgba(255,255,255,0.85)'
                        }}
                    >
                        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>🔐 管理員登入</h3>
                        <form onSubmit={handleSubmit}>
                            {/* Hidden username field for accessibility/password managers */}
                            <input
                                type="text"
                                name="username"
                                autoComplete="username"
                                style={{ display: 'none' }}
                                readOnly
                                value="admin"
                            />
                            <input
                                type="password"
                                autoComplete="current-password"
                                autoFocus
                                placeholder="請輸入管理密碼..."
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    marginBottom: '15px',
                                    border: error ? '2px solid #ef4444' : undefined,
                                    background: 'white'
                                }}
                            />
                            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>密碼錯誤</p>}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '1rem' }}>登入</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
