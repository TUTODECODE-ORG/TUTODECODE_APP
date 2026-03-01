// SPDX-License-Identifier: AGPL-3.0-only
// ============================================
// TutoDeCode Pro - Backend Rust Tauri v3
// Architecture sécurisée avec AppStats et commandes sandboxed
// ============================================

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State, Window};
use tokio::sync::{mpsc, oneshot};
use uuid::Uuid;

#[derive(Serialize)]
pub struct LocalAiStatus {
    pub available: bool,
    pub mode: String,
    pub provider: String,
    pub model: String,
    pub error: Option<String>,
}

#[derive(Deserialize)]
struct OllamaVersion {
    version: String,
}

#[derive(Deserialize)]
struct OllamaGenerateResponse {
    response: String,
}

#[derive(Deserialize)]
struct OllamaErrorResponse {
    error: Option<String>,
}

#[derive(Deserialize)]
struct OllamaModelInfo {
    name: String,
}

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Option<Vec<OllamaModelInfo>>,
}

// ============================================
// TYPES ET STRUCTURES
// ============================================

/// Statistiques globales de l'application (thread-safe)
pub struct AppStats {
    /// Nombre total de commandes exécutées
    pub commands_executed: AtomicU64,
    /// Nombre d'erreurs rencontrées
    pub errors_count: AtomicU64,
    /// Temps de démarrage de l'app
    pub start_time: Instant,
    /// Progression des chapitres par utilisateur
    pub user_progress: Mutex<HashMap<String, UserProgress>>,
    /// Historique des commandes
    pub command_history: Mutex<Vec<CommandEntry>>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct UserProgress {
    pub user_id: String,
    pub completed_chapters: Vec<String>,
    pub current_chapter: Option<String>,
    pub total_time_seconds: u64,
    pub last_activity: u64,
}

#[derive(Clone, Serialize)]
pub struct CommandEntry {
    pub id: String,
    pub command: String,
    pub timestamp: u64,
    pub success: bool,
    pub duration_ms: u64,
}

/// Réponse standardisée des commandes
#[derive(Serialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: u64,
}

impl<T> CommandResult<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: current_timestamp(),
        }
    }

    pub fn err(error: impl ToString) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error.to_string()),
            timestamp: current_timestamp(),
        }
    }
}

/// Informations système
#[derive(Serialize)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub version: String,
    pub cpu_cores: usize,
    pub memory_gb: f64,
}

/// Métriques de performance
#[derive(Serialize)]
pub struct PerformanceMetrics {
    pub uptime_seconds: u64,
    pub commands_executed: u64,
    pub errors_count: u64,
    pub error_rate: f64,
    pub memory_usage_mb: u64,
}

// ============================================
// ÉTAT GLOBAL (GÉRÉ PAR TAURI)
// ============================================

impl AppStats {
    pub fn new() -> Self {
        Self {
            commands_executed: AtomicU64::new(0),
            errors_count: AtomicU64::new(0),
            start_time: Instant::now(),
            user_progress: Mutex::new(HashMap::new()),
            command_history: Mutex::new(Vec::with_capacity(1000)),
        }
    }

    /// Incrémente le compteur de commandes
    pub fn record_command(&self, command: &str, success: bool, duration_ms: u64) {
        self.commands_executed.fetch_add(1, Ordering::Relaxed);
        
        if !success {
            self.errors_count.fetch_add(1, Ordering::Relaxed);
        }

        let entry = CommandEntry {
            id: Uuid::new_v4().to_string(),
            command: command.to_string(),
            timestamp: current_timestamp(),
            success,
            duration_ms,
        };

        if let Ok(mut history) = self.command_history.lock() {
            history.push(entry);
            // Garde seulement les 1000 dernières commandes
            if history.len() > 1000 {
                history.remove(0);
            }
        }
    }

