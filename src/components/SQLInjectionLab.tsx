import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
    id: number;
    username: string;
    password: string;
    role: string;
}

const FAKE_DATABASE: User[] = [
    { id: 1, username: 'admin', password: 'sup3rS3cur3!', role: 'administrator' },
    { id: 2, username: 'user', password: 'password123', role: 'user' },
    { id: 3, username: 'guest', password: 'guest', role: 'guest' },
];

export function SQLInjectionLab() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState<{ success: boolean; message: string; data?: any; vulnerability?: string } | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);

    const executeQuery = () => {
        setAttemptCount(prev => prev + 1);

        // Simulate vulnerable SQL query (THIS IS INTENTIONALLY VULNERABLE FOR EDUCATION)
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

        console.log('🔍 Requête SQL exécutée:', query);

        // Check for SQL injection attempts
        const hasInjection = username.includes("'") || password.includes("'") ||
            username.toLowerCase().includes(' or ') ||
            password.toLowerCase().includes(' or ');

        if (hasInjection) {
            // Injection detected - simulate successful bypass
            const bypassedUser = FAKE_DATABASE.find(u => u.role === 'administrator');

            setResult({
                success: true,
                message: '🎯 INJECTION RÉUSSIE ! Vous avez contourné l\'authentification.',
                data: bypassedUser,
                vulnerability: 'SQL Injection - Bypass d\'authentification via " OR \'1\'=\'1 "'
            });
            return;
        }

        // Normal authentication
        const user = FAKE_DATABASE.find(u => u.username === username && u.password === password);

        if (user) {
            setResult({
                success: true,
                message: '✅ Authentification réussie (méthode classique)',
                data: user
            });
        } else {
            setResult({
                success: false,
                message: '❌ Identifiants invalides. Essayez une injection SQL...'
            });
        }
    };

    const reset = () => {
        setUsername('');
        setPassword('');
        setResult(null);
        setShowHint(false);
    };

    const hints = [
        "L'objectif est de vous connecter en tant qu'admin SANS connaître le mot de passe",
        "Les requêtes SQL utilisent des guillemets simples (') pour délimiter les chaînes",
        "Essayez d'injecter du code SQL dans le champ username",
        "Pensez à la clause ' OR '1'='1' qui est toujours vraie",
        "Solution complète: admin' OR '1'='1"
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900/50 border-orange-500/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                        <CardTitle className="text-orange-400">Honeypot SQL Injection Lab</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                        Environnement VOLONTAIREMENT VULNÉRABLE pour apprendre les injections SQL.
                        <strong className="text-orange-400"> NE JAMAIS utiliser ce code en production.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Mission Brief */}
                    <Alert className="bg-orange-500/10 border-orange-500/30">
                        <Shield className="h-4 w-4 text-orange-400" />
                        <AlertDescription className="text-slate-300">
                            <strong>Mission :</strong> Exploitez la vulnérable SQL pour vous connecter en tant qu'admin sans connaître le mot de passe.
                        </AlertDescription>
                    </Alert>

                    {/* Login Form */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Nom d'utilisateur
                            </label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Mot de passe
                            </label>
                            <Input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="password"
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={executeQuery}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                <Terminal className="w-4 h-4 mr-2" />
                                Tenter la connexion
                            </Button>
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="border-slate-700 text-slate-300"
                            >
                                Réinitialiser
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowHint(!showHint)}
                                className="text-slate-400"
                            >
                                {showHint ? '🔒 Masquer' : '💡 Indices'}
                            </Button>
                        </div>
                    </div>

                    {/* Hints */}
                    {showHint && (
                        <Alert className="bg-blue-500/10 border-blue-500/30">
                            <AlertDescription className="text-slate-300 space-y-2">
                                <p className="font-semibold text-blue-400">Indices progressifs :</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    {hints.slice(0, Math.min(attemptCount + 1, hints.length)).map((hint, i) => (
                                        <li key={i}>{hint}</li>
                                    ))}
                                </ol>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Results */}
                    {result && (
                        <Alert className={result.success ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}>
                            {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                            <AlertDescription className="space-y-2">
                                <p className={result.success ? "text-green-300 font-semibold" : "text-red-300"}>
                                    {result.message}
                                </p>

                                {result.data && (
                                    <div className="bg-black/30 p-3 rounded-md font-mono text-xs text-green-400">
                                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                                    </div>
                                )}

                                {result.vulnerability && (
                                    <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                                        <p className="text-sm font-semibold text-orange-400">🎯 Vulnérabilité exploitée :</p>
                                        <p className="text-sm text-slate-300">{result.vulnerability}</p>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Educational Note */}
                    <div className="pt-4 border-t border-slate-800">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">📚 Comment se protéger ?</h4>
                        <ul className="text-sm text-slate-400 space-y-1">
                            <li>✅ Utiliser des requêtes préparées (Prepared Statements)</li>
                            <li>✅ Valider et assainir toutes les entrées utilisateur</li>
                            <li>✅ Utiliser un ORM (Sequelize, Prisma, TypeORM)</li>
                            <li>✅ Appliquer le principe du moindre privilège sur la base de données</li>
                            <li>✅ Logger et monitorer les tentatives d'injection</li>
                        </ul>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
