import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
    "正在準備報名系統...",
    "正在串連場次資訊...",
    "正在載入視覺效果...",
    "同步雲端資料庫...",
    "即將完成，請稍候..."
];

export const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        // Progress simulation: fast start, slows down as it reaches 90%
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev + 0.1 > 99 ? 99 : prev + 0.1;
                const increment = (100 - prev) / 20;
                return prev + increment;
            });
        }, 200);

        // Message rotation
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearInterval(messageInterval);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <div className="loading-bg-orb" style={{
                position: 'absolute',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -1,
                animation: 'floating 10s ease-in-out infinite'
            }} />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card"
                style={{
                    width: 'min(90%, 400px)',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                }}
            >
                <div style={{ marginBottom: '25px' }}>
                    <img src="./SDGs.png" alt="Soka" style={{ width: '60px', height: '60px', marginBottom: '15px' }} />
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800
                    }}>
                        Soka Education EXPO
                    </h2>
                </div>

                {/* Dynamic Message */}
                <div style={{ height: '24px', marginBottom: '20px' }}>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={messageIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}
                        >
                            {messages[messageIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Progress Bar Container */}
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#f1f5f9',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                }}>
                    <motion.div
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #db2777)',
                            width: `${progress}%`
                        }}
                        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    />
                </div>

                <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(progress)}%
                </div>
            </motion.div>

            <style>{`
        @keyframes floating {
          0% { transform: translate(-10%, -10%) scale(1); }
          50% { transform: translate(10%, 10%) scale(1.1); }
          100% { transform: translate(-10%, -10%) scale(1); }
        }
      `}</style>
        </motion.div>
    );
};
