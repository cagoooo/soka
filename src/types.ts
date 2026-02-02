export type SessionType = 'A' | 'B' | 'C' | 'D';

export interface SessionSlot {
    id: string;
    type: SessionType;
    title: string;
    description: string;
    location: string;
    capacity: number;
    booked: number;
    startTime: string; // e.g., "10:00"
    endTime: string;   // e.g., "10:20"
}

export interface BookingState {
    selectedA: string | null; // ID of selected A
    selectedB: string | null; // ID of selected B
    selectedC: string | null; // ID of selected C
    selectedD: string | null; // ID of selected D
}
