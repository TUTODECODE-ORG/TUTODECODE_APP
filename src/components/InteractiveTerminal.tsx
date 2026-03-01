import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, Download, AlertCircle, Upload, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WebContainer } from '@webcontainer/api';
import { useGamification } from '@/hooks/useGamification';

import type { Course } from '@/types';

interface InteractiveTerminalProps {
    courses?: Course[];
    onCourseSelect?: (course: Course) => void;
}

export function InteractiveTerminal(_props: InteractiveTerminalProps) {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
    const [isBooting, setIsBooting] = useState(true);
    const [error, setError] = useState<string>('');
    const terminalRef = useRef<HTMLDivElement>(null);
    const [output, setOutput] = useState<string[]>([
        '> INITIALISATION DU TERMINAL NEURAL...',
        '> CHARGEMENT DE L\'ENVIRONNEMENT NODE.JS...',
    ]);
    const { consumeRam } = useGamification();
    const [chaosTimer, setChaosTimer] = useState<number | null>(null);

    useEffect(() => {
        bootWebContainer();
    }, []);

    const bootWebContainer = async () => {
        try {
            const container = await WebContainer.boot();
            setWebcontainer(container);
            setIsBooting(false);
            addOutput('✓ Terminal prêt. Environnement Node.js chargé.');
            addOutput('> Tapez votre code JavaScript ou utilisez les exemples ci-dessous.');
        } catch (err: any) {
            setError('Impossible de démarrer WebContainer. Votre navigateur ne supporte peut-être pas cette fonctionnalité.');
            setIsBooting(false);
            console.error(err);
        }
    };

    const addOutput = (text: string) => {
        setOutput(prev => [...prev, text]);
        // Auto-scroll
        setTimeout(() => {
            if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
        }, 10);
    };

    const runCode = async (code: string) => {
        if (!webcontainer) {
            addOutput('❌ Terminal non initialisé');
            return;
        }

        addOutput(`\n> Exécution du code...\n`);

        try {
            // Créer un fichier temporaire avec le code
            await webcontainer.fs.writeFile('/temp.js', code);

            // Exécuter le code
            const process = await webcontainer.spawn('node', ['/temp.js']);

            // Capturer la sortie
            process.output.pipeTo(new WritableStream({
                write(data) {
                    addOutput(data);
                }
            }));

            const exitCode = await process.exit;

            if (exitCode !== 0) {
                addOutput(`\n❌ Erreur d'exécution (code: ${exitCode})`);
                consumeRam(512);
                addOutput(`> ⚠️ -512 MB VRAM Allouée en raison de l'erreur`);
            } else {
                addOutput(`\n✓ Exécution terminée avec succès`);
                if (chaosTimer !== null) {
                    addOutput(`\n> [RÉSOLUTION] Faille du Chaos corrigée. Menace éliminée.`);
                    setChaosTimer(null);
                }
            }
        } catch (err: any) {
            addOutput(`\n❌ Erreur: ${err.message}`);
            consumeRam(512);
            addOutput(`> ⚠️ -512 MB VRAM Allouée suite au crash natif`);
        }
    };

    const triggerChaosEvent = () => {
        addOutput(`\n> ⚠️ [ALERTE SÉCURITÉ - CHAOS ENGINEERING] ⚠️ \n> L'entité GhostAI a introduit une dégradation de performance dans le flux I/O.\n> Mission : Écrivez un script Node.js fonctionnel (ex: 'console.log("Fix");') pour rétablir la situation en moins de 60s.\n> Pénalité d'échec : OOM (-4096 MB VRAM).`);
        setChaosTimer(60);

        let timeLeft = 60;
        const interval = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                clearInterval(interval);
                setChaosTimer((prev) => {
                    if (prev !== null) {
                        addOutput(`\n> ☠️ [ÉCHEC CRITIQUE] Temps écoulé. Crash système.`);
                        consumeRam(4096);
                        return null;
                    }
                    return prev;
                });
            }
        }, 1000);
    };

    const clearTerminal = () => {
        setOutput(['> Terminal effacé']);
    };

    const downloadOutput = () => {
        const text = output.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'terminal-output.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const examples = [
        {
            name: 'Hello World',
            code: `console.log('Hello from Ghost Framework Neural Terminal!');`
        },
        {
            name: 'Calcul Fibonacci',
            code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci(10):', fibonacci(10));`
        },
        {
            name: 'Fetch API (Simulation)',
            code: `const data = { user: 'Ghost', level: 'Elite' };
console.log('Données:', JSON.stringify(data, null, 2));`
        },
        {
            name: 'Manipulation de Tableaux',
            code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = doubled.reduce((a, b) => a + b, 0);

console.log('Tableau original:', numbers);
console.log('Tableau doublé:', doubled);
console.log('Somme:', sum);`
        }
    ];

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        Erreur de Terminal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert className="bg-red-500/10 border-red-500/30">
                        <AlertDescription className="text-red-300">
                            {error}
                        </AlertDescription>
                    </Alert>
                    <p className="text-slate-400 mt-4 text-sm">
                        WebContainer nécessite un navigateur moderne (Chrome, Edge, ou Brave recommandés).
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="bg-slate-900/50 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TerminalIcon className="w-6 h-6 text-cyan-400" />
                            <CardTitle className="text-cyan-400">Terminal Interactif Neural</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={clearTerminal}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Effacer
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={triggerChaosEvent}
                                className="border-red-700 bg-red-900/20 text-red-400 hover:bg-red-800 hover:text-white"
                                disabled={chaosTimer !== null}
                            >
                                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                                Simuler Faille IA
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={downloadOutput}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                    try {
                                        // @ts-ignore - File System Access API
                                        const dirHandle = await window.showDirectoryPicker();
                                        addOutput(`> Montage du dossier local: ${dirHandle.name}...`);

                                        // Recursive function to read files
                                        async function processHandle(handle: any, path: string = '') {
                                            for await (const entry of handle.values()) {
                                                const entryPath = `${path}/${entry.name}`;
                                                if (entry.kind === 'file') {
                                                    const file = await entry.getFile();
                                                    const content = await file.text();
                                                    if (webcontainer) {
                                                        await webcontainer.fs.writeFile(entryPath, content);
                                                        addOutput(`  + ${entryPath}`);
                                                    }
                                                } else if (entry.kind === 'directory') {
                                                    if (webcontainer) {
                                                        await webcontainer.fs.mkdir(entryPath);
                                                    }
                                                    await processHandle(entry, entryPath);
                                                }
                                            }
                                        }

                                        await processHandle(dirHandle);
                                        addOutput(`✓ Dossier "${dirHandle.name}" monté avec succès dans le conteneur.`);
                                        addOutput(`> Vous pouvez maintenant utiliser 'ls' pour voir vos fichiers.`);
                                    } catch (err: any) {
                                        if (err.name !== 'AbortError') {
                                            addOutput(`❌ Erreur de montage: ${err.message}`);
                                            console.error(err);
                                        }
                                    }
                                }}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-green-400"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Mount Local
                            </Button>
                        </div>
                    </div>
                    <CardDescription className="text-slate-400">
                        Environnement Node.js complet • Exécution 100% locale • Zéro serveur
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isBooting ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
                            <p className="text-slate-400">Initialisation du terminal...</p>
                        </div>
                    ) : (
                        <>
                            {/* Terminal Output */}
                            <div
                                ref={terminalRef}
                                className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto border border-slate-700 mb-4 relative"
                            >
                                {output.map((line, index) => (
                                    <div key={index} className="whitespace-pre-wrap">
                                        {line}
                                    </div>
                                ))}

                                {/* AI Analysis Trigger */}
                                {output.length > 0 && output.some(l => l.includes('Error') || l.includes('Exception') || l.includes('Failed')) && (
                                    <div className="sticky bottom-0 right-0 p-2 flex justify-end mt-4 z-10">
                                        <Button
                                            size="sm"
                                            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg shadow-purple-900/20 animate-in fade-in slide-in-from-bottom-2"
                                            onClick={() => {
                                                const errors = output.filter(l => l.includes('Error') || l.includes('Exception') || l.includes('Failed'));
                                                const lastError = errors[errors.length - 1] || "Erreur inconnue";

                                                addOutput(`\n> [NEURAL CORE] 🧠 Analyse contextuelle de l'erreur...`);

                                                setTimeout(() => {
                                                    let analysis = "L'erreur semble être liée à une syntaxe invalide ou une commande inconnue.";
                                                    let confidence = "87%";

                                                    if (lastError.includes('ReferenceError')) {
                                                        analysis = "Variable non déclarée détectée. Vous essayez d'accéder à une référence qui n'existe pas dans la portée actuelle.";
                                                        confidence = "99%";
                                                    }
                                                    if (lastError.includes('SyntaxError')) {
                                                        analysis = "Structure du code invalide. Il manque probablement un caractère de fermeture (}, ], )) ou un point-virgule.";
                                                        confidence = "95%";
                                                    }
                                                    if (lastError.includes('TypeError')) {
                                                        analysis = "Incompatibilité de type. Vous tentez une opération sur une valeur qui ne la supporte pas (ex: .map() sur undefined).";
                                                        confidence = "92%";
                                                    }
                                                    if (lastError.includes('spawn')) {
                                                        analysis = "Échec du lancement de processus. La commande demandée n'est pas disponible dans l'environnement WebContainer ou le binaire est manquant.";
                                                        confidence = "94%";
                                                    }

                                                    addOutput(`> [NEURAL CORE] Diagnostic (Confiance: ${confidence}) : ${analysis}`);
                                                    addOutput(`> [SUGGESTION] Vérifiez la ligne contenant "${lastError.substring(0, 30)}..."`);

                                                    // Singularity Feature: Auto-generated exercise
                                                    setTimeout(() => {
                                                        addOutput(`\n> [SINGULARITY] 🎓 Exercice de renforcement disponible :`);
                                                        if (lastError.includes('ReferenceError')) {
                                                            addOutput(`> "Essayez de déclarer 'const ${lastError.split(' ')[0] || 'maVariable'} = 10;' avant de l'utiliser."`);
                                                        } else if (lastError.includes('SyntaxError')) {
                                                            addOutput(`> "Exercice : Corrigez ce code -> function test() { return 'ok'" (Indice: manque '}')"`);
                                                        } else {
                                                            addOutput(`> "Défi : Réécrivez votre code en ajoutant un bloc 'try { ... } catch (e) { console.error(e) }' pour capturer cette erreur proprement."`);
                                                        }
                                                    }, 1000);
                                                }, 1200);
                                            }}
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Analyser avec Neural Core
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Examples */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-300 mb-2">Exemples de Code :</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {examples.map((example, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => runCode(example.code)}
                                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                                        >
                                            <Play className="w-3 h-3 mr-2" />
                                            {example.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Alert className="mt-4 bg-cyan-500/10 border-cyan-500/30">
                                <TerminalIcon className="h-4 w-4 text-cyan-400" />
                                <AlertDescription className="text-slate-300">
                                    <strong>Astuce :</strong> Ce terminal exécute du vrai JavaScript Node.js dans votre navigateur.
                                    Aucune donnée n'est envoyée à un serveur.
                                </AlertDescription>
                            </Alert>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
