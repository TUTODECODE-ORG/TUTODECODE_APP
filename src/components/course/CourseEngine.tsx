// ============================================
// TutoDeCode Pro - CourseEngine
// Visualiseur de cours avec parsing Markdown et mode Focus
// ============================================

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  BookOpen, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Chapter } from '@/data/curriculum';

// ============================================
// TYPES
// ============================================
interface CourseEngineProps {
  chapter: Chapter;
  totalChapters: number;
  onFinishCourse?: (chapterId: string) => void;
  isCompleted?: boolean;
  hasOpenTicket?: boolean;
  isFinishLocked?: boolean;
  className?: string;
}

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

// ============================================
// PARSING MARKDOWN SIMPLIFIÉ
// ============================================
const parseMarkdown = (content: string): React.ReactNode[] => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let listItems: string[] = [];
  let inList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 my-4 ml-6">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[var(--td-text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--td-primary)] mt-2 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock 
            key={`code-${index}`} 
            code={codeContent.trim()} 
            language={codeLanguage} 
          />
        );
        codeContent = '';
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }

    // Headers
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${index}`} className="text-3xl font-bold text-[var(--td-text-primary)] mt-8 mb-4">
          {line.slice(2)}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${index}`} className="text-2xl font-semibold text-[var(--td-text-primary)] mt-8 mb-3">
          {line.slice(3)}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${index}`} className="text-xl font-medium text-[var(--td-text-primary)] mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
      return;
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      listItems.push(line.slice(2));
      return;
    }

    // Empty line ends list
    if (line.trim() === '' && inList) {
      flushList();
      return;
    }

    // Paragraph
    if (line.trim()) {
      flushList();
      elements.push(
        <p 
          key={`p-${index}`} 
          className="text-[var(--td-text-secondary)] leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: parseInline(line) }}
        />
      );
    }
  });

  flushList();
  return elements;
};

const parseInline = (text: string): string => {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[var(--td-surface)] rounded text-[var(--td-accent-ai)] font-mono text-sm">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--td-text-primary)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[var(--td-primary)] hover:underline" target="_blank" rel="noopener">$1</a>');
};

// ============================================
// CODE BLOCK AVEC COLORATION SYNTAXIQUE
// ============================================
const CodeBlock = memo<CodeBlockProps>(({ code, language, filename }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Coloration syntaxique basique
  const highlightCode = (code: string, lang: string): string => {
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (lang === 'rust') {
      highlighted = highlighted
        .replace(/\b(fn|let|mut|pub|use|struct|impl|trait|enum|match|if|else|return|async|await|const|static|type|where|for|while|loop|break|continue|move|ref|self|Self|super|crate|mod|pub|priv|unsafe|extern|as|dyn|static|union)\b/g, '<span class="text-[#FF7B72]">$1</span>')
        .replace(/\b(String|Vec|Option|Result|i32|i64|u32|u64|f32|f64|bool|char|str|Box|Rc|Arc|Cell|RefCell|Mutex|RwLock)\b/g, '<span class="text-[#79C0FF]">$1</span>')
        .replace(/\b(println!|format!|vec!|vec|Some|None|Ok|Err|Default|Clone|Copy|Debug|Display|Eq|PartialEq|Ord|PartialOrd|Hash|Send|Sync)\b/g, '<span class="text-[#D2A8FF]">$1</span>')
        .replace(/(".*?")/g, '<span class="text-[#A5D6FF]">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="text-[#8B949E]">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-[#8B949E]">$1</span>');
    } else if (lang === 'json') {
      highlighted = highlighted
        .replace(/(".*?")/g, '<span class="text-[#A5D6FF]">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="text-[#79C0FF]">$1</span>')
        .replace(/(-?\d+\.?\d*)/g, '<span class="text-[#79C0FF]">$1</span>');
    }

    return highlighted;
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-[var(--td-border)] bg-[#0D1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--td-surface)] border-b border-[var(--td-border)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--td-text-tertiary)] uppercase">
            {language}
          </span>
          {filename && (
            <>
              <span className="text-[var(--td-text-muted)]">|</span>
              <span className="text-xs text-[var(--td-text-secondary)] font-mono">
                {filename}
              </span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs"
        >
          {isCopied ? 'Copié !' : 'Copier'}
        </Button>
      </div>
      
      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code 
          className="font-mono text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
        />
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

// ============================================
// CHALLENGE TERMINAL
// ============================================
interface ChallengePanelProps {
  challenge: Chapter['challenge'];
}

const ChallengePanel = memo<ChallengePanelProps>(({ challenge }) => {
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  return (
    <div className="mt-8 p-6 rounded-xl border border-[var(--td-accent-ai)]/30 bg-[var(--td-accent-ai-muted)]">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-[var(--td-accent-ai)]" />
        <h3 className="text-lg font-semibold text-[var(--td-text-primary)]">
          Challenge guidé par IA
        </h3>
        <Badge className="ml-auto bg-[var(--td-accent-ai)]/20 text-[var(--td-accent-ai)]">
          Validation ticket
        </Badge>
      </div>

      <p className="text-[var(--td-text-secondary)] mb-4">
        {challenge.description}
      </p>

      <div className="p-4 rounded-lg bg-[var(--td-bg-secondary)] mb-4">
        <p className="text-sm text-[var(--td-text-tertiary)] uppercase tracking-wider mb-2">
          Votre mission
        </p>
        <p className="text-[var(--td-text-primary)]">
          {challenge.task}
        </p>
      </div>

      {/* Hints */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHints(!showHints)}
          className="text-[var(--td-accent-ai)]"
        >
          {showHints ? 'Masquer' : 'Afficher'} les indices ({challenge.hints.length})
        </Button>
        
        {showHints && (
          <div className="mt-3 space-y-2">
            {challenge.hints.slice(0, currentHint + 1).map((hint, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-[var(--td-bg-secondary)] border border-[var(--td-border)]"
              >
                <p className="text-sm text-[var(--td-text-secondary)]">
                  <span className="text-[var(--td-accent-ai)] font-medium">Indice {idx + 1}:</span>{' '}
                  {hint}
                </p>
              </div>
            ))}
            {currentHint < challenge.hints.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentHint(prev => prev + 1)}
                className="text-xs"
              >
                Indice suivant
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-[var(--td-border)] bg-[var(--td-bg-secondary)] p-4">
        <p className="text-sm text-[var(--td-text-secondary)]">
          Quand vous avez terminé, revenez au panneau ticket et cliquez sur <strong>"Dire à l’IA: j’ai terminé"</strong>. 
          Le terminal n'est pas obligatoire pour valider ce module.
        </p>
      </div>
    </div>
  );
});

ChallengePanel.displayName = 'ChallengePanel';

// ============================================
// QUIZ (QCM)
// ============================================
interface QuizPanelProps {
  quiz: { questions: { id: string; question: string; options: string[]; correctIndex: number }[] };
  onPass?: () => void;
}

const QuizPanel = memo<QuizPanelProps>(({ quiz, onPass }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qid: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = quiz.questions.every(q => answers[q.id] === q.correctIndex);
    if (correct) {
      onPass?.();
    }
  };

  return (
    <div className="mt-8 p-6 rounded-xl border border-[var(--td-border)] bg-[var(--td-bg-secondary)]">
      <h3 className="text-lg font-semibold text-[var(--td-text-primary)] mb-3">QCM</h3>
      <div className="space-y-4">
        {quiz.questions.map((q) => (
          <div key={q.id} className="p-3 rounded-md border border-[var(--td-border)]">
            <p className="text-sm font-medium text-[var(--td-text-primary)] mb-2">{q.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(q.id, i)}
                  className={cn(
                    'text-left p-2 rounded-md',
                    answers[q.id] === i ? 'bg-indigo-500/10 border border-indigo-500' : 'bg-transparent'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSubmit} className="btn-primary" disabled={submitted}>
          Valider le QCM
        </Button>
        {submitted && (
          <span className="text-sm text-[var(--td-text-secondary)]">{Object.keys(answers).length}/{quiz.questions.length} répondu(s)</span>
        )}
      </div>
    </div>
  );
});

QuizPanel.displayName = 'QuizPanel';

// ============================================
// COURSE ENGINE PRINCIPAL
// ============================================
export const CourseEngine = memo<CourseEngineProps>(({
  chapter,
  totalChapters,
  onFinishCourse,
  isCompleted = false,
  hasOpenTicket = false,
  isFinishLocked = false,
  className
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentTheoryPage, setCurrentTheoryPage] = useState(0);
  const [showCodeExample, setShowCodeExample] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const theoryPages = useMemo(() => {
    const raw = typeof chapter.theory === 'string' ? chapter.theory : '';
    const pages = raw
      .split('<!--PAGE_BREAK-->')
      .map((part) => part.trim())
      .filter(Boolean);

    const toPlainText = (value: string): string => value
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[>*_`~\[\]()\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const meaningfulPages = pages.filter((page) => {
      const plain = toPlainText(page);
      const words = plain.split(' ').filter(Boolean).length;
      const hasExplanationSentence = plain.length >= 140 && /[.!?]/.test(plain);
      return words >= 28 || hasExplanationSentence;
    });

    if (meaningfulPages.length > 0) {
      return meaningfulPages;
    }

    if (pages.length > 0) {
      return [pages[0]];
    }

    return [raw || 'Contenu indisponible.'];
  }, [chapter.theory]);

  useEffect(() => {
    setCurrentTheoryPage(0);
    setShowCodeExample(false);
  }, [chapter.id]);

  useEffect(() => {
    if (currentTheoryPage >= theoryPages.length) {
      setCurrentTheoryPage(Math.max(0, theoryPages.length - 1));
    }
  }, [currentTheoryPage, theoryPages.length]);

  // Calcul de la progression de lecture
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(Math.round(progress), 100));
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const parsedContent = parseMarkdown(theoryPages[currentTheoryPage] || chapter.theory);

  return (
    <div className={cn(
      "flex min-h-0 flex-col bg-[var(--td-bg-primary)] transition-all duration-300",
      isFocusMode ? "fixed inset-0 z-50" : "h-full",
      className
    )}>
      {/* Header sticky */}
      <header className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-[var(--td-border)]",
        "bg-[var(--td-surface)]/95 backdrop-blur-sm sticky top-0 z-10"
      )}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="shrink-0"
          >
            {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--td-text-tertiary)]">
                Chapitre {chapter.order}/{totalChapters}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {chapter.difficulty}
              </Badge>
            </div>
            <h1 className="text-lg font-semibold text-[var(--td-text-primary)]">
              {chapter.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progression globale */}
          <div className="hidden md:flex items-center gap-3 w-48">
            <Progress value={readingProgress} className="h-1.5 flex-1" />
            <span className="text-xs text-[var(--td-text-tertiary)] w-10">
              {readingProgress}%
            </span>
          </div>

          {isCompleted ? (
            <Button variant="outline" size="sm" className="text-[var(--td-success)]">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complété
            </Button>
          ) : (
            <Button
              size="sm"
              className="btn-primary"
              onClick={() => onFinishCourse?.(chapter.id)}
              disabled={hasOpenTicket || isFinishLocked}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {hasOpenTicket ? 'Ticket déjà généré' : isFinishLocked ? 'Validation déjà lancée' : 'J’ai fini le cours'}
            </Button>
          )}
        </div>
      </header>

      {/* Contenu */}
      <ScrollArea ref={contentRef} className="flex-1 min-h-0">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Titre et métadonnées */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--td-text-primary)] mb-2">
              {chapter.subtitle}
            </h2>
            <div className="flex items-center gap-4 text-sm text-[var(--td-text-tertiary)]">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {chapter.duration}
              </span>
            </div>
          </div>

          {/* Théorie */}
          {theoryPages.length > 1 && (
            <div className="mb-6 rounded-lg border border-[var(--td-border)] bg-[var(--td-surface)] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-[var(--td-text-secondary)]">
                Page {currentTheoryPage + 1}/{theoryPages.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTheoryPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentTheoryPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Page précédente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTheoryPage((prev) => Math.min(theoryPages.length - 1, prev + 1))}
                  disabled={currentTheoryPage >= theoryPages.length - 1}
                >
                  Page suivante
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          <article className="prose prose-invert max-w-none">
            {parsedContent}
          </article>

          {/* Exemple de code */}
          {chapter.codeExample && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-[var(--td-text-primary)]">
                  Exemple de Code
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCodeExample((prev) => !prev)}
                >
                  {showCodeExample ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showCodeExample ? 'Masquer' : 'Afficher'}
                </Button>
              </div>
              {showCodeExample && (
                <CodeBlock
                  code={chapter.codeExample.code}
                  language={chapter.codeExample.language}
                  filename={chapter.codeExample.filename}
                />
              )}
            </div>
          )}

          {/* QCM (si présent) */}
          {chapter.quiz && (
            <QuizPanel
              quiz={chapter.quiz}
              onPass={() => onFinishCourse?.(chapter.id)}
            />
          )}

          {/* Footer navigation */}
          <div className="mt-12 pt-8 border-t border-[var(--td-border)] flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
            {!isCompleted && (
              <Button
                className="btn-primary"
                onClick={() => onFinishCourse?.(chapter.id)}
                disabled={hasOpenTicket || isFinishLocked}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {hasOpenTicket ? 'Ticket déjà généré' : isFinishLocked ? 'Validation déjà lancée' : 'J’ai fini le cours'}
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Barre de progression persistante (en mode focus) */}
      {isFocusMode && (
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-[var(--td-border)]">
          <div 
            className="h-full bg-gradient-to-r from-[var(--td-primary)] to-[var(--td-accent-ai)] transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}
    </div>
  );
});

CourseEngine.displayName = 'CourseEngine';

export default CourseEngine;
