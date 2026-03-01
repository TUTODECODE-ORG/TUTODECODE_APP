import { ArrowRight, Code2, Terminal, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  stats: {
    totalCourses: number;
    totalHours: number;
    favoriteCourses: number;
    completedCourses: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <div className="relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 lg:px-6 max-w-7xl py-20 lg:py-28">

        {/* Main Hero */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Plateforme de formation technique
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-white">Maîtrisez les</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              technologies modernes
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tutoriels Linux, DevOps et cybersécurité. Terminal intégré, audit de code et IA locale pour une expérience d'apprentissage complète.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20"
              onClick={() => {
                const element = document.getElementById('courses-list');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
              onClick={() => {
                const sidebar = document.querySelector('[data-view="lab"]') as HTMLElement;
                if (sidebar) sidebar.click();
              }}
            >
              <Terminal className="mr-2 h-4 w-4" />
              Outils de développement
            </Button>
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-500" />
              Terminal Node.js
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Audit sécurité
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Chiffrement AES-256
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto mt-20 pt-10 border-t border-slate-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {stats.totalCourses}+
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Tutoriels disponibles
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {stats.totalHours}h
              </div>
              <div className="text-sm text-slate-500 font-medium">
                De contenu technique
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                100%
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Gratuit et open source
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                0
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Tracking utilisateur
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}