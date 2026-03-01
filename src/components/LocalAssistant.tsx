import { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';

export function LocalAssistant() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        // Pseudo-init (Real init would load transformers.js)
        setTimeout(() => setStatus('ready'), 2000);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate Local IA response
        setTimeout(() => {
            const assistantMsg = {
                role: 'assistant' as const,
                content: `[GHOST v3.0 AI] Je suis en cours de chargement local... Pour l'instant, je peux vous confirmer que ce cours sur ${input} est d'une importance capitale pour votre Roadmap Security.`
            };
            setMessages(prev => [...prev, assistantMsg]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold text-sm">Assistant Pédagogique (IA Locale)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">{status}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                        <Bot className="w-12 h-12" />
                        <p className="text-sm">Posez-moi une question sur vos cours.<br />Je tourne à 100% sur votre machine.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && <Bot className="w-8 h-8 p-1 bg-purple-500/20 rounded-lg text-purple-400 shrink-0" />}
                        <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {msg.content}
                        </div>
                        {msg.role === 'user' && <User className="w-8 h-8 p-1 bg-blue-500/20 rounded-lg text-blue-400 shrink-0" />}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Comment puis-je vous aider ?"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
