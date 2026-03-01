import { useState } from 'react';
import { Play, Terminal, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WebContainer } from '@webcontainer/api';

const DEMO_EXAMPLES = [
    {
        id: 'hello-node',
        title: 'Hello World Node.js',
        description: 'Serveur HTTP basique avec Node.js',
        code: `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Ghost Framework WebContainer!\\n');
});

server.listen(3000);
console.log('✓ Serveur démarré sur le port 3000');
console.log('✓ WebContainer fonctionne !');`
    },
    {
        id: 'express-server',
        title: 'Serveur Express',
        description: 'API REST avec Express.js',
        code: `// Note: Express doit être installé avec npm install express
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Ghost Framework', 
    status: 'running',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    webcontainer: 'active',
    nodejs: process.version 
  });
});

app.listen(3000, () => {
  console.log('✓ Express server running on port 3000');
});`
    },
    {
        id: 'file-system',
        title: 'Système de fichiers',
        description: 'Manipulation de fichiers dans WebContainer',
        code: `const fs = require('fs');

// Créer un fichier
fs.writeFileSync('test.txt', 'Ghost Framework - Ghost Protocol\\n');
console.log('✓ Fichier créé');

// Lire le fichier
const content = fs.readFileSync('test.txt', 'utf-8');
console.log('✓ Contenu du fichier:', content);

// Lister les fichiers
const files = fs.readdirSync('.');
console.log('✓ Fichiers dans le répertoire:', files);

// Créer un dossier
fs.mkdirSync('data');
console.log('✓ Dossier créé');

console.log('\\n✓ Système de fichiers fonctionnel !');`
    }
];

export function WebContainerDemo() {
    const [selectedExample, setSelectedExample] = useState(DEMO_EXAMPLES[0]);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const [error, setError] = useState<string>('');

    const runExample = async () => {
        setIsRunning(true);
        setOutput(['🔄 Démarrage du WebContainer...']);
        setError('');

        try {
            // Boot WebContainer
            const container = await WebContainer.boot();

            setOutput(prev => [...prev, '✓ WebContainer initialisé']);
            setOutput(prev => [...prev, '✓ Environnement Node.js chargé']);
            setOutput(prev => [...prev, '🔄 Exécution du code...', '']);

            // Write code to file
            await container.fs.writeFile('/demo.js', selectedExample.code);

            // Execute
            const process = await container.spawn('node', ['/demo.js']);

            // Capture output
            process.output.pipeTo(new WritableStream({
                write(data) {
                    setOutput(prev => [...prev, data]);
                }
            }));

            const exitCode = await process.exit;

            if (exitCode === 0) {
                setOutput(prev => [...prev, '', '✓ Exécution terminée avec succès']);
            } else {
                setOutput(prev => [...prev, '', `❌ Code de sortie: ${exitCode}`]);
            }

        } catch (err: any) {
            setError(err.message || 'Erreur inconnue');
            setOutput(prev => [...prev, '', `❌ Erreur: ${err.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Card className="bg-slate-900/50 border-blue-500/30">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Terminal className="w-6 h-6 text-blue-500" />
                    <CardTitle className="text-blue-400">WebContainer - Démo Live</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                    Preuve de concept : Node.js qui tourne réellement dans le navigateur (pas de serveur)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Example Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        Choisir un exemple :
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {DEMO_EXAMPLES.map((example) => (
                            <button
                                key={example.id}
                                onClick={() => setSelectedExample(example)}
                                className={`p-3 rounded-lg border text-left transition-all ${selectedExample.id === example.id
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500/50'
                                    }`}
                            >
                                <div className="font-semibold text-sm">{example.title}</div>
                                <div className="text-xs opacity-75 mt-1">{example.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Display */}
                <div className="bg-black/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-2 font-mono">demo.js</div>
                    <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                        {selectedExample.code}
                    </pre>
                </div>

                {/* Run Button */}
                <Button
                    onClick={runExample}
                    disabled={isRunning}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isRunning ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Exécution en cours...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Exécuter dans WebContainer
                        </>
                    )}
                </Button>

                {/* Output Terminal */}
                {output.length > 0 && (
                    <div className="bg-black/90 rounded-lg p-4 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-3 text-green-400">
                            <Terminal className="w-4 h-4" />
                            <span className="text-sm font-mono font-semibold">Terminal Output</span>
                        </div>
                        <div className="space-y-1">
                            {output.map((line, index) => (
                                <div key={index} className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert className="bg-red-500/10 border-red-500/30">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300">
                            Erreur WebContainer : {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info Alert */}
                <Alert className="bg-blue-500/10 border-blue-500/30">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-slate-300">
                        <strong>Mode Avion ✈️ :</strong> Cette démo fonctionne 100% en local.
                        Désactivez votre connexion Internet et relancez - ça marchera quand même.
                    </AlertDescription>
                </Alert>

            </CardContent>
        </Card>
    );
}
