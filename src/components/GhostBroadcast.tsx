import { useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { toast } from 'sonner';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function GhostBroadcast() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Subscribe to messages/broadcasts
        // We'll use a collection named 'broadcasts' or 'announcements'
        const collectionName = 'announcements';

        const subscribe = async () => {
            try {
                await pb.collection(collectionName).subscribe('*', ({ action, record }) => {
                    if (action === 'create') {
                        const type = record.type || 'info';
                        const message = record.message || 'Nouveau message de l\'administrateur';
                        const title = record.title || 'Annonce Enterprise';

                        // Show notification based on type
                        switch (type) {
                            case 'emergency':
                                toast.error(`${title}: ${message}`, {
                                    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
                                    duration: 10000,
                                });
                                break;
                            case 'success':
                                toast.success(`${title}: ${message}`, {
                                    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                                });
                                break;
                            default:
                                toast.info(`${title}: ${message}`, {
                                    icon: <Bell className="w-5 h-5 text-indigo-400" />,
                                });
                        }
                    }
                });
            } catch (err) {
                console.warn("Realtime subscription failed. Check if 'announcements' collection exists.", err);
            }
        };

        subscribe();

        return () => {
            pb.collection(collectionName).unsubscribe('*').catch(() => { });
        };
    }, [user]);

    return null; // Invisible component that just handles side effects
}
