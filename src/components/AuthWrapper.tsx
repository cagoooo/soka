import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) {
                signInAnonymously(auth).catch((error) => {
                    console.error("Auth Error:", error);
                });
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    if (!user) return <div className="error">Authenticating...</div>;

    return <>{children}</>;
};
