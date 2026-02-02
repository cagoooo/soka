import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BookingState, SessionType } from '../types';

interface BookingContextType {
    selection: BookingState;
    selectSession: (id: string, type: SessionType) => void;
    isValid: boolean;
    isAdmin: boolean;
    login: (password: string) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
    const [selection, setSelection] = useState<BookingState>({
        selectedA: null,
        selectedB: null,
        selectedC: null,
        selectedD: null,
    });

    // Simple Admin State
    const [isAdmin, setIsAdmin] = useState(false);

    const login = (password: string) => {
        // In visual-heavy / simple prototypes, strict auth might be overkill.
        // Using a simple hardcoded key as requested for "admin login function".
        // In production, this should be validated against a server function or Firebase Auth Claims.
        if (password === 'soka2026' || password === 'admin') {
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const selectSession = (id: string, type: SessionType) => {
        setSelection(prev => {
            const newState = { ...prev };

            if (type === 'C') {
                // If C chosen, clear others
                return { selectedA: null, selectedB: null, selectedC: id, selectedD: null };
            }
            if (type === 'D') {
                // If D chosen, clear others
                return { selectedA: null, selectedB: null, selectedC: null, selectedD: id };
            }

            // If A or B chosen, clear C and D
            if (type === 'A' || type === 'B') {
                newState.selectedC = null;
                newState.selectedD = null;
                if (type === 'A') newState.selectedA = id;
                if (type === 'B') newState.selectedB = id;
                return newState;
            }

            return newState;
        });
    };

    // Logic: Valid if (C) OR (D) OR (A AND B)
    const isValid =
        (!!selection.selectedC) ||
        (!!selection.selectedD) ||
        (!!selection.selectedA && !!selection.selectedB);

    return (
        <BookingContext.Provider value={{ selection, selectSession, isValid, isAdmin, login }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) throw new Error('useBooking must be used within BookingProvider');
    return context;
};
