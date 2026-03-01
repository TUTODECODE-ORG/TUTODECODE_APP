/**
 * Utilitaires pour vérifier la compatibilité matérielle avec l'IA WebGPU
 */

export interface HardwareReport {
    compatible: boolean;
    warnings: string[];
    criticalError?: string;
    details: {
        gpu: boolean;
        ram: number | undefined; // En Go (approximatif, souvent plafonné à 8)
        cores: number;
    };
}

export async function checkAIHardware(): Promise<HardwareReport> {
    const report: HardwareReport = {
        compatible: true,
        warnings: [],
        details: {
            gpu: false,
            ram: (navigator as any).deviceMemory,
            cores: navigator.hardwareConcurrency || 2
        }
    };

    // 1. Vérification WebGPU (Critique)
    if (!(navigator as any).gpu) {
        report.compatible = false;
        report.criticalError = "Votre navigateur ne supporte pas WebGPU. Impossible de lancer l'IA en local.";
        return report;
    }

    // Test rapide d'adaptateur (parfois navigator.gpu existe mais pas l'adaptateur ou l'accès est restreint)
    try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (!adapter) {
            // On ne bloque pas ici, car certaines configs dual-GPU (Optimus) peuvent échouer au check simple
            // mais réussir avec WebLLM qui demande un adapter spécifique.
            report.warnings.push("Détection GPU incertaine. L'IA tentera de se lancer quand même.");
        } else {
            report.details.gpu = true;

            // Bonus: Check si c'est un GPU intégré (souvent plus lent)
            const info = await adapter.requestAdapterInfo();
            if (info.description.toLowerCase().includes('intel') || info.description.toLowerCase().includes('uhd')) {
                report.warnings.push("Carte graphique intégrée détectée. Les performances seront réduites.");
            }
        }
    } catch (e) {
        // Si le check échoue (ex: Brave shield, ou restriction), on laisse passer !
        // L'utilisateur a peut-être une 4090 mais le navigateur bloque l'introspection.
        report.warnings.push("Impossible d'analyser le matériel. Tentative de lancement forcée.");
        console.warn("Hardware check blocked:", e);
    }

    // 2. Vérification RAM (Warning)
    // deviceMemory retourne 0.25, 0.5, 1, 2, 4, 8 (c'est approximatif et plafonné à 8 par sécurité privacy)
    // Phi-3.5 demande ~3-4Go de VRAM/RAM libre. Donc < 8Go total est risqué.
    if (report.details.ram) {
        if (report.details.ram < 4) {
            report.warnings.push("RAM critique (< 4Go). L'IA ne pourra probablement pas se charger.");
        } else if (report.details.ram < 8) {
            report.warnings.push("RAM faible. Votre PC risque de ralentir fortement pendant la génération.");
        }
    }

    // 3. Vérification CPU (Warning faible)
    if (report.details.cores < 4) {
        report.warnings.push("Processeur faible (< 4 cœurs). Les réponses seront lentes.");
    }

    return report;
}
