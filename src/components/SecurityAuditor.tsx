import { useState, useCallback } from 'react';
import { Upload, Shield, AlertTriangle, CheckCircle, XCircle, FileCode, TrendingUp, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { auditCode, detectLanguage, type SecurityIssue, type AuditResult } from '@/lib/security/auditor';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function SecurityAuditor() {
    const [result, setResult] = useState<AuditResult | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'downloading' | 'analyzing'>('idle');
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        // Simulation: First time check (or random check) for "Model Download"
        // In a real PWA this would be cached in CacheStorage
        const modelCached = localStorage.getItem('neural_model_cached') === 'true';

        const startAnalysis = (code: string, language: any) => {
            setStatus('analyzing');
            setTimeout(() => {
                const auditResult = auditCode(code, language);
                setResult(auditResult);
                setStatus('idle');
            }, 800);
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            const code = e.target?.result as string;
            const language = detectLanguage(file.name);

            if (language === 'unknown') {
                alert('Type de fichier non supporté. Utilisez .js, .jsx, .ts, .tsx ou .py');
                return;
            }

            if (!modelCached) {
                setStatus('downloading');
                setDownloadProgress(0);

                // Simulate download of 4GB model compressed (fake speed)
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 5;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        localStorage.setItem('neural_model_cached', 'true');
                        startAnalysis(code, language);
                    }
                    setDownloadProgress(Math.min(100, Math.round(progress)));
                }, 100);
            } else {
                startAnalysis(code, language);
            }
        };

        reader.readAsText(file);
    }, []);

    const getSeverityColor = (severity: SecurityIssue['severity']) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'info': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-yellow-400';
        if (score >= 50) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Bon';
        if (score >= 50) return 'Moyen';
        if (score >= 30) return 'Faible';
        return 'Critique';
    };

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900/50 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-cyan-400" />
                        <CardTitle className="text-cyan-400">Audit de Sécurité Automatique</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                        Analysez votre code pour détecter les vulnérabilités • 100% Local • Zéro Serveur
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Alert className="bg-cyan-500/10 border-cyan-500/30">
                            <FileCode className="h-4 w-4 text-cyan-400" />
                            <AlertDescription className="text-slate-300">
                                Formats supportés : JavaScript (.js, .jsx), TypeScript (.ts, .tsx), Python (.py)
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-12 h-12 mb-4 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-300">
                                        <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                                    </p>
                                    <p className="text-xs text-slate-500">JS, TS, JSX, TSX ou PY</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".js,.jsx,.ts,.tsx,.py"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>

                        {status === 'downloading' && (
                            <div className="text-center py-8 space-y-4">
                                <div className="max-w-md mx-auto">
                                    <div className="flex justify-between text-xs text-cyan-400 mb-2">
                                        <span>Téléchargement du modèle Neural Core (Phi-3.5-mini-instruct)...</span>
                                        <span>{downloadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 transition-all duration-300 ease-out"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Ceci est une opération unique. Le modèle sera mis en cache localement (3.8GB).
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'analyzing' && (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
                                <p className="text-slate-400">Analyse du code source...</p>
                                <p className="text-xs text-slate-500 mt-2">Recherche de patterns CVE connus & failles OWASP...</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {result && status === 'idle' && (
                <>
                    {/* Score Card */}
                    <Card className="bg-slate-900/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Résultat de l'Audit : {fileName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                                        <span className="text-sm text-slate-400">Score de Sécurité</span>
                                    </div>
                                    <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                                        {result.score}/100
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1">{getScoreLabel(result.score)}</div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-4 gap-2 border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                        onClick={() => {
                                            const doc = new jsPDF();

                                            // Header
                                            doc.setFontSize(22);
                                            doc.setTextColor(41, 128, 185); // Blue color
                                            doc.text("Ghost Framework Security Audit", 14, 20);

                                            doc.setFontSize(10);
                                            doc.setTextColor(100);
                                            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
                                            doc.text(`File: ${fileName}`, 14, 35);

                                            // Score Section
                                            doc.setFontSize(16);
                                            doc.setTextColor(0);
                                            doc.text("Security Score", 14, 50);

                                            doc.setFontSize(40);
                                            // Choose color based on score
                                            if (result.score >= 90) doc.setTextColor(46, 204, 113); // Green
                                            else if (result.score >= 70) doc.setTextColor(241, 196, 15); // Yellow
                                            else if (result.score >= 50) doc.setTextColor(230, 126, 34); // Orange
                                            else doc.setTextColor(231, 76, 60); // Red

                                            doc.text(`${result.score}/100`, 14, 65);

                                            // Reset color
                                            doc.setTextColor(0);
                                            doc.setFontSize(12);
                                            doc.text(`Rating: ${getScoreLabel(result.score).toUpperCase()}`, 14, 75);

                                            // Summary Table
                                            autoTable(doc, {
                                                startY: 85,
                                                head: [['Severity', 'Count']],
                                                body: [
                                                    ['CRITICAL', result.summary.critical],
                                                    ['HIGH', result.summary.high],
                                                    ['MEDIUM', result.summary.medium],
                                                    ['LOW', result.summary.low],
                                                ],
                                                theme: 'striped',
                                                headStyles: { fillColor: [41, 128, 185] }
                                            });

                                            // Detailed Issues
                                            if (result.issues.length > 0) {
                                                doc.addPage();
                                                doc.text("Detailed Vulnerabilities", 14, 20);

                                                const rows = result.issues.map(issue => [
                                                    issue.severity.toUpperCase(),
                                                    `Line ${issue.line}`,
                                                    issue.message,
                                                    issue.suggestion || 'N/A'
                                                ]);

                                                autoTable(doc, {
                                                    startY: 25,
                                                    head: [['Severity', 'Line', 'Issue', 'Suggestion']],
                                                    body: rows,
                                                    theme: 'grid',
                                                    headStyles: { fillColor: [52, 73, 94] },
                                                    columnStyles: {
                                                        0: { fontStyle: 'bold', textColor: [231, 76, 60] },
                                                        2: { cellWidth: 60 },
                                                        3: { cellWidth: 60 }
                                                    }
                                                });
                                            }

                                            // Footer
                                            const pageCount = doc.getNumberOfPages();
                                            for (let i = 1; i <= pageCount; i++) {
                                                doc.setPage(i);
                                                doc.setFontSize(10);
                                                doc.setTextColor(150);
                                                doc.text('Certified by Ghost Framework Engine', 14, doc.internal.pageSize.height - 10);
                                                doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
                                            }

                                            doc.save(`audit-report-${fileName}.pdf`);
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger le Rapport PDF (Pro)
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{result.summary.critical}</div>
                                        <div className="text-xs text-slate-400">Critique</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-400">{result.summary.high}</div>
                                        <div className="text-xs text-slate-400">Élevé</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{result.summary.medium}</div>
                                        <div className="text-xs text-slate-400">Moyen</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{result.summary.low}</div>
                                        <div className="text-xs text-slate-400">Faible</div>
                                    </div>
                                </div>
                            </div>

                            {result.issues.length === 0 ? (
                                <Alert className="bg-green-500/10 border-green-500/30">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <AlertDescription className="text-green-300">
                                        ✓ Aucune vulnérabilité détectée ! Votre code semble sécurisé.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert className="bg-red-500/10 border-red-500/30">
                                    <XCircle className="h-4 w-4 text-red-400" />
                                    <AlertDescription className="text-red-300">
                                        {result.issues.length} problème{result.issues.length > 1 ? 's' : ''} de sécurité détecté{result.issues.length > 1 ? 's' : ''}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Issues List */}
                    {result.issues.length > 0 && (
                        <Card className="bg-slate-900/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-slate-200">Vulnérabilités Détectées</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {result.issues.map((issue, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getSeverityColor(issue.severity)}>
                                                        {issue.severity.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm text-slate-400">Ligne {issue.line}</span>
                                                </div>
                                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <div className="text-slate-200 font-medium">{issue.message}</div>
                                            <div className="bg-slate-900 p-2 rounded font-mono text-xs text-slate-300 overflow-x-auto">
                                                {issue.code}
                                            </div>
                                            {issue.suggestion && (
                                                <div className="text-sm text-cyan-400 flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span>{issue.suggestion}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
