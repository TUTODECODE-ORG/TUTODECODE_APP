import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Clock, BookOpen, Star, CheckCircle, ChevronRight, Terminal, Zap, Bot, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeBlockComponent } from './CodeBlock';
import { InfoBoxComponent } from './InfoBox';
import { QuizComponent } from './Quiz';
import { CheatsheetComponent } from './Cheatsheet';
import { OfflineCourseButton } from './OfflineManager';
import { WebShell } from './WebShell';
import type { WebShellRef } from './WebShell';
import { CertificateCard } from './CertificateGenerator';
import { cn } from '@/lib/utils';
import type { Course } from '@/types';
import { watermarkElement } from '@/lib/watermark';

// System signature constants
const _S = { v: [116, 100, 99], c: 0x7DC, h: (n: number[]) => n.reduce((a, b) => a ^ b, 0) };

/**
 * Fonction pour convertir le markdown simple en HTML de manière sécurisée
 * Implémente une sanitisation stricte avant transformation.
 */
function parseMarkdown(text: string): string {
  if (!text) return '';

  // 1. Sanitisation initiale : On échappe TOUS les caractères HTML potentiellement dangereux
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };

  const escaped = text.replace(/[&<>"'\/]/g, (s) => escapeMap[s]);

  // 2. Transformation contrôlée : On applique nos règles Markdown sur le texte échappé
  return escaped
    // Gras : **texte** -> <strong>texte</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italique : *texte* -> <em>texte</em>
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>')
    // Code inline : `code` -> <code>code</code>
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-sm font-mono">$1</code>')
    // Liens : [texte](url) -> <a>texte</a> (Force target _blank, rel noopener/noreferrer/nofollow)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_match, label, url) => {
      const safeUrl = url.trim();
      // Vérification rigoureuse du protocole (évite javascript:, data: etc.)
      const isSafe = /^https?:\/\//i.test(safeUrl) || /^\//.test(safeUrl) || /^#/.test(safeUrl);

      if (!isSafe) {
        console.warn('Blocked potentially unsafe URL:', safeUrl);
        return label;
      }

      return `<a href="${safeUrl}" class="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`;
    })
    // Listes à puces (début de ligne)
    .replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Sauts de ligne
    .replace(/\n\n/g, '<div class="h-4"></div>') // Espace entre paragraphes
    .replace(/\n/g, '<br />');
}

interface CourseViewerProps {
  course: Course;
  isFavorite: boolean;
  isCompleted: boolean;
  progress: number;
  onBack: () => void;
  onFavoriteToggle: () => void;
  onCompleteToggle: () => void;
  onProgressUpdate: (progress: number) => void;
}

const levelLabels = {
  beginner: 'Clearance Level 1',
  intermediate: 'Clearance Level 2',
  advanced: 'Clearance Level 3',
  expert: 'Clearance Level 4',
} as const;

const levelColors = {
  beginner: 'bg-green-500/10 text-green-600',
  intermediate: 'bg-yellow-500/10 text-yellow-600',
  advanced: 'bg-red-500/10 text-red-600',
  expert: 'bg-purple-500/10 text-purple-500',
} as const;

interface LearningQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildQuestion(id: string, question: string, correctOption: string, distractors: string[]): LearningQuestion {
  const uniqueOptions = Array.from(new Set([correctOption, ...distractors])).slice(0, 4);
  while (uniqueOptions.length < 4) {
    uniqueOptions.push(`Option ${uniqueOptions.length + 1}`);
  }
  const options = shuffleArray(uniqueOptions);
  return {
    id,
    question,
    options,
    correctIndex: options.indexOf(correctOption),
  };
}

