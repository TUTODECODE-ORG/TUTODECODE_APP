import { useState, useEffect, createContext, useContext, useRef, type ReactNode } from 'react';
import { pb } from '@/lib/pocketbase';
import type { AuthModel } from 'pocketbase';
import { toast } from 'sonner';

interface AuthContextType {
    user: AuthModel | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    isSyncing: boolean;
    lastSync: Date | null;
    isAdmin: boolean;
    syncProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
    isSyncing: false,
    lastSync: null,
    isAdmin: false,
    syncProgress: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthModel | null>(pb.authStore.model);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const isBusySyncing = useRef(false);

    const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

    useEffect(() => {
        let lastUserId = pb.authStore.model?.id;

        // Subscribe to auth state changes
        const unsubscribe = pb.authStore.onChange((_, model) => {
            const hasLoggedIn = model && !lastUserId;
            lastUserId = model?.id;
            setUser(model);

            if (hasLoggedIn && !isBusySyncing.current) {
                // Sync on initial login only
                syncProgress(true);
            }
        });

        // Check initial state
        setUser(pb.authStore.model);
        setIsLoading(false);

        return () => {
            unsubscribe();
        };
    }, []);

    const login = async () => {
        // Handle login in the AuthModal component
    };

    const logout = () => {
        pb.authStore.clear();
        setUser(null);
        toast.info("Déconnexion réussie. Mode hors ligne activé.");
    };

    const syncProgress = async (silent: boolean = false) => {
        if (!user || isBusySyncing.current) return;

        isBusySyncing.current = true;
        setIsSyncing(true);
        try {
            const localData = {
                favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
                completed: JSON.parse(localStorage.getItem('completed') || '[]'),
                progress: JSON.parse(localStorage.getItem('progress') || '{}'),
                gamification: JSON.parse(localStorage.getItem('tuto_gamification') || '{}')
            };

            await pb.collection('users').update(user.id, {
                data: localData
            });

            setLastSync(new Date());
            if (!silent) {
                toast.success("Progression synchronisée dans le cloud ! ☁️");
            }
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            isBusySyncing.current = false;
            setIsSyncing(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isSyncing,
            lastSync,
            isAdmin,
            syncProgress
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
