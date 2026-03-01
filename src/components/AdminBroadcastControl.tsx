import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Send, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminBroadcastControl() {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('Annonce Admin');
    const [type, setType] = useState<'info' | 'success' | 'emergency'>('info');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Veuillez saisir un message.");
            return;
        }

        setIsSending(true);
        try {
            await pb.collection('announcements').create({
                title: title,
                message: message,
                type: type,
                sender: pb.authStore.model?.username || 'Admin',
            });

            toast.success("Annonce diffusée en temps réel ! 🚀");
            setMessage('');
        } catch (err) {
            console.error(err);
            toast.error("Échec de la diffusion. Vérifiez la collection 'announcements'.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="bg-zinc-900/80 border-indigo-/30 shadow-2xl shadow-indigo-/10 overflow-hidden">
            <CardHeader className="bg-indigo-/10 border-b border-indigo-/20">
                <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Megaphone className="w-5 h-5" />
                    Console de Diffusion Enterprise
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Titre de l'annonce</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition-all"
                            placeholder="Ex: Mise à jour système..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Type d'urgence</label>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={type === 'info' ? 'default' : 'outline'}
                                onClick={() => setType('info')}
                                className="flex-1 gap-2"
                            >
                                <Info className="w-4 h-4" /> Info
                            </Button>
                            <Button
                                size="sm"
                                variant={type === 'success' ? 'secondary' : 'outline'}
                                onClick={() => setType('success')}
                                className="flex-1 gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Succès
                            </Button>
                            <Button
                                size="sm"
                                variant={type === 'emergency' ? 'destructive' : 'outline'}
                                onClick={() => setType('emergency')}
                                className="flex-1 gap-2 text-red-400"
                            >
                                <AlertTriangle className="w-4 h-4" /> Urgent
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Message à diffuser</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all resize-none"
                        placeholder="Tapez le message que tous les clients recevront instantanément..."
                    />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] border-indigo-/30 text-indigo-400 uppercase tracking-tighter">
                            Socket Realtime ACTIVE
                        </Badge>
                        <span className="text-[10px] text-zinc-500">Destination: Tous les ports reliés</span>
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={isSending}
                        className="bg-indigo-500 hover:bg-indigo-500 text-white font-bold px-8 h-12 shadow-lg shadow-indigo-/20 gap-2"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Diffuser l'Annonce
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
