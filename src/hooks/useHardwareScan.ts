// ============================================
// TutoDeCode - Hardware Scan Hook
// Détecte le matériel et recommande des modèles LLM
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { HardwareInfo, LlmRecommendation, HardwareScanResult } from '@/types';

interface UseHardwareScanReturn {
  hardware: HardwareInfo | null;
  recommendation: LlmRecommendation | null;
  isScanning: boolean;
  error: string | null;
  isDesktop: boolean;
  scanHardware: () => Promise<void>;
  getWebHardwareInfo: () => Promise<HardwareInfo>;
}

// Détection WebGPU pour l'environnement web
async function detectWebGPU(): Promise<{ available: boolean; vramGb?: number }> {
  if (!('gpu' in navigator)) {
    return { available: false };
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return { available: false };
    }

    const info = await adapter.requestAdapterInfo();
    
    // Estimation de la VRAM basée sur le nom
    let vramGb: number | undefined;
    const vramMatch = info.description?.match(/(\d+)\s*GB/i);
    if (vramMatch) {
      vramGb = parseInt(vramMatch[1], 10);
    }

    return { 
      available: true, 
      vramGb,
    };
  } catch {
    return { available: false };
  }
}

// Détection de la mémoire pour l'environnement web
function detectWebMemory(): { totalGb: number; usedGb: number } {
  // @ts-ignore - Performance memory API
  const memory = (performance as any).memory;
  
  if (memory) {
    return {
      totalGb: Math.round((memory.jsHeapSizeLimit / 1024 / 1024 / 1024) * 10) / 10,
      usedGb: Math.round((memory.usedJSHeapSize / 1024 / 1024 / 1024) * 10) / 10,
    };
  }

  // Fallback: estimation basée sur le device
  // @ts-ignore - deviceMemory API
  const memoryGb = navigator.deviceMemory || 4;
  return {
    totalGb: memoryGb,
    usedGb: memoryGb * 0.6,
  };
}

// Détection des cores CPU
function detectCpuCores(): { cores: number; architecture: string } {
  return {
    cores: navigator.hardwareConcurrency || 4,
    architecture: 'unknown',
  };
}

export function useHardwareScan(): UseHardwareScanReturn {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [recommendation, setRecommendation] = useState<LlmRecommendation | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Vérifie si nous sommes sur desktop (Tauri)
  useEffect(() => {
    const checkDesktop = async () => {
      try {
        const desktop = await invoke<boolean>('is_desktop');
        setIsDesktop(desktop);
      } catch {
        setIsDesktop(false);
      }
    };
    checkDesktop();
  }, []);

  // Scan du hardware via Tauri (desktop)
  const scanHardwareDesktop = useCallback(async (): Promise<HardwareScanResult> => {
    return await invoke<HardwareScanResult>('get_llm_recommendation');
  }, []);

  // Scan du hardware via Web APIs (web)
  const getWebHardwareInfo = useCallback(async (): Promise<HardwareInfo> => {
    const gpu = await detectWebGPU();
    const memory = detectWebMemory();
    const cpu = detectCpuCores();

    const hardwareInfo: HardwareInfo = {
      platform: 'Web',
      cpu: {
        brand: 'Unknown (Web)',
        coresPhysical: cpu.cores,
        coresLogical: cpu.cores,
        frequencyMhz: 0,
        architecture: cpu.architecture,
      },
      memory: {
        totalGb: memory.totalGb,
        availableGb: memory.totalGb - memory.usedGb,
        usedGb: memory.usedGb,
      },
      gpu: gpu.available ? {
        name: 'WebGPU Compatible',
        vendor: 'Unknown',
        vramGb: gpu.vramGb,
        isDedicated: !!gpu.vramGb && gpu.vramGb >= 4,
      } : undefined,
      performanceScore: calculateWebPerformanceScore(cpu.cores, memory.totalGb, gpu.vramGb),
    };

    return hardwareInfo;
  }, []);

  // Calcule un score de performance pour le web
  const calculateWebPerformanceScore = (
    cores: number, 
    ramGb: number, 
    vramGb?: number
  ): number => {
    let score = 0;

    // Score CPU (max 40)
    score += Math.min(cores * 5, 40);

    // Score RAM (max 30)
    score += Math.min(ramGb * 3, 30);

    // Score GPU (max 30)
    if (vramGb) {
      score += Math.min(vramGb * 5, 30);
    }

    return Math.min(score, 100);
  };

  // Fonction principale de scan
  const scanHardware = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      if (isDesktop) {
        // Utilise Tauri pour un scan complet
        const result = await scanHardwareDesktop();
        setHardware(result.hardware);
        setRecommendation(result.recommendation);
      } else {
        // Utilise les Web APIs
        const webHardware = await getWebHardwareInfo();
        setHardware(webHardware);
        
        // Génère une recommandation basée sur le hardware web
        const webRecommendation = generateWebRecommendation(webHardware);
        setRecommendation(webRecommendation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du scan matériel');
      console.error('Hardware scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [isDesktop, scanHardwareDesktop, getWebHardwareInfo]);

  // Génère une recommandation pour le web
  const generateWebRecommendation = (hw: HardwareInfo): LlmRecommendation => {
    const totalRam = hw.memory.totalGb;
    const gpuVram = hw.gpu?.vramGb || 0;
    const hasWebGPU = !!hw.gpu;

    if (hasWebGPU && gpuVram >= 4 && totalRam >= 8) {
      return {
        modelName: 'WebLLM - Llama 3.1 8B',
        modelSize: '8B paramètres',
        parameters: '8B',
        vramRequiredGb: 4,
        ramRequiredGb: 6,
        reason: 'WebGPU détecté avec suffisamment de VRAM pour l\'inférence locale dans le navigateur.',
        suitableFor: [
          'Génération de code avancée',
          'Debugging complexe',
          'Explications détaillées',
        ],
      };
    } else if (totalRam >= 8) {
      return {
        modelName: 'WebLLM - Phi-3.5 Mini',
        modelSize: '3.8B paramètres',
        parameters: '3.8B',
        vramRequiredGb: 2,
        ramRequiredGb: 4,
        reason: 'Configuration équilibrée pour l\'apprentissage avec assistance IA via WebAssembly.',
        suitableFor: [
          'Aide au code quotidienne',
          'Explications de concepts',
          'Suggestions de debugging',
        ],
      };
    } else {
      return {
        modelName: 'Mode Cloud (API externe)',
        modelSize: 'Variable',
        parameters: 'N/A',
        vramRequiredGb: 0,
        ramRequiredGb: 0,
        reason: 'RAM limitée détectée. Utilisation d\'API cloud recommandée pour de meilleures performances.',
        suitableFor: [
          'Accès à des modèles puissants',
          'Sans charge locale',
          'Nécessite une connexion internet',
        ],
      };
    }
  };

  // Scan automatique au montage
  useEffect(() => {
    scanHardware();
  }, [scanHardware]);

  return {
    hardware,
    recommendation,
    isScanning,
    error,
    isDesktop,
    scanHardware,
    getWebHardwareInfo,
  };
}
