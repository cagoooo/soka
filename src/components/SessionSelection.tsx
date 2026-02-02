import { useState } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { useSlots } from '../hooks/useSlots';
import type { SessionType } from '../types';
import { SeedButton as InjectSeedButton } from './SeedButton';
import { ConflictModal } from './ConflictModal';
import { motion, AnimatePresence } from 'framer-motion';

export const SessionSelection = () => {
    const { slots, loading } = useSlots();
    const { selection, selectSession, isAdmin } = useBooking();

    const [pendingSelection, setPendingSelection] = useState<{ id: string, type: SessionType } | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);

    // Smart UX: Check for group conflicts
    const handleSlotClick = (id: string, type: SessionType) => {
        const hasAorB = !!selection.selectedA || !!selection.selectedB;
        const hasC = !!selection.selectedC;
        const hasD = !!selection.selectedD;

        let conflict = false;

        // Rule: If A or B is selected
        if (hasAorB) {
            // ...and user clicks C or D -> Conflict
            if (type === 'C' || type === 'D') conflict = true;
        }
        // Rule: If C is selected
        else if (hasC) {
            // ...and user clicks A, B, or D -> Conflict
            if (['A', 'B', 'D'].includes(type)) conflict = true;
        }
        // Rule: If D is selected
        else if (hasD) {
            // ...and user clicks A, B, or C -> Conflict
            if (['A', 'B', 'C'].includes(type)) conflict = true;
        }

        if (conflict) {
            setPendingSelection({ id, type });
            setShowConflictModal(true);

            // UX Improvement: Auto scroll removed to prevent jumping
            // window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            selectSession(id, type);
        }
    };

    const confirmSwitch = () => {
        if (pendingSelection) {
            selectSession(pendingSelection.id, pendingSelection.type);
            setPendingSelection(null);
            setShowConflictModal(false);
        }
    };

    if (loading) return <div className="loading-spinner">載入場次資料中... (若很久未顯示請重整)</div>;

    // 1. Definition must be restored here
    const validSlots = slots.filter(s => !!s.title);

    if (validSlots.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-state"
                style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>目前無場次資料</p>
                <p>No active sessions found.</p>

                {/* Only show Seed Button if Admin */}
                {isAdmin ? ( // Accessing isAdmin from context via selection object? No, likely context destructuring needed update if I didn't verify useBooking return type properly
                    // Checking useBooking... I updated the type but need to destructure it here
                    // Let's check below... I only destructured { selection, selectSession }
                    // I need to update destructuring first.
                    <div style={{ marginTop: '20px' }}>
                        <p style={{ color: '#ef4444', marginBottom: '10px' }}>🔧 管理員權限已啟用</p>
                        <InjectSeedButton />
                    </div>
                ) : (
                    <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.7 }}>
                        請聯繫管理員進行系統初始化設定。<br />
                        Please contact the administrator to initialize the system.
                    </p>
                )}
            </motion.div>
        );
    }

    const renderSection = (title: string, filterType: SessionType[], note?: string) => {
        const filteredSlots = validSlots.filter(s => filterType.includes(s.type));

        return (
            <div className="section-container">
                <h3>{title} <span style={{ fontSize: '0.8em', fontWeight: 'normal', marginLeft: '10px', opacity: 0.7 }}>{note}</span></h3>
                <div className="slot-grid">
                    <AnimatePresence>
                        {filteredSlots.map(slot => {
                            const isSelected =
                                selection.selectedA === slot.id ||
                                selection.selectedB === slot.id ||
                                selection.selectedC === slot.id ||
                                selection.selectedD === slot.id;

                            // Logic for dimming/disabling
                            let isDimmed = false;

                            // If C is selected, dim A, B, D
                            if (selection.selectedC && selection.selectedC !== slot.id) {
                                if (['A', 'B', 'D'].includes(slot.type)) isDimmed = true;
                                if (slot.type === 'C') isDimmed = true; // Other C's
                            }
                            // If D is selected, dim A, B, C
                            if (selection.selectedD && selection.selectedD !== slot.id) {
                                if (['A', 'B', 'C'].includes(slot.type)) isDimmed = true;
                                if (slot.type === 'D') isDimmed = true; // Other D's
                            }
                            // If A or B is selected
                            if ((selection.selectedA || selection.selectedB)) {
                                if (slot.type === 'C' || slot.type === 'D') isDimmed = true;
                            }

                            const isFull = slot.booked >= slot.capacity;

                            return (
                                <motion.div
                                    key={slot.id}
                                    layoutId={slot.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{
                                        opacity: isDimmed ? 0.4 : 1,
                                        scale: isSelected ? 1.02 : 1,
                                        filter: isFull ? 'grayscale(100%)' : 'none'
                                    }}
                                    whileHover={(!isFull && !isDimmed) ? { y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } : {}}
                                    onClick={() => !isFull && handleSlotClick(slot.id, slot.type)}
                                    className={`slot-card type-${slot.type} ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''}`}
                                >
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="check-mark"
                                        >
                                            ✓
                                        </motion.div>
                                    )}

                                    <span className="slot-name">{slot.title}</span>
                                    <div className="slot-location">📍 {slot.location}</div>
                                    <p className="slot-description">
                                        {slot.description}
                                    </p>

                                    <div className="slot-footer">
                                        <span className="slot-time">⏱ {slot.startTime}</span>
                                        <span className={`slot-capacity ${slot.capacity - slot.booked < 10 ? 'low' : ''}`}>
                                            剩餘: {slot.capacity - slot.booked}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="selection-container"
        >
            <div className="combo-row">
                {renderSection('方案主要活動 (A)', ['A'], '需搭配方案 B')}
                {renderSection('方案搭配講座 (B)', ['B'], '需搭配方案 A')}
            </div>
            <div className="sc-divider">OR</div>
            {renderSection('專题工作坊 (C)', ['C'], '單獨 40 分鐘完整體驗')}
            <div className="sc-divider">OR</div>
            {renderSection('特別活動 (D)', ['D'], '單獨 40 分鐘完整體驗')}

            <ConflictModal
                isOpen={showConflictModal}
                onConfirm={confirmSwitch}
                onCancel={() => setShowConflictModal(false)}
            />
        </motion.div>
    );
};
