// ============================================
// TutoDeCode Pro - App Installation Section
// Guide d'installation de l'application Tauri
// ============================================

import React from 'react';
import { 
  Download, 
  Monitor, 
  Shield, 
  CheckCircle2,
  ExternalLink,
  WifiOff,
  Sparkles,
  FolderOpen,
  Bot,
  RefreshCw,
  Code2,
  FileCode,
  Info
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
            Devenez développeur avec TutoDeCode Pro
          </h2>
          <p className="text-lg text-[var(--td-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            L'app desktop qui vous guide pas à pas : <span className="text-[var(--td-primary)] font-medium">parcours structurés</span>, <span className="text-[var(--td-primary)] font-medium">IA mentor</span> pour corriger vos projets, et <span className="text-[var(--td-primary)] font-medium">tickets de missions</span> pour coder comme un pro.
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
                  <h3 className="text-2xl font-bold text-[var(--td-text-primary)]">TutoDeCode Pro</h3>
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
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
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
                  
                  {/* SmartScreen Info */}
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-200/80">
                        <p className="font-medium text-amber-300 mb-1">Windows SmartScreen</p>
                        <p>L'app n'est pas signée (coût de 400€/an). Si Windows affiche un avertissement, cliquez « Plus d'infos » → « Exécuter quand même ». Le code source est vérifiable sur GitHub.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Winget Info */}
                  <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-cyan-200/80">
                        <p className="font-medium text-cyan-300 mb-1">Bientôt sur Winget</p>
                        <p>Nous sommes en cours de soumission au <a href="https://github.com/microsoft/winget-pkgs" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">Windows Package Manager</a> (le « apt » de Windows). Une fois validé par Microsoft, l'app sera reconnue comme partenaire officiel et installable via <code className="px-1 py-0.5 bg-cyan-500/20 rounded text-cyan-300">winget install TutoDeCode</code>.</p>
                      </div>
                    </div>
                  </div>
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
              Ce que fait l'IA dans l'app
            </h4>
            <ul className="space-y-2 text-xs text-[var(--td-text-secondary)]">
              <li>• Génère des missions/tickets à partir du cours.</li>
              <li>• Analyse votre retour « Je pense avoir fini ».</li>
              <li>• Valide le cours si réussi, sinon explique ce qu'il manque.</li>
              <li>• Aide possible sans donner la réponse finale.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
            <h4 className="text-sm font-semibold text-[var(--td-text-primary)] mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[var(--td-primary)]" />
              Ce qui est écrit sur votre machine
            </h4>
            <ul className="space-y-2 text-xs text-[var(--td-text-secondary)]">
              <li>• Dossier lab local choisi par vous.</li>
              <li>• Fichiers de mission et starter générés dans ce dossier.</li>
              <li>• Rapports de validation IA en fichiers locaux.</li>
              <li>• Progression sauvegardée localement.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
            <h4 className="text-sm font-semibold text-[var(--td-text-primary)] mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[var(--td-primary)]" />
              Mises à jour sans réinstallation
            </h4>
            <ul className="space-y-2 text-xs text-[var(--td-text-secondary)]">
              <li>• Sync API des contenus publics (interface/cours).</li>
              <li>• Cache local pour éviter les téléchargements en boucle.</li>
              <li>• Fonctionnement offline conservé en cas de coupure.</li>
              <li>• Aucune donnée utilisateur envoyée pendant la sync.</li>
            </ul>
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
