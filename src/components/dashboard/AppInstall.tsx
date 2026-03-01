// ============================================
// TutoDeCode - App Installation Section
// Guide d'installation de l'application Tauri
// ============================================

import React from 'react';
import { 
  Download, 
  Shield, 
  CheckCircle2,
  ExternalLink,
  WifiOff,
  Sparkles,
  FolderOpen,
  Bot,
  RefreshCw,
  Code2,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppInstallProps {
  onContinueWeb?: () => void;
  allowContinueWeb?: boolean;
}

export default function AppInstall({ onContinueWeb, allowContinueWeb = true }: AppInstallProps) {
  const features = [
    {
      icon: WifiOff,
      title: "100% Hors-ligne",
      desc: "Apprenez sans connexion internet"
    },
    {
      icon: RefreshCw,
      title: "Mises à jour de contenus",
      desc: "Cours/interface synchronisés depuis l'API sans réinstallation"
    },
    {
      icon: Shield,
      title: "Sécurisé & Privé",
      desc: "Vos données restent locales"
    },
    {
      icon: FolderOpen,
      title: "Lab local par dossier",
      desc: "Tickets, missions et fichiers générés dans votre dossier de travail"
    }
  ];

  const downloadMSI = () => {
    const token = Date.now();
    const msiUrl = `/downloads/TutoDeCode-Setup.msi?v=${token}`;
    const fallbackUrl = `/downloads/Install-TutoDeCode-App-Windows.bat?v=${token}`;

    fetch(msiUrl, { method: 'HEAD', cache: 'no-store' })
      .then((response) => {
        if (response.ok) {
          window.location.href = msiUrl;
          return;
        }
        window.location.href = fallbackUrl;
      })
      .catch(() => {
        window.location.href = fallbackUrl;
      });
  };

  const openGitHub = () => {
    window.open('https://github.com/TUTODECODE-ORG/TUTODECODE_APP', '_blank');
  };

  const openDemo = () => {
    window.open('/app?demo=1', '_blank');
  };

  return (
    <section className="py-16 px-4 sm:px-8 bg-gradient-to-b from-[var(--td-surface)] to-[var(--td-bg-primary)]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
            Application Desktop Gratuite
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--td-text-primary)] via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
            Devenez développeur avec TutoDeCode
          </h2>
          <p className="text-lg text-[var(--td-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Apprenez à coder avec des <span className="text-[var(--td-primary)] font-medium">cours structurés</span>, des <span className="text-[var(--td-primary)] font-medium">QCM intégrés</span>, et une <span className="text-[var(--td-primary)] font-medium">IA mentor locale</span> (Ollama) pour vous aider sans envoyer vos données sur le cloud.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-[var(--td-text-tertiary)]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" />100% Gratuit</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Sans compte requis</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Fonctionne hors-ligne</span>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <p className="text-xs uppercase tracking-wide text-emerald-400 font-medium">Open Source</p>
            </div>
            <p className="text-sm text-[var(--td-text-primary)] font-medium">100% du code est public</p>
            <p className="text-xs text-[var(--td-text-secondary)] mt-1">Vérifiez vous-même sur GitHub. Aucun code caché.</p>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-600/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <p className="text-xs uppercase tracking-wide text-blue-400 font-medium">Tauri Framework</p>
            </div>
            <p className="text-sm text-[var(--td-text-primary)] font-medium">Technologie moderne et sécurisée</p>
            <p className="text-xs text-[var(--td-text-secondary)] mt-1">Même techno que 1Password, Codeium, et autres apps pros.</p>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-purple-600/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <p className="text-xs uppercase tracking-wide text-purple-400 font-medium">Vie Privée</p>
            </div>
            <p className="text-sm text-[var(--td-text-primary)] font-medium">Zéro données personnelles</p>
            <p className="text-xs text-[var(--td-text-secondary)] mt-1">Pas de compte, pas de trackers, tout reste local.</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--td-surface)] rounded-3xl border border-[var(--td-border)] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Left: Features */}
            <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-[var(--td-border)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <img src="/logo.png" alt="TDC" className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--td-text-primary)]">TutoDeCode</h3>
                  <p className="text-sm text-[var(--td-text-secondary)]">Version Desktop Tauri</p>
                </div>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[var(--td-surface-elevated)] transition-colors duration-200 group">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-200">
                      <feature.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--td-text-primary)]">{feature.title}</h4>
                      <p className="text-sm text-[var(--td-text-secondary)] leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Download */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="space-y-6">
                
                {/* Windows Download */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-600/15 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0078D4] to-[#00BCF2] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                        </svg>
                      </div>
                      <div>
                        <span className="font-bold text-[var(--td-text-primary)] block">Windows</span>
                        <span className="text-xs text-[var(--td-text-tertiary)]">10 / 11</span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recommandé
                    </Badge>
                  </div>
                  <Button 
                    onClick={downloadMSI}
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Installer maintenant — Gratuit
                  </Button>
                  <p className="text-xs text-[var(--td-text-secondary)] mt-3 text-center">
                    Installateur MSI officiel • ~50 MB • Licence AGPL-3.0
                  </p>
                </div>

                {/* GitHub Releases */}
                <div className="p-4 rounded-xl bg-[var(--td-surface-elevated)] border border-[var(--td-border)]">
                  <Button 
                    variant="ghost"
                    onClick={openGitHub}
                    className="w-full justify-start text-[var(--td-text-secondary)] hover:text-[var(--td-text-primary)]"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Code source sur GitHub — Open Source
                  </Button>
                </div>



                {/* Continue Web */}
                {allowContinueWeb && (
                  <div className="text-center pt-4 border-t border-[var(--td-border)]">
                    <button
                      onClick={onContinueWeb}
                      className="text-sm text-[var(--td-text-secondary)] hover:text-[var(--td-primary)] transition-colors"
                    >
                      Ou continuer avec la version web →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités réelles */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
            <h4 className="text-sm font-semibold text-[var(--td-text-primary)] mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[var(--td-primary)]" />
              IA locale (optionnelle)
            </h4>
            <ul className="space-y-2 text-xs text-[var(--td-text-secondary)]">
              <li>• <strong>Chat avec l'IA</strong> — posez des questions sur le code, elle répond.</li>
              <li>• <strong>Analyse d'erreurs</strong> — elle lit vos erreurs terminal et explique.</li>
              <li>• <strong>Pas de cloud</strong> — Ollama tourne sur votre PC, rien n'est envoyé.</li>
            </ul>
            <p className="text-[10px] text-[var(--td-text-tertiary)] mt-3 italic">Nécessite d'installer Ollama séparément (~4 GB pour le modèle).</p>
          </div>

          <div className="rounded-2xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
            <h4 className="text-sm font-semibold text-[var(--td-text-primary)] mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[var(--td-primary)]" />
              Données stockées
            </h4>
            <ul className="space-y-2 text-xs text-[var(--td-text-secondary)]">
              <li>• <strong>Chapitres terminés</strong> — pour reprendre où vous en étiez.</li>
              <li>• <strong>Résultats QCM</strong> — score et réponses de chaque quiz.</li>
              <li>• <strong>Cache des cours</strong> — pour fonctionner hors-ligne.</li>
            </ul>
            <p className="text-[10px] text-[var(--td-text-tertiary)] mt-3 italic">Tout est sur votre machine, aucun compte requis.</p>
          </div>

          <div className="rounded-2xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
            <h4 className="text-sm font-semibold text-[var(--td-text-primary)] mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[var(--td-primary)]" />
              Mises à jour des cours
            </h4>
            <ul className="space-y-2 text-xs text-[var(--td-text-secondary)]">
              <li>• <strong>Sync automatique</strong> — nouveaux cours téléchargés au démarrage.</li>
              <li>• <strong>Mode hors-ligne</strong> — fonctionne sans internet après 1ère sync.</li>
              <li>• <strong>Pas de tracking</strong> — seuls les cours publics sont récupérés.</li>
            </ul>
            <p className="text-[10px] text-[var(--td-text-tertiary)] mt-3 italic">L'app envoie 0 donnée personnelle.</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-[var(--td-text-tertiary)]">
            Configuration requise : Windows 10+ (installateur MSI officiel)
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--td-text-tertiary)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Open Source
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              AGPL-3.0
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Zero Trackers
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
