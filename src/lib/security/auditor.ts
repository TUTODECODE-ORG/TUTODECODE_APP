/**
 * 🔍 GHOST PROTOCOL - Security Auditor
 * 
 * Analyseur de code automatique pour détecter les vulnérabilités courantes.
 * Fonctionne 100% en local, aucune donnée n'est envoyée à un serveur.
 * 
 * @license AGPL-3.0
 */

export interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    line: number;
    column?: number;
    message: string;
    code: string;
    rule: string;
    suggestion?: string;
}

export interface AuditResult {
    issues: SecurityIssue[];
    score: number; // 0-100
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
}

/**
 * Règles de sécurité pour JavaScript/TypeScript
 */
const JS_SECURITY_RULES = [
    {
        id: 'no-eval',
        severity: 'critical' as const,
        pattern: /\beval\s*\(/g,
        message: 'Utilisation de eval() détectée - Risque d\'injection de code',
        suggestion: 'Utilisez JSON.parse() ou des alternatives sûres'
    },
    {
        id: 'no-inner-html',
        severity: 'high' as const,
        pattern: /\.innerHTML\s*=/g,
        message: 'Utilisation de innerHTML - Risque XSS',
        suggestion: 'Utilisez textContent ou DOMPurify pour sanitizer le HTML'
    },
    {
        id: 'no-dangerously-set',
        severity: 'high' as const,
        pattern: /dangerouslySetInnerHTML/g,
        message: 'Utilisation de dangerouslySetInnerHTML - Risque XSS',
        suggestion: 'Sanitizez le HTML avec DOMPurify avant utilisation'
    },
    {
        id: 'no-document-write',
        severity: 'medium' as const,
        pattern: /document\.write\s*\(/g,
        message: 'Utilisation de document.write() - Mauvaise pratique',
        suggestion: 'Utilisez DOM manipulation moderne'
    },
    {
        id: 'hardcoded-secrets',
        severity: 'critical' as const,
        pattern: /(api[_-]?key|password|secret|token)\s*[:=]\s*['"][^'"]+['"]/gi,
        message: 'Potentiel secret hardcodé détecté',
        suggestion: 'Utilisez des variables d\'environnement'
    },
    {
        id: 'sql-injection',
        severity: 'critical' as const,
        pattern: /query\s*\(\s*['"`].*\$\{.*\}.*['"`]\s*\)/g,
        message: 'Potentielle injection SQL détectée',
        suggestion: 'Utilisez des requêtes préparées (prepared statements)'
    },
    {
        id: 'unsafe-regex',
        severity: 'medium' as const,
        pattern: /new\s+RegExp\s*\(\s*[^)]*\+[^)]*\)/g,
        message: 'Construction de regex dynamique - Risque ReDoS',
        suggestion: 'Validez et sanitizez les entrées utilisateur'
    },
    {
        id: 'console-log',
        severity: 'low' as const,
        pattern: /console\.(log|debug|info)\s*\(/g,
        message: 'console.log() en production - Fuite d\'information potentielle',
        suggestion: 'Supprimez les logs de debug en production'
    },
    {
        id: 'http-url',
        severity: 'medium' as const,
        pattern: /['"]http:\/\/[^'"]+['"]/g,
        message: 'URL HTTP non sécurisée détectée',
        suggestion: 'Utilisez HTTPS pour toutes les communications'
    },
    {
        id: 'weak-crypto',
        severity: 'high' as const,
        pattern: /\b(md5|sha1)\b/gi,
        message: 'Algorithme de hachage faible détecté (MD5/SHA1)',
        suggestion: 'Utilisez SHA-256 ou supérieur'
    }
];

/**
 * Règles de sécurité pour Python
 */
const PYTHON_SECURITY_RULES = [
    {
        id: 'py-exec',
        severity: 'critical' as const,
        pattern: /\bexec\s*\(/g,
        message: 'Utilisation de exec() - Risque d\'injection de code',
        suggestion: 'Évitez exec() et utilisez des alternatives sûres'
    },
    {
        id: 'py-pickle',
        severity: 'high' as const,
        pattern: /pickle\.loads?\s*\(/g,
        message: 'Utilisation de pickle - Risque de désérialisation non sécurisée',
        suggestion: 'Utilisez JSON pour les données non fiables'
    },
    {
        id: 'py-sql-injection',
        severity: 'critical' as const,
        pattern: /execute\s*\(\s*f?['"].*%s.*['"]/g,
        message: 'Potentielle injection SQL détectée',
        suggestion: 'Utilisez des requêtes paramétrées'
    },
    {
        id: 'py-shell-injection',
        severity: 'critical' as const,
        pattern: /os\.system\s*\(|subprocess\.call\s*\([^,]*shell\s*=\s*True/g,
        message: 'Exécution de commande shell non sécurisée',
        suggestion: 'Utilisez subprocess avec shell=False et validez les entrées'
    },
    {
        id: 'py-hardcoded-password',
        severity: 'critical' as const,
        pattern: /(password|passwd|pwd)\s*=\s*['"][^'"]+['"]/gi,
        message: 'Mot de passe hardcodé détecté',
        suggestion: 'Utilisez des variables d\'environnement ou un gestionnaire de secrets'
    }
];

/**
 * Analyse un fichier JavaScript/TypeScript
 */
function auditJavaScript(code: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = code.split('\n');

    for (const rule of JS_SECURITY_RULES) {
        lines.forEach((line, index) => {
            const matches = line.matchAll(rule.pattern);
            for (const match of matches) {
                issues.push({
                    severity: rule.severity,
                    line: index + 1,
                    column: match.index,
                    message: rule.message,
                    code: line.trim(),
                    rule: rule.id,
                    suggestion: rule.suggestion
                });
            }
        });
    }

    return issues;
}

/**
 * Analyse un fichier Python
 */
function auditPython(code: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = code.split('\n');

    for (const rule of PYTHON_SECURITY_RULES) {
        lines.forEach((line, index) => {
            const matches = line.matchAll(rule.pattern);
            for (const match of matches) {
                issues.push({
                    severity: rule.severity,
                    line: index + 1,
                    column: match.index,
                    message: rule.message,
                    code: line.trim(),
                    rule: rule.id,
                    suggestion: rule.suggestion
                });
            }
        });
    }

    return issues;
}

/**
 * Calcule un score de sécurité (0-100)
 */
function calculateScore(issues: SecurityIssue[]): number {
    const weights = {
        critical: 25,
        high: 15,
        medium: 5,
        low: 2,
        info: 1
    };

    let totalPenalty = 0;
    for (const issue of issues) {
        totalPenalty += weights[issue.severity];
    }

    // Score de base 100, on retire les pénalités
    const score = Math.max(0, 100 - totalPenalty);
    return Math.round(score);
}

/**
 * Analyse un fichier de code
 */
export function auditCode(code: string, language: 'javascript' | 'typescript' | 'python'): AuditResult {
    let issues: SecurityIssue[] = [];

    if (language === 'javascript' || language === 'typescript') {
        issues = auditJavaScript(code);
    } else if (language === 'python') {
        issues = auditPython(code);
    }

    const summary = {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
        info: issues.filter(i => i.severity === 'info').length
    };

    const score = calculateScore(issues);

    return {
        issues,
        score,
        summary
    };
}

/**
 * Détecte le langage depuis l'extension du fichier
 */
export function detectLanguage(filename: string): 'javascript' | 'typescript' | 'python' | 'unknown' {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'py') return 'python';

    return 'unknown';
}
