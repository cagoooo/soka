import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { SessionSlot } from '../types';

export const useSlots = () => {
    const [slots, setSlots] = useState<SessionSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'slots'), orderBy('id'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as SessionSlot);
            setSlots(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { slots, loading };
};
