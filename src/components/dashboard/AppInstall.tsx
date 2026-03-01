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
  Eye,
  Globe,
  FolderOpen,
  Bot,
  RefreshCw
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
          <Badge className="mb-4 bg-[var(--td-primary)]/20 text-[var(--td-primary)]">
            <Sparkles className="w-3 h-3 mr-1" />
            Application Desktop
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--td-text-primary)] mb-4">
            Installez TutoDeCode Pro
          </h2>
          <p className="text-lg text-[var(--td-text-secondary)] max-w-2xl mx-auto">
            Version desktop recommandée: parcours complets, tickets IA, génération de fichiers de mission, validation guidée et synchronisation des nouveautés de cours.
          </p>
        </div>

        {/* Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--td-text-tertiary)] mb-1">Confiance</p>
            <p className="text-sm text-[var(--td-text-primary)] font-medium">Code source public et vérifiable</p>
            <p className="text-xs text-[var(--td-text-secondary)] mt-1">Releases publiées sur GitHub + installateur MSI officiel.</p>
          </div>
          <div className="rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--td-text-tertiary)] mb-1">Vie privée</p>
            <p className="text-sm text-[var(--td-text-primary)] font-medium">Aucune donnée perso récupérée</p>
            <p className="text-xs text-[var(--td-text-secondary)] mt-1">Pas de trackers. La synchro récupère uniquement des contenus publics.</p>
          </div>
          <div className="rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--td-text-tertiary)] mb-1">Fonctionnel aujourd'hui</p>
            <p className="text-sm text-[var(--td-text-primary)] font-medium">Workflow ticket IA complet</p>
            <p className="text-xs text-[var(--td-text-secondary)] mt-1">"J'ai fini" → ticket → "Je pense avoir fini" → validation/feedback.</p>
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
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--td-surface-elevated)] flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-[var(--td-primary)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--td-text-primary)]">{feature.title}</h4>
                      <p className="text-sm text-[var(--td-text-secondary)]">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Download */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="space-y-6">
                
                {/* Windows Download */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Monitor className="w-6 h-6 text-blue-400" />
                    <span className="font-semibold text-[var(--td-text-primary)]">Windows</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400">Recommandé</Badge>
                  </div>
                  <Button 
                    onClick={downloadMSI}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger l'installateur .msi
                  </Button>
                  <p className="text-xs text-[var(--td-text-tertiary)] mt-2 text-center">
                    Windows 10/11 • ~50 MB
                  </p>
                  <p className="text-[11px] text-[var(--td-text-tertiary)] mt-2 text-center">
                    Si le MSI n'est pas disponible, le script d'installation Windows est téléchargé automatiquement.
                  </p>
                </div>

                {/* GitHub Releases */}
                <div className="p-6 rounded-2xl bg-[var(--td-surface-elevated)] border border-[var(--td-border)]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-semibold text-[var(--td-text-primary)]">GitHub (source + builds)</span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={openGitHub}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir le code source (Tauri)
                  </Button>
                  <p className="text-xs text-[var(--td-text-tertiary)] mt-2 text-center">
                    Dépôt officiel: code source de l'app Tauri + artefacts de release
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--td-surface-elevated)] border border-[var(--td-border)]">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-5 h-5 text-[var(--td-primary)]" />
                    <span className="font-semibold text-[var(--td-text-primary)]">Zone de test</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={openDemo}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir la démo web
                  </Button>
                  <p className="text-xs text-[var(--td-text-tertiary)] mt-2 text-center">
                    Aperçu immédiat de l'interface et des parcours avant installation.
                  </p>
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
