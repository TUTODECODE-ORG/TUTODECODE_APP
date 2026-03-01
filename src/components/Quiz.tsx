import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp,
  Trophy, Zap, Clock, Target, Award, TrendingUp, Brain,
  Flame, Star, BarChart3, Sparkles, Timer, Medal, Save, RotateCcw, Lock, FileText, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';
import { useQuizProgress } from '@/hooks/useQuizProgress';
import { useGamification } from '@/contexts/GamificationContext';

interface QuizProps {
  courseId: string;
  courseTitle?: string;
  quizzes: QuizQuestion[];
  onComplete?: (score: number) => void;
}

type GameMode = 'normal' | 'timed' | 'survival' | 'certification';
type PowerUp = 'fiftyFifty' | 'skip' | 'hint';

interface QuizStats {
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  maxStreak: number;
  totalPoints: number;
  timeBonus: number;
  averageTime: number;
  perfectAnswers: number;
}

const CONFETTI_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
const TIME_PER_QUESTION = 30;
const POINTS_PER_CORRECT = 100;
const STREAK_MULTIPLIER = 1.5;
const TIME_BONUS_THRESHOLD = 10;

export function QuizComponent({ courseId, courseTitle, quizzes, onComplete }: QuizProps) {
  const { addXp, unlockAchievement } = useGamification();
  // Hook de progression
  const {
    progress: savedProgress,
    isSaving,
    updateProgress,
    initializeProgress,
    completeQuiz,
    resetProgress,
    hasSavedProgress,
    getTimeSinceLastSave
  } = useQuizProgress(courseId);

  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [answerTimes, setAnswerTimes] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [powerUps, setPowerUps] = useState<Record<PowerUp, number>>({
    fiftyFifty: 2,
    skip: 1,
    hint: 3
  });
  const [removedOptions, setRemovedOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [, setCheatAttempts] = useState(0);
  const [stats, setStats] = useState<QuizStats>({
    correctAnswers: 0,
    wrongAnswers: 0,
    streak: 0,
    maxStreak: 0,
    totalPoints: 0,
    timeBonus: 0,
    averageTime: 0,
    perfectAnswers: 0
  });

  const timerRef = useRef<number | null>(null);

  const currentQuiz = quizzes[currentIndex];
  const selectedAnswer = selectedAnswers[currentQuiz.id];
  const isAnswered = selectedAnswer !== undefined;

  // VÃ©rifier s'il y a une progression sauvegardÃ©e au montage
  useEffect(() => {
    if (hasSavedProgress() && !gameMode) {
      setShowResumeDialog(true);
    }
  }, []);

  // Détection de triche stricte pour mode certification
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameMode === 'certification' && !showResults) {
        setCheatAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= 3) {
            finishQuiz();
            setStats(s => ({ ...s, correctAnswers: 0, streak: 0, totalPoints: 0, timeBonus: 0, perfectAnswers: 0 }));
          } else {
            alert(`⚠️ ALERTE INTÉGRITÉ (${newAttempts}/3) : Changement d'onglet détecté. Les évaluations professionnelles requièrent votre attention exclusive.`);
          }
          return newAttempts;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameMode, showResults]);

  // Sauvegarder automatiquement la progression
  useEffect(() => {
    if (gameMode && !showResults) {
      updateProgress({
        courseId,
        currentIndex,
        selectedAnswers,
        answerTimes,
        gameMode,
        stats,
        powerUps,
        lastUpdated: Date.now(),
        completed: false
      });
    }
  }, [currentIndex, selectedAnswers, answerTimes, stats, powerUps]);

  // Reprendre la progression sauvegardÃ©e
  const resumeSavedProgress = () => {
    if (savedProgress) {
      setGameMode(savedProgress.gameMode);
      setCurrentIndex(savedProgress.currentIndex);
      setSelectedAnswers(savedProgress.selectedAnswers);
      setAnswerTimes(savedProgress.answerTimes);
      setStats(savedProgress.stats);
      setPowerUps(savedProgress.powerUps);
    }
    setShowResumeDialog(false);
  };

  // DÃ©marrer un nouveau quiz
  const startNewQuiz = (mode: GameMode) => {
    resetProgress();
    setGameMode(mode);
    initializeProgress(mode);
    setShowResumeDialog(false);
  };

  useEffect(() => {
    if (gameMode === 'timed' && !isAnswered && !showResults) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return TIME_PER_QUESTION;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    }
  }, [gameMode, isAnswered, currentIndex, showResults]);

  useEffect(() => {
    setTimeLeft(TIME_PER_QUESTION);
    setQuestionStartTime(Date.now());
    setRemovedOptions([]);
    setShowHint(false);
  }, [currentIndex]);

  const handleTimeOut = () => {
    if (!isAnswered) {
      setStats(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
        streak: 0
      }));
      handleNext();
    }
  };

  const createConfetti = () => {
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: -10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  const calculatePoints = (timeTaken: number, isCorrect: boolean): number => {
    if (!isCorrect) return 0;

    let points = POINTS_PER_CORRECT;

    if (stats.streak > 0) {
      points *= Math.pow(STREAK_MULTIPLIER, Math.min(stats.streak, 5));
    }

    if (timeTaken < TIME_BONUS_THRESHOLD) {
      const timeBonus = Math.floor((TIME_BONUS_THRESHOLD - timeTaken) * 10);
      points += timeBonus;
      setStats(prev => ({ ...prev, timeBonus: prev.timeBonus + timeBonus }));
    }

    return Math.floor(points);
  };

  const handleAnswerSelect = (value: string) => {
    if (isAnswered || showResults) return;

    const answerIndex = parseInt(value);
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const correct = answerIndex === currentQuiz.correctAnswer;

    setSelectedAnswers(prev => ({ ...prev, [currentQuiz.id]: answerIndex }));
    setAnswerTimes(prev => ({ ...prev, [currentQuiz.id]: timeTaken }));

    if (correct) {
      if (gameMode !== 'certification') {
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
        createConfetti();
      }

      const points = calculatePoints(timeTaken, true);
      const newStreak = stats.streak + 1;
      const isPerfect = timeTaken < TIME_BONUS_THRESHOLD;

      setStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        totalPoints: prev.totalPoints + points,
        perfectAnswers: isPerfect ? prev.perfectAnswers + 1 : prev.perfectAnswers
      }));
    } else {
      if (gameMode !== 'certification') {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setStats(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
        streak: 0
      }));
    }

    if (gameMode === 'certification') {
      setTimeout(() => {
        if (currentIndex < quizzes.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          finishQuiz();
        }
      }, 500);
    }
  };

  const usePowerUp = (powerUp: PowerUp) => {
    if (powerUps[powerUp] <= 0 || isAnswered) return;

    setPowerUps(prev => ({ ...prev, [powerUp]: prev[powerUp] - 1 }));

    if (powerUp === 'fiftyFifty') {
      const incorrectOptions = (currentQuiz.options || [])
        .map((_, i) => i)
        .filter(i => i !== currentQuiz.correctAnswer);
      const toRemove = incorrectOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      setRemovedOptions(toRemove);
    } else if (powerUp === 'skip') {
      handleNext();
    } else if (powerUp === 'hint') {
      setShowHint(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
    const totalTime = Object.values(answerTimes).reduce((a, b) => a + b, 0);
    const avgTime = totalTime / quizzes.length;
    setStats(prev => ({ ...prev, averageTime: avgTime }));

    const finalScore = Math.round((stats.correctAnswers / quizzes.length) * 100);

    // Gamification Logic
    if (finalScore >= 70) {
      const xpEarned = Math.round(finalScore * 2);
      addXp(xpEarned, 'Quiz réussi');
      if (finalScore === 100) unlockAchievement('quiz_master');
      if (totalTime < 60) unlockAchievement('speed_demon');
    }

    onComplete?.(finalScore);

    // Marquer le quiz comme terminé dans la sauvegarde
    completeQuiz();

    if (finalScore === 100) {
      createConfetti();
    }
  };

  const resetQuiz = () => {
    setShowResults(false);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setAnswerTimes({});
    setTimeLeft(TIME_PER_QUESTION);
    setRemovedOptions([]);
    setShowHint(false);
    setPowerUps({
      fiftyFifty: 2,
      skip: 1,
      hint: 3
    });
    setStats({
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      maxStreak: 0,
      totalPoints: 0,
      timeBonus: 0,
      averageTime: 0,
      perfectAnswers: 0
    });
  };

  const toggleExplanation = () => {
    setShowExplanation(prev => ({
      ...prev,
      [currentQuiz.id]: !prev[currentQuiz.id]
    }));
  };

  const getScoreRank = (score: number): { label: string; icon: any; color: string } => {
    if (score === 100) return { label: 'LÃ‰GENDAIRE', icon: Trophy, color: 'text-yellow-500' };
    if (score >= 90) return { label: 'EXCELLENT', icon: Award, color: 'text-purple-500' };
    if (score >= 80) return { label: 'TRÃˆS BIEN', icon: Medal, color: 'text-blue-500' };
    if (score >= 70) return { label: 'BIEN', icon: Star, color: 'text-green-500' };
    if (score >= 60) return { label: 'PASSABLE', icon: Target, color: 'text-yellow-600' };
    return { label: 'Ã€ AMÃ‰LIORER', icon: TrendingUp, color: 'text-red-500' };
  };

  // Dialogue de reprise de progression
  if (showResumeDialog && savedProgress) {
    const progressPercent = Math.round((savedProgress.currentIndex / quizzes.length) * 100);

    return (
      <Card className="mt-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10" />
        <CardHeader className="relative">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Save className="h-6 w-6 text-green-500" />
            Progression sauvegardÃ©e dÃ©tectÃ©e !
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Vous avez une partie en cours qui a Ã©tÃ© sauvegardÃ©e {getTimeSinceLastSave()}
            </p>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-blue-500">{progressPercent}%</div>
                  <div className="text-xs text-muted-foreground">Progression</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{savedProgress.stats.correctAnswers}</div>
                  <div className="text-xs text-muted-foreground">Bonnes rÃ©ponses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">{savedProgress.stats.streak}</div>
                  <div className="text-xs text-muted-foreground">SÃ©rie actuelle</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">{savedProgress.stats.totalPoints}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>

              <Progress value={progressPercent} className="h-3" />

              <p className="text-xs text-muted-foreground">
                Question {savedProgress.currentIndex + 1} sur {quizzes.length} | Mode: {' '}
                {savedProgress.gameMode === 'normal' && 'Normal'}
                {savedProgress.gameMode === 'timed' && 'ChronomÃ©trÃ©'}
                {savedProgress.gameMode === 'survival' && 'Survie'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={resumeSavedProgress}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <RotateCcw className="h-5 w-5" />
              Reprendre la partie
            </Button>
            <Button
              onClick={() => setShowResumeDialog(false)}
              size="lg"
              variant="outline"
              className="w-full gap-2"
            >
              <Trophy className="h-5 w-5" />
              Commencer une nouvelle partie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gameMode) {
    return (
      <Card className="mt-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <CardHeader className="relative">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Brain className="h-6 w-6" />
            Choisissez votre mode de jeu
          </CardTitle>
          {isSaving && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
              <Save className="h-3 w-3 animate-pulse text-green-500" />
              Sauvegarde automatique...
            </div>
          )}
        </CardHeader>
        <CardContent className="relative space-y-4">
          <Button
            onClick={() => startNewQuiz('normal')}
            className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              <Target className="h-5 w-5" />
              Mode Normal
            </div>
            <p className="text-sm text-blue-100 font-normal">
              Prenez votre temps, rÃ©flÃ©chissez bien. Pas de limite de temps.
            </p>
          </Button>

          <Button
            onClick={() => setGameMode('timed')}
            className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              <Timer className="h-5 w-5" />
              Mode ChronomÃ©trÃ©
            </div>
            <p className="text-sm text-orange-100 font-normal">
              {TIME_PER_QUESTION} secondes par question ! Soyez rapide et prÃ©cis.
            </p>
          </Button>

          <Button
            onClick={() => setGameMode('survival')}
            className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              <Flame className="h-5 w-5" />
              Mode Survie
            </div>
            <p className="text-sm text-purple-100 font-normal">
              Une erreur = Game Over ! Maintenez votre sÃ©rie parfaite.
            </p>
          </Button>

          <Button
            onClick={() => startNewQuiz('certification')}
            className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Medal className="h-5 w-5 text-yellow-500" />
              Mode Certification Professionnelle
            </div>
            <p className="text-sm text-slate-400 font-normal">
              Environnement strict. Scénarios réels. Anti-triche activé. Résultat à la fin.
            </p>
          </Button>
        </CardContent>
      </Card >
    );
  }

  // Easter Egg Clue logic
  // Easter Egg Clue logic
  const getEasterEggClue = () => {
    const clues = [
      "Indice 1/6 : Ascension double vers le zénith.", // Up Up
      "Indice 2/6 : Chute double vers le nadir.",     // Down Down
      "Indice 3/6 : L'occident rencontre l'orient.",  // Left Right
      "Indice 4/6 : Le flux et le reflux se répètent.", // Left Right
      "Indice 5/6 : La seconde lettre précède la première, l'initiation inversée.", // B A
      "Indice 6/6 : Il suffit de taper la séquence dans le vide." // Start
    ];

    // Determine clue index based on total completed courses
    // This allows getting clues in order by completing different courses
    const completedCourses = JSON.parse(localStorage.getItem('completed') || '[]');
    const completedCount = completedCourses.length;

    // Cycle through clues if more courses than clues
    const index = Math.max(0, completedCount - 1) % clues.length;

    return clues[index];
  };

  // Pro Features Handlers
  const handleDownloadPDF = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport - ${courseTitle || 'Formation'}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: end; }
          .title { font-size: 28px; font-weight: 800; color: #1e293b; margin: 0; }
          .subtitle { color: #64748b; font-size: 14px; }
          .score-card { background: #f8fafc; padding: 30px; border-radius: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; border: 1px solid #e2e8f0; margin-bottom: 40px; }
          .metric { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .value { font-size: 36px; font-weight: 900; color: #3b82f6; line-height: 1.2; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-top: 5px; }
          .section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 10px; }
          .content { line-height: 1.6; color: #334155; font-size: 14px; margin-bottom: 30px; }
          .footer { margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
          .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Rapport de Compétences</h1>
            <div class="subtitle">Analyse IA & Performance Post-Evaluation</div>
          </div>
          <div class="badge">LICENCE PRO ACTIVE</div>
        </div>
        
        <div class="score-card">
          <div class="metric">
            <span class="value">${Math.round((stats.correctAnswers / quizzes.length) * 100)}%</span>
            <span class="label">Score Global</span>
          </div>
          <div class="metric">
            <span class="value">${stats.correctAnswers}/${quizzes.length}</span>
            <span class="label">Précision</span>
          </div>
          <div class="metric">
            <span class="value">${stats.averageTime.toFixed(1)}s</span>
            <span class="label">Vitesse Moyenne</span>
          </div>
           <div class="metric">
            <span class="value">${stats.maxStreak}</span>
            <span class="label">Série Max</span>
          </div>
        </div>
        
        <div class="section-title">Analyse du Module</div>
        <div class="content">
          <p><strong>Module :</strong> ${courseTitle || 'Ingénierie DevOps & Infrastructure'}</p>
          <p>Ce document atteste que l'apprenant a suivi et complété l'évaluation technique du module susmentionné.</p>
          <p>La performance indique une maîtrise ${stats.correctAnswers === quizzes.length ? 'parfaite' : 'solide'} des concepts abordés. L'analyse cognitive révèle une capacité d'assimilation ${stats.averageTime < 20 ? 'rapide' : 'réfléchie'} et une constance dans l'effort.</p>
        </div>

        <div class="section-title">Points d'Expérience</div>
        <div class="content">
          <p>XP Gagnés : <strong>${stats.totalPoints}</strong></p>
          <p>Bonus de Vitesse : <strong>${stats.timeBonus}</strong></p>
        </div>
        
        <div class="footer">
          Document généré certifié conforme par Security Lab Platform.<br>
          ${new Date().toLocaleDateString()} • ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleDownloadCertificate = () => {
    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificat - ${courseTitle || 'Formation'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;600&display=swap');
          body { margin: 0; padding: 0; background: #ccc; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Montserrat', sans-serif; }
          .certificate-container { width: 297mm; height: 210mm; background: #fff; position: relative; padding: 0; box-shadow: 0 0 20px rgba(0,0,0,0.5); overflow: hidden; background-image: radial-gradient(circle at 50% 50%, #fff 30%, #f7f7f7 100%); }
          .border-frame { position: absolute; top: 15mm; left: 15mm; right: 15mm; bottom: 15mm; border: 1px solid #c5a059; outline: 3px double #c5a059; outline-offset: 5px; }
          .content { position: relative; z-index: 10; text-align: center; padding-top: 35mm; }
          h1 { font-family: 'Cinzel', serif; font-size: 40pt; font-weight: 700; color: #1a1a1a; margin: 0; letter-spacing: 5px; text-transform: uppercase; }
          .subtitle { font-size: 14pt; letter-spacing: 4px; text-transform: uppercase; color: #c5a059; margin-top: 10px; font-weight: 600; }
          .presented-to { margin-top: 15mm; font-size: 12pt; color: #666; letter-spacing: 1px; text-transform: uppercase; }
          .name { font-family: 'Cinzel', serif; font-size: 36pt; color: #000; margin: 5mm 0 10mm; font-weight: 700; }
          .separator { width: 100px; height: 2px; background: #c5a059; margin: 0 auto; }
          .body-text { margin-top: 10mm; font-size: 14pt; color: #444; line-height: 1.5; max-width: 80%; margin-left: auto; margin-right: auto; }
          .course-title { font-weight: 700; color: #1a1a1a; font-size: 18pt; display: block; margin-top: 5px; }
          .footer { position: absolute; bottom: 25mm; left: 0; width: 100%; display: flex; justify-content: space-around; px: 20mm; }
          .signature-block { text-align: left; }
          .signature-line { width: 60mm; border-bottom: 1px solid #999; margin-bottom: 5px; font-family: 'Cinzel', serif; font-size: 14pt; color: #1a1a1a; }
          .signature-label { font-size: 10pt; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          .seal { position: absolute; bottom: 20mm; right: 25mm; width: 40mm; height: 40mm; border-radius: 50%; border: 2px solid #c5a059; color: #c5a059; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-weight: 700; font-size: 10pt; text-align: center; transform: rotate(-15deg); opacity: 0.8; }
          @media print { body { background: none; } .certificate-container { box-shadow: none; width: 100%; height: 100%; } }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="border-frame"></div>
          <div class="content">
            <h1>Certificat</h1>
            <div class="subtitle">d'accomplissement</div>
            <div class="presented-to">Ce document certifie que</div>
            <div class="name">Security Lab Graduate</div>
            <div class="separator"></div>
            <div class="body-text">
              A validé avec succès l'évaluation finale du module
              <span class="course-title">${courseTitle || 'Expertise Technique DevOps'}</span>
            </div>
          </div>
          <div class="footer">
            <div class="signature-block" style="margin-left: 30mm;">
              <div class="signature-line">${new Date().toLocaleDateString()}</div>
              <div class="signature-label">Date d'émission</div>
            </div>
            <div class="signature-block" style="margin-right: 30mm;">
              <div class="signature-line">Admin</div>
              <div class="signature-label">Directeur Pédagogique</div>
            </div>
          </div>
          <div class="seal">OFFICIAL<br>CERTIFIED<br>VALID</div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(certHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleShare = () => {
    const text = `J'ai obtenu ${Math.round((stats.correctAnswers / quizzes.length) * 100)}% sur ${courseTitle || 'ce module'} ! 🚀 #SecurityLab #DevOps`;
    if ((navigator as any).share) {
      (navigator as any).share({ title: 'Security Lab Score', text, url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard.writeText(text);
      alert('Message copié ! Partagez votre succès sur les réseaux.');
    }
  };

  if (showResults) {
    const score = Math.round((stats.correctAnswers / quizzes.length) * 100);
    const rank = getScoreRank(score);
    const RankIcon = rank.icon;

    return (
      <div className="mt-8 space-y-6 relative">
        <div className="fixed inset-0 pointer-events-none z-50">
          <svg className="w-full h-full">
            {confetti.map(c => (
              <rect
                key={c.id}
                x={`${c.x}%`}
                y={`${c.y}%`}
                width="8"
                height="8"
                fill={c.color}
                className="animate-[fall_3s_linear_forwards]"
                transform={`rotate(${c.rotation})`}
              />
            ))}
          </svg>
        </div>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
          <CardContent className="relative p-8 text-center">
            <RankIcon className={cn("h-20 w-20 mx-auto mb-4", rank.color)} />
            <h2 className={cn("text-3xl font-bold mb-2", rank.color)}>{rank.label}</h2>
            <div className="text-7xl font-black mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {score}%
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              {stats.correctAnswers} / {quizzes.length} questions correctes
            </p>
            <Progress value={score} className="h-3 mb-4" />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Points Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{stats.maxStreak}</div>
              <p className="text-sm text-muted-foreground">Meilleure SÃ©rie</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.averageTime.toFixed(1)}s</div>
              <p className="text-sm text-muted-foreground">Temps Moyen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{stats.perfectAnswers}</div>
              <p className="text-sm text-muted-foreground">RÃ©ponses Parfaites</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyse de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">RÃ©ponses Correctes</span>
                  <span className="text-sm text-green-500">{stats.correctAnswers}</span>
                </div>
                <Progress value={(stats.correctAnswers / quizzes.length) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">RÃ©ponses Incorrectes</span>
                  <span className="text-sm text-red-500">{stats.wrongAnswers}</span>
                </div>
                <Progress value={(stats.wrongAnswers / quizzes.length) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Bonus de Temps</span>
                  <span className="text-sm text-blue-500">+{stats.timeBonus} pts</span>
                </div>
                <Progress value={(stats.timeBonus / (POINTS_PER_CORRECT * quizzes.length)) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/10 mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <Sparkles className="h-5 w-5" />
              Indice Secret Débloqué !
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono text-yellow-200">
              {getEasterEggClue()}
            </p>
            <p className="text-xs text-yellow-500/60 mt-2">
              Rassemblez tous les indices pour trouver le secret...
            </p>
          </CardContent>
        </Card>

        {/* Fonctionnalités PRO / Easter Egg */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Brain className="h-5 w-5" />
                Analyse Cognitive (IA)
                {!localStorage.getItem('license_key')?.includes('PRO') && <Lock className="h-4 w-4 ml-auto text-slate-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {localStorage.getItem('license_key')?.includes('PRO') ? (
                <div className="space-y-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-purple-300 mb-1">Points Forts</h4>
                    <p className="text-xs text-slate-300">
                      Excellente maîtrise des concepts fondamentaux. Temps de réaction 15% plus rapide que la moyenne.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Axes d'amélioration</h4>
                    <p className="text-xs text-slate-300">
                      Approfondir les cas limites et la gestion des erreurs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  <p>Disponible uniquement avec la version PRO.</p>
                  <Button variant="link" size="sm" className="text-purple-400">En savoir plus</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <FileText className="h-5 w-5" />
                Rapport & Export
                {!localStorage.getItem('license_key')?.includes('PRO') && <Lock className="h-4 w-4 ml-auto text-slate-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {localStorage.getItem('license_key')?.includes('PRO') ? (
                <>
                  <Button variant="outline" className="w-full justify-start gap-2 border-blue-500/20 hover:bg-blue-500/10 text-blue-300" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4" />
                    Télécharger le rapport PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 border-green-500/20 hover:bg-green-500/10 text-green-300" onClick={handleDownloadCertificate}>
                    <Medal className="h-4 w-4" />
                    Obtenir le certificat officiel
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 border-slate-700 hover:bg-slate-800" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Partager le score
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  <p>Export PDF et Certificat verrouillés.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button onClick={resetQuiz} size="lg" className="gap-2 bg-white text-black hover:bg-gray-200">
            <Trophy className="h-5 w-5" />
            Recommencer
          </Button>
          <Button onClick={() => setGameMode(null)} size="lg" variant="outline" className="gap-2">
            <Target className="h-5 w-5" />
            Changer de Mode
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / quizzes.length) * 100;
  const timePercentage = (timeLeft / TIME_PER_QUESTION) * 100;

  return (
    <div className="mt-8 space-y-4 relative">
      <div className="fixed inset-0 pointer-events-none z-50">
        <svg className="w-full h-full">
          {confetti.map(c => (
            <rect
              key={c.id}
              x={`${c.x}%`}
              y={`${c.y}%`}
              width="12"
              height="12"
              rx="2"
              fill={c.color}
              className="animate-[fall_3s_linear_forwards]"
              transform={`rotate(${c.rotation})`}
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-lg font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-lg font-bold">{stats.streak}</div>
              <p className="text-xs text-muted-foreground">SÃ©rie</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-lg font-bold">{stats.correctAnswers}</div>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-lg font-bold">{stats.wrongAnswers}</div>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        shake && "animate-shake",
        pulse && "animate-pulse-success"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              Question {currentIndex + 1} / {quizzes.length}
            </Badge>
            {gameMode === 'timed' && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs flex items-center gap-1",
                  timeLeft < 10 && "bg-red-500/20 text-red-600 animate-pulse"
                )}
              >
                <Clock className="h-3 w-3" />
                {timeLeft}s
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            {gameMode === 'timed' && (
              <Progress
                value={timePercentage}
                className={cn(
                  "h-1",
                  timeLeft < 10 ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"
                )}
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            {gameMode === 'certification' && (
              <Badge variant="secondary" className="mb-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
                Demande d'utilisateur simulé (Scénario Pro)
              </Badge>
            )}
            <h3 className="text-xl font-semibold leading-tight">
              {gameMode === 'certification' ? `« ${currentQuiz.question} »` : currentQuiz.question}
            </h3>
            {showHint && currentQuiz.explanation && (
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Indice : {currentQuiz.explanation.split('.')[0]}...
                </p>
              </div>
            )}
          </div>

          {!isAnswered && gameMode !== 'certification' && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => usePowerUp('fiftyFifty')}
                disabled={powerUps.fiftyFifty === 0 || removedOptions.length > 0}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                50/50 ({powerUps.fiftyFifty})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => usePowerUp('hint')}
                disabled={powerUps.hint === 0 || showHint}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Indice ({powerUps.hint})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => usePowerUp('skip')}
                disabled={powerUps.skip === 0}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Passer ({powerUps.skip})
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {currentQuiz.options.map((option, index) => {
              const isRemoved = removedOptions.includes(index);
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuiz.correctAnswer;
              const isCertMode = gameMode === 'certification';
              const showAsCorrect = isAnswered && !isCertMode && isCorrectAnswer;
              const showAsWrong = isAnswered && !isCertMode && isSelected && !isCorrectAnswer;
              const showAsSelected = isAnswered && isCertMode && isSelected;

              if (isRemoved) return null;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index.toString())}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-300 text-left",
                    "hover:scale-[1.02] hover:shadow-lg",
                    !isAnswered && "hover:bg-muted hover:border-primary cursor-pointer",
                    isAnswered && "cursor-not-allowed",
                    showAsCorrect && "bg-green-500/20 border-green-500 shadow-green-500/20 shadow-lg",
                    showAsWrong && "bg-red-500/20 border-red-500 shadow-red-500/20 shadow-lg animate-shake",
                    showAsSelected && "bg-yellow-500/20 border-yellow-500 shadow-yellow-500/20 shadow-lg",
                    !isAnswered && !showAsCorrect && !showAsWrong && !showAsSelected && "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      showAsCorrect && "bg-green-500 text-white",
                      showAsWrong && "bg-red-500 text-white",
                      showAsSelected && "bg-yellow-500 text-white",
                      !showAsCorrect && !showAsWrong && !showAsSelected && "bg-muted"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {showAsCorrect && <CheckCircle className="h-5 w-5 text-green-500 animate-scale-in" />}
                    {showAsWrong && <XCircle className="h-5 w-5 text-red-500 animate-scale-in" />}
                    {showAsSelected && <CheckCircle className="h-5 w-5 text-yellow-500 animate-scale-in" />}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && gameMode !== 'certification' && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExplanation}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Explication dÃ©taillÃ©e
                </span>
                {showExplanation[currentQuiz.id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showExplanation[currentQuiz.id] && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2 animate-slide-down">
                  <p className="text-sm leading-relaxed">{currentQuiz.explanation}</p>
                  {answerTimes[currentQuiz.id] && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      RÃ©pondu en {answerTimes[currentQuiz.id].toFixed(1)}s
                      {answerTimes[currentQuiz.id] < TIME_BONUS_THRESHOLD && (
                        <Badge variant="outline" className="text-xs ml-2">
                          +Bonus vitesse
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              PrÃ©cÃ©dent
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isAnswered && gameMode !== 'timed'}
              className="gap-2"
            >
              {currentIndex === quizzes.length - 1 ? (
                <>
                  <Trophy className="h-4 w-4" />
                  Voir les rÃ©sultats
                </>
              ) : (
                <>
                  Suivant
                  <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes pulse-success {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
        }
        @keyframes scale-in {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-pulse-success {
          animation: pulse-success 0.5s ease-in-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}


