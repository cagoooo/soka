import Skeleton from 'react-loading-skeleton';
import { motion } from 'framer-motion';

export const SessionCardSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="slot-card"
            style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Title */}
            <div style={{ marginBottom: '8px' }}>
                <Skeleton height={24} width="80%" />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '12px' }}>
                <Skeleton width="40%" height={16} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 'auto' }}>
                <Skeleton count={2} />
            </div>

            {/* Footer */}
            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                    <Skeleton width={80} height={20} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <Skeleton width={60} height={20} style={{ borderRadius: '12px' }} />
                        <Skeleton width={80} height={24} />
                    </div>
                </div>
                {/* Progress Bar */}
                <Skeleton height={8} borderRadius={4} />
            </div>
        </motion.div>
    );
};
