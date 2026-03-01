// TutoDeCode - Hardware Diagnostics Module
// Détecte CPU, GPU, RAM et recommande des modèles LLM adaptés

use serde::{Deserialize, Serialize};
use sysinfo::{System, Components, CpuRefreshKind};
use std::process::Command;

/// Structure des informations matérielles
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareInfo {
    /// Plateforme (Windows, macOS, Linux)
    pub platform: String,
    
    /// Informations CPU
    pub cpu: CpuInfo,
    
    /// Informations mémoire RAM
    pub memory: MemoryInfo,
    
    /// Informations GPU (si disponible)
    pub gpu: Option<GpuInfo>,
    
    /// Score estimé de performance (0-100)
    pub performance_score: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub brand: String,
    pub cores_physical: usize,
    pub cores_logical: usize,
    pub frequency_mhz: u64,
    pub architecture: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total_gb: f64,
    pub available_gb: f64,
    pub used_gb: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub vendor: String,
    pub vram_gb: Option<f64>,
    pub is_dedicated: bool,
}

/// Recommandation de modèle LLM
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmRecommendation {
    pub model_name: String,
    pub model_size: String,
    pub parameters: String,
    pub vram_required_gb: f64,
    pub ram_required_gb: f64,
    pub reason: String,
    pub suitable_for: Vec<String>,
}

/// Récupère les informations matérielles complètes
pub async fn get_hardware_info() -> Result<HardwareInfo, Box<dyn std::error::Error>> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Petite pause pour s'assurer que sysinfo a bien collecté les données
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    sys.refresh_all();
    
    let platform = detect_platform();
    let cpu = detect_cpu(&sys);
    let memory = detect_memory(&sys);
    let gpu = detect_gpu().await;
    let performance_score = calculate_performance_score(&cpu, &memory, &gpu);
    
    Ok(HardwareInfo {
        platform,
        cpu,
        memory,
        gpu,
        performance_score,
    })
}

/// Détecte la plateforme actuelle
fn detect_platform() -> String {
    #[cfg(target_os = "windows")]
    return "Windows".to_string();
    
    #[cfg(target_os = "macos")]
    return "macOS".to_string();
    
    #[cfg(target_os = "linux")]
    return "Linux".to_string();
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    return "Unknown".to_string();
}

/// Détecte les informations CPU
fn detect_cpu(sys: &System) -> CpuInfo {
    let cpus = sys.cpus();
    let first_cpu = cpus.first();
    
    CpuInfo {
        brand: first_cpu.map(|c| c.brand().to_string()).unwrap_or_else(|| "Unknown".to_string()),
        cores_physical: sys.physical_core_count().unwrap_or(cpus.len()),
        cores_logical: cpus.len(),
        frequency_mhz: first_cpu.map(|c| c.frequency()).unwrap_or(0),
        architecture: std::env::consts::ARCH.to_string(),
    }
}

/// Détecte les informations mémoire
fn detect_memory(sys: &System) -> MemoryInfo {
    let total = sys.total_memory() as f64 / 1024.0 / 1024.0 / 1024.0; // Convert to GB
    let available = sys.available_memory() as f64 / 1024.0 / 1024.0 / 1024.0;
    let used = sys.used_memory() as f64 / 1024.0 / 1024.0 / 1024.0;
    
    MemoryInfo {
        total_gb: (total * 10.0).round() / 10.0,
        available_gb: (available * 10.0).round() / 10.0,
        used_gb: (used * 10.0).round() / 10.0,
    }
}

/// Détecte les informations GPU (plateforme-spécifique)
async fn detect_gpu() -> Option<GpuInfo> {
    #[cfg(target_os = "windows")]
    {
        detect_gpu_windows().await
    }
    
    #[cfg(target_os = "macos")]
    {
        detect_gpu_macos().await
    }
    
    #[cfg(target_os = "linux")]
    {
        detect_gpu_linux().await
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        None
    }
}

