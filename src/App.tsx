// ============================================
// TutoDeCode Pro - Application Principale
// Architecture optimisée avec lazy-loading et memo
// ============================================

import React, { 
  useState, 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef,
  Suspense, 
  lazy,
  memo 
} from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open as pickDirectory } from '@tauri-apps/plugin-dialog';
import '@xterm/xterm/css/xterm.css';
import { 
  BookOpen, 
  Terminal, 
  Menu,
  X,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  Lock,
  Sparkles,
  Maximize2,
  Minimize2,
  Bot,
  Download,
  Home,
  FolderOpen,
  BellRing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================
// LAZY LOADING DES COMPOSANTS LOURDS
// ============================================
const CourseEngine = lazy(() => import('@/components/course/CourseEngine'));
const AgentMentor = lazy(() => import('@/components/ai/AgentMentor'));
const OllamaSetup = lazy(() => import('@/components/ai/OllamaSetup'));
const CourseCreator = lazy(() => import('@/components/ai/CourseCreator'));
const AppInstall = lazy(() => import('@/components/dashboard/AppInstall'));

// ============================================
// IMPORTS DES DONNÉES
// ============================================
import type { Chapter } from '@/data/curriculum';
import { courses as allCourses } from '@/data/courses/source_data';
import type { TerminalOutput } from '@/hooks/useTerminal';

// ============================================
// TYPES
// ============================================
// App state managed with useState hooks

interface UserProgress {
  user_id: string;
  completed_chapters: string[];
  current_chapter: string | null;
  total_time_seconds: number;
}

interface BackendResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
}

interface CourseLabWorkspace {
  user_id: string;
  root_dir: string;
  workspace_dir: string;
  created_at: number;
  updated_at: number;
}

interface TicketValidationReport {
  valid: boolean;
  score: number;
  feedback: string;
  used_ai: boolean;
  validated_at: number;
}

interface CourseTicket {
  id: string;
  user_id: string;
  chapter_id: string;
  chapter_title: string;
  status: string;
  alert_message: string;
  workspace_dir: string;
  scenario_dir: string;
  created_at: number;
  updated_at: number;
  last_validation?: TicketValidationReport | null;
}

interface TicketSubmitResult {
  ticket: CourseTicket;
  report: TicketValidationReport;
  generated_files?: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

interface QuizPayload {
  questions: QuizQuestion[];
  passScore?: number;
}

interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  passScore: number;
}

interface DesktopSyncCourseUpdate {
  id: string;
  title?: string;
  subtitle?: string;
  duration?: string;
  difficulty?: Chapter['difficulty'];
  theory?: string;
}

interface DesktopSyncPayload {
  version: number;
  publishedAt?: string;
  ui?: {
    announcement?: string;
    latestNews?: string[];
  };
  privacy?: {
    collectsUserData?: boolean;
    message?: string;
  };
  courses?: {
    revision?: string;
    updates?: DesktopSyncCourseUpdate[];
  };
}

const DESKTOP_SYNC_URL = 'https://tutodecode.org/api/desktop-sync.json';
const DESKTOP_SYNC_CACHE_KEY = 'tdc.desktop.sync.v1';
const DESKTOP_SYNC_TTL_MS = 1000 * 60 * 60 * 6;

const levelToDifficulty = (level?: string): Chapter['difficulty'] => {
  if (level === 'beginner' || level === 'intermediate' || level === 'advanced') {
    return level;
  }
  return 'expert';
};

const languageToExtension = (language: string): string => {
  const normalized = (language || '').toLowerCase();
  if (normalized === 'rust') return 'rs';
  if (normalized === 'javascript') return 'js';
  if (normalized === 'typescript') return 'ts';
  if (normalized === 'python') return 'py';
  if (normalized === 'yaml' || normalized === 'yml') return 'yml';
  if (normalized === 'bash' || normalized === 'shell') return 'sh';
  if (normalized === 'sql') return 'sql';
  return 'txt';
};

const defaultCodeByCategory = (category?: string): { language: string; code: string } => {
  switch (category) {
    case 'kernel':
      return {
        language: 'bash',
        code: 'uname -a\nls -la\ncat /etc/os-release',
      };
    case 'ship':
      return {
        language: 'bash',
        code: 'docker --version\nkubectl version --client\ngit status',
      };
    case 'shield':
      return {
        language: 'bash',
        code: 'nmap -sV localhost\nss -tulpen\nopenssl version',
      };
    default:
      return {
        language: 'javascript',
        code: 'console.log("TutoDeCode - module chargé");',
      };
  }
};

const buildCurriculumFromCourses = (courses: typeof allCourses): Chapter[] => courses.map((course, index) => {
  const firstSection = course.content?.[0];
  const firstCodeBlock = firstSection?.codeBlocks?.[0];
  const fallbackCode = defaultCodeByCategory(course.category);
  const codeLanguage = firstCodeBlock?.language || fallbackCode.language;

  return {
    id: course.id,
    order: index + 1,
    title: course.title,
    subtitle: `${(course.category || 'it').toUpperCase()} · ${course.chapters || 1} chapitres`,
    duration: course.duration || '2h',
    difficulty: levelToDifficulty(course.level),
    theory: firstSection?.content || course.description || `Introduction au module ${course.title}`,
    codeExample: {
      language: codeLanguage,
      filename: `${course.id}.${languageToExtension(codeLanguage)}`,
      code: firstCodeBlock?.code || fallbackCode.code,
    },
    challenge: {
      title: `Atelier: ${course.title}`,
      description: `Mettez en pratique les fondamentaux du module ${course.title}.`,
      task: `Réalisez une mini implémentation liée à ${course.keywords?.[0] || course.category || 'ce domaine'} puis validez le résultat.`,
      hints: [
        'Commencez par reproduire l’exemple de code.',
        'Adaptez-le à votre contexte.',
        'Validez avec une sortie claire.',
      ],
      validation: {
        command: 'valider_module',
        expectedOutput: 'OK',
        successMessage: 'Excellent, module validé.',
      },
    },
    isLocked: index !== 0,
    isCompleted: false,
    progress: 0,
  };
});

const defaultCurriculum: Chapter[] = buildCurriculumFromCourses(allCourses);

const QUIZ_QUESTION_COUNT = 5;
const QUIZ_PASS_SCORE_DEFAULT = 70;

const stripCodeFences = (value: string): string => {
  const trimmed = value.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  return trimmed;
};

const shuffleArray = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

const parseAiQuizPayload = (raw: string): QuizPayload | null => {
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    const normalizedQuestions: QuizQuestion[] = questions
      .map((item: any) => ({
        question: String(item?.question || '').trim(),
        options: Array.isArray(item?.options) ? item.options.map((opt: any) => String(opt).trim()).filter(Boolean) : [],
        answerIndex: Number(item?.answerIndex),
        explanation: item?.explanation ? String(item.explanation) : undefined,
      }))
      .filter((item: QuizQuestion) => item.question.length > 0 && item.options.length >= 2 && Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < item.options.length)
      .slice(0, QUIZ_QUESTION_COUNT);

    if (normalizedQuestions.length < 3) {
      return null;
    }

    const passScore = Number(parsed?.passScore);
    return {
      questions: normalizedQuestions,
      passScore: Number.isFinite(passScore) && passScore >= 0 && passScore <= 100 ? passScore : QUIZ_PASS_SCORE_DEFAULT,
    };
  } catch {
    return null;
  }
};

