// ============================================
// TutoDeCode - Ollama AI Bridge Setup
// Permet à l'utilisateur de configurer son IA locale
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Cpu,
  Zap,
  Settings,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Models populaires Ollama
const OLLAMA_MODELS = [
  { id: 'llama3.2', name: 'Llama 3.2', size: '2GB', desc: 'Modèle généraliste rapide', recommended: true },
  { id: 'codellama', name: 'Code Llama', size: '4GB', desc: 'Spécialisé programmation', recommended: true },
  { id: 'mistral', name: 'Mistral 7B', size: '4GB', desc: 'Excellent rapport qualité/taille' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', size: '3GB', desc: 'Expert en code' },
  { id: 'phi3', name: 'Phi-3 Mini', size: '2GB', desc: 'Léger et performant' },
  { id: 'gemma2', name: 'Gemma 2', size: '5GB', desc: 'Par Google, polyvalent' },
  { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', size: '4GB', desc: 'Nouveau modèle code' },
  { id: 'starcoder2', name: 'StarCoder 2', size: '3GB', desc: 'Open source, code' },
];

interface OllamaSetupProps {
  onModelReady?: (model: string) => void;
  onCreateCourse?: () => void;
}

export default function OllamaSetup({ onModelReady, onCreateCourse }: OllamaSetupProps) {
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'installed' | 'not-installed' | 'running'>('checking');
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Vérifier si Ollama est installé et en cours d'exécution
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    setOllamaStatus('checking');
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const data = await response.json();
        setOllamaStatus('running');
        setInstalledModels(data.models?.map((m: any) => m.name) || []);
        if (data.models?.length > 0) {
          setSelectedModel(data.models[0].name);
        }
      } else {
        setOllamaStatus('installed');
      }
    } catch (error) {
      setOllamaStatus('not-installed');
    }
  };

  const connectToOllama = async () => {
    if (!selectedModel) return;
    
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // Test de connexion avec le modèle sélectionné
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: 'Dis "Connexion établie!" en une phrase.',
          stream: false
        }),
        signal: AbortSignal.timeout(30000)
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        onModelReady?.(selectedModel);
      } else {
        throw new Error('Connexion échouée');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    } finally {
      setIsConnecting(false);
    }
  };

  const openOllamaDownload = () => {
    window.open('https://ollama.com/download', '_blank');
  };

  const copyInstallCommand = (modelId: string) => {
    navigator.clipboard.writeText(`ollama pull ${modelId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--td-bg-primary)] to-[var(--td-surface)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--td-text-primary)]">
            Configuration IA Locale
          </h1>
          <p className="text-lg text-[var(--td-text-secondary)] max-w-2xl mx-auto">
            Connectez votre IA locale Ollama à TutoDeCode pour créer des cours personnalisés et obtenir de l'aide en temps réel.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-[var(--td-surface)] rounded-2xl border border-[var(--td-border)] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--td-text-primary)] flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              État d'Ollama
            </h2>
            <Button variant="outline" size="sm" onClick={checkOllamaStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Vérifier
            </Button>
          </div>

          {/* Status Display */}
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-4",
            ollamaStatus === 'running' && "bg-emerald-500/10 border border-emerald-500/30",
            ollamaStatus === 'installed' && "bg-yellow-500/10 border border-yellow-500/30",
            ollamaStatus === 'not-installed' && "bg-red-500/10 border border-red-500/30",
            ollamaStatus === 'checking' && "bg-blue-500/10 border border-blue-500/30"
          )}>
            {ollamaStatus === 'checking' && (
              <>
                <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                <div>
                  <p className="font-medium text-blue-400">Vérification en cours...</p>
                  <p className="text-sm text-[var(--td-text-secondary)]">Recherche d'Ollama sur localhost:11434</p>
                </div>
              </>
            )}
            {ollamaStatus === 'running' && (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-400">Ollama est actif !</p>
                  <p className="text-sm text-[var(--td-text-secondary)]">
                    {installedModels.length} modèle(s) installé(s)
                  </p>
                </div>
              </>
            )}
            {ollamaStatus === 'installed' && (
              <>
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-400">Ollama installé mais pas lancé</p>
                  <p className="text-sm text-[var(--td-text-secondary)]">
                    Lancez Ollama pour continuer
                  </p>
                </div>
              </>
            )}
            {ollamaStatus === 'not-installed' && (
              <>
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="font-medium text-red-400">Ollama non détecté</p>
                  <p className="text-sm text-[var(--td-text-secondary)]">
                    Installez Ollama pour utiliser l'IA locale
                  </p>
                </div>
                <Button onClick={openOllamaDownload} className="ml-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger Ollama
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Models Section */}
        {ollamaStatus === 'running' && (
          <div className="bg-[var(--td-surface)] rounded-2xl border border-[var(--td-border)] p-6 space-y-6">
            <h2 className="text-xl font-semibold text-[var(--td-text-primary)] flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Choisissez votre modèle IA
            </h2>

            {/* Installed Models */}
            {installedModels.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--td-text-secondary)]">Modèles installés</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {installedModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        selectedModel === model
                          ? "border-[var(--td-primary)] bg-[var(--td-primary-muted)]"
                          : "border-[var(--td-border)] hover:border-[var(--td-primary)]/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[var(--td-text-primary)]">{model}</span>
                        {selectedModel === model && (
                          <CheckCircle2 className="w-5 h-5 text-[var(--td-primary)]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Models to Install */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--td-text-secondary)]">
                Modèles recommandés à installer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OLLAMA_MODELS.filter(m => !installedModels.some(im => im.includes(m.id))).map((model) => (
                  <div
                    key={model.id}
                    className="p-4 rounded-xl border border-[var(--td-border)] bg-[var(--td-surface-elevated)]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-[var(--td-text-primary)]">{model.name}</span>
                        {model.recommended && (
                          <Badge className="ml-2 bg-[var(--td-primary)]/20 text-[var(--td-primary)]">
                            Recommandé
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-[var(--td-text-tertiary)]">{model.size}</span>
                    </div>
                    <p className="text-sm text-[var(--td-text-secondary)] mb-3">{model.desc}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInstallCommand(model.id)}
                      className="w-full"
                    >
                      <code className="text-xs">ollama pull {model.id}</code>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect Button */}
            {selectedModel && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--td-border)]">
                <Button
                  onClick={connectToOllama}
                  disabled={isConnecting || connectionStatus === 'connected'}
                  className="flex-1 h-12"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : connectionStatus === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Connecté à {selectedModel}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Connecter {selectedModel}
                    </>
                  )}
                </Button>

                {connectionStatus === 'connected' && (
                  <Button
                    onClick={onCreateCourse}
                    variant="outline"
                    className="flex-1 h-12 border-[var(--td-primary)] text-[var(--td-primary)]"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Créer un cours personnalisé
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-[var(--td-surface)] rounded-2xl border border-[var(--td-border)] p-6">
          <h2 className="text-xl font-semibold text-[var(--td-text-primary)] mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Guide d'installation
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--td-primary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium text-[var(--td-text-primary)]">Téléchargez Ollama</h3>
                <p className="text-sm text-[var(--td-text-secondary)]">
                  Rendez-vous sur <a href="https://ollama.com" target="_blank" className="text-[var(--td-primary)] underline">ollama.com</a> et installez le logiciel pour votre système.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--td-primary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium text-[var(--td-text-primary)]">Installez un modèle</h3>
                <p className="text-sm text-[var(--td-text-secondary)]">
                  Ouvrez un terminal et tapez : <code className="bg-[var(--td-surface-elevated)] px-2 py-1 rounded">ollama pull llama3.2</code>
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--td-primary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium text-[var(--td-text-primary)]">Connectez-vous</h3>
                <p className="text-sm text-[var(--td-text-secondary)]">
                  Revenez ici, sélectionnez votre modèle et cliquez sur "Connecter" pour activer le pont IA.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
