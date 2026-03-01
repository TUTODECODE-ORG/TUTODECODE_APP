import { Terminal, Shield, Lock, Cpu, ArrowRight } from 'lucide-react';

export function AppSection() {
  const tools = [
    {
      icon: Terminal,
      title: 'Terminal interactif',
      description: 'Environnement Node.js complet dans le navigateur',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Audit de sécurité',
      description: 'Détection automatique des vulnérabilités',
      color: 'blue'
    },
    {
      icon: Lock,
      title: 'Vault chiffré',
      description: 'Stockage local avec chiffrement AES-256-GCM',
      color: 'blue'
    },
    {
      icon: Cpu,
      title: 'IA locale',
      description: 'Assistant Phi-3.5 sans connexion serveur',
      color: 'blue'
    }
  ];

  return (
    <section className="py-20 border-t border-slate-800">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6">
            Environnement de développement
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Outils intégrés pour apprendre et créer
          </h2>
          <p className="text-lg text-slate-400">
            Un laboratoire complet avec terminal, audit de sécurité, stockage chiffré et intelligence artificielle locale.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {tool.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Honeypot Highlight */}
        <div className="mb-12">
          <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-red-500/10 via-orange-500/10 to-transparent border border-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Honeypot SecOps Playground
                </h3>
                <p className="text-slate-300 mb-4">
                  Pratiquez les techniques d'exploitation sur des environnements volontairement vulnérables.
                  SQL Injection, XSS, CSRF et plus encore.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-sm text-red-300">
                  ⚠️ Environnement pédagogique • 100% légal
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    const sidebar = document.querySelector('[data-view="honeypot"]') as HTMLElement;
                    if (sidebar) sidebar.click();
                  }}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all hover:scale-105"
                >
                  Accéder au Playground
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const sidebar = document.querySelector('[data-view="lab"]') as HTMLElement;
              if (sidebar) sidebar.click();
            }}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-medium transition-all"
          >
            Accéder au laboratoire
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