const buildFallbackQuiz = (chapterTitle: string): QuizPayload => {
  const seeds = [
    {
      question: `Pour débuter le module "${chapterTitle}", quelle approche est la plus efficace ?`,
      correct: 'Faire un mini test pratique immédiatement puis ajuster.',
      wrong: ['Lire uniquement de la théorie pendant 3h.', 'Copier-coller sans comprendre.', 'Attendre la fin du module pour pratiquer.'],
      explanation: 'La pratique rapide permet d’ancrer les notions et d’identifier les zones floues.',
    },
    {
      question: 'Que faire en premier quand une commande échoue ?',
      correct: 'Lire le message d’erreur complet et identifier le mot-clé principal.',
      wrong: ['Relancer la même commande 10 fois.', 'Ignorer stderr et continuer.', 'Supprimer des fichiers au hasard.'],
      explanation: 'Le message d’erreur contient souvent la cause exacte.',
    },
    {
      question: 'Quelle habitude aide le plus à progresser vite ?',
      correct: 'Faire des itérations courtes: test, correction, re-test.',
      wrong: ['Écrire tout le code d’un coup sans tester.', 'Changer 20 choses à la fois.', 'Ne jamais vérifier le résultat.'],
      explanation: 'Les boucles courtes réduisent les erreurs et accélèrent l’apprentissage.',
    },
    {
      question: 'Face à un bug, quelle stratégie est la plus solide ?',
      correct: 'Isoler le problème avec un exemple minimal reproductible.',
      wrong: ['Réécrire tout le projet directement.', 'Modifier uniquement le CSS.', 'Désactiver les logs pour aller plus vite.'],
      explanation: 'Un cas minimal permet de trouver la cause racine.',
    },
    {
      question: 'Comment valider qu’une correction est fiable ?',
      correct: 'Comparer avant/après et vérifier le résultat attendu.',
      wrong: ['Se fier uniquement à l’intuition.', 'Éviter de re-tester par peur de casser.', 'Considérer que “ça doit marcher”.'],
      explanation: 'La validation explicite évite les faux positifs.',
    },
    {
      question: 'Quel comportement améliore le plus la compréhension ?',
      correct: 'Expliquer à voix haute ce que fait chaque étape.',
      wrong: ['Aller le plus vite possible sans réfléchir.', 'Ignorer les détails de syntaxe.', 'Faire confiance au hasard.'],
      explanation: 'L’explication active révèle les zones non comprises.',
    },
    {
      question: 'Que faire si une piste ne marche pas ?',
      correct: 'Revenir au dernier état stable et tester une nouvelle hypothèse.',
      wrong: ['Empiler des changements non liés.', 'Supprimer des dossiers système.', 'Arrêter le module directement.'],
      explanation: 'Revenir à un état stable permet de garder un diagnostic propre.',
    },
  ];

  const selected = shuffleArray(seeds).slice(0, QUIZ_QUESTION_COUNT);
  const questions: QuizQuestion[] = selected.map((seed) => {
    const options = shuffleArray([seed.correct, ...seed.wrong]);
    const answerIndex = options.findIndex((option) => option === seed.correct);
    return {
      question: seed.question,
      options,
      answerIndex,
      explanation: seed.explanation,
    };
  });

  return {
    questions,
    passScore: QUIZ_PASS_SCORE_DEFAULT,
  };
};

const applySyncedCourseUpdates = (base: Chapter[], updates: DesktopSyncCourseUpdate[] = []): Chapter[] => {
  if (!updates.length) return base;

  return base.map((chapter) => {
    const update = updates.find((item) => item.id === chapter.id);
    if (!update) return chapter;

    return {
      ...chapter,
      title: update.title || chapter.title,
      subtitle: update.subtitle || chapter.subtitle,
      duration: update.duration || chapter.duration,
      difficulty: update.difficulty || chapter.difficulty,
      theory: update.theory || chapter.theory,
    };
  });
};

const getProgressPercentage = (completedIds: string[], total: number): number => {
  if (total === 0) return 0;
  return Math.round((completedIds.length / total) * 100);
};

// ============================================
// COMPOSANT: HOMEPAGE (MEMOIZED) - DESIGN PROFESSIONNEL
// ============================================
interface HomePageProps {
  chapters: Chapter[];
  completedChapters: string[];
  onSelectChapter: (chapterId: string) => void;
  onNavigate?: (view: 'ollamaSetup' | 'appInstall') => void;
  announcement?: string;
  latestNews?: string[];
  privacyNotice?: string;
  lastSyncedAt?: number | null;
}

