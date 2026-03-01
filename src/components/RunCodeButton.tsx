import { useState } from 'react';
import { Play, Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebContainer } from '@webcontainer/api';

interface RunCodeButtonProps {
    code: string;
    language?: string;
    onRun?: (output: string) => void;
}

export function RunCodeButton({ code, language = 'javascript', onRun }: RunCodeButtonProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const executeCode = async () => {
        if (language !== 'javascript' && language !== 'js' && language !== 'typescript' && language !== 'ts') {
            setOutput('⚠️ Ce langage n\'est pas supporté pour l\'exécution. Seul JavaScript/TypeScript est supporté actuellement.');
            return;
        }

        setIsRunning(true);
        setOutput('🔄 Initialisation du WebContainer...\n');

        try {
            // Boot WebContainer
            const container = await WebContainer.boot();

            setOutput(prev => prev + '✓ WebContainer prêt\n');
            setOutput(prev => prev + '🔄 Exécution du code...\n\n');

            // Write code to temp file
            await container.fs.writeFile('/run.js', code);

            // Execute
            const process = await container.spawn('node', ['/run.js']);

            let fullOutput = '';

            // Capture output
            process.output.pipeTo(new WritableStream({
                write(data) {
                    fullOutput += data;
                    setOutput(prev => prev + data);
                }
            }));

            const exitCode = await process.exit;

            if (exitCode === 0) {
                const finalOutput = fullOutput || '✓ Exécution réussie (aucune sortie)';
                setOutput(prev => prev + '\n\n✓ Code exécuté avec succès');
                onRun?.(finalOutput);
            } else {
                setOutput(prev => prev + `\n\n❌ Erreur (code: ${exitCode})`);
            }

        } catch (error: any) {
            setOutput(prev => prev + `\n\n❌ Erreur: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={executeCode}
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isRunning ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                            Exécution...
                        </>
                    ) : (
                        <>
                            <Play className="w-3 h-3 mr-2" />
                            Exécuter ce code
                        </>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={copyCode}
                    className="border-slate-700"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 mr-2" />
                            Copié !
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3 mr-2" />
                            Copier
                        </>
                    )}
                </Button>
            </div>

            {output && (
                <div className="bg-black/90 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <Terminal className="w-4 h-4" />
                        <span className="text-sm font-mono font-semibold">Sortie du terminal</span>
                    </div>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                        {output}
                    </pre>
                </div>
            )}
        </div>
    );
}
