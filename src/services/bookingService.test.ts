import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBooking } from './bookingService';
import { auth } from '../firebase';

// Mock Firebase Imports
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(() => ({ id: 'mock-doc-id' })),
    runTransaction: vi.fn(),
    serverTimestamp: vi.fn(),
}));

// Mock Local Firebase Instance
vi.mock('../firebase', () => ({
    db: {},
    auth: {
        currentUser: null
    }
}));

describe('bookingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset auth state
        (auth as any).currentUser = null;
    });

    it('should throw error if user is not logged in', async () => {
        const selection = { selectedA: '2F_A', selectedB: '2F_B', selectedC: null, selectedD: null };
        const userDetails = { name: 'Test User' };

        await expect(submitBooking(selection, userDetails))
            .rejects
            .toThrow("Must be logged in");
    });

    it('should proceed if user is logged in (Mock Transaction)', async () => {
        // Set logged in user
        (auth as any).currentUser = { uid: 'test-user-123' };

        const { runTransaction } = await import('firebase/firestore');

        // Mock transaction implementation to just return success
        // In a real integration test, we would simulate the transaction steps
        (runTransaction as any).mockResolvedValue(null);

        const selection = { selectedA: '2F_A', selectedB: null, selectedC: null, selectedD: null };
        const userDetails = { name: 'Test User' };

        // We expect it NOT to throw "Must be logged in"
        // It might throw "Unexpected booking failure" if transaction returns void, 
        // because the service expects it to complete. 
        // But for this unit test we just want to ensure it passed the Auth check.

        try {
            await submitBooking(selection, userDetails);
        } catch (e: any) {
            // Our mock returns null/void, so the function might hit the 
            // "Unexpected booking failure" if it loops or returns undefined.
            // But we specifically want to verify it CALLED runTransaction
        }

        expect(runTransaction).toHaveBeenCalled();
    });
});
