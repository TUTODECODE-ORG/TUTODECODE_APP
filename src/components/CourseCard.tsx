import { isValidElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfflineCourseButton } from './OfflineManager';
import {
  Clock,
  Star,
  CheckCircle,
  PlayCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  isFavorite: boolean;
  isCompleted: boolean;
  progress: number;
  onFavoriteToggle: () => void;
  onCompleteToggle: () => void;
  onClick: () => void;
}

const levelConfig = {
  beginner: { label: 'Clearance Level 1', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  intermediate: { label: 'Clearance Level 2', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  advanced: { label: 'Clearance Level 3', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

export function CourseCard({
  course,
  isFavorite,
  isCompleted,
  progress,
  onFavoriteToggle,
  onCompleteToggle,
  onClick,
}: CourseCardProps) {

  const levelStyle = levelConfig[course.level as keyof typeof levelConfig] || levelConfig.beginner;

  // Handle icon rendering safely
  const Icon = course.icon;
  let RenderedIcon;

  if (isValidElement(Icon)) {
    RenderedIcon = Icon;
  } else if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
    // It's likely a component (Function or ForwardRef) -> Render it as a component
    const IconComponent = Icon as React.ElementType;
    RenderedIcon = <IconComponent className="w-6 h-6" />;
  } else {
    RenderedIcon = null; // Fallback
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full rounded-2xl border transition-all duration-300",
        "bg-[#13131f] border-white/5 hover:border-white/10 overflow-hidden",
        "hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 active:scale-[0.98] md:active:scale-100"
      )}
      onClick={onClick}
    >
      {/* Top Banner (Gradient Line) */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-50 transition-opacity group-hover:opacity-100",
        isCompleted ? "from-green-500 to-emerald-500" : "from-blue-600 to-purple-600"
      )} />

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 relative z-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-3xl shadow-inner border border-white/5">
            {RenderedIcon}
          </div>

          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <OfflineCourseButton course={course} variant="icon" />
            <button onClick={onFavoriteToggle} className={cn("p-2 rounded-lg hover:bg-white/5 transition-colors", isFavorite ? "text-yellow-400" : "text-gray-600")} aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
            </button>
            <button onClick={onCompleteToggle} className={cn("p-2 rounded-lg hover:bg-white/5 transition-colors", isCompleted ? "text-green-400" : "text-gray-600")} aria-label={isCompleted ? "Marquer comme non terminé" : "Marquer comme terminé"}>
              <CheckCircle size={18} fill={isCompleted ? "currentColor" : "none"} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Title & Info */}
        <div className="mb-auto">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold h-5 px-1.5", levelStyle.bg, levelStyle.color, levelStyle.border)}>
              {levelStyle.label}
            </Badge>
            {isCompleted && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold h-5 px-1.5 bg-green-500/10 text-green-400 border-green-500/20">
                Complété
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors flex items-center gap-2">
            {course.title}
            {/* Tech Icons based on keywords (Soft mapping) */}
            {course.keywords.some(k => k.toLowerCase().includes('docker')) && <i className="devicon-docker-plain text-blue-400 text-lg" />}
            {course.keywords.some(k => k.toLowerCase().includes('linux')) && <i className="devicon-linux-plain text-white text-lg" />}
            {course.keywords.some(k => k.toLowerCase().includes('git')) && <i className="devicon-git-plain text-orange-500 text-lg" />}
            {course.keywords.some(k => k.toLowerCase().includes('python')) && <i className="devicon-python-plain text-yellow-300 text-lg" />}
            {course.keywords.some(k => k.toLowerCase().includes('windows')) && <i className="devicon-windows8-original text-blue-300 text-lg" />}
          </h3>

          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        </div>

        {/* Metrics & Progress */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          {/* Detailed Metrics */}
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-blue-500/70" /> {course.duration}
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-purple-500/70" /> {course.chapters} modules
            </div>
          </div>

          {/* Progress Bar (Always visible but subtle if 0) */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-end text-[10px] font-bold tracking-wider uppercase text-gray-500">
              <span>Progression</span>
              <span className={cn(progress > 0 ? "text-blue-400" : "text-gray-600")}>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <svg width="100%" height="6" className="block">
                <rect
                  x="0"
                  y="0"
                  width={`${progress}%`}
                  height="6"
                  fill="url(#progress-gradient)"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* CTA on Hover */}
          <div className="absolute inset-x-6 bottom-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
              <PlayCircle size={16} className="mr-2" /> Reprendre
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle Glow Background */}
      <div className="absolute -inset-px bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
    </div>
  );
}