/// Détection GPU sur Windows
#[cfg(target_os = "windows")]
async fn detect_gpu_windows() -> Option<GpuInfo> {
    // Utilise wmic pour obtenir les informations GPU
    let output = Command::new("wmic")
        .args(&["path", "win32_VideoController", "get", "Name,AdapterRAM", "/format:csv"])
        .output()
        .ok()?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // Parse la sortie CSV
    for line in stdout.lines().skip(1) {
        let parts: Vec<&str> = line.split(',').collect();
        if parts.len() >= 3 {
            let name = parts[parts.len() - 2].trim();
            let vram_str = parts[parts.len() - 1].trim();
            
            if !name.is_empty() && name != "Name" {
                let vram_bytes = vram_str.parse::<u64>().unwrap_or(0);
                let vram_gb = if vram_bytes > 0 {
                    Some((vram_bytes as f64 / 1024.0 / 1024.0 / 1024.0 * 10.0).round() / 10.0)
                } else {
                    None
                };
                
                let vendor = if name.to_lowercase().contains("nvidia") {
                    "NVIDIA"
                } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                    "AMD"
                } else if name.to_lowercase().contains("intel") {
                    "Intel"
                } else {
                    "Unknown"
                };
                
                let is_dedicated = !name.to_lowercase().contains("intel") || 
                                  name.to_lowercase().contains("arc");
                
                return Some(GpuInfo {
                    name: name.to_string(),
                    vendor: vendor.to_string(),
                    vram_gb,
                    is_dedicated,
                });
            }
        }
    }
    
    None
}

/// Détection GPU sur macOS
#[cfg(target_os = "macos")]
async fn detect_gpu_macos() -> Option<GpuInfo> {
    let output = Command::new("system_profiler")
        .args(&["SPDisplaysDataType", "-json"])
        .output()
        .ok()?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // Parse le JSON de system_profiler
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&stdout) {
        if let Some(displays) = json["SPDisplaysDataType"].as_array() {
            if let Some(display) = displays.first() {
                let name = display["sppci_model"].as_str()
                    .or_else(|| display["_name"].as_str())
                    .unwrap_or("Apple GPU");
                
                let vram = display["sppci_vram"].as_str()
                    .and_then(|s| {
                        s.split_whitespace().next()
                            .and_then(|n| n.parse::<f64>().ok())
                    });
                
                let is_apple_silicon = name.contains("Apple") || 
                                      std::env::consts::ARCH == "aarch64";
                
                return Some(GpuInfo {
                    name: name.to_string(),
                    vendor: if is_apple_silicon { "Apple" } else { "Unknown" }.to_string(),
                    vram_gb: vram,
                    is_dedicated: !is_apple_silicon,
                });
            }
        }
    }
    
    None
}

/// Détection GPU sur Linux
#[cfg(target_os = "linux")]
async fn detect_gpu_linux() -> Option<GpuInfo> {
    // Essayer nvidia-smi d'abord
    if let Ok(output) = Command::new("nvidia-smi")
        .args(&["--query-gpu=name,memory.total", "--format=csv,noheader"])
        .output() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let parts: Vec<&str> = stdout.split(',').collect();
        if parts.len() >= 2 {
            let name = parts[0].trim();
            let vram_str = parts[1].trim();
            let vram_mb = vram_str.split_whitespace().next()
                .and_then(|s| s.parse::<f64>().ok())
                .unwrap_or(0.0);
            
            return Some(GpuInfo {
                name: name.to_string(),
                vendor: "NVIDIA".to_string(),
                vram_gb: Some((vram_mb / 1024.0 * 10.0).round() / 10.0),
                is_dedicated: true,
            });
        }
    }
    
    // Fallback sur lspci
    if let Ok(output) = Command::new("lspci")
        .args(&["-nn", "-v"])
        .output() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        
        for line in stdout.lines() {
            if line.to_lowercase().contains("vga") || line.to_lowercase().contains("3d controller") {
                if let Some(start) = line.find(':') {
                    if let Some(end) = line.find('[') {
                        let name = line[start+1..end].trim();
                        let vendor = if name.to_lowercase().contains("nvidia") {
                            "NVIDIA"
                        } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                            "AMD"
                        } else if name.to_lowercase().contains("intel") {
                            "Intel"
                        } else {
                            "Unknown"
                        };
                        
                        return Some(GpuInfo {
                            name: name.to_string(),
                            vendor: vendor.to_string(),
                            vram_gb: None,
                            is_dedicated: vendor == "NVIDIA" || (vendor == "AMD" && !name.to_lowercase().contains("integrated")),
                        });
                    }
                }
            }
        }
    }
    
    None
}

/// Calcule un score de performance estimé (0-100)
fn calculate_performance_score(cpu: &CpuInfo, memory: &MemoryInfo, gpu: &Option<GpuInfo>) -> u8 {
    let mut score: u8 = 0;
    
    // Score basé sur le CPU (max 40 points)
    let cpu_score = match cpu.cores_logical {
        0..=2 => 10,
        3..=4 => 20,
        5..=8 => 30,
        9..=16 => 35,
        _ => 40,
    };
    score += cpu_score;
    
    // Score basé sur la RAM (max 30 points)
    let ram_score = match memory.total_gb as u64 {
        0..=4 => 5,
        5..=8 => 15,
        9..=16 => 25,
        17..=32 => 28,
        _ => 30,
    };
    score += ram_score;
    
    // Score basé sur le GPU (max 30 points)
    if let Some(ref gpu) = gpu {
        let gpu_score = if gpu.is_dedicated {
            match gpu.vram_gb {
                Some(vram) if vram >= 16.0 => 30,
                Some(vram) if vram >= 8.0 => 25,
                Some(vram) if vram >= 4.0 => 20,
                Some(_) => 15,
                None => 20,
            }
        } else {
            5 // GPU intégré
        };
        score += gpu_score;
    } else {
        score += 0; // Pas de GPU détecté
    }
    
    score
}

