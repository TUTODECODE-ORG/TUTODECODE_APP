/**
 * 🎯 GHOST PROTOCOL - Page Laboratoire
 * 
 * Centre de commande pour toutes les fonctionnalités avancées :
 * - Terminal Interactif (WebContainer)
 * - Audit de Sécurité
 * - Vault Chiffré
 * 
 * @author Winancher - Ghost Protocol Team
 */

import { useState } from 'react';
import { ArrowLeft, Terminal, Shield, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveTerminal } from '@/components/InteractiveTerminal';
import { SecurityAuditor } from '@/components/SecurityAuditor';
import { VaultManager } from '@/components/VaultManager';
import { WebContainerDemo } from '@/components/WebContainerDemo';

interface LabPageProps {
    onBack: () => void;
}

export function LabPage({ onBack }: LabPageProps) {
    const [activeTab, setActiveTab] = useState('terminal');

    return (
        <div className="min-h-screen bg-[#0B1221] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-4 text-slate-400 hover:text-cyan-400"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                Laboratoire Neural
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Outils avancés pour les développeurs • 100% Local • Zéro Serveur
                            </p>
                        </div>
                    </div>

                    {/* Stats Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-slate-900/50 border-cyan-500/30">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Terminal className="w-8 h-8 text-cyan-400" />
                                <div>
                                    <div className="text-sm text-slate-400">Terminal</div>
                                    <div className="text-lg font-bold text-cyan-400">Node.js WASM</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-orange-500/30">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-orange-400" />
                                <div>
                                    <div className="text-sm text-slate-400">Audit</div>
                                    <div className="text-lg font-bold text-orange-400">SecOps Local</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-green-500/30">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Lock className="w-8 h-8 text-green-400" />
                                <div>
                                    <div className="text-sm text-slate-400">Vault</div>
                                    <div className="text-lg font-bold text-green-400">AES-256-GCM</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-700">
                        <TabsTrigger
                            value="terminal"
                            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                        >
                            <Terminal className="w-4 h-4 mr-2" />
                            Terminal
                        </TabsTrigger>
                        <TabsTrigger
                            value="audit"
                            className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Audit
                        </TabsTrigger>
                        <TabsTrigger
                            value="vault"
                            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Vault
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="terminal" className="mt-6">
                        <div className="space-y-6">
                            <WebContainerDemo />
                            <InteractiveTerminal />
                        </div>
                    </TabsContent>

                    <TabsContent value="audit" className="mt-6">
                        <SecurityAuditor />
                    </TabsContent>

                    <TabsContent value="vault" className="mt-6">
                        <div className="max-w-2xl mx-auto">
                            <VaultManager />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer Info */}
                <Card className="mt-8 bg-slate-900/30 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-slate-200 text-sm">À propos du Laboratoire</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-400 space-y-2">
                        <p>
                            <strong className="text-cyan-400">Terminal Interactif :</strong> Exécutez du vrai code Node.js directement dans votre navigateur grâce à WebContainer.
                            Aucun serveur requis, tout s'exécute localement.
                        </p>
                        <p>
                            <strong className="text-orange-400">Audit de Sécurité :</strong> Analysez vos fichiers JavaScript, TypeScript et Python pour détecter
                            les vulnérabilités courantes (XSS, injection SQL, secrets hardcodés, etc.).
                        </p>
                        <p>
                            <strong className="text-green-400">Vault Chiffré :</strong> Stockez vos données sensibles avec un chiffrement AES-256-GCM.
                            Votre passphrase ne quitte jamais votre navigateur.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
