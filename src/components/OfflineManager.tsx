import { useState, useEffect, useRef } from 'react';
import { Download, Trash2, HardDrive, CheckCircle, XCircle, Wifi, WifiOff, Info, RefreshCw, Zap, Ghost, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { Switch } from './ui/switch';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { Course } from '@/types';

interface OfflineManagerProps {
    courses: Course[];
}

/**
 * Composant pour gérer les cours disponibles hors ligne - VERSION ULTRA PRO
 */
export function OfflineManager({ courses }: OfflineManagerProps) {
    const {
        isEnabled,
        savedCourses,
        saveCourseOffline,
        removeCourseOffline,
        isCourseAvailableOffline,

        clearAllOfflineCourses,
        toggleOfflineMode,
        formatSize,
    } = useOfflineMode();

    const { isOnline } = useNetworkStatus();
    const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, available: 0, percentage: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [currentDownloading, setCurrentDownloading] = useState<string | null>(null);
    const [ghostMode, setGhostMode] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Activer le Ghost Mode automatiquement quand on est offline
    useEffect(() => {
        if (!isOnline && isEnabled) {
            setGhostMode(true);
        } else {
            setGhostMode(false);
        }
    }, [isOnline, isEnabled]);

    // Animation de particules pour le Ghost Mode
    useEffect(() => {
        if (!ghostMode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Connexions entre particules
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [ghostMode]);

    // Charger les infos de stockage
    useEffect(() => {
        loadStorageInfo();
    }, [savedCourses]);

    const loadStorageInfo = async () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const available = quota - usage;
            const percentage = quota > 0 ? (usage / quota) * 100 : 0;

            setStorageInfo({ usage, quota, available, percentage });
        }
    };

    const handleToggleOffline = async () => {
        await toggleOfflineMode();
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setDownloadProgress(0);

        try {
            const total = courses.length;
            let completed = 0;

            for (const course of courses) {
                setCurrentDownloading(course.title);
                await saveCourseOffline(course);
                completed++;
                setDownloadProgress((completed / total) * 100);

                // Petit délai pour l'effet visuel
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setCurrentDownloading(null);
            console.log(`✅ ${completed} cours sauvegardés`);
        } finally {
            setIsSaving(false);
            setDownloadProgress(0);
        }
    };

    const handleClearAll = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer tous les cours offline ?')) {
            await clearAllOfflineCourses();
        }
    };

    const handleToggleCourse = async (course: Course) => {
        if (isCourseAvailableOffline(course.id)) {
            await removeCourseOffline(course.id);
        } else {
            setCurrentDownloading(course.title);
            await saveCourseOffline(course);
            setCurrentDownloading(null);
        }
    };

    // Calculer les stats impressionnantes
    const stats = {
        totalCourses: courses.length,
        savedCount: savedCourses.length,
        completion: courses.length > 0 ? (savedCourses.length / courses.length) * 100 : 0,
        storageUsedMB: (storageInfo.usage / (1024 * 1024)).toFixed(2),
        estimatedOfflineHours: savedCourses.length * 2, // 2h par cours estimé
    };

    return (
        <div className="space-y-6 relative">
            {/* Canvas d'animation pour Ghost Mode */}
            {ghostMode && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none z-0 opacity-50"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* Header avec statut ULTRA PRO */}
            <Card className={`relative overflow-hidden transition-all duration-500 ${ghostMode ? 'border-blue-500/30 shadow-lg shadow-blue-500/20' : ''}`}>
                {/* Gradient animé en background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />

                <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Icône animée */}
                            <div className={`relative ${ghostMode ? 'animate-pulse' : ''}`}>
                                {ghostMode ? (
                                    <Ghost className="h-8 w-8 text-blue-400" />
                                ) : isOnline ? (
                                    <Wifi className="h-8 w-8 text-green-500" />
                                ) : (
                                    <WifiOff className="h-8 w-8 text-gray-500" />
                                )}

                                {/* Pulse ring effect */}
                                {isEnabled && (
                                    <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                                )}
                            </div>

                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {ghostMode ? '👻 Ghost Mode Activé' : 'Mode Hors Ligne'}
                                    {isEnabled && (
                                        <Badge variant="default" className="gap-1 bg-gradient-to-r from-blue-500 to-purple-500">
                                            <Zap className="h-3 w-3" />
                                            Activé
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-sm mt-1">
                                    {ghostMode ? (
                                        <span className="text-blue-400 font-medium">
                                            🔒 Mode Fantôme • Fonctionnement 100% Local
                                        </span>
                                    ) : isOnline ? (
                                        'Connecté à Internet • Ready to Download'
                                    ) : (
                                        'Hors ligne • Utilisation du cache local'
                                    )}
                                </CardDescription>
                            </div>
                        </div>

                        <Switch
                            checked={isEnabled}
                            onCheckedChange={handleToggleOffline}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                        />
                    </div>
                </CardHeader>

                {isEnabled && (
                    <CardContent className="space-y-6 relative z-10">
                        {/* STATS ULTRA PRO */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <HardDrive className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs text-muted-foreground">Cours Sauvés</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-500">{stats.savedCount}</p>
                                <p className="text-xs text-muted-foreground">sur {stats.totalCourses}</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-purple-500" />
                                    <span className="text-xs text-muted-foreground">Progression</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-500">{stats.completion.toFixed(0)}%</p>
                                <p className="text-xs text-muted-foreground">complété</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-muted-foreground">Stockage</span>
                                </div>
                                <p className="text-2xl font-bold text-green-500">{stats.storageUsedMB}</p>
                                <p className="text-xs text-muted-foreground">MB utilisés</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="h-4 w-4 text-orange-500" />
                                    <span className="text-xs text-muted-foreground">Offline Time</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-500">{stats.estimatedOfflineHours}h</p>
                                <p className="text-xs text-muted-foreground">disponibles</p>
                            </div>
                        </div>

                        {/* Barre de progression du stockage avec gradient */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Espace utilisé</span>
                                <span className="font-medium bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    {formatSize(storageInfo.usage)} / {formatSize(storageInfo.quota)}
                                </span>
                            </div>
                            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                                    style={{ width: `${storageInfo.percentage}%` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {storageInfo.percentage.toFixed(1)}% utilisé • {formatSize(storageInfo.available)} disponible
                            </p>
                        </div>

                        {/* Progression du téléchargement */}
                        {isSaving && (
                            <div className="space-y-2 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                                    <span className="text-sm font-medium">Téléchargement en cours...</span>
                                </div>
                                {currentDownloading && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        📥 {currentDownloading}
                                    </p>
                                )}
                                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                                        style={{ width: `${downloadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-right text-blue-500 font-medium">
                                    {downloadProgress.toFixed(0)}%
                                </p>
                            </div>
                        )}

                        {/* Actions rapides avec style futuriste */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveAll}
                                disabled={!isOnline || isSaving}
                                className="flex-1 gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
                            >
                                <Download className="h-4 w-4" />
                                {isSaving ? 'Téléchargement...' : `Tout télécharger (${courses.length})`}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                disabled={savedCourses.length === 0}
                                className="flex-1 gap-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 hover:from-red-500/20 hover:to-orange-500/20 transition-all duration-300"
                            >
                                <Trash2 className="h-4 w-4" />
                                Tout supprimer
                            </Button>
                        </div>

                        {/* Info avec icône */}
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    💡 Mode Hors Ligne Ultra-Avancé
                                </p>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                    Les cours sauvegardés restent accessibles même sans connexion Internet.
                                    Vous pouvez consulter le contenu, faire les QCM, utiliser les cheatsheets et même l'IA en local !
                                </p>
                            </div>
                        </div>

                        {/* Ghost Mode Badge */}
                        {ghostMode && (
                            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg backdrop-blur-sm animate-pulse">
                                <Ghost className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                                        👻 Ghost Mode Actif
                                    </p>
                                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                                        Vous êtes complètement invisible • Aucune donnée ne quitte votre appareil •
                                        Fonctionnement 100% local et privé
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Liste des cours avec design ultra-moderne */}
            {isEnabled && (
                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-blue-500" />
                            Bibliothèque Hors Ligne
                            <Badge variant="outline" className="ml-auto">
                                {savedCourses.length} / {courses.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {courses.map(course => {
                                const isAvailable = isCourseAvailableOffline(course.id);
                                const isDownloading = currentDownloading === course.title;

                                return (
                                    <div
                                        key={course.id}
                                        className={`group flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${isAvailable
                                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:from-green-500/20 hover:to-emerald-500/20'
                                            : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600'
                                            } ${isDownloading ? 'animate-pulse' : ''}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="text-3xl shrink-0 transform group-hover:scale-110 transition-transform">
                                                {course.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{course.title}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {course.duration} • {course.chapters} chapitres
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {isAvailable ? (
                                                <Badge variant="outline" className="gap-1 text-green-600 border-green-600 bg-green-500/10">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Téléchargé
                                                </Badge>
                                            ) : isDownloading ? (
                                                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600 bg-blue-500/10">
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                    En cours...
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1">
                                                    <XCircle className="h-3 w-3" />
                                                    Non sauvegardé
                                                </Badge>
                                            )}

                                            <Button
                                                size="sm"
                                                variant={isAvailable ? 'destructive' : 'default'}
                                                onClick={() => handleToggleCourse(course)}
                                                disabled={(!isOnline && !isAvailable) || isDownloading}
                                                className={`transition-all duration-300 ${isAvailable
                                                    ? ''
                                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                                    }`}
                                            >
                                                {isDownloading ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : isAvailable ? (
                                                    <Trash2 className="h-4 w-4" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/**
 * Badge de statut offline compact ULTRA PRO
 */
export function OfflineStatusBadge() {
    const { savedCourses } = useOfflineMode();
    const { isOnline } = useNetworkStatus();

    if (savedCourses.length === 0) return null;

    return (
        <Badge
            variant="outline"
            className={`gap-2 transition-all duration-300 ${isOnline
                ? 'text-green-600 border-green-600 bg-green-500/10'
                : 'text-blue-600 border-blue-600 bg-blue-500/10 animate-pulse'
                }`}
        >
            {isOnline ? (
                <Wifi className="h-3 w-3" />
            ) : (
                <>
                    <Ghost className="h-3 w-3" />
                    <span className="hidden sm:inline">Ghost Mode •</span>
                </>
            )}
            {savedCourses.length} cours offline
        </Badge>
    );
}

/**
 * Bouton de téléchargement pour un cours individuel ULTRA PRO
 */
interface OfflineCourseButtonProps {
    course: Course;
    variant?: 'icon' | 'full';
}

export function OfflineCourseButton({ course, variant = 'icon' }: OfflineCourseButtonProps) {
    const { saveCourseOffline, removeCourseOffline, isCourseAvailableOffline } = useOfflineMode();
    const { isOnline } = useNetworkStatus();
    const [isLoading, setIsLoading] = useState(false);

    const isAvailable = isCourseAvailableOffline(course.id);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            if (isAvailable) {
                await removeCourseOffline(course.id);
            } else {
                await saveCourseOffline(course);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'icon') {
        return (
            <Button
                size="sm"
                variant={isAvailable ? 'default' : 'outline'}
                onClick={handleToggle}
                disabled={!isOnline && !isAvailable || isLoading}
                title={isAvailable ? 'Supprimer du mode offline' : 'Sauvegarder pour utilisation offline'}
                className={`transition-all duration-300 ${isAvailable
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    }`}
            >
                {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isAvailable ? (
                    <CheckCircle className="h-4 w-4" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
            </Button>
        );
    }

    return (
        <Button
            size="sm"
            variant={isAvailable ? 'default' : 'outline'}
            onClick={handleToggle}
            disabled={!isOnline && !isAvailable || isLoading}
            className={`gap-2 transition-all duration-300 ${isAvailable
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }`}
        >
            {isLoading ? (
                <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Chargement...
                </>
            ) : isAvailable ? (
                <>
                    <CheckCircle className="h-4 w-4" />
                    Disponible offline
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    Sauvegarder offline
                </>
            )}
        </Button>
    );
}