/// Recommande un modèle LLM basé sur le hardware
pub fn recommend_llm_model(hardware: &HardwareInfo) -> LlmRecommendation {
    let total_ram = hardware.memory.total_gb;
    let gpu_vram = hardware.gpu.as_ref().and_then(|g| g.vram_gb).unwrap_or(0.0);
    let has_dedicated_gpu = hardware.gpu.as_ref().map(|g| g.is_dedicated).unwrap_or(false);
    
    // Configuration haut de gamme: GPU dédié avec 8GB+ VRAM et 16GB+ RAM
    if has_dedicated_gpu && gpu_vram >= 8.0 && total_ram >= 16.0 {
        LlmRecommendation {
            model_name: "Llama 3.1 8B Instruct".to_string(),
            model_size: "8B paramètres".to_string(),
            parameters: "8B".to_string(),
            vram_required_gb: 6.0,
            ram_required_gb: 8.0,
            reason: format!("Votre {} avec {:.0}GB VRAM est idéal pour l'inférence locale de modèles de taille moyenne.", 
                hardware.gpu.as_ref().unwrap().name, gpu_vram),
            suitable_for: vec![
                "Génération de code avancée".to_string(),
                "Debugging complexe".to_string(),
                "Explications détaillées".to_string(),
                "Labs sur l'entraînement de modèles".to_string(),
            ],
        }
    }
    // Configuration moyenne: GPU dédié avec 4GB+ VRAM ou 16GB+ RAM
    else if (has_dedicated_gpu && gpu_vram >= 4.0) || total_ram >= 16.0 {
        LlmRecommendation {
            model_name: "Phi-3.5 Mini Instruct".to_string(),
            model_size: "3.8B paramètres".to_string(),
            parameters: "3.8B".to_string(),
            vram_required_gb: 3.0,
            ram_required_gb: 6.0,
            reason: "Configuration équilibrée pour l'apprentissage avec assistance IA efficace.".to_string(),
            suitable_for: vec![
                "Aide au code quotidienne".to_string(),
                "Explications de concepts".to_string(),
                "Suggestions de debugging".to_string(),
            ],
        }
    }
    // Configuration modeste: 8GB+ RAM
    else if total_ram >= 8.0 {
        LlmRecommendation {
            model_name: "TinyLlama 1.1B Chat".to_string(),
            model_size: "1.1B paramètres".to_string(),
            parameters: "1.1B".to_string(),
            vram_required_gb: 1.0,
            ram_required_gb: 2.0,
            reason: format!("Votre configuration avec {:.0}GB RAM permet l'inférence légère locale.", total_ram),
            suitable_for: vec![
                "Assistances basiques".to_string(),
                "Questions-réponses simples".to_string(),
                "Optimisation de conteneurs Docker".to_string(),
            ],
        }
    }
    // Configuration limitée
    else {
        LlmRecommendation {
            model_name: "Mode Cloud (API externe)".to_string(),
            model_size: "Variable".to_string(),
            parameters: "N/A".to_string(),
            vram_required_gb: 0.0,
            ram_required_gb: 0.0,
            reason: format!("Avec seulement {:.0}GB RAM, nous recommandons l'utilisation d'API cloud ou l'upgrade de votre système.", total_ram),
            suitable_for: vec![
                "Accès à des modèles puissants".to_string(),
                "Sans charge locale".to_string(),
                "Nécessite une connexion internet".to_string(),
            ],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_calculate_performance_score() {
        let cpu = CpuInfo {
            brand: "Test CPU".to_string(),
            cores_physical: 4,
            cores_logical: 8,
            frequency_mhz: 3200,
            architecture: "x86_64".to_string(),
        };
        
        let memory = MemoryInfo {
            total_gb: 16.0,
            available_gb: 8.0,
            used_gb: 8.0,
        };
        
        let gpu = Some(GpuInfo {
            name: "NVIDIA RTX 3060".to_string(),
            vendor: "NVIDIA".to_string(),
            vram_gb: Some(12.0),
            is_dedicated: true,
        });
        
        let score = calculate_performance_score(&cpu, &memory, &gpu);
        assert!(score > 70, "High-end system should have score > 70");
    }
}
