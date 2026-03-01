// ============================================
// TutoDeCode - Hardware Diagnostic Card
// Affiche les specs système et recommandations
// ============================================

import { 
  Cpu, 
  MemoryStick, 
  Monitor, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { HardwareInfo, LlmRecommendation } from '@/types';

interface HardwareCardProps {
  hardware: HardwareInfo | null;
  recommendation: LlmRecommendation | null;
  isScanning: boolean;
  error: string | null;
  onRescan: () => void;
}

export function HardwareCard({ 
  hardware, 
  recommendation, 
  isScanning, 
  error, 
  onRescan 
}: HardwareCardProps) {
  
  // Détermine la couleur du score de performance
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  // Détermine le label du score
  const getScoreLabel = (score: number): string => {
    if (score >= 70) return 'Excellente';
    if (score >= 40) return 'Bonne';
    return 'Limitée';
  };

  if (isScanning) {
    return (
      <Card className="card-td">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[var(--td-primary)]" />
            Analyse du système...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-4">
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-td border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Erreur de détection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--td-text-secondary)] mb-4">{error}</p>
          <Button onClick={onRescan} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hardware) {
    return (
      <Card className="card-td">
        <CardHeader>
          <CardTitle>Configuration système</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--td-text-secondary)] mb-4">
            Aucune information matérielle disponible.
          </p>
          <Button onClick={onRescan} className="w-full btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Scanner le système
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-td">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="w-5 h-5 text-[var(--td-primary)]" />
            Configuration système
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRescan}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Score de performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--td-text-secondary)]">
              Performance globale
            </span>
            <span className={`text-sm font-medium ${getScoreColor(hardware.performanceScore)}`}>
              {getScoreLabel(hardware.performanceScore)}
            </span>
          </div>
          <Progress 
            value={hardware.performanceScore} 
            className="h-2"
          />
        </div>

        {/* CPU */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--td-bg-secondary)]">
          <Cpu className="w-5 h-5 text-[var(--td-primary)] mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--td-text-primary)]">
              {hardware.cpu.brand}
            </p>
            <p className="text-xs text-[var(--td-text-secondary)]">
              {hardware.cpu.coresLogical} cœurs • {hardware.cpu.architecture}
            </p>
          </div>
        </div>

        {/* RAM */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--td-bg-secondary)]">
          <MemoryStick className="w-5 h-5 text-[var(--td-primary)] mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--td-text-primary)]">
              {hardware.memory.totalGb.toFixed(1)} GB RAM
            </p>
            <p className="text-xs text-[var(--td-text-secondary)]">
              {hardware.memory.availableGb.toFixed(1)} GB disponible
            </p>
          </div>
        </div>

        {/* GPU */}
        {hardware.gpu && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--td-bg-secondary)]">
            <Monitor className="w-5 h-5 text-[var(--td-primary)] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--td-text-primary)]">
                {hardware.gpu.name}
              </p>
              <p className="text-xs text-[var(--td-text-secondary)]">
                {hardware.gpu.vendor} • {hardware.gpu.vramGb ? `${hardware.gpu.vramGb} GB VRAM` : 'VRAM inconnu'}
                {hardware.gpu.isDedicated && ' • Dédiée'}
              </p>
            </div>
          </div>
        )}

        {/* Recommandation IA */}
        {recommendation && (
          <div className="mt-4 pt-4 border-t border-[var(--td-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--td-accent-ai)]" />
              <span className="text-sm font-medium text-[var(--td-accent-ai)]">
                Recommandation IA
              </span>
            </div>
            
            <div className="p-3 rounded-lg bg-[var(--td-accent-ai-muted)] border border-[var(--td-accent-ai)]/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[var(--td-accent-ai)]" />
                <span className="font-medium text-sm">
                  {recommendation.modelName}
                </span>
              </div>
              
              <p className="text-xs text-[var(--td-text-secondary)] mb-3">
                {recommendation.reason}
              </p>
              
              <div className="flex flex-wrap gap-1.5">
                {recommendation.suitableFor.map((item, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-[10px] bg-[var(--td-accent-ai)]/10 text-[var(--td-accent-ai)]"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
