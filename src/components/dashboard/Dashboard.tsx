// ============================================
// TutoDeCode Pro - Main Dashboard Component
// Vue principale avec diagnostic et tickets
// ============================================

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Ticket, 
  Bell,
  Search,
  Menu,
  X,
  BookOpen,
  Trophy,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { HardwareCard } from './HardwareCard';
import { TicketList } from '../tickets/TicketList';
import { Terminal as TerminalComponent } from '../terminal/Terminal';
import { AIChat } from '../ai/AIChat';
import { useHardwareScan } from '@/hooks/useHardwareScan';
import { useAgentTerminalBridge } from '@/hooks/useAgentTerminalBridge';
import type { Ticket as TicketType } from '@/types';

// Données de démonstration pour les tickets
const DEMO_TICKETS: TicketType[] = [
  {
    id: '1',
    title: 'Le serveur Nginx crash en production',
    description: 'Les logs indiquent une erreur de configuration. Le service redémarre en boucle.',
    context: 'Vous êtes en charge de la maintenance d\'un serveur web Nginx qui vient de tomber en production. Les utilisateurs ne peuvent plus accéder au site.',
    priority: 'critical',
    status: 'open',
    category: 'devops',
    checkpoints: [
      { id: '1-1', description: 'Vérifier les logs Nginx', completed: false, hint: 'Utilisez journalctl ou tail sur /var/log/nginx/error.log' },
      { id: '1-2', description: 'Identifier l\'erreur de configuration', completed: false },
      { id: '1-3', description: 'Corriger et redémarrer Nginx', completed: false },
    ],
    estimatedTime: '15 min',
    difficulty: 'intermediate',
    tags: ['nginx', 'linux', 'production', 'debugging'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Configurer HTTPS avec Certbot',
    description: 'Mettre en place un certificat SSL gratuit pour sécuriser le site web.',
    context: 'Le site actuellement en HTTP doit être sécurisé. Vous devez configurer HTTPS avec Let\'s Encrypt.',
    priority: 'high',
    status: 'open',
    category: 'security',
    checkpoints: [
      { id: '2-1', description: 'Installer Certbot', completed: false },
      { id: '2-2', description: 'Générer le certificat', completed: false },
      { id: '2-3', description: 'Configurer le renouvellement automatique', completed: false },
    ],
    estimatedTime: '20 min',
    difficulty: 'beginner',
    tags: ['ssl', 'https', 'certbot', 'security'],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
  },
  {
    id: '3',
    title: 'Optimiser une requête SQL lente',
    description: 'La requête de recherche prend plus de 5 secondes à s\'exécuter.',
    context: 'Les utilisateurs se plaignent de la lenteur de la recherche. Le profiling indique un problème de requête SQL.',
    priority: 'medium',
    status: 'in-progress',
    category: 'database',
    checkpoints: [
      { id: '3-1', description: 'Analyser la requête avec EXPLAIN', completed: true },
      { id: '3-2', description: 'Créer un index approprié', completed: false },
      { id: '3-3', description: 'Mesurer l\'amélioration des performances', completed: false },
    ],
    estimatedTime: '30 min',
    difficulty: 'advanced',
    tags: ['sql', 'postgresql', 'performance', 'indexing'],
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  {
    id: '4',
    title: 'Déployer une app sur Kubernetes',
    description: 'Créer les manifests Kubernetes pour déployer une application containerisée.',
    context: 'L\'application est prête en Docker. Il faut maintenant la déployer sur un cluster Kubernetes.',
    priority: 'medium',
    status: 'open',
    category: 'cloud',
    checkpoints: [
      { id: '4-1', description: 'Créer le Deployment', completed: false },
      { id: '4-2', description: 'Créer le Service', completed: false },
      { id: '4-3', description: 'Appliquer et vérifier le déploiement', completed: false },
    ],
    estimatedTime: '25 min',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'docker', 'k8s', 'deployment'],
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
  },
  {
    id: '5',
    title: 'Corriger une faille XSS',
    description: 'Un audit de sécurité a révélé une vulnérabilité XSS dans le formulaire de commentaires.',
    context: 'L\'application web permet l\'injection de scripts malveillants. Vous devez sécuriser le formulaire.',
    priority: 'high',
    status: 'open',
    category: 'security',
    checkpoints: [
      { id: '5-1', description: 'Identifier le point d\'injection', completed: false },
      { id: '5-2', description: 'Implémenter l\'échappement des entrées', completed: false },
      { id: '5-3', description: 'Tester la correction', completed: false },
    ],
    estimatedTime: '20 min',
    difficulty: 'intermediate',
    tags: ['xss', 'security', 'web', 'vulnerability'],
    createdAt: '2024-01-11T15:00:00Z',
    updatedAt: '2024-01-11T15:00:00Z',
  },
];

interface DashboardProps {
  className?: string;
}

export function Dashboard({ className = '' }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'tickets'>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>(DEMO_TICKETS);
  
  const { 
    hardware, 
    recommendation, 
    isScanning, 
    error, 
    isDesktop, 
    scanHardware 
  } = useHardwareScan();
  
  const { 
    messages, 
    isAnalyzing, 
    analyzeOutput, 
    requestHint, 
    clearMessages 
  } = useAgentTerminalBridge();

  // Gère le clic sur un ticket
  const handleTicketClick = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setActiveTab('dashboard');
  };

  // Gère le démarrage d'un ticket
  const handleTicketStart = (ticket: TicketType) => {
    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, status: 'in-progress' as const } : t
    ));
    setSelectedTicket({ ...ticket, status: 'in-progress' });
    setActiveTab('terminal');
  };

  // Gère l'envoi d'un message à l'IA
  const handleSendMessage = (message: string) => {
    // Simule une réponse de l'IA
    setTimeout(() => {
      analyzeOutput(message, { currentTicket: selectedTicket || undefined });
    }, 500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
  ];

  return (
    <div className={cn("flex h-screen bg-[var(--td-bg-primary)]", className)}>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-[var(--td-surface)] border-r border-[var(--td-border)] transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[var(--td-border)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--td-primary)] to-[var(--td-accent-ai)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-semibold text-[var(--td-text-primary)]">
              TutoDeCode
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "flex items-center w-full px-3 py-2.5 rounded-lg transition-colors",
                    activeTab === item.id
                      ? "bg-[var(--td-primary-muted)] text-[var(--td-primary)]"
                      : "text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)] hover:text-[var(--td-text-primary)]"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <Separator className="my-4 mx-4 w-auto" />

          {/* Stats rapides */}
          {sidebarOpen && (
            <div className="px-4 space-y-3">
              <p className="text-xs font-medium text-[var(--td-text-tertiary)] uppercase tracking-wider">
                Progression
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--td-text-secondary)]">Tickets complétés</span>
                  <span className="text-[var(--td-text-primary)]">3/12</span>
                </div>
                <div className="h-1.5 bg-[var(--td-bg-secondary)] rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-[var(--td-primary)] rounded-full" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--td-bg-secondary)]">
                <Trophy className="w-4 h-4 text-[var(--td-accent-ai)]" />
                <div>
                  <p className="text-xs text-[var(--td-text-secondary)]">Niveau</p>
                  <p className="text-sm font-medium text-[var(--td-text-primary)]">Développeur Jr</p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[var(--td-surface)] border border-[var(--td-border)] rounded-full flex items-center justify-center hover:bg-[var(--td-surface-hover)]"
        >
          {sidebarOpen ? (
            <X className="w-3 h-3" />
          ) : (
            <Menu className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* Header */}
        <header className="h-16 px-6 border-b border-[var(--td-border)] flex items-center justify-between bg-[var(--td-surface)]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--td-text-tertiary)]" />
              <Input
                placeholder="Rechercher..."
                className="input-td pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--td-accent-ai)] rounded-full" />
            </Button>
            
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-[var(--td-primary)] text-white text-sm">
                TD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome */}
              <div>
                <h1 className="text-2xl font-semibold text-[var(--td-text-primary)]">
                  Bienvenue sur TutoDeCode Pro
                </h1>
                <p className="text-[var(--td-text-secondary)] mt-1">
                  Votre laboratoire DevOps interactif avec terminal réel et agent IA.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hardware Card */}
                <div className="lg:col-span-1">
                  <HardwareCard
                    hardware={hardware}
                    recommendation={recommendation}
                    isScanning={isScanning}
                    error={error}
                    onRescan={scanHardware}
                  />
                </div>

                {/* Selected Ticket or Quick Stats */}
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <div className="card-td h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px]">
                              {selectedTicket.category}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-[10px]",
                                selectedTicket.priority === 'critical' && "bg-red-500/10 text-red-400",
                                selectedTicket.priority === 'high' && "bg-orange-500/10 text-orange-400",
                                selectedTicket.priority === 'medium' && "bg-amber-500/10 text-amber-400",
                                selectedTicket.priority === 'low' && "bg-emerald-500/10 text-emerald-400",
                              )}
                            >
                              {selectedTicket.priority}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-medium text-[var(--td-text-primary)]">
                            {selectedTicket.title}
                          </h3>
                        </div>
                        <Button 
                          size="sm" 
                          className="btn-primary"
                          onClick={() => handleTicketStart(selectedTicket)}
                        >
                          Commencer
                        </Button>
                      </div>
                      
                      <p className="text-sm text-[var(--td-text-secondary)] mb-4">
                        {selectedTicket.description}
                      </p>
                      
                      <div className="p-3 rounded-lg bg-[var(--td-bg-secondary)] mb-4">
                        <p className="text-xs text-[var(--td-text-tertiary)] uppercase tracking-wider mb-1">
                          Contexte
                        </p>
                        <p className="text-sm text-[var(--td-text-secondary)]">
                          {selectedTicket.context}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-[var(--td-text-tertiary)] uppercase tracking-wider mb-2">
                          Definition of Done
                        </p>
                        <div className="space-y-2">
                          {selectedTicket.checkpoints.map((checkpoint) => (
                            <div 
                              key={checkpoint.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-[var(--td-bg-secondary)]"
                            >
                              <div className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center",
                                checkpoint.completed
                                  ? "bg-[var(--td-success)] border-[var(--td-success)]"
                                  : "border-[var(--td-border)]"
                              )}>
                                {checkpoint.completed && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={cn(
                                "text-sm",
                                checkpoint.completed 
                                  ? "text-[var(--td-text-tertiary)] line-through" 
                                  : "text-[var(--td-text-primary)]"
                              )}>
                                {checkpoint.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card-td h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-[var(--td-primary-muted)] flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-[var(--td-primary)]" />
                      </div>
                      <h3 className="text-lg font-medium text-[var(--td-text-primary)] mb-2">
                        Aucun ticket sélectionné
                      </h3>
                      <p className="text-sm text-[var(--td-text-secondary)] max-w-md">
                        Sélectionnez un ticket dans la liste pour voir les détails et commencer à résoudre le problème.
                      </p>
                      <Button 
                        className="mt-4 btn-primary"
                        onClick={() => setActiveTab('tickets')}
                      >
                        Voir les tickets
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TerminalComponent 
                  isDesktop={isDesktop} 
                  className="h-[400px]"
                />
                
                {/* AI Chat */}
                <div className="relative h-[400px]">
                  <AIChat
                    messages={messages}
                    isAnalyzing={isAnalyzing}
                    onSendMessage={handleSendMessage}
                    onRequestHint={() => requestHint('unknown', { currentTicket: selectedTicket || undefined })}
                    onClearChat={clearMessages}
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <TicketList
              tickets={tickets}
              activeTicketId={selectedTicket?.id}
              onTicketClick={handleTicketClick}
              onTicketStart={handleTicketStart}
            />
          )}

          {activeTab === 'terminal' && (
            <div className="h-full">
              <TerminalComponent 
                isDesktop={isDesktop}
                className="h-full"
              />
            </div>
          )}
        </div>
      </main>

      {/* AI Chat Floating (only on dashboard) */}
      {activeTab !== 'dashboard' && (
        <AIChat
          messages={messages}
          isAnalyzing={isAnalyzing}
          onSendMessage={handleSendMessage}
          onRequestHint={() => requestHint('unknown', { currentTicket: selectedTicket || undefined })}
          onClearChat={clearMessages}
          className="fixed bottom-4 right-4 z-50"
        />
      )}
    </div>
  );
}
