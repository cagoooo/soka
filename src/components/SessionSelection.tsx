import { useState, useEffect, useRef } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { useSlots } from '../hooks/useSlots';
import type { SessionType } from '../types';
import { SeedButton as InjectSeedButton } from './SeedButton';
import { ConflictModal } from './ConflictModal';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionCardSkeleton } from './skeletons/SessionCardSkeleton';
import toast from 'react-hot-toast';

// Define props interface
interface SessionSelectionProps {
    disabled?: boolean;
    bookedSlotIds?: string[];
}

export const SessionSelection = ({ disabled = false, bookedSlotIds }: SessionSelectionProps) => {
    const { slots, loading } = useSlots();
    const { selection, selectSession, isAdmin } = useBooking();

    const [pendingSelection, setPendingSelection] = useState<{ id: string, type: SessionType } | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);

    // Smart Suggestion Logic (Debounced to strictly once per unique pair)
    const lastToastKey = useRef<string | null>(null);

    useEffect(() => {
        const { selectedA, selectedB } = selection;
        // Only trigger if both A and B are selected
        if (!selectedA || !selectedB) return;

        // Create a unique key for this combination
        const currentKey = `${selectedA}-${selectedB}`;

        // If we showed a toast for this EXACT combination already, don't spam
        if (lastToastKey.current === currentKey) return;

        const floorA = selectedA.split('_')[0];
        const floorB = selectedB.split('_')[0];

        // Scenario 1: Same Floor Diversity (2F or 5F)
        // If user picks 2F_A + 2F_B, implies they are staying on same floor for identical content
        if (floorA === floorB && (floorA === '2F' || floorA === '5F')) {
            toast('💡 貼心提醒：同樓層課程內容相同\n建議選擇不同樓層，體驗更多元喔！', {
                icon: '💁',
                duration: 6000,
                style: {
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    fontSize: '0.95rem',
                    textAlign: 'left'
                }
            });
            lastToastKey.current = currentKey;
        }
        // Scenario 2: 3F Exploration (Large Venue)
        // If user picks 3F + 3F, remind them there are many booths
        else if (floorA === '3F' && floorB === '3F') {
            toast('💡 貼心提醒：3F 展場很大共有 8 種攤位\n歡迎多逛逛同樓層的其他攤位！', {
                icon: '🗺️',
                duration: 6000,
                style: {
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    fontSize: '0.95rem',
                    textAlign: 'left'
                }
            });
            lastToastKey.current = currentKey;
        }

    }, [selection.selectedA, selection.selectedB]);

    // Smart UX: Check for group conflicts
    const handleSlotClick = (id: string, type: SessionType) => {
        if (disabled) return; // Prevent interaction if disabled

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

    if (loading) {
        const renderSkeletonSection = (title: string, count: number) => (
            <div className="section-container">
                <h3>{title}</h3>
                <div className="slot-grid">
                    {Array.from({ length: count }).map((_, i) => (
                        <SessionCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );

        return (
            <div className="selection-container">
                <div className="combo-row">
                    {renderSkeletonSection('方案主要活動 (A)', 2)}
                    {renderSkeletonSection('方案搭配講座 (B)', 1)}
                </div>
                <div className="sc-divider">OR</div>
                <div className="combo-row">
                    {renderSkeletonSection('專题工作坊 (C)', 2)}
                    {renderSkeletonSection('特別活動 (D)', 1)}
                </div>
            </div>
        );
    }

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
                {isAdmin ? (
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
                            const isSelected = bookedSlotIds
                                ? bookedSlotIds.includes(slot.id)
                                : (
                                    selection.selectedA === slot.id ||
                                    selection.selectedB === slot.id ||
                                    selection.selectedC === slot.id ||
                                    selection.selectedD === slot.id
                                );

                            // Logic for dimming/disabling
                            let isDimmed = false;

                            // If not booked view, apply dimming logic
                            if (!bookedSlotIds) {
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
                            }

                            const isFull = slot.booked >= slot.capacity;

                            // UI Logic for Availability
                            const remaining = slot.capacity - slot.booked;
                            const percent = (slot.booked / slot.capacity) * 100;

                            let statusColor = '#10b981'; // Green
                            let statusText = '尚有名額';
                            let statusIcon = '🟢';

                            if (remaining === 0) {
                                statusColor = '#64748b';
                                statusText = '已額滿';
                                statusIcon = '❌';
                            } else if (remaining <= 20) {
                                statusColor = '#ef4444'; // Red
                                statusText = '最後搶購';
                                statusIcon = '🔥';
                            } else if (percent >= 70) {
                                statusColor = '#f59e0b'; // Orange
                                statusText = '即將額滿';
                                statusIcon = '⚡';
                            }

                            return (
                                <motion.div
                                    key={slot.id}
                                    layoutId={slot.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{
                                        opacity: disabled && !isSelected ? 0.4 : 1, // Only dim if disabled AND NOT selected
                                        scale: isSelected ? 1.02 : 1,
                                        filter: isFull && !isSelected ? 'grayscale(100%)' : (disabled && !isSelected ? 'grayscale(100%)' : 'none'), // Only grayscale if full OR (disabled AND NOT selected)
                                    }}
                                    whileHover={(!isFull && !isDimmed && !disabled) ? { y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } : {}}
                                    whileTap={(!isFull && !isDimmed && !disabled) ? { scale: 0.98 } : {}}
                                    onClick={() => !isFull && !disabled && handleSlotClick(slot.id, slot.type)}
                                    className={`slot-card type-${slot.type} ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''}`}
                                    style={disabled ? {
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                        // If selected, keep the card looking "rich" but static
                                        // If NOT selected, flatten it
                                        border: isSelected ? undefined : '1px solid transparent',
                                        background: isSelected ? undefined : '#f1f5f9',
                                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none', // Add distinct static shadow for booked item
                                        transform: isSelected ? 'scale(1.02)' : 'none' // Ensure scale persists statically? (animate handles this but style helps)
                                    } : {}}
                                >
                                    {isSelected && ( // Consolidated checkmark
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="check-mark"
                                            style={{ background: disabled ? '#10b981' : undefined }} // Ensure strong green in booked state
                                        >
                                            ✓
                                        </motion.div>
                                    )}

                                    {/* Sold Out Overlay */}
                                    {isFull && (
                                        <div className="sold-out-overlay-text">
                                            SOLD OUT
                                        </div>
                                    )}

                                    <span className="slot-name">{slot.title}</span>
                                    <div className="slot-location">📍 {slot.location}</div>
                                    <p className="slot-description">
                                        {slot.description}
                                    </p>

                                    <div className="slot-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="slot-time">⏱ {slot.startTime}</span>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        color: statusColor,
                                                        background: `${statusColor}15`,
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {statusIcon} {statusText}
                                                    </span>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#334155' }}>
                                                        剩餘 <span style={{ color: statusColor, fontSize: '1.4rem' }}>{remaining}</span> 席
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                style={{
                                                    height: '100%',
                                                    background: statusColor,
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
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
            <div className="combo-row">
                {renderSection('專题工作坊 (C)', ['C'], '單獨 40 分鐘完整體驗')}
                {renderSection('特別活動 (D)', ['D'], '單獨 40 分鐘完整體驗')}
            </div>

            <ConflictModal
                isOpen={showConflictModal}
                onConfirm={confirmSwitch}
                onCancel={() => setShowConflictModal(false)}
            />
        </motion.div>
    );
};
