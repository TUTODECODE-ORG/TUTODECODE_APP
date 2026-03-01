// ============================================
// TutoDeCode Pro - Ticket List Component
// Liste des tickets avec filtres et recherche
// ============================================

import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TicketCard } from './TicketCard';
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types';

interface TicketListProps {
  tickets: Ticket[];
  activeTicketId?: string;
  onTicketClick: (ticket: Ticket) => void;
  onTicketStart: (ticket: Ticket) => void;
}

type FilterStatus = 'all' | TicketStatus;
type SortOption = 'newest' | 'priority' | 'difficulty';

export function TicketList({ 
  tickets, 
  activeTicketId, 
  onTicketClick, 
  onTicketStart 
}: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategories, setSelectedCategories] = useState<TicketCategory[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TicketPriority[]>([]);

  // Filtre et trie les tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter);
    }

    // Filtre par catégories
    if (selectedCategories.length > 0) {
      result = result.filter(ticket => selectedCategories.includes(ticket.category));
    }

    // Filtre par priorités
    if (selectedPriorities.length > 0) {
      result = result.filter(ticket => selectedPriorities.includes(ticket.priority));
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'difficulty':
          const difficultyOrder = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return result;
  }, [tickets, searchQuery, statusFilter, sortBy, selectedCategories, selectedPriorities]);

  // Statistiques
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  }), [tickets]);

  const toggleCategory = (category: TicketCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePriority = (priority: TicketPriority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--td-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--td-text-primary)]">
              Tickets de résolution
            </h2>
            <p className="text-sm text-[var(--td-text-secondary)]">
              {stats.total} tickets • {stats.open} ouverts • {stats.inProgress} en cours
            </p>
          </div>
          <Button size="sm" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--td-text-tertiary)]" />
            <Input
              placeholder="Rechercher un ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-td pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Catégories</DropdownMenuLabel>
              {(['devops', 'security', 'frontend', 'backend', 'database', 'cloud'] as TicketCategory[]).map(cat => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                >
                  <span className="capitalize">{cat}</span>
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Priorités</DropdownMenuLabel>
              {(['low', 'medium', 'high', 'critical'] as TicketPriority[]).map(prio => (
                <DropdownMenuCheckboxItem
                  key={prio}
                  checked={selectedPriorities.includes(prio)}
                  onCheckedChange={() => togglePriority(prio)}
                >
                  <span className="capitalize">{prio}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Trier par</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'newest'}
                onCheckedChange={() => setSortBy('newest')}
              >
                Plus récent
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'priority'}
                onCheckedChange={() => setSortBy('priority')}
              >
                Priorité
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'difficulty'}
                onCheckedChange={() => setSortBy('difficulty')}
              >
                Difficulté
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtres actifs */}
        {(selectedCategories.length > 0 || selectedPriorities.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedCategories.map(cat => (
              <Badge 
                key={cat} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleCategory(cat)}
              >
                {cat} ×
              </Badge>
            ))}
            {selectedPriorities.map(prio => (
              <Badge 
                key={prio} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => togglePriority(prio)}
              >
                {prio} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
        <TabsList className="w-full justify-start rounded-none border-b border-[var(--td-border)] bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--td-primary)] data-[state=active]:bg-transparent"
          >
            Tous
          </TabsTrigger>
          <TabsTrigger 
            value="open"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--td-primary)] data-[state=active]:bg-transparent"
          >
            <Circle className="w-3.5 h-3.5 mr-1.5" />
            Ouverts
          </TabsTrigger>
          <TabsTrigger 
            value="in-progress"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--td-primary)] data-[state=active]:bg-transparent"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            En cours
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--td-primary)] data-[state=active]:bg-transparent"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Terminés
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Liste des tickets */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--td-surface)] flex items-center justify-center">
              <Search className="w-8 h-8 text-[var(--td-text-tertiary)]" />
            </div>
            <p className="text-[var(--td-text-secondary)]">
              Aucun ticket trouvé
            </p>
            <p className="text-sm text-[var(--td-text-tertiary)] mt-1">
              Essayez de modifier vos filtres
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isActive={ticket.id === activeTicketId}
              onClick={() => onTicketClick(ticket)}
              onStart={() => onTicketStart(ticket)}
            />
          ))
        )}
      </div>
    </div>
  );
}