export function CourseViewer({
  course,
  isFavorite,
  isCompleted,
  progress,
  onBack,
  onFavoriteToggle,
  onCompleteToggle,
  onProgressUpdate,
}: CourseViewerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<Record<number, number>>({});
  const [showTerminal, setShowTerminal] = useState(false);
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [showMobileOutline, setShowMobileOutline] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<WebShellRef>(null);

  const safeContent = useMemo(() => {
    if (Array.isArray(course.content) && course.content.length > 0) {
      return course.content;
    }
    return [{
      id: 'placeholder',
      title: 'Contenu bientôt disponible',
      content: 'Ce cours est en cours de finalisation. Revenez dans quelques instants.',
      duration: 'N/A',
    }];
  }, [course.content]);

  const safeKeywords = useMemo(() => (
    Array.isArray(course.keywords) ? course.keywords : []
  ), [course.keywords]);

  const safeSectionCount = safeContent.length;
  const safeActiveSection = Math.min(activeSection, Math.max(safeSectionCount - 1, 0));
  const currentContent = safeContent[safeActiveSection];
  const unlockThreshold = 70;
  const finalQuestions = useMemo<LearningQuestion[]>(() => {
    const firstSection = safeContent[0];
    const lastSection = safeContent[safeContent.length - 1];
    const middleSection = safeContent[Math.floor((safeContent.length - 1) / 2)] || firstSection;
    const sectionTitles = safeContent.map((section) => section.title).filter(Boolean);

    const falseStatement = 'La validation exige obligatoirement 100% à chaque tentative';
    const trueStatements = [
      'La progression se fait section par section',
      'Le cours combine théorie et pratique',
      'La validation dépend d\'un questionnaire final',
    ];

    return [
      buildQuestion(
        `${course.id}-learn-1`,
        'Quel est l’objectif principal de ce cours ?',
        course.title,
        ['Découverte marketing', 'Gestion RH', 'Comptabilité']
      ),
      buildQuestion(
        `${course.id}-learn-2`,
        'Quel module ouvre le parcours ?',
        firstSection?.title || 'Module 1',
        [lastSection?.title || 'Module final', middleSection?.title || 'Support PDF', 'Annexe administrative']
      ),
      buildQuestion(
        `${course.id}-learn-3`,
        'Quelle affirmation est FAUSSE à propos de la validation ?',
        falseStatement,
        shuffleArray(trueStatements)
      ),
      buildQuestion(
        `${course.id}-learn-4`,
        'Quel score minimal est requis pour valider ce cours ?',
        `${Math.ceil(5 * 0.67)}/5`,
        ['1/5', '3/5', '5/5 obligatoire']
      ),
      buildQuestion(
        `${course.id}-learn-5`,
        'Quel module appartient réellement au plan du cours ?',
        lastSection?.title || 'Module final',
        [
          'Roadmap commerciale',
          'Plan comptable annuel',
          sectionTitles.find((title) => title !== (lastSection?.title || '')) || 'FAQ externe',
        ]
      ),
    ];
  }, [course.id, course.title, safeContent]);
  const [learningAnswers, setLearningAnswers] = useState<number[]>(() => Array(finalQuestions.length).fill(-1));
  const [learningSubmitted, setLearningSubmitted] = useState(false);
  const [learningScore, setLearningScore] = useState(0);
  const recommendedScore = Math.ceil(finalQuestions.length * 0.67);
  const isPlaceholderContent = safeContent.length === 1 && safeContent[0].id === 'placeholder';
  const safeLevelLabel = levelLabels[course.level as keyof typeof levelLabels] || 'Clearance Level';
  const safeLevelColor = levelColors[course.level as keyof typeof levelColors] || 'bg-slate-500/10 text-slate-300';
  const masteryGuide = useMemo(() => {
    const lines = (currentContent?.content || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    const keyIdeas = lines.slice(0, 3);
    const codeHint = currentContent?.codeBlocks?.[0]?.title || 'Exercice pratique';

    return {
      keyIdeas: keyIdeas.length > 0 ? keyIdeas : ['Identifiez les concepts centraux de cette section et reformulez-les avec vos mots.'],
      drills: [
        `Refaites le module ${currentContent?.title || 'actuel'} sans support puis expliquez chaque étape à voix haute.`,
        `Transformez ${codeHint} en variante personnelle avec un cas limite réel.`,
        'Rédigez un mini post-mortem: erreur commise, cause racine, correctif durable.'
      ]
    };
  }, [currentContent]);

  const estimatedDurationLabel = useMemo(() => {
    const sectionMinutes = safeContent.reduce((sum, section) => sum + parseDurationToMinutes(section.duration), 0);
    const quizMinutes = Math.max(5, Math.round(finalQuestions.length * 1.5));
    const reflectionMinutes = Math.max(10, Math.round(safeSectionCount * 2));
    const fallback = parseDurationToMinutes(course.duration);
    const total = sectionMinutes > 0 ? sectionMinutes + quizMinutes + reflectionMinutes : fallback;
    return total > 0 ? formatMinutes(total) : String(course.duration || 'N/A');
  }, [course.duration, finalQuestions.length, safeContent, safeSectionCount]);

  useEffect(() => {
    if (activeSection >= safeSectionCount) {
      setActiveSection(0);
    }
  }, [activeSection, safeSectionCount]);

  useEffect(() => {
    setLearningAnswers(Array(finalQuestions.length).fill(-1));
    setLearningSubmitted(false);
    setLearningScore(0);
  }, [course.id, finalQuestions.length]);

  // Sécurité: Memoization du rendu Markdown pour éviter des re-parsing inutiles
  const sanitizedHtml = useMemo(() => {
    const rawHtml = parseMarkdown(currentContent?.content ?? '');
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true }, // Only allow HTML
      ADD_ATTR: ['target', 'rel', 'class'], // Allow specific attributes needed for links/code
    });
  }, [currentContent]);

  const hasTerminal = course.title.toLowerCase().match(/linux|docker|git|bash|terminal/i);

  const handleScroll = useCallback(() => {
    if (!mainRef.current) return;
    const element = mainRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    const clampedPercent = Math.min(100, Math.max(0, scrollPercent));

    setReadingProgress(clampedPercent);

    setSectionProgress(prev => ({
      ...prev,
      [activeSection]: clampedPercent
    }));
  }, [activeSection]);

  const onProgressUpdateRef = useRef(onProgressUpdate);
  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressUpdate]);

  useEffect(() => {
    const totalSections = safeSectionCount;
    const completedSections = Object.keys(sectionProgress).filter(
      key => sectionProgress[parseInt(key)] >= 90
    ).length;

    const globalProgress = (completedSections / totalSections) * 100;
    onProgressUpdateRef.current(Math.round(globalProgress));
  }, [sectionProgress, safeSectionCount]);

  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;
    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Apply content watermark for copyright protection
  useEffect(() => {
    const element = mainRef.current;
    if (element && course?.id) {
      setTimeout(() => {
        watermarkElement(element);
        // System signature
        const sig = _S.h(_S.v) * _S.c;
        element.setAttribute('data-cs', sig.toString(36));
      }, 100);
    }
  }, [course?.id, activeSection]);

  const handleSectionChange = (index: number) => {
    const isUnlocked = index === 0 || isCompleted || (sectionProgress[index - 1] || 0) >= unlockThreshold;
    if (!isUnlocked) return;

    setActiveSection(index);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    const savedProgress = sectionProgress[index] || 0;
    setReadingProgress(savedProgress);
  };

  const handlePrevious = useCallback(() => {
    if (activeSection > 0) handleSectionChange(activeSection - 1);
  }, [activeSection]);

  const handleNext = useCallback(() => {
    if (safeActiveSection < safeSectionCount - 1) handleSectionChange(safeActiveSection + 1);
  }, [safeActiveSection, safeSectionCount]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrevious]);

  const canSubmitLearning = learningAnswers.every((answer) => answer >= 0);

  const handleLearningSubmit = () => {
    if (!canSubmitLearning) return;

    const score = finalQuestions.reduce((sum, question, idx) => (
      sum + (learningAnswers[idx] === question.correctIndex ? 1 : 0)
    ), 0);

    setLearningScore(score);
    setLearningSubmitted(true);

    onProgressUpdate(100);
    if (!isCompleted) {
      onCompleteToggle();
    }
  };

  const handleQuizComplete = (score: number) => {
    if (score >= 70) {
      onProgressUpdate(100);
      if (!isCompleted) onCompleteToggle();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[var(--td-bg-primary)] to-[var(--td-surface)] overflow-hidden relative z-0">
      {/* Header */}
      <header className="flex-shrink-0 bg-[var(--td-surface)] border-b border-[var(--td-border)] z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--td-text-tertiary)] mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-auto hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span>Cours</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words text-[var(--td-text-primary)]">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge className={safeLevelColor}>
                  {safeLevelLabel}
                </Badge>
                <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--td-text-tertiary)]">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  Durée estimée: {estimatedDurationLabel}
                </span>
                <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--td-text-tertiary)]">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  {course.chapters || safeSectionCount} chapitres
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {hasTerminal && (
                <Button
                  variant={showTerminal ? "default" : "outline"}
                  size="icon"
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  title="Ouvrir le Terminal Interactif"
                >
                  <Terminal className="h-4 w-4" />
                </Button>
              )}
              <OfflineCourseButton course={course} variant="icon" />
              <Button
                variant="outline"
                size="icon"
                onClick={onFavoriteToggle}
                className={cn(isFavorite && "text-yellow-500 border-yellow-500", "h-9 w-9 sm:h-10 sm:w-10")}
              >
                <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
              <Button
                variant="outline"
                onClick={onCompleteToggle}
                disabled={!isCompleted}
                className={cn("gap-2 h-9 sm:h-10 text-xs sm:text-sm", isCompleted && "text-green-500 border-green-500")}
              >
                <CheckCircle className={cn("h-4 w-4", isCompleted && "fill-current")} />
                <span className="hidden sm:inline">{isCompleted ? 'Complété' : 'Validation via questionnaire'}</span>
                <span className="sm:hidden">✓</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex-shrink-0 h-1 bg-[var(--td-surface-elevated)] w-full overflow-hidden">
        <svg width="100%" height="4" className="block">
          <rect x="0" y="0" width={`${readingProgress}%`} height="4" className="fill-blue-500 transition-all duration-100" />
        </svg>
      </div>

      {/* Navigation des sections */}
      <div className="flex-shrink-0 bg-[var(--td-surface)] border-b border-[var(--td-border)] z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
          <div className="flex gap-2 items-center min-w-max">
            {safeContent.map((section, index) => {
              const isSectionCompleted = sectionProgress[index] >= 90;
              const isSectionUnlocked = index === 0 || isCompleted || (sectionProgress[index - 1] || 0) >= unlockThreshold;
              return (
                <Button
                  key={section.id}
                  variant={safeActiveSection === index ? 'default' : 'outline'}
                  size="sm"
                  disabled={!isSectionUnlocked}
                  className={cn(
                    "flex-shrink-0 text-xs sm:text-sm transition-colors whitespace-nowrap",
                    isSectionCompleted && activeSection !== index && "border-green-500/50",
                    !isSectionUnlocked && "opacity-60 cursor-not-allowed",
                    safeActiveSection !== index && "bg-[var(--td-surface)] text-[var(--td-text-secondary)] border-[var(--td-border)]"
                  )}
                  onClick={() => handleSectionChange(index)}
                >
                  {!isSectionUnlocked && <Lock className="h-3 w-3 mr-1" />}
                  {isSectionCompleted && <CheckCircle className="h-3 w-3 mr-1 text-green-500 fill-current" />}
                  {index + 1}. {section.title}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone de contenu principale */}
      <div className="flex-1 flex overflow-hidden">
        <main ref={mainRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="lg:hidden rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--td-text-tertiary)]">Section en cours</p>
                  <p className="text-sm font-semibold text-[var(--td-text-primary)] truncate">
                    {safeActiveSection + 1}/{safeSectionCount} · {currentContent.title}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileOutline((prev) => !prev)}
                >
                  {showMobileOutline ? 'Masquer le plan' : 'Plan rapide'}
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Progress value={readingProgress} className="h-2 flex-1" aria-label="Progression de lecture" />
                <span className="text-xs text-[var(--td-text-tertiary)] w-10 text-right">{Math.round(readingProgress)}%</span>
              </div>

              {showMobileOutline && (
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                  {safeContent.map((sec, idx) => {
                    const isUnlocked = idx === 0 || isCompleted || (sectionProgress[idx - 1] || 0) >= unlockThreshold;
                    const isDone = sectionProgress[idx] >= 90;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSectionChange(idx)}
                        disabled={!isUnlocked}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded text-sm transition-colors truncate',
                          safeActiveSection === idx ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                          !isUnlocked && 'opacity-60 cursor-not-allowed'
                        )}
                      >
                        {!isUnlocked && <Lock className="h-3 w-3 mr-2 inline" />}
                        {isDone && <CheckCircle className="h-3 w-3 mr-2 inline text-green-500" />}
                        {idx + 1}. {sec.title}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevious} disabled={safeActiveSection === 0}>← Précédent</Button>
                <Button size="sm" onClick={handleNext} disabled={safeActiveSection === safeSectionCount - 1}>Suivant →</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (mainRef.current) mainRef.current.scrollTop = 0;
                  }}
                >
                  Revenir en haut
                </Button>
              </div>
              <p className="mt-2 text-xs text-[var(--td-text-tertiary)]">Astuce: Alt+← / Alt+→ pour naviguer rapidement.</p>
            </div>
            {isPlaceholderContent && (
              <div className="rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
                <h3 className="text-lg font-semibold text-[var(--td-text-primary)] mb-2">Cours en cours de publication</h3>
                <p className="text-sm text-[var(--td-text-secondary)]">
                  Ce cours sera utilisable très bientôt. Le plan est déjà affiché, et le contenu détaillé arrive dans la prochaine mise à jour.
                </p>
              </div>
            )}
            <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed prose-li:text-base sm:prose-li:text-lg">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--td-text-primary)]">
                {currentContent.title}
              </h2>

              <div
                className="whitespace-pre-wrap leading-relaxed sm:leading-loose text-[var(--td-text-secondary)]"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />

              {currentContent.infoBoxes?.map((infoBox, idx) => (
                <InfoBoxComponent key={`info-${idx}`} infoBox={infoBox} />
              ))}

              {currentContent.codeBlocks?.map((codeBlock) => (
                <CodeBlockComponent key={codeBlock.id} codeBlock={codeBlock} />
              ))}

              {currentContent.tables?.map((table, idx) => (
                <div key={`table-${idx}`} className="my-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        {table.headers.map((h, i) => <th key={i} className="border px-4 py-2 text-left font-semibold">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows?.map((row, ri) => (
                        <tr key={ri} className="hover:bg-muted/50">
                          {row.map((cell, ci) => <td key={ci} className="border px-4 py-2">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </article>

            <section className="rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--td-primary)]" />
                <h3 className="text-lg font-semibold text-[var(--td-text-primary)]">Mode Maîtrise · Approfondissement</h3>
              </div>
              <p className="text-sm text-[var(--td-text-secondary)]">
                Travaillez cette section comme un expert: comprendre, reformuler, appliquer, puis auditer vos propres décisions.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[var(--td-border)] p-3">
                  <h4 className="text-sm font-semibold mb-2">Idées à maîtriser</h4>
                  <ul className="space-y-2 text-sm text-[var(--td-text-secondary)]">
                    {masteryGuide.keyIdeas.map((idea, idx) => (
                      <li key={`idea-${idx}`} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--td-primary)]" />
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-[var(--td-border)] p-3">
                  <h4 className="text-sm font-semibold mb-2">Drills expert</h4>
                  <ul className="space-y-2 text-sm text-[var(--td-text-secondary)]">
                    {masteryGuide.drills.map((drill, idx) => (
                      <li key={`drill-${idx}`} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{drill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {showTerminal && hasTerminal && (
              <div className="my-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-500" aria-label="Terminal Icon" />
                    Terminal Interactif
                  </h3>
                  <Button
                    onClick={async () => {
                      if (!shellRef.current || isAutoSolving) return;
                      setIsAutoSolving(true);

                      const commands = course.title.toLowerCase().includes('docker')
                        ? ['docker ps', 'docker run nginx']
                        : ['ls -la', 'pwd', 'echo "Hello World" > test.txt', 'cat test.txt'];

                      for (const cmd of commands) {
                        await shellRef.current.typeAndExecuteCommand(cmd);
                        await new Promise(r => setTimeout(r, 800)); // Pause entre les commandes
                      }

                      setIsAutoSolving(false);
                    }}
                    disabled={isAutoSolving}
                    className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all data-[state=active]:animate-pulse"
                  >
                    {isAutoSolving ? <Bot className="w-4 h-4 animate-bounce text-yellow-300" /> : <Zap className="w-4 h-4 text-yellow-300" />}
                    {isAutoSolving ? "L'IA exécute la mission..." : "Auto-Solve avec l'Agent Phi-3.5"}
                  </Button>
                </div>

                <div className={cn("transition-all duration-500 rounded-xl p-[2px]", isAutoSolving ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "bg-transparent")}>
                  <WebShell
                    ref={shellRef}
                    validCommands={course.title.toLowerCase().includes('docker') ? ['docker ps', 'docker run'] : ['ls', 'cd']}
                  />
                </div>
              </div>
            )}

            {isCompleted && progress === 100 && <div className="my-12"><CertificateCard course={course} /></div>}

            {course.quiz && safeActiveSection === safeSectionCount - 1 && (
              <QuizComponent courseId={course.id} courseTitle={course.title} quizzes={course.quiz} onComplete={handleQuizComplete} />
            )}

            {course.cheatsheet && safeActiveSection === safeSectionCount - 1 && (
              <CheatsheetComponent items={course.cheatsheet} />
            )}

            <div className="my-8 rounded-xl border border-[var(--td-border)] bg-[var(--td-surface)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-[var(--td-primary)]" />
                <h3 className="text-lg font-semibold">Auto-évaluation de fin de cours</h3>
                <Badge variant="outline" className="ml-auto">Repère: {recommendedScore}/{finalQuestions.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Ce QCM sert à mesurer votre compréhension actuelle. Le score est un indicateur de progression, pas une finalité: l'objectif est d'identifier quoi renforcer ensuite.
              </p>

              <div className="space-y-4">
                {finalQuestions.map((question, qIndex) => (
                  <div key={question.id} className="rounded-lg border border-[var(--td-border)] p-3">
                    <p className="text-sm font-medium mb-2">{qIndex + 1}. {question.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {question.options.map((option, optionIndex) => {
                        const selected = learningAnswers[qIndex] === optionIndex;
                        const showResult = learningSubmitted;
                        const isCorrect = optionIndex === question.correctIndex;
                        const isWrongSelected = showResult && selected && !isCorrect;

                        return (
                          <button
                            key={`${question.id}-${optionIndex}`}
                            type="button"
                            onClick={() => {
                              setLearningAnswers((prev) => {
                                const next = [...prev];
                                next[qIndex] = optionIndex;
                                return next;
                              });
                              if (learningSubmitted) setLearningSubmitted(false);
                            }}
                            className={cn(
                              'text-left px-3 py-2 rounded-md border text-sm transition-colors',
                              selected ? 'border-[var(--td-primary)] bg-[var(--td-primary-muted)] text-foreground' : 'border-[var(--td-border)] hover:bg-muted text-muted-foreground',
                              showResult && isCorrect && 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
                              isWrongSelected && 'border-red-500/60 bg-red-500/10 text-red-300'
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button onClick={handleLearningSubmit} disabled={!canSubmitLearning}>Obtenir mon score</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLearningAnswers(Array(finalQuestions.length).fill(-1));
                    setLearningSubmitted(false);
                    setLearningScore(0);
                  }}
                >
                  Réinitialiser
                </Button>

                {learningSubmitted && (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      learningScore >= recommendedScore ? 'text-emerald-400' : learningScore >= Math.ceil(finalQuestions.length * 0.4) ? 'text-blue-300' : 'text-amber-300'
                    )}
                  >
                    Résultat: {learningScore}/{finalQuestions.length} · {learningScore >= recommendedScore ? 'maîtrise solide' : learningScore >= Math.ceil(finalQuestions.length * 0.4) ? 'bonne base, à renforcer' : 'base en construction'} · continuez la pratique.
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={safeActiveSection === 0}>← Précédent</Button>
              <Button onClick={handleNext} disabled={safeActiveSection === safeSectionCount - 1}>Suivant →</Button>
            </div>
          </div>
        </main>

        <aside className="hidden lg:block w-[300px] border-l border-[var(--td-border)] bg-[var(--td-surface)] overflow-y-auto relative z-0">
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Progression</h3>
              <Progress value={progress} className="h-2" aria-label="Progression de la mission" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complété</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-3">Table des matières</h3>
              <ScrollArea className="h-60 md:h-72">
                <nav className="space-y-1">
                  {safeContent.map((sec, idx) => (
                    (() => {
                      const isUnlocked = idx === 0 || isCompleted || (sectionProgress[idx - 1] || 0) >= unlockThreshold;
                      return (
                    <button
                      key={sec.id}
                      onClick={() => handleSectionChange(idx)}
                      disabled={!isUnlocked}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-sm transition-colors truncate block",
                        safeActiveSection === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        !isUnlocked && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {!isUnlocked ? '🔒 ' : ''}
                      {idx + 1}. {sec.title}
                    </button>
                      );
                    })()
                  ))}
                </nav>
              </ScrollArea>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-3">Mots-clés</h3>
              <div className="flex flex-wrap gap-2">
                {safeKeywords.slice(0, 10).map((kw) => (
                  <span key={kw} className="text-xs px-2 py-1 bg-muted rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function parseDurationToMinutes(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.toLowerCase().trim().replace(',', '.');

  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hourMatch) {
    const hours = Number(hourMatch[1]);
    return Number.isFinite(hours) ? Math.round(hours * 60) : 0;
  }

  const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*min/);
  if (minuteMatch) {
    const mins = Number(minuteMatch[1]);
    return Number.isFinite(mins) ? Math.round(mins) : 0;
  }

  const bareNumber = Number(normalized);
  if (!Number.isNaN(bareNumber)) {
    return bareNumber <= 12 ? Math.round(bareNumber * 60) : Math.round(bareNumber);
  }

  return 0;
}

function formatMinutes(mins: number): string {
  const safe = Math.max(0, Math.round(mins));
  const hours = Math.floor(safe / 60);
  const remaining = safe % 60;

  if (hours <= 0) return `${remaining} min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h${remaining.toString().padStart(2, '0')}`;
}