    /// Récupère les métriques actuelles
    pub fn get_metrics(&self) -> PerformanceMetrics {
        let commands = self.commands_executed.load(Ordering::Relaxed);
        let errors = self.errors_count.load(Ordering::Relaxed);

        PerformanceMetrics {
            uptime_seconds: self.start_time.elapsed().as_secs(),
            commands_executed: commands,
            errors_count: errors,
            error_rate: if commands > 0 {
                (errors as f64 / commands as f64) * 100.0
            } else {
                0.0
            },
            memory_usage_mb: get_memory_usage(),
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn get_memory_usage() -> u64 {
    // Simplifié - en production, utiliser sysinfo
    0
}

fn local_ai_model() -> String {
    std::env::var("TUTODECODE_AI_MODEL").unwrap_or_else(|_| "tinyllama".to_string())
}

#[tauri::command]
async fn check_local_ai_status() -> CommandResult<LocalAiStatus> {
    let model = local_ai_model();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build();

    let client = match client {
        Ok(c) => c,
        Err(e) => {
            return CommandResult::ok(LocalAiStatus {
                available: false,
                mode: "simulation".to_string(),
                provider: "ollama".to_string(),
                model,
                error: Some(e.to_string()),
            })
        }
    };

    let ping = client.get("http://127.0.0.1:11434/api/version").send().await;

    match ping {
        Ok(resp) if resp.status().is_success() => {
            let parsed = resp.json::<OllamaVersion>().await.ok();
            let provider = parsed
                .map(|v| format!("ollama {}", v.version))
                .unwrap_or_else(|| "ollama".to_string());

            CommandResult::ok(LocalAiStatus {
                available: true,
                mode: "local".to_string(),
                provider,
                model,
                error: None,
            })
        }
        Ok(resp) => CommandResult::ok(LocalAiStatus {
            available: false,
            mode: "simulation".to_string(),
            provider: "ollama".to_string(),
            model,
            error: Some(format!("Ollama indisponible: HTTP {}", resp.status())),
        }),
        Err(e) => CommandResult::ok(LocalAiStatus {
            available: false,
            mode: "simulation".to_string(),
            provider: "ollama".to_string(),
            model,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
async fn ask_local_ai(prompt: String) -> CommandResult<String> {
    if prompt.trim().is_empty() {
        return CommandResult::err("Prompt vide");
    }

    let model = local_ai_model();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build();

    let client = match client {
        Ok(c) => c,
        Err(e) => return CommandResult::err(format!("Client HTTP invalide: {}", e)),
    };

    let send_generate = |model_name: &str| {
        let payload = serde_json::json!({
            "model": model_name,
            "prompt": prompt,
            "stream": false
        });

        client
            .post("http://127.0.0.1:11434/api/generate")
            .json(&payload)
            .send()
    };

    let response = match send_generate(&model).await {
        Ok(r) => r,
        Err(e) => {
            return CommandResult::err(format!(
                "IA locale indisponible. Démarrez Ollama puis réessayez. Détail: {}",
                e
            ))
        }
    };

    if !response.status().is_success() {
        let status = response.status();
        let maybe_error = response
            .json::<OllamaErrorResponse>()
            .await
            .ok()
            .and_then(|e| e.error)
            .unwrap_or_default();

        if status.as_u16() == 404 {
            let tags_resp = client
                .get("http://127.0.0.1:11434/api/tags")
                .send()
                .await
                .ok()
                .filter(|r| r.status().is_success());

            if let Some(tags_resp) = tags_resp {
                if let Ok(tags) = tags_resp.json::<OllamaTagsResponse>().await {
                    if let Some(fallback_model) = tags
                        .models
                        .unwrap_or_default()
                        .into_iter()
                        .map(|m| m.name)
                        .find(|name| !name.trim().is_empty() && name != &model)
                    {
                        let retry_response = match send_generate(&fallback_model).await {
                            Ok(r) => r,
                            Err(e) => {
                                return CommandResult::err(format!(
                                    "Erreur Ollama: modèle '{}' introuvable (HTTP 404) et fallback '{}' indisponible. Détail: {}",
                                    model, fallback_model, e
                                ))
                            }
                        };

                        if retry_response.status().is_success() {
                            return match retry_response.json::<OllamaGenerateResponse>().await {
                                Ok(data) => CommandResult::ok(data.response),
                                Err(e) => CommandResult::err(format!("Réponse IA invalide: {}", e)),
                            };
                        }
                    }
                }
            }

            if maybe_error.is_empty() {
                return CommandResult::err(format!(
                    "Erreur Ollama: HTTP 404 Not Found. Le modèle '{}' n'est probablement pas installé. Lancez: ollama pull {}",
                    model, model
                ));
            }

            return CommandResult::err(format!(
                "Erreur Ollama: HTTP 404 Not Found ({})",
                maybe_error
            ));
        }

        if maybe_error.is_empty() {
            return CommandResult::err(format!("Erreur Ollama: HTTP {}", status));
        }

        return CommandResult::err(format!("Erreur Ollama: HTTP {} ({})", status, maybe_error));
    }

    match response.json::<OllamaGenerateResponse>().await {
        Ok(data) => CommandResult::ok(data.response),
        Err(e) => CommandResult::err(format!("Réponse IA invalide: {}", e)),
    }
}

/// Valide un nom de fichier (anti path traversal)
fn validate_filename(name: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err("Nom de fichier vide".to_string());
    }

    if name.len() > 255 {
        return Err("Nom de fichier trop long".to_string());
    }

    // Caractères interdits
    let forbidden = ['/', '\\', ':', '*', '?', '"', '<', '>', '|', '\0'];
    if name.chars().any(|c| forbidden.contains(&c)) {
        return Err("Caractères interdits dans le nom".to_string());
    }

    // Anti path traversal
    if name.contains("..") {
        return Err("Path traversal détecté".to_string());
    }

    Ok(())
}

/// Récupère le répertoire de données de l'application
fn get_app_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())
}

#[derive(Clone, Serialize, Deserialize)]
pub struct CourseLabConfig {
    pub user_id: String,
    pub root_dir: String,
    pub workspace_dir: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct TicketValidationReport {
    pub valid: bool,
    pub score: u8,
    pub feedback: String,
    pub used_ai: bool,
    pub validated_at: u64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct CourseTicket {
    pub id: String,
    pub user_id: String,
    pub chapter_id: String,
    pub chapter_title: String,
    pub status: String,
    pub alert_message: String,
    pub workspace_dir: String,
    pub scenario_dir: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub last_validation: Option<TicketValidationReport>,
}

#[derive(Serialize)]
pub struct TicketSubmitResult {
    pub ticket: CourseTicket,
    pub report: TicketValidationReport,
    pub generated_files: Vec<String>,
}

#[derive(Deserialize)]
struct AiTicketDecision {
    valid: bool,
    score: u8,
    feedback: String,
}

fn sanitize_segment(input: &str) -> String {
    input
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect::<String>()
}

fn lab_config_path(app_handle: &AppHandle, user_id: &str) -> Result<PathBuf, String> {
    let app_dir = get_app_dir(app_handle)?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    Ok(app_dir.join(format!("course_lab_config_{}.json", sanitize_segment(user_id))))
}

fn load_lab_config(app_handle: &AppHandle, user_id: &str) -> Result<CourseLabConfig, String> {
    let path = lab_config_path(app_handle, user_id)?;
    if !path.exists() {
        return Err("Aucun dossier de lab configuré".to_string());
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str::<CourseLabConfig>(&raw).map_err(|e| e.to_string())
}

fn save_lab_config(app_handle: &AppHandle, config: &CourseLabConfig) -> Result<(), String> {
    let path = lab_config_path(app_handle, &config.user_id)?;
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

fn ensure_workspace_dirs(workspace_dir: &Path) -> Result<(), String> {
    fs::create_dir_all(workspace_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(workspace_dir.join("tickets")).map_err(|e| e.to_string())?;
    fs::create_dir_all(workspace_dir.join("scenarios")).map_err(|e| e.to_string())?;
    fs::create_dir_all(workspace_dir.join("submissions")).map_err(|e| e.to_string())?;
    Ok(())
}

fn ticket_files_from_workspace(workspace_dir: &str) -> Result<Vec<PathBuf>, String> {
    let tickets_dir = Path::new(workspace_dir).join("tickets");
    if !tickets_dir.exists() {
        return Ok(vec![]);
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(tickets_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().map(|e| e == "json").unwrap_or(false) {
            files.push(path);
        }
    }
    Ok(files)
}

fn load_tickets_for_user(app_handle: &AppHandle, user_id: &str) -> Result<Vec<CourseTicket>, String> {
    let config = load_lab_config(app_handle, user_id)?;
    let mut tickets = Vec::new();

    for file in ticket_files_from_workspace(&config.workspace_dir)? {
        let raw = fs::read_to_string(file).map_err(|e| e.to_string())?;
        if let Ok(ticket) = serde_json::from_str::<CourseTicket>(&raw) {
            if ticket.user_id == user_id {
                tickets.push(ticket);
            }
        }
    }

    tickets.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(tickets)
}

fn save_ticket(workspace_dir: &str, ticket: &CourseTicket) -> Result<(), String> {
    let path = Path::new(workspace_dir)
        .join("tickets")
        .join(format!("{}.json", ticket.id));
    let json = serde_json::to_string_pretty(ticket).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

fn language_from_course(chapter_id: &str, chapter_title: &str) -> (&'static str, &'static str) {
    let lower = format!("{} {}", chapter_id.to_lowercase(), chapter_title.to_lowercase());
    if lower.contains("python") {
        ("python", "py")
    } else if lower.contains("sql") || lower.contains("database") {
        ("sql", "sql")
    } else if lower.contains("linux") || lower.contains("docker") || lower.contains("kubernetes") {
        if cfg!(target_os = "windows") {
            ("powershell", "ps1")
        } else {
            ("bash", "sh")
        }
    } else if lower.contains("rust") || lower.contains("tauri") {
        ("rust", "rs")
    } else {
        ("javascript", "js")
    }
}

fn enforce_windows_terminal_content(content: &str) -> String {
    let mut normalized = content
        .replace("```bash", "```powershell")
        .replace("```sh", "```powershell")
        .replace(" /bin/bash", " powershell.exe")
        .replace("bash ", "powershell ")
        .replace(".sh", ".ps1");

    if !normalized.to_lowercase().contains("powershell") {
        normalized = format!(
            "⚠️ Environnement Windows: utilisez le terminal intégré de l'app (PowerShell/CMD). N'utilisez pas bash/sh.\n\n{}",
            normalized
        );
    }

    normalized
}

async fn analyze_ticket_with_ai(
    chapter_id: &str,
    chapter_title: &str,
    chapter_context: Option<&str>,
    solution: &str,
) -> Result<Option<AiTicketDecision>, String> {
    let model = local_ai_model();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())?;

    let context_snippet = chapter_context
        .unwrap_or("")
        .chars()
        .take(6000)
        .collect::<String>();

    let prompt = format!(
        "Tu es un évaluateur technique strict. Analyse la solution d'un ticket de cours.\n\nCours: {}\nID: {}\n\nContexte pédagogique (théorie, mission, attentes):\n{}\n\nSolution utilisateur:\n{}\n\nRègles: compare la solution aux exigences du contexte, vérifie si les actions décrites sont concrètes et testables, puis décide réussite/échec.\nRéponds UNIQUEMENT en JSON valide avec ce schéma exact:\n{{\"valid\":true|false,\"score\":0..100,\"feedback\":\"texte court en français\"}}",
        chapter_title,
        chapter_id,
        context_snippet,
        solution
    );

    let payload = serde_json::json!({
        "model": model,
        "prompt": prompt,
        "stream": false
    });

    let response = client
        .post("http://127.0.0.1:11434/api/generate")
        .json(&payload)
        .send()
        .await;

    let response = match response {
        Ok(resp) => resp,
        Err(_) => return Ok(None),
    };

    if !response.status().is_success() {
        return Ok(None);
    }

    let data = match response.json::<OllamaGenerateResponse>().await {
        Ok(data) => data,
        Err(_) => return Ok(None),
    };

    let text = data.response.trim();
    let json_candidate = if let (Some(start), Some(end)) = (text.find('{'), text.rfind('}')) {
        &text[start..=end]
    } else {
        text
    };

    match serde_json::from_str::<AiTicketDecision>(json_candidate) {
        Ok(parsed) => Ok(Some(parsed)),
        Err(_) => Ok(None),
    }
}

async fn generate_ticket_scenario_with_ai(
    chapter_id: &str,
    chapter_title: &str,
    chapter_context: Option<&str>,
    language: &str,
    extension: &str,
) -> Result<Option<(String, String, String)>, String> {
    let context = chapter_context
        .unwrap_or("")
        .chars()
        .take(7000)
        .collect::<String>();

    if context.trim().is_empty() {
        return Ok(None);
    }

    let model = local_ai_model();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())?;

    let prompt = format!(
        "Tu es un générateur de scénario pédagogique sans donner la réponse finale.\n\nCours: {}\nID: {}\nLangage cible: {} (. {})\n\nContexte du cours:\n{}\n\nContraintes terminal: {}\n\nGénère un JSON strict avec ce schéma:\n{{\"readme\":\"...\",\"mission\":\"...\",\"starter\":\"...\"}}\n\nRègles: mission concrète, starter incomplet mais guidant, pas de solution finale explicite.",
        chapter_title,
        chapter_id,
        language,
        extension,
        context,
        if cfg!(target_os = "windows") {
            "Windows uniquement: utiliser PowerShell/CMD, ne jamais utiliser bash/sh et ne pas proposer de scripts .sh"
        } else {
            "Linux/macOS: utiliser shell compatible bash"
        }
    );

    let payload = serde_json::json!({
        "model": model,
        "prompt": prompt,
        "stream": false
    });

    let response = match client
        .post("http://127.0.0.1:11434/api/generate")
        .json(&payload)
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(_) => return Ok(None),
    };

    if !response.status().is_success() {
        return Ok(None);
    }

    let data = match response.json::<OllamaGenerateResponse>().await {
        Ok(data) => data,
        Err(_) => return Ok(None),
    };

    let text = data.response.trim();
    let json_candidate = if let (Some(start), Some(end)) = (text.find('{'), text.rfind('}')) {
        &text[start..=end]
    } else {
        text
    };

    #[derive(Deserialize)]
    struct AiScenarioFiles {
        readme: String,
        mission: String,
        starter: String,
    }

    match serde_json::from_str::<AiScenarioFiles>(json_candidate) {
        Ok(parsed) => {
            if cfg!(target_os = "windows") {
                Ok(Some((
                    enforce_windows_terminal_content(&parsed.readme),
                    enforce_windows_terminal_content(&parsed.mission),
                    enforce_windows_terminal_content(&parsed.starter),
                )))
            } else {
                Ok(Some((parsed.readme, parsed.mission, parsed.starter)))
            }
        }
        Err(_) => Ok(None),
    }
}

fn fallback_ticket_validation(
    chapter_id: &str,
    chapter_title: &str,
    chapter_context: Option<&str>,
    solution: &str,
) -> TicketValidationReport {
    let lower = solution.to_lowercase();
    let mut score: i32 = 0;
    let context_lower = chapter_context.unwrap_or("").to_lowercase();

    if solution.trim().len() >= 80 {
        score += 30;
    }

    for keyword in chapter_id.split(|c: char| !c.is_alphanumeric()) {
        if keyword.len() > 2 && lower.contains(&keyword.to_lowercase()) {
            score += 5;
        }
    }

    for keyword in chapter_title.split_whitespace() {
        if keyword.len() > 3 && lower.contains(&keyword.to_lowercase()) {
            score += 5;
        }
    }

    for keyword in context_lower
        .split(|c: char| !c.is_alphanumeric())
        .filter(|k| k.len() >= 4)
        .take(20)
    {
        if lower.contains(keyword) {
            score += 2;
        }
    }

    if lower.contains("fix") || lower.contains("corrig") || lower.contains("résolu") || lower.contains("resolve") {
        score += 20;
    }

    if lower.contains("test") || lower.contains("validation") || lower.contains("preuve") {
        score += 15;
    }

    if score > 100 {
        score = 100;
    }

    let valid = score >= 60;

    TicketValidationReport {
        valid,
        score: score as u8,
        feedback: if valid {
            "Validation automatique: solution suffisamment argumentée. Vous pouvez passer au ticket suivant.".to_string()
        } else {
            "Validation automatique: détails insuffisants. Expliquez le problème, le correctif appliqué et la preuve de réussite (tests/logs).".to_string()
        },
        used_ai: false,
        validated_at: current_timestamp(),
    }
}

fn write_ai_validation_artifacts(
    workspace_dir: &str,
    ticket: &CourseTicket,
    solution: &str,
    chapter_context: Option<&str>,
    report: &TicketValidationReport,
) -> Result<Vec<String>, String> {
    let mut generated_files = Vec::new();

    let scenario_path = Path::new(&ticket.scenario_dir);
    if scenario_path.exists() {
        let report_path = scenario_path.join("AI_VALIDATION_REPORT.md");
        let context_excerpt = chapter_context
            .unwrap_or("")
            .chars()
            .take(2000)
            .collect::<String>();
        let md = format!(
            "# Rapport IA de validation\n\n- Ticket: {}\n- Cours: {}\n- Statut: {}\n- Score: {}/100\n\n## Feedback\n{}\n\n## Attendus du cours pris en compte\n{}\n\n## Résumé de la soumission\n{}\n",
            ticket.id,
            ticket.chapter_title,
            if report.valid { "réussi" } else { "à revoir" },
            report.score,
            report.feedback,
            if context_excerpt.trim().is_empty() {
                "Contexte non fourni".to_string()
            } else {
                context_excerpt
            },
            solution.chars().take(1200).collect::<String>()
        );
        fs::write(&report_path, md).map_err(|e| e.to_string())?;
        generated_files.push(report_path.to_string_lossy().to_string());
    }

    let submissions_dir = Path::new(workspace_dir).join("submissions");
    let json_path = submissions_dir.join(format!(
        "{}-{}-ai_result.json",
        sanitize_segment(&ticket.id),
        current_timestamp()
    ));

    let payload = serde_json::json!({
        "ticket_id": ticket.id,
        "chapter_id": ticket.chapter_id,
        "chapter_title": ticket.chapter_title,
        "valid": report.valid,
        "score": report.score,
        "feedback": report.feedback,
        "used_ai": report.used_ai,
        "validated_at": report.validated_at
    });
    fs::write(&json_path, serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    generated_files.push(json_path.to_string_lossy().to_string());

    Ok(generated_files)
}

/// Crée les fichiers de mise en situation pour un chapitre
#[tauri::command]
fn create_scenario_files(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    chapter_id: String,
) -> CommandResult<Vec<String>> {
    let start = Instant::now();

    let result = (|| -> Result<Vec<String>, String> {
        if chapter_id.is_empty() {
            return Err("chapter_id vide".to_string());
        }

        // Nom de dossier sûr
        validate_filename(&chapter_id)?;

        let app_dir = get_app_dir(&app_handle)?;
        let scenarios_dir = app_dir.join("scenarios").join(&chapter_id);

        fs::create_dir_all(&scenarios_dir).map_err(|e| e.to_string())?;

        // Fichiers à créer: README.md, starter.rs, solution.txt (vide)
        let mut created: Vec<String> = Vec::new();

        let readme = scenarios_dir.join("README.md");
        let readme_content = format!(
            "# Mise en situation - {}\n\nOuvrez le terminal et suivez les instructions du challenge. Ne demandez pas la réponse à l'IA — elle doit guider uniquement.\n",
            chapter_id
        );
        fs::write(&readme, readme_content).map_err(|e| e.to_string())?;
        created.push(readme.file_name().unwrap().to_string_lossy().to_string());

        let starter = scenarios_dir.join("starter.rs");
        let starter_content = format!(
            "// Fichier starter pour {}\n// Complétez la solution ici\nfn main() {{\n    println!(\"Implémentez la solution pour {}\");\n}}\n",
            chapter_id, chapter_id
        );
        fs::write(&starter, starter_content).map_err(|e| e.to_string())?;
        created.push(starter.file_name().unwrap().to_string_lossy().to_string());

        let solution = scenarios_dir.join("solution.txt");
        fs::write(&solution, "").map_err(|e| e.to_string())?;
        created.push(solution.file_name().unwrap().to_string_lossy().to_string());

        Ok(created)
    })();

    let success = result.is_ok();
    stats.record_command("create_scenario_files", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[tauri::command]
fn set_course_lab_workspace(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
    root_dir: String,
) -> CommandResult<CourseLabConfig> {
    let start = Instant::now();

    let result = (|| -> Result<CourseLabConfig, String> {
        if user_id.trim().is_empty() {
            return Err("Utilisateur invalide".to_string());
        }

        let root = PathBuf::from(root_dir.trim());
        if !root.exists() || !root.is_dir() {
            return Err("Le dossier sélectionné est invalide".to_string());
        }

        let workspace_dir = root.join("TutoDeCode_CourseLab");
        ensure_workspace_dirs(&workspace_dir)?;

        let now = current_timestamp();
        let config = CourseLabConfig {
            user_id: user_id.clone(),
            root_dir: root.to_string_lossy().to_string(),
            workspace_dir: workspace_dir.to_string_lossy().to_string(),
            created_at: now,
            updated_at: now,
        };

        save_lab_config(&app_handle, &config)?;
        Ok(config)
    })();

    let success = result.is_ok();
    stats.record_command("set_course_lab_workspace", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[tauri::command]
fn get_course_lab_workspace(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
) -> CommandResult<CourseLabConfig> {
    let start = Instant::now();
    let result = load_lab_config(&app_handle, &user_id);

    let success = result.is_ok();
    stats.record_command("get_course_lab_workspace", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[tauri::command]
fn open_course_lab_path(
    stats: State<Arc<AppStats>>,
    path: String,
) -> CommandResult<bool> {
    let start = Instant::now();

    let result = (|| -> Result<bool, String> {
        let target = path.trim();
        if target.is_empty() {
            return Err("Chemin invalide".to_string());
        }

        let target_path = PathBuf::from(target);
        if !target_path.exists() {
            return Err("Le dossier de mission est introuvable".to_string());
        }

        #[cfg(target_os = "windows")]
        {
            Command::new("explorer")
                .arg(target)
                .spawn()
                .map_err(|e| e.to_string())?;
        }

        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg(target)
                .spawn()
                .map_err(|e| e.to_string())?;
        }

        #[cfg(all(unix, not(target_os = "macos")))]
        {
            Command::new("xdg-open")
                .arg(target)
                .spawn()
                .map_err(|e| e.to_string())?;
        }

        Ok(true)
    })();

    let success = result.is_ok();
    stats.record_command("open_course_lab_path", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[tauri::command]
fn list_course_tickets(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
) -> CommandResult<Vec<CourseTicket>> {
    let start = Instant::now();
    let result = load_tickets_for_user(&app_handle, &user_id);

    let success = result.is_ok();
    stats.record_command("list_course_tickets", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[tauri::command]
fn create_course_ticket(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
    chapter_id: String,
    chapter_title: String,
    chapter_context: Option<String>,
) -> CommandResult<CourseTicket> {
    let start = Instant::now();

    let result = (|| -> Result<CourseTicket, String> {
        if user_id.trim().is_empty() || chapter_id.trim().is_empty() {
            return Err("Paramètres ticket invalides".to_string());
        }

        let config = load_lab_config(&app_handle, &user_id)?;
        ensure_workspace_dirs(Path::new(&config.workspace_dir))?;

        // Évite de créer des doublons de ticket ouverts pour le même cours
        let existing = load_tickets_for_user(&app_handle, &user_id)?
            .into_iter()
            .find(|t| t.chapter_id == chapter_id && t.status != "resolved");

        if let Some(ticket) = existing {
            return Ok(ticket);
        }

        let ticket_id = Uuid::new_v4().to_string();
        let chapter_slug = sanitize_segment(&chapter_id);
        let ticket_prefix = format!("{}-{}", chapter_slug, &ticket_id[..8]);
        let scenario_dir = Path::new(&config.workspace_dir).join("scenarios").join(&ticket_prefix);
        fs::create_dir_all(&scenario_dir).map_err(|e| e.to_string())?;

        let (lang, ext) = language_from_course(&chapter_id, &chapter_title);

        let readme = scenario_dir.join("README.md");
        let mission = scenario_dir.join("MISSION.md");
        let starter = scenario_dir.join(format!("starter_solution.{}", ext));

        let ai_scenario = tauri::async_runtime::block_on(generate_ticket_scenario_with_ai(
            &chapter_id,
            &chapter_title,
            chapter_context.as_deref(),
            lang,
            ext,
        ))?;

        let (readme_content, mission_content, starter_content) = if let Some((r, m, s)) = ai_scenario {
            if cfg!(target_os = "windows") {
                (
                    enforce_windows_terminal_content(&r),
                    enforce_windows_terminal_content(&m),
                    enforce_windows_terminal_content(&s),
                )
            } else {
                (r, m, s)
            }
        } else {
            (
                format!(
                    "# Ticket de mise en situation\n\n- Ticket: {}\n- Cours: {}\n- ID cours: {}\n\nObjectif: résoudre le problème dans ce dossier puis soumettre votre correction dans l'application.",
                    ticket_id, chapter_title, chapter_id
                ),
                format!(
                    "# Mission\n\nUn bug bloque ce module ({chapter_title}).\n\n1. Analysez les fichiers de scénario.\n2. Corrigez le code dans `starter_solution.{ext}`.\n3. Utilisez le terminal intégré de l'app (PowerShell/CMD sur Windows).\n4. Ajoutez un court résumé de votre démarche dans l'app pour validation IA."
                ),
                format!(
                    "// Langage cible: {lang}\n// TODO: corrigez ici le problème demandé par le ticket {ticket_id}\n\n// Astuce: démontrez le correctif avec un test, un log, ou une preuve d'exécution.\n"
                ),
            )
        };

        fs::write(&readme, readme_content).map_err(|e| e.to_string())?;
        fs::write(&mission, mission_content).map_err(|e| e.to_string())?;
        fs::write(&starter, starter_content).map_err(|e| e.to_string())?;

        let now = current_timestamp();
        let ticket = CourseTicket {
            id: ticket_id,
            user_id: user_id.clone(),
            chapter_id: chapter_id.clone(),
            chapter_title: chapter_title.clone(),
            status: "open".to_string(),
            alert_message: format!(
                "Nouveau ticket: \"{}\". Ouvrez le dossier de mission, corrigez le problème puis soumettez votre solution.",
                chapter_title
            ),
            workspace_dir: config.workspace_dir.clone(),
            scenario_dir: scenario_dir.to_string_lossy().to_string(),
            created_at: now,
            updated_at: now,
            last_validation: None,
        };

        save_ticket(&config.workspace_dir, &ticket)?;
        Ok(ticket)
    })();

    let success = result.is_ok();
    stats.record_command("create_course_ticket", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[tauri::command]
fn submit_course_ticket_solution(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
    ticket_id: String,
    solution: String,
    chapter_context: Option<String>,
) -> CommandResult<TicketSubmitResult> {
    let start = Instant::now();

    let result = (|| -> Result<TicketSubmitResult, String> {
        if solution.trim().is_empty() {
            return Err("La solution ne peut pas être vide".to_string());
        }

        let config = load_lab_config(&app_handle, &user_id)?;
        ensure_workspace_dirs(Path::new(&config.workspace_dir))?;

        let ticket_file = Path::new(&config.workspace_dir)
            .join("tickets")
            .join(format!("{}.json", sanitize_segment(&ticket_id)));

        if !ticket_file.exists() {
            return Err("Ticket introuvable".to_string());
        }

        let ticket_raw = fs::read_to_string(&ticket_file).map_err(|e| e.to_string())?;
        let mut ticket: CourseTicket = serde_json::from_str(&ticket_raw).map_err(|e| e.to_string())?;

        if ticket.user_id != user_id {
            return Err("Accès ticket refusé".to_string());
        }

        // Sauvegarde de la soumission pour traçabilité pédagogique
        let submission_file = Path::new(&config.workspace_dir)
            .join("submissions")
            .join(format!("{}-{}.md", sanitize_segment(&ticket.id), current_timestamp()));
        fs::write(&submission_file, solution.as_bytes()).map_err(|e| e.to_string())?;

        let ai_report = tauri::async_runtime::block_on(analyze_ticket_with_ai(
            &ticket.chapter_id,
            &ticket.chapter_title,
            chapter_context.as_deref(),
            &solution,
        ))?;

        let report = if let Some(ai) = ai_report {
            TicketValidationReport {
                valid: ai.valid,
                score: ai.score.min(100),
                feedback: ai.feedback,
                used_ai: true,
                validated_at: current_timestamp(),
            }
        } else {
            fallback_ticket_validation(
                &ticket.chapter_id,
                &ticket.chapter_title,
                chapter_context.as_deref(),
                &solution,
            )
        };

        ticket.last_validation = Some(report.clone());
        ticket.status = if report.valid { "resolved".to_string() } else { "in-progress".to_string() };
        ticket.updated_at = current_timestamp();

        save_ticket(&config.workspace_dir, &ticket)?;

        let generated_files = write_ai_validation_artifacts(
            &config.workspace_dir,
            &ticket,
            &solution,
            chapter_context.as_deref(),
            &report,
        )?;

        Ok(TicketSubmitResult {
            ticket,
            report,
            generated_files,
        })
    })();

    let success = result.is_ok();
    stats.record_command(
        "submit_course_ticket_solution",
        success,
        start.elapsed().as_millis() as u64,
    );

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

// ============================================
// COMMANDES TAURI (SANDBOXED)
// ============================================

/// Sauvegarde la progression d'un utilisateur
#[tauri::command]
fn save_progress(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
    chapter_id: String,
    completed: bool,
) -> CommandResult<bool> {
    let start = Instant::now();

    let result = (|| -> Result<bool, String> {
        // Validation des entrées
        if user_id.is_empty() || chapter_id.is_empty() {
            return Err("ID utilisateur ou chapitre invalide".to_string());
        }

        let mut progress_map = stats.user_progress.lock().map_err(|e| e.to_string())?;

        let user_progress = progress_map.entry(user_id.clone()).or_insert(UserProgress {
            user_id: user_id.clone(),
            completed_chapters: Vec::new(),
            current_chapter: Some(chapter_id.clone()),
            total_time_seconds: 0,
            last_activity: current_timestamp(),
        });

        if completed && !user_progress.completed_chapters.contains(&chapter_id) {
            user_progress.completed_chapters.push(chapter_id);
        }

        user_progress.last_activity = current_timestamp();

        // Sauvegarde sur disque
        let app_dir = get_app_dir(&app_handle)?;
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

        let progress_file = app_dir.join(format!("progress_{}.json", user_id));
        let json = serde_json::to_string_pretty(&user_progress).map_err(|e| e.to_string())?;

        fs::write(&progress_file, json).map_err(|e| e.to_string())?;

        Ok(true)
    })();

    let success = result.is_ok();
    stats.record_command("save_progress", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

/// Charge la progression d'un utilisateur
#[tauri::command]
fn load_progress(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
) -> CommandResult<UserProgress> {
    let start = Instant::now();

    let result = (|| -> Result<UserProgress, String> {
        if user_id.is_empty() {
            return Err("ID utilisateur invalide".to_string());
        }

        let app_dir = get_app_dir(&app_handle)?;
        let progress_file = app_dir.join(format!("progress_{}.json", user_id));

        if !progress_file.exists() {
            // Retourne une progression vide
            return Ok(UserProgress {
                user_id,
                completed_chapters: Vec::new(),
                current_chapter: None,
                total_time_seconds: 0,
                last_activity: current_timestamp(),
            });
        }

        let json = fs::read_to_string(&progress_file).map_err(|e| e.to_string())?;
        let progress: UserProgress = serde_json::from_str(&json).map_err(|e| e.to_string())?;

        Ok(progress)
    })();

    let success = result.is_ok();
    stats.record_command("load_progress", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

/// Exécute une commande système de manière sandboxée
#[tauri::command]
fn execute_command(
    stats: State<'_, Arc<AppStats>>,
    command: String,
    args: Vec<String>,
    _timeout_secs: Option<u64>,
) -> CommandResult<CommandOutput> {
    let start = Instant::now();
    // Liste blanche des commandes autorisées
    let allowed_commands = vec![
        "cargo", "rustc", "rustup", "git", "echo", "pwd", "ls", "cat",
        "mkdir", "rm", "cp", "mv", "touch", "head", "tail", "grep",
    ];

    let cmd_name = command.split_whitespace().next().unwrap_or("");

    let result = if !allowed_commands.contains(&cmd_name) {
        Err(format!("Commande '{}' non autorisée", cmd_name))
    } else {
        Command::new(&command)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .map(|output| CommandOutput {
                stdout: String::from_utf8_lossy(&output.stdout).to_string(),
                stderr: String::from_utf8_lossy(&output.stderr).to_string(),
                exit_code: output.status.code().unwrap_or(-1),
            })
            .map_err(|e| e.to_string())
    };

    let success = result.is_ok();
    stats.record_command(&command, success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[derive(Serialize)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

/// Lit un fichier de manière sécurisée
#[tauri::command]
fn read_file(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    filename: String,
) -> CommandResult<String> {
    let start = Instant::now();

    let result = (|| -> Result<String, String> {
        validate_filename(&filename)?;

        let app_dir = get_app_dir(&app_handle)?;
        let file_path = app_dir.join(&filename);

        // Vérifie que le fichier est dans le répertoire autorisé
        if !file_path.starts_with(&app_dir) {
            return Err("Accès interdit".to_string());
        }

        // Limite la taille (1MB)
        let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
        if metadata.len() > 1_000_000 {
            return Err("Fichier trop volumineux".to_string());
        }

        fs::read_to_string(&file_path).map_err(|e| e.to_string())
    })();

    let success = result.is_ok();
    stats.record_command("read_file", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

/// Écrit un fichier de manière sécurisée
#[tauri::command]
fn write_file(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    filename: String,
    content: String,
) -> CommandResult<bool> {
    let start = Instant::now();

    let result = (|| -> Result<bool, String> {
        validate_filename(&filename)?;

        // Limite la taille (1MB)
        if content.len() > 1_000_000 {
            return Err("Contenu trop volumineux".to_string());
        }

        let app_dir = get_app_dir(&app_handle)?;
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

        let file_path = app_dir.join(&filename);

        // Vérifie le chemin
        if !file_path.starts_with(&app_dir) {
            return Err("Accès interdit".to_string());
        }

        // Écriture atomique
        let temp_path = file_path.with_extension("tmp");
        fs::write(&temp_path, &content).map_err(|e| e.to_string())?;
        fs::rename(&temp_path, &file_path).map_err(|e| e.to_string())?;

        Ok(true)
    })();

    let success = result.is_ok();
    stats.record_command("write_file", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

/// Récupère les métriques de performance
#[tauri::command]
fn get_metrics(stats: State<Arc<AppStats>>) -> CommandResult<PerformanceMetrics> {
    CommandResult::ok(stats.get_metrics())
}

/// Récupère les informations système
#[tauri::command]
fn get_system_info() -> CommandResult<SystemInfo> {
    let info = SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        cpu_cores: num_cpus::get(),
        memory_gb: 0.0, // Simplifié
    };

    CommandResult::ok(info)
}

/// Vérifie si une solution est correcte
#[tauri::command]
fn validate_solution(
    stats: State<Arc<AppStats>>,
    chapter_id: String,
    solution: String,
) -> CommandResult<ValidationResult> {
    let start = Instant::now();

    let result = (|| -> Result<ValidationResult, String> {
        // Validation basique (à étendre selon les besoins)
        let is_valid = match chapter_id.as_str() {
            "ch-01" => solution.contains("#[tauri::command]") && solution.contains("fn"),
            "ch-02" => solution.contains("Mutex") && solution.contains("lock()"),
            "ch-03" => solution.contains("Result<") && solution.contains("?"),
            "ch-04" => solution.contains("validate") || solution.contains("sanitize"),
            "ch-05" => solution.contains("AtomicU64") && solution.contains("Ordering"),
            "ch-06" => solution.contains("async") && solution.contains("await"),
            "ch-07" => solution.contains("rename") || solution.contains("atomic"),
            "ch-08" => solution.contains("Command") && solution.contains("spawn"),
            "ch-09" => solution.contains("reqwest") || solution.contains("Client"),
            "ch-10" => solution.contains("Telemetry") || solution.contains("metrics"),
            _ => false,
        };

        Ok(ValidationResult {
            valid: is_valid,
            message: if is_valid {
                "✅ Solution correcte !".to_string()
            } else {
                "❌ Solution incorrecte. Réessayez !".to_string()
            },
            hints: vec![],
        })
    })();

    let success = result.is_ok();
    stats.record_command("validate_solution", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[derive(Serialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub message: String,
    pub hints: Vec<String>,
}

/// Réinitialise la progression
#[tauri::command]
fn reset_progress(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
) -> CommandResult<bool> {
    let start = Instant::now();

    let result = (|| -> Result<bool, String> {
        let app_dir = get_app_dir(&app_handle)?;
        let progress_file = app_dir.join(format!("progress_{}.json", user_id));

        if progress_file.exists() {
            fs::remove_file(&progress_file).map_err(|e| e.to_string())?;
        }

        // Réinitialise aussi en mémoire
        if let Ok(mut progress_map) = stats.user_progress.lock() {
            progress_map.remove(&user_id);
        }

        Ok(true)
    })();

    let success = result.is_ok();
    stats.record_command("reset_progress", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

/// Exporte toutes les données utilisateur
#[tauri::command]
fn export_data(
    app_handle: AppHandle,
    stats: State<Arc<AppStats>>,
    user_id: String,
) -> CommandResult<ExportData> {
    let start = Instant::now();

    let result = (|| -> Result<ExportData, String> {
        let progress = load_progress(app_handle.clone(), stats.clone(), user_id.clone())
            .data
            .unwrap_or_else(|| UserProgress {
                user_id: user_id.clone(),
                completed_chapters: Vec::new(),
                current_chapter: None,
                total_time_seconds: 0,
                last_activity: current_timestamp(),
            });

        let metrics = stats.get_metrics();

        Ok(ExportData {
            user_id,
            progress,
            metrics,
            export_date: current_timestamp(),
        })
    })();

    let success = result.is_ok();
    stats.record_command("export_data", success, start.elapsed().as_millis() as u64);

    match result {
        Ok(data) => CommandResult::ok(data),
        Err(e) => CommandResult::err(e),
    }
}

#[derive(Serialize)]
pub struct ExportData {
    pub user_id: String,
    pub progress: UserProgress,
    pub metrics: PerformanceMetrics,
    pub export_date: u64,
}

// ============================================
// PTY (PSEUDOTERMINAL) - DESKTOP UNIQUEMENT
// ============================================

#[cfg(not(any(target_os = "android", target_os = "ios")))]
mod pty {
    use super::*;
    use portable_pty::{CommandBuilder, NativePtySystem, PtyPair, PtySize, PtySystem};
    use std::io::{Read, Write};

    pub struct PtyInstance {
        pub id: String,
        pub pair: PtyPair,
        pub buffer: Arc<Mutex<String>>,
    }

    impl PtyInstance {
        pub fn write(&mut self, data: &str) -> io::Result<()> {
            let mut writer = self
                .pair
                .master
                .take_writer()
                .map_err(|e| io::Error::new(io::ErrorKind::Other, e.to_string()))?;
            writer.write_all(data.as_bytes())?;
            writer.flush()?;
            Ok(())
        }

        pub fn read(&self) -> String {
            self.buffer.lock().unwrap().clone()
        }

        pub fn resize(&self, cols: u16, rows: u16) -> io::Result<()> {
            self.pair.master.resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e.to_string()))
        }
    }

    pub fn create_pty(cols: u16, rows: u16) -> Result<PtyInstance, String> {
        let pty_system = NativePtySystem::default();

        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;

        // Détecte le shell
        let shell = if cfg!(target_os = "windows") {
            "powershell.exe".to_string()
        } else {
            std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
        };

        let cmd = CommandBuilder::new(shell);
        let _child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;

        let buffer = Arc::new(Mutex::new(String::new()));
        let buffer_clone = Arc::clone(&buffer);
        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| e.to_string())?;

        // Thread de lecture
        std::thread::spawn(move || {
            let mut buf = [0u8; 1024];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) => break,
                    Ok(n) => {
                        if let Ok(text) = String::from_utf8(buf[..n].to_vec()) {
                            if let Ok(mut b) = buffer_clone.lock() {
                                b.push_str(&text);
                                if b.len() > 100000 {
                                    *b = b[b.len() - 50000..].to_string();
                                }
                            }
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        Ok(PtyInstance {
            id: Uuid::new_v4().to_string(),
            pair,
            buffer,
        })
    }
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use pty::*;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use std::sync::Mutex as StdMutex;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
type PtyState = StdMutex<Option<PtyInstance>>;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
fn pty_create(
    state: State<PtyState>,
    cols: u16,
    rows: u16,
) -> Result<String, String> {
    let pty = create_pty(cols, rows)?;
    let id = pty.id.clone();
    *state.lock().unwrap() = Some(pty);
    Ok(id)
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
fn pty_write(state: State<PtyState>, data: String) -> Result<(), String> {
    if let Some(ref mut pty) = *state.lock().unwrap() {
        pty.write(&data).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
fn pty_read(state: State<PtyState>) -> Result<String, String> {
    if let Some(ref pty) = *state.lock().unwrap() {
        Ok(pty.read())
    } else {
        Err("PTY non initialisé".to_string())
    }
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
fn pty_resize(state: State<PtyState>, cols: u16, rows: u16) -> Result<(), String> {
    if let Some(ref pty) = *state.lock().unwrap() {
        pty.resize(cols, rows).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
fn pty_destroy(state: State<PtyState>) -> Result<(), String> {
    *state.lock().unwrap() = None;
    Ok(())
}

// ============================================
// POINT D'ENTRÉE PRINCIPAL
// ============================================

fn main() {
    // Initialise l'état global
    let app_stats = Arc::new(AppStats::new());

    let builder = tauri::Builder::default().manage(app_stats.clone());

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder.manage(StdMutex::new(None::<PtyInstance>) as PtyState);

    #[cfg(any(target_os = "android", target_os = "ios"))]
    let builder = builder;

    builder
        // Plugins
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        
        // Handlers de commandes
        .invoke_handler(tauri::generate_handler![
            save_progress,
            load_progress,
            check_local_ai_status,
            ask_local_ai,
            set_course_lab_workspace,
            get_course_lab_workspace,
            open_course_lab_path,
            list_course_tickets,
            create_course_ticket,
            submit_course_ticket_solution,
            execute_command,
            read_file,
            write_file,
            get_metrics,
            get_system_info,
            validate_solution,
            reset_progress,
            export_data,
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            pty_create,
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            pty_write,
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            pty_read,
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            pty_resize,
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            pty_destroy,
        ])
        
        // Setup
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        
        // Exécution
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de Tauri");
}
