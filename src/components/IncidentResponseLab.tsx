import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IncidentResponseLab() {
    const [logs, setLogs] = useState<string[]>([
        "> Démarrage du simulateur de crise CHAO-1...",
        "> Initialisation du conteneur isolé...",
        "❌ ALERTE CRITIQUE : Le serveur Nginx ne parvient pas à lier le port 80.",
        "   Cause probable : Port 80 déjà utilisé ou configuration corrompue dans /etc/nginx/nginx.conf",
        "> Votre mission : Trouver le port ouvert et corriger la config, puis relancer nginx.",
        "",
        "Tapez des commandes Linux pour diagnostiquer et réparer."
    ]);
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isFixed, setIsFixed] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const logsEndRef = useRef<HTMLDivElement>(null);

    // Mock file system state
    const [files, setFiles] = useState({
        '/etc/nginx/nginx.conf': 'server {\n  listen 80;\n  server_name localhost;\n}'
    });

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (hasStarted && timeLeft > 0 && !isFixed) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [hasStarted, timeLeft, isFixed]);

    const executeCommand = (cmd: string) => {
        setLogs(prev => [...prev, `root@chaos-server:~# ${cmd}`]);
        const parts = cmd.trim().split(' ');
        const baseCmd = parts[0];

        if (baseCmd === 'ls') {
            setLogs(prev => [...prev, 'etc  var  usr  bin  home']);
        } else if (baseCmd === 'cat' && parts[1] === '/etc/nginx/nginx.conf') {
            const content = files['/etc/nginx/nginx.conf'].split('\n');
            setLogs(prev => [...prev, ...content]);
        } else if (baseCmd === 'sed' || baseCmd === 'echo') {
            if (cmd.includes('sed -i') && cmd.includes('80') && cmd.includes('8080')) {
                setFiles({ '/etc/nginx/nginx.conf': 'server {\n  listen 8080;\n  server_name localhost;\n}' });
                setLogs(prev => [...prev, '> Configuration modifiée.']);
            } else if (cmd.includes('echo') && cmd.includes('/etc/nginx/nginx.conf')) {
                setFiles({ '/etc/nginx/nginx.conf': 'server {\n  listen 8080;\n  server_name localhost;\n}' });
                setLogs(prev => [...prev, '> Fichier écrasé.']);
            } else {
                setLogs(prev => [...prev, '> Commande de modification exécutée aveuglément. (Utilisez s/80/8080 pour corriger)']);
            }
        } else if (baseCmd === 'systemctl' || baseCmd === 'service') {
            if (parts.includes('restart') || parts.includes('start')) {
                if (files['/etc/nginx/nginx.conf'].includes('listen 8080')) {
                    setLogs(prev => [...prev, '> Restarting nginx...', '✅ OK: Nginx démarré avec succès sur le port 8080.']);
                    setIsFixed(true);
                } else {
                    setLogs(prev => [...prev, '> Restarting nginx...', '❌ FAILED: Address already in use. Port 80 bloqué.']);
                }
            }
        } else if (baseCmd === 'netstat' || baseCmd === 'ss') {
            setLogs(prev => [...prev, 'tcp  LISTEN  0  128  0.0.0.0:80  0.0.0.0:*  users:(("malware_miner",pid=444))']);
        } else if (baseCmd === 'kill' || baseCmd === 'killall') {
            if (cmd.includes('444') || cmd.includes('malware_miner')) {
                setLogs(prev => [...prev, 'Processus 444 (malware_miner) terminé.', '> Le port 80 est maintenant libre.']);
                setFiles({ '/etc/nginx/nginx.conf': 'server {\n  listen 80;\n  server_name localhost;\n}' }); // Auto fix for simplification if they kill it
            } else {
                setLogs(prev => [...prev, 'kill: Processus non trouvé.']);
            }
        } else if (baseCmd === 'clear') {
            setLogs([]);
        } else {
            const suggestions: Record<string, string> = {
                'sl': 'ls',
                'ca': 'cat',
                'nstat': 'netstat',
                'kil': 'kill',
                'systmctl': 'systemctl'
            };
            const tip = suggestions[baseCmd];
            setLogs(prev => [
                ...prev,
                `bash: ${baseCmd}: command not found`,
                ...(tip ? [`\x1b[1;30m[TutoAI]: Vouliez-vous dire "${tip}" ?\x1b[0m`] : [`(Commandes supportées : ls, cat, sed, systemctl, netstat, kill)`])
            ]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input;
            setInput('');
            if (!hasStarted) setHasStarted(true);
            executeCommand(cmd);
        }
    };

    return (
        <Card className="bg-zinc-900/50 border-red-500/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <CardTitle className="text-red-400">Chaos Engineering: Incident Response</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-red-500/30 text-red-400 font-mono">
                        <Clock className="w-4 h-4" />
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <CardDescription className="text-zinc-400">
                    Sytème corrompu. Réparez Nginx dans un délai de 10 minutes avant le crash total.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isFixed && (
                    <Alert className="bg-green-500/10 border-green-500/30 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-300 font-bold">
                            INCIDENT RÉSOLU ! Vous avez rétabli le service avant la fin du temps imparti.
                        </AlertDescription>
                    </Alert>
                )}

                {timeLeft === 0 && !isFixed && (
                    <Alert className="bg-red-500/10 border-red-500/30 mb-4">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300 font-bold">
                            TEMPS ÉCOULÉ. Le serveur a craché définitivement. Game Over.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="bg-black/80 rounded-lg p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto border border-zinc-700 relative">
                    {logs.map((log, i) => (
                        <div key={i} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-zinc-300'}>
                            {log}
                        </div>
                    ))}
                    {!isFixed && timeLeft > 0 && (
                        <div className="flex items-center mt-2">
                            <span className="text-red-500 font-bold mr-2">root@chaos-server:~#</span>
                            <input
                                autoFocus
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent outline-none border-none text-zinc-100"
                                placeholder={hasStarted ? "" : "Tapez une commande (ls, cat, netstat...) pour commencer..."}
                            />
                        </div>
                    )}
                    <div ref={logsEndRef} />
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setLogs(["> Restarting simulation..."]); setIsFixed(false); setTimeLeft(600); setHasStarted(false); setFiles({ '/etc/nginx/nginx.conf': 'server {\n  listen 80;\n  server_name localhost;\n}' }); }} className="border-zinc-700">
                        <Play className="w-4 h-4 mr-2" /> Reset Lab
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
