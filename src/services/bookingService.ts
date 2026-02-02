import { runTransaction, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { BookingState } from '../types';

export interface UserDetails {
    name: string;
    email: string; // Optional if anon? User said "Registration Website". Usually Name/Phone/ID needed.
    phone: string;
    studentId?: string;
}

export const submitBooking = async (selection: BookingState, userDetails: UserDetails) => {
    if (!auth.currentUser) throw new Error("Must be logged in");

    const bookingRef = doc(collection(db, 'bookings'));

    await runTransaction(db, async (transaction) => {
        // 1. Identify slots to book
        const slotsToBook: string[] = [];
        if (selection.selectedC) slotsToBook.push(selection.selectedC);
        if (selection.selectedD) slotsToBook.push(selection.selectedD);
        if (selection.selectedA) slotsToBook.push(selection.selectedA);
        if (selection.selectedB) slotsToBook.push(selection.selectedB);

        if (slotsToBook.length === 0) throw new Error("No sessions selected");

        // 2. Read all slots fresh
        const slotDocs = await Promise.all(slotsToBook.map(id => transaction.get(doc(db, 'slots', id))));

        // 3. Check capacity
        slotDocs.forEach(slotDoc => {
            if (!slotDoc.exists()) throw new Error(`Slot ${slotDoc.id} not found`);
            const data = slotDoc.data();
            if (data.booked >= data.capacity) {
                throw new Error(`場次 ${data.name} 已額滿，請重新選擇。`);
            }
        });

        // 4. Updates
        // Increment booked count
        slotDocs.forEach(slotDoc => {
            const data = slotDoc.data();
            if (!data) throw new Error("Slot data missing");
            transaction.update(slotDoc.ref, {
                booked: data.booked + 1
            });
        });

        // Create booking record
        transaction.set(bookingRef, {
            userId: auth.currentUser!.uid,
            userName: userDetails.name,
            userPhone: userDetails.phone,
            slots: slotsToBook,
            selectionData: selection,
            timestamp: serverTimestamp(),
            status: 'confirmed'
        });
    });

    return bookingRef.id;
};

export interface BookingRecord {
    id: string; // Firestore Document ID
    bookingId: string; // Human-readable ID (e.g. SOKA-2026-XYZ)
    name: string;
    phone: string;
    studentId?: string; // Optional for compatibility with old records
    department?: string; // Optional for compatibility with old records
    slots: string[];
    timestamp: any;
    status: 'confirmed' | 'cancelled';
}
// We might want to include expanded slot details later, but for now IDs are stored


import { getDocs, query, orderBy } from 'firebase/firestore';

export const getAllBookings = async (): Promise<BookingRecord[]> => {
    // Assuming 'bookings' collection exists. 
    // If not, it will return empty, which is fine for initial state.
    const q = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            bookingId: data.bookingId || 'UNKNOWN',
            name: data.name || 'Unknown',
            phone: data.phone || '',
            studentId: data.studentId || '',
            department: data.department || '',
            slots: data.slots || [],
            timestamp: data.timestamp,
            status: (data.status as 'confirmed' | 'cancelled') || 'confirmed'
        } as BookingRecord;
    });
};
