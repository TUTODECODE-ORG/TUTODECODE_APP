// ============================================
// TutoDeCode - Ticket Card Component
// Affiche un ticket de résolution d'incident
// ============================================

import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MoreHorizontal,
  Tag,
  Cpu,
  Shield,
  Globe,
  Database,
  Cloud,
  Layout
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Ticket } from '@/types';

interface TicketCardProps {
  ticket: Ticket;
  isActive?: boolean;
  onClick?: () => void;
  onStart?: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  devops: Cpu,
  security: Shield,
  frontend: Layout,
  backend: Globe,
  database: Database,
  cloud: Cloud,
};

const priorityColors: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-slate-500/10 text-slate-400',
  'in-progress': 'bg-blue-500/10 text-blue-400',
  review: 'bg-purple-500/10 text-purple-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert',
};

export function TicketCard({ ticket, isActive = false, onClick, onStart }: TicketCardProps) {
  const CategoryIcon = categoryIcons[ticket.category] || Cpu;
  
  // Calcule la progression des checkpoints
  const completedCheckpoints = ticket.checkpoints.filter(c => c.completed).length;
  const progress = ticket.checkpoints.length > 0 
    ? (completedCheckpoints / ticket.checkpoints.length) * 100 
    : 0;

  return (
    <Card 
      className={`ticket ${isActive ? 'active' : ''} ticket-priority-${ticket.priority}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CategoryIcon className="w-4 h-4 text-[var(--td-text-tertiary)] flex-shrink-0" />
            <span className="text-xs text-[var(--td-text-tertiary)] uppercase tracking-wider">
              {ticket.category}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStart?.(); }}>
                Commencer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Voir les détails
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Titre */}
        <h4 className="font-medium text-[var(--td-text-primary)] line-clamp-2">
          {ticket.title}
        </h4>

        {/* Description courte */}
        <p className="text-sm text-[var(--td-text-secondary)] line-clamp-2">
          {ticket.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant="outline" 
            className={`text-[10px] ${priorityColors[ticket.priority]}`}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            {ticket.priority}
          </Badge>
          
          <Badge 
            variant="secondary" 
            className={`text-[10px] ${statusColors[ticket.status]}`}
          >
            {ticket.status === 'in-progress' ? 'En cours' : 
             ticket.status === 'completed' ? 'Terminé' :
             ticket.status === 'review' ? 'En revue' : 'Ouvert'}
          </Badge>
          
          <Badge variant="outline" className="text-[10px]">
            {difficultyLabels[ticket.difficulty]}
          </Badge>
        </div>

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="text-[10px] text-[var(--td-text-tertiary)] flex items-center"
              >
                <Tag className="w-3 h-3 mr-0.5" />
                {tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span className="text-[10px] text-[var(--td-text-tertiary)]">
                +{ticket.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Progression */}
        {ticket.checkpoints.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--td-text-secondary)]">
                Progression
              </span>
              <span className="text-[var(--td-text-primary)]">
                {completedCheckpoints}/{ticket.checkpoints.length}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 text-xs text-[var(--td-text-tertiary)]">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {ticket.estimatedTime}
          </div>
          
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedCheckpoints}/{ticket.checkpoints.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