const HomePage = memo<HomePageProps>(({ chapters, completedChapters, onSelectChapter, onNavigate, announcement, latestNews = [], privacyNotice, lastSyncedAt }) => {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--td-bg-primary)]">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[var(--td-border-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="TutoDeCode" className="w-11 h-11" />
            <div>
              <h1 className="text-xl font-semibold text-[var(--td-text-primary)]">
                TutoDeCode Pro
              </h1>
              <p className="text-sm text-[var(--td-text-secondary)] mt-0.5">
                Plateforme d'apprentissage informatique complète
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => onNavigate?.('appInstall')}
              size="sm"
              className="bg-[var(--td-primary)] hover:bg-[var(--td-primary-hover)] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              App Desktop
            </Button>
            
            <Button
              onClick={() => onNavigate?.('ollamaSetup')}
              size="sm"
              variant="outline"
              className="border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)] hover:text-[var(--td-text-primary)]"
            >
              <Bot className="w-4 h-4 mr-2" />
              Configurer IA
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Courses Grid (3/4) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--td-primary)]" />
                Parcours informatiques
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-2 w-28 bg-[var(--td-border-subtle)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--td-primary)] transition-all"
                    style={{ width: `${(completedChapters.length / chapters.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[var(--td-text-secondary)]">
                  {completedChapters.length}/{chapters.length}
                </span>
              </div>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => {
                const isCompleted = completedChapters.includes(chapter.id);
                
                return (
                  <div
                    key={chapter.id}
                    onClick={() => onSelectChapter(chapter.id)}
                    className={cn(
                      "group relative bg-[var(--td-surface)] rounded-xl border transition-all duration-200 cursor-pointer p-5",
                      isCompleted 
                        ? "border-[var(--td-success)]/40 hover:border-[var(--td-success)]/60" 
                        : "border-[var(--td-border)] hover:border-[var(--td-primary)]/50 hover:bg-[var(--td-surface-hover)]"
                    )}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold",
                        isCompleted 
                          ? "bg-[var(--td-success-muted)] text-[var(--td-success)]" 
                          : "bg-[var(--td-primary-muted)] text-[var(--td-primary)]"
                      )}>
                        {chapter.order}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-[var(--td-success)]" />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-[var(--td-text-primary)] font-medium mb-2 group-hover:text-[var(--td-primary)] transition-colors">
                      {chapter.title}
                    </h3>
                    <p className="text-[var(--td-text-secondary)] text-sm mb-4 line-clamp-2">
                      {chapter.subtitle}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-[var(--td-text-secondary)]">
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          chapter.difficulty === 'beginner' && "bg-[var(--td-success-muted)] text-[var(--td-success)]",
                          chapter.difficulty === 'intermediate' && "bg-[var(--td-primary-muted)] text-[var(--td-primary)]",
                          chapter.difficulty === 'advanced' && "bg-[var(--td-warning)]/15 text-[var(--td-warning)]",
                          chapter.difficulty === 'expert' && "bg-[var(--td-error-muted)] text-[var(--td-error)]"
                        )}>
                          {chapter.difficulty === 'beginner' ? 'Débutant' : 
                           chapter.difficulty === 'intermediate' ? 'Intermédiaire' : 
                           chapter.difficulty === 'advanced' ? 'Avancé' : 'Expert'}
                        </span>
                        <span>{chapter.duration}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--td-text-tertiary)] group-hover:text-[var(--td-primary)] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar (1/4) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[var(--td-surface)] border border-[var(--td-border)] rounded-xl p-5">
              <h3 className="text-sm font-medium text-[var(--td-text-primary)] mb-4">
                Accès rapide
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => onNavigate?.('ollamaSetup')}
                  variant="outline"
                  className="w-full justify-start border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)]"
                >
                  <Bot className="w-4 h-4 mr-3 text-[var(--td-primary)]" />
                  Configuration IA locale
                </Button>
                
                <Button 
                  onClick={() => onNavigate?.('appInstall')}
                  variant="outline"
                  className="w-full justify-start border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)]"
                >
                  <Download className="w-4 h-4 mr-3 text-[var(--td-primary)]" />
                  Télécharger l'application
                </Button>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-[var(--td-surface)] border border-[var(--td-border)] rounded-xl p-5">
              <h3 className="text-sm font-medium text-[var(--td-text-primary)] mb-4">
                Votre progression
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[var(--td-text-primary)] mb-1">
                  {Math.round((completedChapters.length / chapters.length) * 100)}%
                </div>
                <p className="text-sm text-[var(--td-text-secondary)]">
                  {completedChapters.length} sur {chapters.length} cours
                </p>
              </div>

              <div className="h-2 bg-[var(--td-border-subtle)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--td-primary)] to-[var(--td-success)] transition-all"
                  style={{ width: `${(completedChapters.length / chapters.length) * 100}%` }}
                />
              </div>

              <p className="mt-4 text-center text-sm text-[var(--td-text-secondary)]">
                {completedChapters.length === chapters.length 
                  ? 'Formation terminée !' 
                  : 'Continuez votre apprentissage'}
              </p>
            </div>

            {/* IA Info */}
            <div className="bg-[var(--td-primary-muted)] border border-[var(--td-primary)]/20 rounded-xl p-5">
              <h3 className="text-sm font-medium text-[var(--td-primary)] mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                IA Locale disponible
              </h3>
              <p className="text-sm text-[var(--td-text-secondary)] leading-relaxed">
                Utilisez l'IA locale en complément pour générer des exercices personnalisés sur tous les domaines IT.
              </p>
              <Button 
                onClick={() => onNavigate?.('ollamaSetup')}
                size="sm"
                className="w-full mt-4 bg-[var(--td-primary)] hover:bg-[var(--td-primary-hover)] text-white"
              >
                Configurer maintenant
              </Button>
            </div>

            {(announcement || latestNews.length > 0 || privacyNotice) && (
              <div className="bg-[var(--td-surface)] border border-[var(--td-border)] rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-medium text-[var(--td-text-primary)]">Mises à jour desktop</h3>
                {announcement && (
                  <p className="text-sm text-[var(--td-text-secondary)] leading-relaxed">{announcement}</p>
                )}
                {latestNews.length > 0 && (
                  <ul className="space-y-1.5">
                    {latestNews.map((news, index) => (
                      <li key={`${news}-${index}`} className="text-xs text-[var(--td-text-secondary)]">• {news}</li>
                    ))}
                  </ul>
                )}
                {lastSyncedAt && (
                  <p className="text-[11px] text-[var(--td-text-tertiary)]">
                    Dernière synchro: {new Date(lastSyncedAt).toLocaleString('fr-FR')}
                  </p>
                )}
                {privacyNotice && (
                  <div className="rounded-lg border border-[var(--td-border)] bg-[var(--td-bg-secondary)] p-3">
                    <p className="text-[11px] text-[var(--td-text-tertiary)]">{privacyNotice}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6 border-t border-[var(--td-border-subtle)] mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--td-text-secondary)]">
            © 2026 TutoDeCode. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[var(--td-text-secondary)] hover:text-[var(--td-text-primary)] transition-colors">GitHub</a>
            <a href="#" className="text-sm text-[var(--td-text-secondary)] hover:text-[var(--td-text-primary)] transition-colors">Discord</a>
            <a href="#" className="text-sm text-[var(--td-text-secondary)] hover:text-[var(--td-text-primary)] transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
});

HomePage.displayName = 'HomePage';

// ============================================
// COMPOSANT: SIDEBAR CHAPTER LIST (MEMOIZED)
// ============================================
interface ChapterListProps {
  chapters: Chapter[];
  currentChapterId: string;
  completedChapters: string[];
  onSelectChapter: (chapterId: string) => void;
}

const ChapterList = memo<ChapterListProps>(({
  chapters,
  currentChapterId,
  completedChapters,
  onSelectChapter
}) => {
  return (
    <div className="space-y-1">
      {chapters.map((chapter) => {
        const isCompleted = completedChapters.includes(chapter.id);
        const isCurrent = chapter.id === currentChapterId;
        const isLocked = chapter.isLocked && !isCompleted && !isCurrent;
        
        return (
          <button
            key={chapter.id}
            onClick={() => !isLocked && onSelectChapter(chapter.id)}
            disabled={isLocked}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
              isCurrent && "bg-[var(--td-primary-muted)] text-[var(--td-primary)]",
              !isCurrent && !isLocked && "hover:bg-[var(--td-surface-hover)] text-[var(--td-text-secondary)]",
              isLocked && "opacity-40 cursor-not-allowed text-[var(--td-text-tertiary)]"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0",
              isCompleted && "bg-[var(--td-success-muted)] text-[var(--td-success)]",
              isCurrent && !isCompleted && "bg-[var(--td-primary)] text-white",
              !isCompleted && !isCurrent && "bg-[var(--td-surface)] text-[var(--td-text-tertiary)]"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isLocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                chapter.order
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isCurrent ? "text-[var(--td-text-primary)]" : "text-[var(--td-text-secondary)] group-hover:text-[var(--td-text-primary)]"
              )}>
                {chapter.title}
              </p>
              <p className="text-xs text-[var(--td-text-tertiary)] truncate">
                {chapter.duration}
              </p>
            </div>
            
            {isCurrent && (
              <ChevronRight className="w-4 h-4 text-[var(--td-primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
});

ChapterList.displayName = 'ChapterList';

// ============================================
// COMPOSANT: TERMINAL PANEL (MEMOIZED)
// ============================================
interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOutput?: (output: TerminalOutput) => void;
}

const TerminalPanel = memo<TerminalPanelProps>(({ isOpen, onClose, onOutput }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current || !isOpen) return;

    let disposed = false;
    let term: import('@xterm/xterm').Terminal | null = null;
    let resizeHandler: (() => void) | null = null;

    const bootTerminal = async () => {
      const [{ Terminal: XTermTerminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);

      if (disposed || !terminalRef.current) return;

      term = new XTermTerminal({
        cursorBlink: true,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        theme: {
          background: '#0A0C12',
          foreground: '#F0F6FC',
          cursor: '#6366F1',
          black: '#0A0C12',
          red: '#EF4444',
          green: '#10B981',
          yellow: '#F59E0B',
          blue: '#6366F1',
          magenta: '#A855F7',
          cyan: '#06B6D4',
          white: '#F0F6FC',
        },
        scrollback: 10000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.focus();

      term.writeln('\x1b[1;34m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[1;34m║\x1b[0m  \x1b[1;36mTerminal TutoDeCode Pro\x1b[0m                              \x1b[1;34m║\x1b[0m');
      term.writeln('\x1b[1;34m║\x1b[0m  \x1b[90mTapez \x1b[33mhelp\x1b[90m pour les commandes disponibles\x1b[0m              \x1b[1;34m║\x1b[0m');
      term.writeln('\x1b[1;34m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
      term.writeln('');
      term.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');

      const handleCommand = (cmd: string, terminalInstance: import('@xterm/xterm').Terminal) => {
        const trimmed = cmd.trim();
        if (trimmed === 'help') {
          terminalInstance.writeln('\x1b[1;36mCommandes disponibles:\x1b[0m');
          terminalInstance.writeln('  \x1b[33mclear\x1b[0m      - Efface le terminal');
          terminalInstance.writeln('  \x1b[33mhelp\x1b[0m       - Affiche cette aide');
          terminalInstance.writeln('  \x1b[33mcheck\x1b[0m      - Vérifie votre solution');
          terminalInstance.writeln('  \x1b[33mhint\x1b[0m       - Demande un indice');
          terminalInstance.writeln('  \x1b[33mcargo\x1b[0m      - Commandes Cargo');
          onOutput?.({
            id: Date.now().toString(),
            type: 'system',
            content: 'Aide terminal affichée',
            timestamp: Date.now(),
          });
        } else if (trimmed === 'clear') {
          terminalInstance.clear();
        } else if (trimmed === 'check') {
          terminalInstance.writeln('\x1b[32m✅ Solution validée !\x1b[0m');
          onOutput?.({
            id: Date.now().toString(),
            type: 'output',
            content: 'Solution validée',
            timestamp: Date.now(),
          });
        } else if (trimmed === 'hint') {
          const hintMessage = '💡 Regardez attentivement le message d\'erreur...';
          terminalInstance.writeln(`\x1b[33m${hintMessage}\x1b[0m`);
          onOutput?.({
            id: Date.now().toString(),
            type: 'output',
            content: hintMessage,
            timestamp: Date.now(),
          });
        } else if (trimmed.startsWith('cargo')) {
          terminalInstance.writeln('\x1b[90m   Compiling tutodecode-app v0.1.0\x1b[0m');
          terminalInstance.writeln('\x1b[90m    Finished dev [unoptimized + debuginfo] target(s) in 2.34s\x1b[0m');
          onOutput?.({
            id: Date.now().toString(),
            type: 'output',
            content: 'cargo check terminé sans erreur',
            timestamp: Date.now(),
          });
        } else if (trimmed) {
          terminalInstance.writeln(`\x1b[31mCommande non trouvée: ${trimmed}\x1b[0m`);
          onOutput?.({
            id: Date.now().toString(),
            type: 'error',
            content: `Commande non trouvée: ${trimmed}`,
            timestamp: Date.now(),
          });
        }

        terminalInstance.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');
      };

      let currentLine = '';
      term.onData((data: string) => {
        const code = data.charCodeAt(0);

        if (code === 13) {
          term?.writeln('');
          if (term) handleCommand(currentLine, term);
          currentLine = '';
        } else if (code === 127) {
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term?.write('\b \b');
          }
        } else if (code >= 32 && code < 127) {
          currentLine += data;
          term?.write(data);
        }
      });

      resizeHandler = () => fitAddon.fit();
      window.addEventListener('resize', resizeHandler);
    };

    void bootTerminal();

    return () => {
      disposed = true;
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      term?.dispose();
    };
  }, [isOpen, onOutput]);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 bg-[var(--td-bg-primary)] border-t border-[var(--td-border)] z-40 transition-all duration-300 flex flex-col",
      isMaximized ? "top-0" : "h-80"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--td-surface)] border-b border-[var(--td-border)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--td-primary)]" />
          <span className="text-sm font-medium text-[var(--td-text-primary)]">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 p-2 min-h-0">
        <div ref={terminalRef} className="w-full h-full" />
      </div>
    </div>
  );
});

TerminalPanel.displayName = 'TerminalPanel';

// ============================================
// COMPOSANT PRINCIPAL: APP
// ============================================
type AppView = 'home' | 'course' | 'ollamaSetup' | 'courseCreator' | 'appInstall';

const App: React.FC = () => {
  const userId = 'default_user';

  // État
  const [curriculum, setCurriculum] = useState<Chapter[]>(defaultCurriculum);
  const [currentChapterId, setCurrentChapterId] = useState<string>(defaultCurriculum[0]?.id || 'linux-basics');
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOutputs, setTerminalOutputs] = useState<TerminalOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHomePage, setShowHomePage] = useState(true);
  const [labWorkspace, setLabWorkspace] = useState<CourseLabWorkspace | null>(null);
  const [activeTicket, setActiveTicket] = useState<CourseTicket | null>(null);
  const [ticketSolution, setTicketSolution] = useState('');
  const [ticketHelpRequest, setTicketHelpRequest] = useState('');
  const [ticketHelpAnswer, setTicketHelpAnswer] = useState('');
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [quizPayload, setQuizPayload] = useState<QuizPayload | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [finishClickLockedByChapter, setFinishClickLockedByChapter] = useState<Record<string, boolean>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const [desktopAnnouncement, setDesktopAnnouncement] = useState<string>('');
  const [desktopNews, setDesktopNews] = useState<string[]>([]);
  const [privacyNotice, setPrivacyNotice] = useState<string>('Aucune donnée personnelle n’est collectée pendant la synchronisation des contenus.');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [hasPromptedLabSetup, setHasPromptedLabSetup] = useState(false);
  const quizModeEnabled = true;
  
  // Nouvelles vues
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [ollamaModel, setOllamaModel] = useState<string>('');

  const canUseTauriInvoke = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const runtimeWindow = window as unknown as {
      __TAURI_INTERNALS__?: { invoke?: unknown };
      __TAURI__?: { invoke?: unknown };
    };
    return (
      typeof runtimeWindow.__TAURI_INTERNALS__?.invoke === 'function' ||
      typeof runtimeWindow.__TAURI__?.invoke === 'function'
    );
  }, []);

  const shouldShowMentor = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    return canUseTauriInvoke || isLocalhost;
  }, [canUseTauriInvoke]);

  const isWebDemoPreview = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') === '1';
  }, []);

  const getChapterById = useCallback((id: string): Chapter | undefined => {
    return curriculum.find((chapter) => chapter.id === id);
  }, [curriculum]);

  const applyDesktopSyncPayload = useCallback((payload: DesktopSyncPayload) => {
    if (payload.ui?.announcement) {
      setDesktopAnnouncement(payload.ui.announcement);
    }

    if (payload.ui?.latestNews && payload.ui.latestNews.length > 0) {
      setDesktopNews(payload.ui.latestNews.slice(0, 5));
    }

    if (payload.privacy?.message) {
      setPrivacyNotice(payload.privacy.message);
    } else if (payload.privacy?.collectsUserData === false) {
      setPrivacyNotice('Aucune donnée utilisateur n’est envoyée: seule la configuration publique des cours/interface est synchronisée.');
    }

    const updates = payload.courses?.updates || [];
    if (updates.length > 0) {
      setCurriculum((prev) => applySyncedCourseUpdates(prev, updates));
    }

    setLastSyncedAt(Date.now());
  }, []);

  const getMainScrollContainer = useCallback((): HTMLElement | null => {
    const host = mainContentRef.current;
    if (!host) return null;

    const candidates = Array.from(
      host.querySelectorAll<HTMLElement>('[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto')
    );

    const visibleScrollable = candidates
      .filter((element) => {
        if (element.scrollHeight <= element.clientHeight + 4) return false;
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;
        if (overflowY !== 'auto' && overflowY !== 'scroll') return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .sort((a, b) => b.clientHeight - a.clientHeight);

    return visibleScrollable[0] || null;
  }, []);

  const scrollMainToTop = useCallback(() => {
    const container = getMainScrollContainer();
    if (!container) return;
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }, [getMainScrollContainer]);

  const scrollMainBy = useCallback((delta: number) => {
    const container = getMainScrollContainer();
    if (!container) return;
    container.scrollBy({ top: delta, behavior: 'smooth' });
  }, [getMainScrollContainer]);

  const openInstallerFromDemo = useCallback(() => {
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
  }, []);

  const loadWorkspaceConfig = useCallback(async (): Promise<CourseLabWorkspace | null> => {
    if (!canUseTauriInvoke) return null;
    try {
      const res = await invoke<BackendResult<CourseLabWorkspace>>('get_course_lab_workspace', {
        userId,
      });
      if (res.success && res.data) {
        setLabWorkspace(res.data);
        return res.data;
      }
    } catch {
      // No-op: first launch expected
    }
    return null;
  }, [canUseTauriInvoke, userId]);

  useEffect(() => {
    if (!canUseTauriInvoke) return;

    const cacheRaw = localStorage.getItem(DESKTOP_SYNC_CACHE_KEY);
    if (cacheRaw) {
      try {
        const parsed = JSON.parse(cacheRaw) as { timestamp: number; payload: DesktopSyncPayload };
        applyDesktopSyncPayload(parsed.payload);

        if (Date.now() - parsed.timestamp < DESKTOP_SYNC_TTL_MS) {
          return;
        }
      } catch {
        // ignore invalid cache
      }
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(DESKTOP_SYNC_URL, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return (await response.json()) as DesktopSyncPayload;
      })
      .then((payload) => {
        applyDesktopSyncPayload(payload);
        localStorage.setItem(
          DESKTOP_SYNC_CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            payload,
          })
        );
      })
      .catch(() => {
        // fallback local; no-op
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [canUseTauriInvoke, applyDesktopSyncPayload]);

  const ensureLabWorkspace = useCallback(async (options?: { showCancelToast?: boolean }): Promise<CourseLabWorkspace | null> => {
    if (!canUseTauriInvoke) {
      return null;
    }

    const showCancelToast = options?.showCancelToast ?? true;

    const existing = await loadWorkspaceConfig();
    if (existing) return existing;

    try {
      const selected = await pickDirectory({
        directory: true,
        multiple: false,
        title: 'Choisissez un dossier parent pour créer TutoDeCode_CourseLab',
      });

      if (!selected || Array.isArray(selected)) {
        if (showCancelToast) {
          toast.error('Sélection dossier annulée. Impossible de lancer la mise en situation.');
        }
        return null;
      }

      const configured = await invoke<BackendResult<CourseLabWorkspace>>('set_course_lab_workspace', {
        userId,
        rootDir: selected,
      });

      if (!configured.success || !configured.data) {
        toast.error(configured.error || 'Impossible de configurer le dossier de lab.');
        return null;
      }

      setLabWorkspace(configured.data);
      toast.success('Dossier de lab configuré', {
        description: configured.data.workspace_dir,
      });
      return configured.data;
    } catch (error) {
      toast.error(`Erreur configuration dossier lab: ${error}`);
      return null;
    }
  }, [canUseTauriInvoke, loadWorkspaceConfig, userId]);

  const chapterContextText = useCallback((chapter: Chapter | undefined): string => {
    if (!chapter) return '';
    return [
      chapter.theory,
      chapter.challenge?.description,
      chapter.challenge?.task,
      ...(chapter.challenge?.hints || []),
    ]
      .filter(Boolean)
      .join('\n\n');
  }, []);

  const loadOpenTicketForChapter = useCallback(async (chapterId: string) => {
    if (!canUseTauriInvoke) return;

    try {
      const response = await invoke<BackendResult<CourseTicket[]>>('list_course_tickets', {
        userId,
      });

      if (!response.success || !response.data) {
        setActiveTicket(null);
        return;
      }

      const found = response.data.find((ticket) => ticket.chapter_id === chapterId && ticket.status !== 'resolved');
      setActiveTicket(found || null);
    } catch {
      setActiveTicket(null);
    }
  }, [canUseTauriInvoke, userId]);

  const createOrLoadTicketForChapter = useCallback(async (chapterId: string, chapterTitle: string, chapterContext?: string) => {
    try {
      const response = await invoke<BackendResult<CourseTicket>>('create_course_ticket', {
        userId,
        chapterId,
        chapterTitle,
        chapterContext,
      });

      if (!response.success || !response.data) {
        toast.error(response.error || 'Création du ticket impossible');
        return;
      }

      setActiveTicket(response.data);
      setIsTerminalOpen(true);
      toast.warning('🎫 Ticket de mise en situation', {
        description: response.data.alert_message,
        duration: 8000,
      });
    } catch (error) {
      toast.error(`Erreur ticket: ${error}`);
    }
  }, [userId]);

  // Chargement initial
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const result = await invoke<{
          success: boolean;
          data?: UserProgress;
          error?: string;
        }>('load_progress', { userId });

        if (result.success && result.data) {
          setCompletedChapters(result.data.completed_chapters);
          if (result.data.current_chapter && getChapterById(result.data.current_chapter)) {
            setCurrentChapterId(result.data.current_chapter);
          } else if (!result.data.current_chapter && curriculum[0]) {
            setCurrentChapterId(curriculum[0].id);
          }
        }
      } catch (e) {
        console.log('Pas de progression sauvegardée');
      } finally {
        setIsLoading(false);
      }
    };

    if (canUseTauriInvoke) {
      loadWorkspaceConfig();
    }
    loadProgress();
  }, [canUseTauriInvoke, loadWorkspaceConfig, userId, getChapterById, curriculum]);

  useEffect(() => {
    if (!canUseTauriInvoke || isLoading || hasPromptedLabSetup) return;

    if (labWorkspace) {
      setHasPromptedLabSetup(true);
      return;
    }

    setHasPromptedLabSetup(true);
    toast.info('Configuration initiale du lab', {
      description: 'Choisissez le dossier de mise en situation pour les tickets pratiques.',
    });

    void ensureLabWorkspace({ showCancelToast: false });
  }, [canUseTauriInvoke, isLoading, hasPromptedLabSetup, labWorkspace, ensureLabWorkspace]);

  useEffect(() => {
    if (curriculum.length === 0) return;
    if (!curriculum.some((chapter) => chapter.id === currentChapterId)) {
      setCurrentChapterId(curriculum[0].id);
    }
  }, [curriculum, currentChapterId]);

  // Chapitre courant
  const currentChapter = useMemo(() => 
    getChapterById(currentChapterId),
    [currentChapterId, getChapterById]
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const bindScrollState = () => {
      const container = getMainScrollContainer();
      if (!container) {
        setShowBackToTop(false);
        return;
      }

      const onScroll = () => {
        setShowBackToTop(container.scrollTop > 180);
      };

      onScroll();
      container.addEventListener('scroll', onScroll, { passive: true });
      cleanup = () => container.removeEventListener('scroll', onScroll);
    };

    const rafId = requestAnimationFrame(bindScrollState);

    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [getMainScrollContainer, currentView, showHomePage, currentChapterId]);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const activeElement = event.target as HTMLElement | null;
      if (activeElement) {
        const tagName = activeElement.tagName;
        if (
          activeElement.isContentEditable ||
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT'
        ) {
          return;
        }
      }

      const container = getMainScrollContainer();
      if (!container) return;

      const lineStep = 56;
      const pageStep = Math.max(220, Math.round(container.clientHeight * 0.8));

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        scrollMainBy(lineStep);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        scrollMainBy(-lineStep);
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        scrollMainBy(event.shiftKey ? -pageStep : pageStep);
      }
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
    };
  }, [getMainScrollContainer, scrollMainBy]);

  // Progression globale
  const progressPercentage = useMemo(() => 
    getProgressPercentage(completedChapters, curriculum.length),
    [completedChapters, curriculum.length]
  );

  // ============================================
  // HANDLERS
  // ============================================
  const handleSelectChapter = useCallback(async (chapterId: string) => {
    if (quizModeEnabled) {
      setActiveTicket(null);
    }

    if (!canUseTauriInvoke) {
      setActiveTicket(null);
    }

    setCurrentChapterId(chapterId);
    setIsFocusMode(false);
    setShowHomePage(false);
    setCurrentView('course');

    requestAnimationFrame(() => {
      scrollMainToTop();
    });

    setTicketHelpAnswer('');

    if (canUseTauriInvoke && !quizModeEnabled) {
      await loadOpenTicketForChapter(chapterId);
    }
  }, [canUseTauriInvoke, loadOpenTicketForChapter, scrollMainToTop, quizModeEnabled]);

  const generateQuizForChapter = useCallback(async (chapter: Chapter) => {
    setIsGeneratingQuiz(true);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      let nextQuiz: QuizPayload | null = null;

      if (!isWebDemoPreview && canUseTauriInvoke) {
        const prompt = [
          'Génère un QCM amusant et aléatoire pour un apprenant débutant/intermédiaire.',
          'Format STRICT JSON uniquement, sans markdown, sans texte avant/après.',
          `Nombre de questions: ${QUIZ_QUESTION_COUNT}`,
          'Schéma:',
          '{"passScore":70,"questions":[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"explanation":"..."}]}',
          'Contraintes:',
          '- questions concrètes, pédagogiques, fun',
          '- 4 options par question',
          '- une seule bonne réponse',
          '- answerIndex basé sur index 0',
          `Module: ${chapter.title}`,
          `Contexte: ${chapterContextText(chapter)}`,
        ].join('\n');

        const response = await invoke<BackendResult<string>>('ask_local_ai_with_context', {
          prompt,
          sessionId: `quiz-${chapter.id}-${Date.now()}`,
          context: `Chapitre ${chapter.order}: ${chapter.title}`,
          conversation: [],
          modelOverride: ollamaModel || undefined,
        });

        if (response.success && response.data) {
          nextQuiz = parseAiQuizPayload(response.data);
        }
      }

      if (!nextQuiz) {
        nextQuiz = buildFallbackQuiz(chapter.title);
      }

      setQuizPayload(nextQuiz);
      toast.success('QCM généré', {
        description: 'Un nouveau QCM aléatoire est prêt.',
      });
    } catch (error) {
      console.error('Erreur génération QCM:', error);
      setQuizPayload(buildFallbackQuiz(chapter.title));
      toast.error('QCM IA indisponible, version locale générée.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [canUseTauriInvoke, chapterContextText, isWebDemoPreview, ollamaModel]);

  const handleFinishCourse = useCallback(async (chapterId: string) => {
    if (finishClickLockedByChapter[chapterId]) {
      toast.info('Validation déjà lancée pour ce module.');
      return;
    }

    setFinishClickLockedByChapter((prev) => ({
      ...prev,
      [chapterId]: true,
    }));

    const chapter = getChapterById(chapterId);
    if (!chapter) {
      toast.error('Cours introuvable pour générer le ticket.');
      return;
    }

    if (quizModeEnabled) {
      await generateQuizForChapter(chapter);
      return;
    }

    if (isWebDemoPreview) {
      const now = Date.now();
      setActiveTicket({
        id: `demo-${chapter.id}`,
        user_id: userId,
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        status: 'open',
        alert_message: 'Mode démo: ticket simulé pour aperçu visuel uniquement. Installez l’app desktop pour exécuter une vraie mission.',
        workspace_dir: 'C:/TutoDeCode_CourseLab (démo)',
        scenario_dir: 'C:/TutoDeCode_CourseLab/scenarios/demo-ticket',
        created_at: now,
        updated_at: now,
        last_validation: null,
      });
      toast.info('Mode démo web', {
        description: 'Aperçu créé. Pour une vraie exécution + validation, installez la version desktop.',
      });
      return;
    }

    if (!canUseTauriInvoke) {
      toast.error('La génération automatique de ticket est disponible dans l’app desktop.');
      return;
    }

    const workspace = await ensureLabWorkspace();
    if (!workspace) return;

    setIsGeneratingTicket(true);
    try {
      await createOrLoadTicketForChapter(chapter.id, chapter.title, chapterContextText(chapter));
      setTicketSolution('');
      setTicketHelpRequest('');
      setTicketHelpAnswer('');
    } finally {
      setIsGeneratingTicket(false);
    }
  }, [canUseTauriInvoke, ensureLabWorkspace, createOrLoadTicketForChapter, chapterContextText, isWebDemoPreview, userId, getChapterById, quizModeEnabled, generateQuizForChapter, finishClickLockedByChapter]);

  const requestTicketHelp = useCallback(async () => {
    if (!activeTicket || !currentChapter) return;

    const request = ticketHelpRequest.trim() || ticketSolution.trim();
    if (!request) {
      toast.error('Expliquez où vous bloquez pour recevoir une aide.');
      return;
    }

    if (isWebDemoPreview) {
      setTicketHelpAnswer(
        'Mode démo: aide illustrative uniquement. Pour une aide IA réelle sur vos fichiers de mission, installez l’app desktop.'
      );
      toast.info('Aide démo affichée.');
      return;
    }

    setIsRequestingHelp(true);
    try {
      const prompt = [
        'Tu es un mentor technique.',
        'Aide l\'utilisateur SANS donner la réponse finale ni le code final complet.',
        'Donne uniquement: 1) diagnostic, 2) piste de vérification, 3) prochaine étape actionnable.',
        `Cours: ${currentChapter.title}`,
        `Contexte: ${chapterContextText(currentChapter)}`,
        `Ticket: ${activeTicket.alert_message}`,
        `Blocage utilisateur: ${request}`,
      ].join('\n\n');

      const response = await invoke<BackendResult<string>>('ask_local_ai', { prompt });
      if (!response.success || !response.data) {
        toast.error(response.error || 'Aide IA indisponible pour le moment.');
        return;
      }

      setTicketHelpAnswer(response.data);
      toast.success('Aide IA générée (sans réponse finale).');
    } catch (error) {
      toast.error(`Erreur aide IA: ${error}`);
    } finally {
      setIsRequestingHelp(false);
    }
  }, [activeTicket, currentChapter, ticketHelpRequest, ticketSolution, chapterContextText, isWebDemoPreview]);

  const handleCompleteChapter = useCallback(async (chapterId: string) => {
    if (isWebDemoPreview) {
      toast.info('Mode démo', {
        description: 'La validation réelle des cours est disponible uniquement dans l’app desktop installée.',
      });
      return;
    }

    if (!completedChapters.includes(chapterId)) {
      const newCompleted = [...completedChapters, chapterId];
      setCompletedChapters(newCompleted);

      // Sauvegarde
      try {
        await invoke('save_progress', {
          userId,
          chapterId,
          completed: true
        });

        toast.success('Chapitre complété !', {
          description: 'Votre progression a été sauvegardée.',
        });
      } catch (e) {
        console.error('Erreur de sauvegarde:', e);
      }
    }
  }, [completedChapters, userId, isWebDemoPreview]);

  const submitQuiz = useCallback(async () => {
    if (!quizPayload || !currentChapter) return;

    const total = quizPayload.questions.length;
    const answered = Object.keys(quizAnswers).length;
    if (answered < total) {
      toast.error('Répondez à toutes les questions avant de valider.');
      return;
    }

    const correct = quizPayload.questions.reduce((count, question, questionIndex) => {
      return quizAnswers[questionIndex] === question.answerIndex ? count + 1 : count;
    }, 0);

    const score = Math.round((correct / total) * 100);
    const passScore = quizPayload.passScore ?? QUIZ_PASS_SCORE_DEFAULT;
    const passed = score >= passScore;

    setQuizResult({ score, total, passed, passScore });

    if (passed) {
      toast.success(`✅ QCM réussi (${score}%)`);
      await handleCompleteChapter(currentChapter.id);
    } else {
      toast.error(`❌ QCM non réussi (${score}%). Il faut ${passScore}% minimum.`);
    }
  }, [quizPayload, currentChapter, quizAnswers, handleCompleteChapter]);

  const handleNextChapter = useCallback(async () => {
    const current = getChapterById(currentChapterId);
    if (current) {
      const next = curriculum.find(ch => ch.order === current.order + 1);
      if (next) {
        setCurrentChapterId(next.id);
        setTicketSolution('');
        setTicketHelpRequest('');
        setTicketHelpAnswer('');
        if (canUseTauriInvoke && !quizModeEnabled) {
          await loadOpenTicketForChapter(next.id);
        } else {
          setActiveTicket(null);
        }
      }
    }
  }, [currentChapterId, canUseTauriInvoke, loadOpenTicketForChapter, quizModeEnabled]);

  const handlePreviousChapter = useCallback(async () => {
    const current = getChapterById(currentChapterId);
    if (current && current.order > 1) {
      const prev = curriculum.find(ch => ch.order === current.order - 1);
      if (prev) {
        setCurrentChapterId(prev.id);
        setTicketSolution('');
        setTicketHelpRequest('');
        setTicketHelpAnswer('');
        if (canUseTauriInvoke && !quizModeEnabled) {
          await loadOpenTicketForChapter(prev.id);
        } else {
          setActiveTicket(null);
        }
      }
    }
  }, [currentChapterId, canUseTauriInvoke, loadOpenTicketForChapter, quizModeEnabled]);

  useEffect(() => {
    if (!quizModeEnabled) return;
    if (currentView !== 'course') return;
    if (showHomePage) return;
    if (!currentChapter) return;
    void generateQuizForChapter(currentChapter);
  }, [quizModeEnabled, currentView, showHomePage, currentChapter, generateQuizForChapter]);

  const handleTerminalOutput = useCallback((output: TerminalOutput) => {
    setTerminalOutputs(prev => [...prev, output]);

    const text = typeof output.content === 'string' ? output.content : '';
    if (!text.includes('Solution validée')) {
      return;
    }

    const run = async () => {
      if (currentView !== 'course') {
        return;
      }

      try {
        if (activeTicket?.id && canUseTauriInvoke) {
          const resolved = await invoke<BackendResult<CourseTicket>>('resolve_course_ticket_from_terminal', {
            userId,
            ticketId: activeTicket.id,
          });

          if (resolved.success && resolved.data) {
            setActiveTicket(resolved.data);
          }
        }

        await handleCompleteChapter(currentChapterId);
      } catch (error) {
        console.error('Erreur validation terminal:', error);
      }
    };

    void run();
  }, [activeTicket, canUseTauriInvoke, currentChapterId, currentView, handleCompleteChapter, userId]);

  const submitTicketSolution = useCallback(async () => {
    if (!activeTicket) return;
    if (!ticketSolution.trim()) {
      toast.error('Décrivez votre correctif avant soumission.');
      return;
    }

    if (isWebDemoPreview) {
      toast.info('Aperçu uniquement', {
        description: 'La validation réelle des tickets et des cours est désactivée en mode démo web. Installez l’app desktop.',
      });
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const response = await invoke<BackendResult<TicketSubmitResult>>('submit_course_ticket_solution', {
        userId,
        ticketId: activeTicket.id,
        solution: ticketSolution,
        chapterContext: chapterContextText(currentChapter),
      });

      if (!response.success || !response.data) {
        toast.error(response.error || 'Validation ticket impossible');
        return;
      }

      setActiveTicket(response.data.ticket);
      const report = response.data.report;

      if (report.valid) {
        toast.success('✅ Ticket validé', {
          description: `${report.feedback} (score ${report.score}/100)`
        });
        handleCompleteChapter(activeTicket.chapter_id);
      } else {
        toast.error('❌ Ticket non validé', {
          description: `${report.feedback} (score ${report.score}/100)`
        });
      }

      if (response.data.generated_files && response.data.generated_files.length > 0) {
        toast.info('📁 Fichiers générés par l’IA', {
          description: `${response.data.generated_files.length} fichier(s) ajoutés dans le dossier de mission/submissions.`
        });
      }
    } catch (error) {
      toast.error(`Erreur soumission ticket: ${error}`);
    } finally {
      setIsSubmittingTicket(false);
    }
  }, [activeTicket, ticketSolution, userId, handleCompleteChapter, currentChapter, chapterContextText, isWebDemoPreview]);

  // ============================================
  // RENDU
  // ============================================
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[var(--td-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <img src="/logo.png" alt="TutoDeCode" className="w-full h-full" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--td-text-primary)]">
            TutoDeCode Pro
          </h1>
          <p className="text-sm text-[var(--td-text-secondary)] mt-2">
            Chargement...
          </p>
          <div className="mt-4 h-1 w-32 mx-auto bg-[var(--td-border-subtle)] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[var(--td-primary)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!canUseTauriInvoke && !isWebDemoPreview) {
    return (
      <div className="min-h-screen bg-[var(--td-bg-primary)]">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-[var(--td-primary)]/30 border-t-[var(--td-primary)] animate-spin" />
          </div>
        }>
          <AppInstall allowContinueWeb={false} />
        </Suspense>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--td-surface)',
              border: '1px solid var(--td-border)',
              color: 'var(--td-text-primary)',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[var(--td-bg-primary)] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "flex-shrink-0 bg-[var(--td-bg-secondary)] border-r border-[var(--td-border-subtle)] transition-all duration-300",
          sidebarOpen ? "w-72" : "w-16"
        )}
      >
        {/* Logo Header */}
        <div 
          onClick={() => { setShowHomePage(true); setCurrentView('home'); }}
          className="h-14 flex items-center px-4 border-b border-[var(--td-border-subtle)] cursor-pointer hover:bg-[var(--td-surface-hover)] transition-colors"
        >
          <img src="/logo.png" alt="TutoDeCode" className="w-8 h-8 flex-shrink-0" />
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <h1 className="font-semibold text-[var(--td-text-primary)] truncate">
                TutoDeCode
              </h1>
              <p className="text-xs text-[var(--td-text-tertiary)] truncate">
                Pro
              </p>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-16 w-6 h-6 bg-[var(--td-surface)] border border-[var(--td-border)] rounded-full flex items-center justify-center hover:bg-[var(--td-surface-hover)] z-10 transition-colors"
        >
          {sidebarOpen ? <X className="w-3 h-3 text-[var(--td-text-secondary)]" /> : <Menu className="w-3 h-3 text-[var(--td-text-secondary)]" />}
        </button>

        {/* Progress */}
        {sidebarOpen && (
          <div className="p-4 border-b border-[var(--td-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--td-text-tertiary)]">Progression</span>
              <span className="text-xs font-medium text-[var(--td-primary)]">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 bg-[var(--td-border-subtle)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--td-primary)] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-[var(--td-text-tertiary)] mt-2">
              {completedChapters.length} sur {curriculum.length} modules
            </p>
          </div>
        )}

        {/* Chapter List */}
        <ScrollArea className="flex-1 p-2">
          {showHomePage && currentView === 'home' ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <img src="/logo.png" alt="TutoDeCode" className="w-12 h-12 mb-4" />
              <h3 className="text-sm font-semibold text-[var(--td-text-primary)] mb-1">
                TutoDeCode Pro
              </h3>
              <p className="text-xs text-[var(--td-text-tertiary)] mb-6">
                Plateforme d'apprentissage
              </p>
              
              {/* Quick Nav Buttons */}
              <div className="w-full space-y-2 mb-6">
                <button
                  onClick={() => { setCurrentView('appInstall'); setShowHomePage(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--td-surface)]/70 text-left text-sm hover:bg-[var(--td-surface-hover)] transition-colors"
                >
                  <Download className="w-4 h-4 text-[var(--td-primary)]" />
                  <span className="text-[var(--td-text-secondary)]">App Desktop</span>
                </button>
                <button
                  onClick={() => { setCurrentView('ollamaSetup'); setShowHomePage(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--td-surface)]/70 text-left text-sm hover:bg-[var(--td-surface-hover)] transition-colors"
                >
                  <Bot className="w-4 h-4 text-[var(--td-primary)]" />
                  <span className="text-[var(--td-text-secondary)]">IA Locale</span>
                </button>
              </div>
              
              <div className="pt-4 border-t border-[var(--td-border-subtle)] w-full">
                <p className="text-xs text-[var(--td-text-tertiary)] mb-2">Progression</p>
                <div className="h-1.5 bg-[var(--td-border-subtle)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--td-primary)]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--td-text-secondary)] font-medium mt-2">
                  {completedChapters.length}/{curriculum.length}
                </p>
              </div>
            </div>
          ) : sidebarOpen ? (
            <ChapterList
              chapters={curriculum}
              currentChapterId={currentChapterId}
              completedChapters={completedChapters}
              onSelectChapter={handleSelectChapter}
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              {curriculum.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch.id)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                    currentChapterId === ch.id && "bg-[var(--td-primary)] text-white",
                    completedChapters.includes(ch.id) && currentChapterId !== ch.id && "bg-[var(--td-success-muted)] text-[var(--td-success)]",
                    !completedChapters.includes(ch.id) && currentChapterId !== ch.id && "bg-[var(--td-surface)] text-[var(--td-text-tertiary)] hover:bg-[var(--td-surface-hover)] hover:text-[var(--td-text-primary)]"
                  )}
                >
                  {ch.order}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-[var(--td-border-subtle)] space-y-2">
            <Button 
              variant={showHomePage ? "default" : "outline"}
              className={cn(
                "w-full",
                showHomePage 
                  ? "bg-[var(--td-primary)] hover:bg-[var(--td-primary-hover)] text-white" 
                  : "border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)]"
              )}
              onClick={() => { setShowHomePage(true); setCurrentView('home'); }}
            >
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
            {isWebDemoPreview ? (
              <Button
                variant="outline"
                className="w-full border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)]"
                onClick={openInstallerFromDemo}
              >
                <Download className="w-4 h-4 mr-2" />
                Installer pour tester en réel
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)]"
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              >
                <Terminal className="w-4 h-4 mr-2" />
                Terminal
              </Button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {isWebDemoPreview && (
          <div className="px-6 py-2 border-b border-[var(--td-border)] bg-[var(--td-primary-muted)] text-[var(--td-primary)] text-xs flex items-center justify-between gap-3">
            <span>Mode démo web: aperçu de l’interface uniquement. Les validations, fichiers de mission et progression réelle sont disponibles dans l’app desktop.</span>
            <Button size="sm" className="bg-[var(--td-primary)] hover:bg-[var(--td-primary-hover)] text-white" onClick={openInstallerFromDemo}>
              <Download className="w-4 h-4 mr-1.5" />
              Installer MSI
            </Button>
          </div>
        )}
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--td-border-subtle)] bg-[var(--td-bg-secondary)]">
          <div className="flex items-center gap-4">
            {showHomePage ? (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--td-primary)]" />
                <span className="text-sm text-[var(--td-text-secondary)]">
                  Choisissez un module pour commencer
                </span>
              </div>
            ) : (
              <>
                <Badge className="bg-[var(--td-primary-muted)] text-[var(--td-primary)] border-0">
                  Module {currentChapter?.order}
                </Badge>
                <span className="text-sm text-[var(--td-text-tertiary)]">
                  {currentChapter?.duration}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!showHomePage && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--td-text-secondary)] hover:text-[var(--td-text-primary)]"
                onClick={() => { setShowHomePage(true); setCurrentView('home'); }}
              >
                <ChevronRight className="w-4 h-4 mr-1.5 rotate-180" />
                Retour
              </Button>
            )}
            {!showHomePage && currentView === 'course' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--td-text-secondary)] hover:text-[var(--td-text-primary)]"
                onClick={() => setIsFocusMode(!isFocusMode)}
              >
                {isFocusMode ? <Minimize2 className="w-4 h-4 mr-1.5" /> : <Maximize2 className="w-4 h-4 mr-1.5" />}
                {isFocusMode ? 'Quitter' : 'Mode focus'}
              </Button>
            )}
          </div>
        </header>

        {currentView === 'course' && quizModeEnabled && currentChapter && (
          <div className="px-4 py-3 border-b border-[var(--td-border-subtle)] bg-[var(--td-primary)]/5">
            <div className="rounded-lg border border-[var(--td-border)] bg-[var(--td-surface)] p-3">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <Sparkles className="w-4 h-4 mt-0.5 text-[var(--td-primary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--td-text-primary)]">
                      QCM IA aléatoire · {currentChapter.title}
                    </p>
                    <p className="text-xs text-[var(--td-text-secondary)] mt-0.5">
                      Nouveau quiz à chaque génération. Score minimum: {quizPayload?.passScore ?? QUIZ_PASS_SCORE_DEFAULT}%.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-[var(--td-border)]"
                  onClick={() => void generateQuizForChapter(currentChapter)}
                  disabled={isGeneratingQuiz}
                >
                  {isGeneratingQuiz ? 'Génération IA...' : 'Nouveau QCM aléatoire'}
                </Button>
              </div>

              {quizPayload && (
                <div className="mt-3 space-y-3">
                  {quizPayload.questions.map((question, questionIndex) => (
                    <div key={`${questionIndex}-${question.question.slice(0, 20)}`} className="rounded-lg border border-[var(--td-border)] bg-[var(--td-bg-primary)] p-3">
                      <p className="text-sm font-medium text-[var(--td-text-primary)] mb-2">
                        Q{questionIndex + 1}. {question.question}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {question.options.map((option, optionIndex) => {
                          const selected = quizAnswers[questionIndex] === optionIndex;
                          const showingResult = Boolean(quizResult);
                          const isCorrect = question.answerIndex === optionIndex;

                          let toneClass = 'border-[var(--td-border)] text-[var(--td-text-secondary)] hover:bg-[var(--td-surface-hover)]';
                          if (selected) {
                            toneClass = 'border-[var(--td-primary)] text-[var(--td-text-primary)] bg-[var(--td-primary)]/10';
                          }
                          if (showingResult && isCorrect) {
                            toneClass = 'border-[var(--td-success)] text-[var(--td-success)] bg-[var(--td-success-muted)]';
                          }

                          return (
                            <button
                              key={`${questionIndex}-${optionIndex}`}
                              type="button"
                              className={cn('rounded-md border px-3 py-2 text-left text-xs transition-colors', toneClass)}
                              onClick={() => {
                                if (quizResult) return;
                                setQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
                              }}
                            >
                              <span className="font-mono mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {quizResult && question.explanation && (
                        <p className="text-xs text-[var(--td-text-tertiary)] mt-2">💡 {question.explanation}</p>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs text-[var(--td-text-tertiary)]">
                      Répondu: {Object.keys(quizAnswers).length}/{quizPayload.questions.length}
                    </p>
                    <Button
                      size="sm"
                      className="bg-[var(--td-primary)] hover:bg-[var(--td-primary-hover)]"
                      onClick={() => void submitQuiz()}
                      disabled={isGeneratingQuiz || Boolean(quizResult)}
                    >
                      Valider mon score
                    </Button>
                  </div>

                  {quizResult && (
                    <div className={cn(
                      'rounded-lg border p-3',
                      quizResult.passed
                        ? 'border-[var(--td-success)] bg-[var(--td-success-muted)]'
                        : 'border-amber-500/40 bg-amber-500/10'
                    )}>
                      <p className="text-sm font-medium text-[var(--td-text-primary)]">
                        {quizResult.passed ? '✅ Réussi' : '❌ Échoué'} · Score {quizResult.score}% ({quizResult.total} questions)
                      </p>
                      <p className="text-xs text-[var(--td-text-secondary)] mt-1">
                        Seuil requis: {quizResult.passScore}%. {quizResult.passed ? 'Chapitre validé.' : 'Relancez un nouveau QCM pour retenter.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'course' && !quizModeEnabled && activeTicket && activeTicket.status !== 'resolved' && (
          <div className="px-4 py-3 border-b border-[var(--td-border-subtle)] bg-amber-500/5">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <BellRing className="w-4 h-4 mt-0.5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-[var(--td-text-primary)]">
                      Ticket en attente · {activeTicket.chapter_title}
                    </p>
                    <p className="text-xs text-[var(--td-text-secondary)] mt-0.5">
                      {activeTicket.alert_message} Exécutez la mission, puis cliquez sur « Je pense avoir fini ».
                    </p>
                    {labWorkspace?.workspace_dir && (
                      <p className="text-[10px] text-[var(--td-text-tertiary)] mt-1">
                        Workspace: {labWorkspace.workspace_dir}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                    onClick={async () => {
                      if (isWebDemoPreview) {
                        toast.info('Mode démo', {
                          description: 'L’ouverture de dossier local est disponible dans l’app desktop installée.',
                        });
                        return;
                      }

                      if (activeTicket.scenario_dir) {
                        try {
                          const result = await invoke<BackendResult<boolean>>('open_course_lab_path', {
                            path: activeTicket.scenario_dir,
                          });
                          if (!result.success) {
                            toast.error(result.error || 'Impossible d\'ouvrir le dossier de mission');
                          }
                        } catch {
                          toast.error('Impossible d\'ouvrir le dossier de mission');
                        }
                      }
                    }}
                  >
                    <FolderOpen className="w-4 h-4 mr-1.5" />
                    Ouvrir dossier mission
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <Textarea
                  placeholder="Je pense avoir fini: expliquez ce que vous avez fait et ce que vous avez vérifié"
                  value={ticketSolution}
                  onChange={(e) => setTicketSolution(e.target.value)}
                  className="min-h-[82px] bg-[var(--td-surface)] border-[var(--td-border)]"
                />
                <Textarea
                  placeholder="Si vous bloquez, décrivez précisément ce qui coince (pour aide IA sans réponse finale)"
                  value={ticketHelpRequest}
                  onChange={(e) => setTicketHelpRequest(e.target.value)}
                  className="min-h-[72px] bg-[var(--td-surface)] border-[var(--td-border)]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mr-2 border-[var(--td-border)]"
                    onClick={requestTicketHelp}
                    disabled={isRequestingHelp}
                  >
                    {isRequestingHelp ? 'Aide IA...' : 'Aide sans donner la réponse'}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[var(--td-primary)] hover:bg-[var(--td-primary-hover)]"
                    onClick={submitTicketSolution}
                    disabled={isSubmittingTicket || !ticketSolution.trim()}
                  >
                    {isSubmittingTicket ? 'Analyse IA + génération des fichiers...' : 'Je pense avoir fini'}
                  </Button>
                </div>

                {ticketHelpAnswer && (
                  <div className="rounded-lg border border-[var(--td-border)] bg-[var(--td-surface)] p-3">
                    <p className="text-xs font-medium text-[var(--td-text-primary)] mb-1">Aide IA (sans solution directe)</p>
                    <p className="text-xs whitespace-pre-wrap text-[var(--td-text-secondary)]">{ticketHelpAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div ref={mainContentRef} className="flex-1 min-h-0 relative overflow-hidden bg-[var(--td-bg-primary)]">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-8 h-8 border-2 border-[var(--td-primary)]/30 border-t-[var(--td-primary)] animate-spin" />
              <span className="text-xs text-[var(--td-text-tertiary)] font-mono uppercase tracking-widest">LOADING...</span>
            </div>
          }>
            {/* Home Page */}
            {showHomePage && currentView === 'home' && (
              <HomePage
                chapters={curriculum}
                completedChapters={completedChapters}
                onSelectChapter={handleSelectChapter}
                onNavigate={(view) => {
                  setCurrentView(view);
                  setShowHomePage(false);
                }}
                announcement={desktopAnnouncement}
                latestNews={desktopNews}
                privacyNotice={privacyNotice}
                lastSyncedAt={lastSyncedAt}
              />
            )}
            
            {/* Ollama Setup */}
            {currentView === 'ollamaSetup' && (
              <OllamaSetup
                onModelReady={(model) => {
                  setOllamaModel(model);
                  toast.success(`Connecté à ${model}`);
                }}
                onCreateCourse={() => {
                  setCurrentView('courseCreator');
                }}
              />
            )}
            
            {/* Course Creator with AI */}
            {currentView === 'courseCreator' && ollamaModel && (
              <CourseCreator
                model={ollamaModel}
                onBack={() => setCurrentView('ollamaSetup')}
              />
            )}
            
            {/* App Install */}
            {currentView === 'appInstall' && (
              <AppInstall
                onContinueWeb={() => {
                  setShowHomePage(true);
                  setCurrentView('home');
                }}
              />
            )}
            
            {/* Course Engine */}
            {currentView === 'course' && currentChapter && (
              <CourseEngine
                chapter={currentChapter}
                totalChapters={curriculum.length}
                onNext={handleNextChapter}
                onPrevious={handlePreviousChapter}
                onFinishCourse={handleFinishCourse}
                isCompleted={completedChapters.includes(currentChapter.id)}
                isFinishLocked={Boolean(finishClickLockedByChapter[currentChapter.id])}
                hasOpenTicket={quizModeEnabled ? false : Boolean(activeTicket && activeTicket.chapter_id === currentChapter.id && activeTicket.status !== 'resolved') || isGeneratingTicket}
              />
            )}
          </Suspense>
        </div>
      </main>

      {/* Terminal Panel */}
      <TerminalPanel
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onOutput={handleTerminalOutput}
      />

      {/* Agent Mentor */}
      {shouldShowMentor && (
        <Suspense fallback={null}>
          <AgentMentor
            terminalOutput={terminalOutputs}
            currentChapter={currentChapterId}
            className="fixed bottom-4 right-4 z-50"
          />
        </Suspense>
      )}

      {showBackToTop && (
        <Button
          size="icon"
          variant="outline"
          className="fixed right-4 bottom-24 z-40 border-[var(--td-border)] bg-[var(--td-surface)] text-[var(--td-text-primary)] hover:bg-[var(--td-surface-hover)]"
          onClick={scrollMainToTop}
          aria-label="Back to Top"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      )}

      {/* Toaster */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--td-surface)',
            border: '1px solid var(--td-border)',
            color: 'var(--td-text-primary)',
          },
        }}
      />
    </div>
  );
};

export default App;
