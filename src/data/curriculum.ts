// ============================================
// TutoDeCode - Curriculum "Mastering Tauri v3 & Rust Systems"
// 10 Chapitres complets avec théorie, code et challenges
// ============================================

export interface Chapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  theory: string;
  codeExample: {
    language: string;
    filename: string;
    code: string;
  };
  challenge: {
    title: string;
    description: string;
    task: string;
    hints: string[];
    validation: {
      command: string;
      expectedOutput: string;
      successMessage: string;
    };
  };
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
    }>;
  };
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
}

export const tauriV3Curriculum: Chapter[] = [
  {
    id: 'ch-01',
    order: 1,
    title: 'Demarrage Tauri v3',
    subtitle: 'Toolchain, structure et cycle de vie',
    duration: '55 min',
    difficulty: 'beginner',
    theory: `Demarrage Tauri v3

Objectif: comprendre la structure d'un projet et la chaine de build.

Structure minimale:
- src/ (frontend)
- src-tauri/ (backend Rust)
- tauri.conf.json (config runtime)
- assets/ (icones, splash)

Toolchain recommandee:
- Rust stable + Cargo
- Node.js LTS
- Tauri CLI
- OS build tools (MSVC, Xcode, build-essential)

Cycle de vie principal:
1) dev: frontend hot reload + backend rebuild
2) build: bundling + packaging
3) run: WebView + Rust commands

Configuration critique:
- bundle.identifier doit etre unique
- allowlist et capabilities definissent les permissions
- devPath et distDir controlent le frontend

Checklist de demarrage:
- verifier rustc, cargo, node
- lancer tauri dev
- valider un invoke simple
- verifier les logs dans console
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/main.rs',
      code: `#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping])
        .run(tauri::generate_context!())
        .expect("tauri launch failed");
}`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quel dossier contient le backend Rust ?', options: ['src-tauri/', 'src/', 'assets/', 'public/'], correctIndex: 0 },
        { id: 'q2', question: 'Quel fichier porte la config runtime ?', options: ['tauri.conf.json', 'package.json', 'tsconfig.json', 'Cargo.lock'], correctIndex: 0 },
        { id: 'q3', question: 'Quel outil lance le mode dev Tauri ?', options: ['tauri dev', 'cargo run', 'vite build', 'npm pack'], correctIndex: 0 },
        { id: 'q4', question: 'Quel element doit etre unique pour le bundle ?', options: ['bundle.identifier', 'app name', 'app version', 'devPath'], correctIndex: 0 },
        { id: 'q5', question: 'Quel element definit les permissions ?', options: ['capabilities', 'assets', 'icons', 'scripts'], correctIndex: 0 },
        { id: 'q6', question: 'Quel dossier contient le frontend ?', options: ['src/', 'src-tauri/', 'target/', 'dist/'], correctIndex: 0 },
        { id: 'q7', question: 'Que fait invoke_handler ?', options: ['enregistre les commandes', 'configure le WebView', 'compile le frontend', 'nettoie le cache'], correctIndex: 0 },
        { id: 'q8', question: 'Quel workflow assemble le bundle final ?', options: ['build', 'dev', 'lint', 'test'], correctIndex: 0 },
        { id: 'q9', question: 'Quel pre-requis est obligatoire ?', options: ['Rust + Node', 'Python + Java', 'Go + Deno', 'PHP + Ruby'], correctIndex: 0 },
        { id: 'q10', question: 'Quel element relie frontend et backend ?', options: ['IPC', 'DOM', 'CSS', 'WebSocket uniquement'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Sanity Check',
      description: 'Verifiez la chaine de build avec une commande simple.',
      task: 'Creez une commande ping() et retournez "pong" depuis le frontend.',
      hints: ['Ajoutez #[tauri::command]', 'Enregistrez la commande dans generate_handler!', 'Testez avec invoke'],
      validation: {
        command: 'invoke ping',
        expectedOutput: 'pong',
        successMessage: 'OK, toolchain et IPC fonctionnent.'
      }
    },
    isLocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-02',
    order: 2,
    title: 'Rust pour commandes Tauri',
    subtitle: 'Types, erreurs, modules, test rapide',
    duration: '65 min',
    difficulty: 'intermediate',
    theory: `Rust pour commandes Tauri

Objectif: ecrire des commandes robustes et testables.

Fondamentaux utiles:
- ownership pour eviter les clones inutiles
- Result<T, E> pour les erreurs
- enum pour les etats et variantes
- modules pour organiser le code

Style de commandes:
- signature simple: fn foo(arg: String) -> Result<T, String>
- validation avant toute action
- erreurs explicites, message court

Erreurs typiques:
- verrouillage Mutex oublie
- Option non gere
- clones excessifs sur String

Mini tests:
- fonction pure extraite
- tests unitaires rapides
- assert_eq sur cases limites
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/domain/user.rs',
      code: `#[derive(Clone)]
pub struct User {
    pub id: u64,
    pub email: String,
}

pub fn normalize_email(raw: &str) -> Result<String, String> {
    let trimmed = raw.trim().to_lowercase();
    if !trimmed.contains('@') {
        return Err("email invalide".to_string());
    }
    Ok(trimmed)
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quel type exprime une erreur possible ?', options: ['Result<T, E>', 'Option<T>', 'Vec<T>', 'HashMap<K,V>'], correctIndex: 0 },
        { id: 'q2', question: 'Quel objectif du ownership ?', options: ['eviter les use-after-free', 'ajouter du GC', 'optimiser CSS', 'charger des plugins'], correctIndex: 0 },
        { id: 'q3', question: 'Quel est un bon pattern de commande ?', options: ['validation puis action', 'action puis validation', 'panic sur erreur', 'unwrap partout'], correctIndex: 0 },
        { id: 'q4', question: 'Quel type pour un statut ?', options: ['enum', 'String', 'i32', 'bool uniquement'], correctIndex: 0 },
        { id: 'q5', question: 'Quel est un test unitaire simple ?', options: ['assert_eq', 'console.log', 'sleep', 'printf'], correctIndex: 0 },
        { id: 'q6', question: 'Quel est un souci courant ?', options: ['Option non gere', 'CSS non charge', 'HTML invalide', 'SVG mal place'], correctIndex: 0 },
        { id: 'q7', question: 'Quel choix limite les clones ?', options: ['&str', 'String partout', 'Vec<String> global', 'unwrap'], correctIndex: 0 },
        { id: 'q8', question: 'Quel module organise le code ?', options: ['mod', 'use', 'impl', 'match'], correctIndex: 0 },
        { id: 'q9', question: 'Quel est un message d erreur correct ?', options: ['court et explicite', 'tres long', 'vide', 'code HTML'], correctIndex: 0 },
        { id: 'q10', question: 'Quel type pour presence/absence ?', options: ['Option<T>', 'Result<T,E>', 'Vec<T>', 'String'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Validation email',
      description: 'Exposez une commande qui normalise un email.',
      task: 'Creez normalize_email_cmd(email) qui retourne email en lowercase ou une erreur.',
      hints: ['Utilisez trim()', 'verifiez le caractere @', 'retournez Result<String, String>'],
      validation: {
        command: 'invoke normalize_email_cmd test@site.com',
        expectedOutput: 'test@site.com',
        successMessage: 'Validation de base OK.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-03',
    order: 3,
    title: 'IPC et contrats de donnees',
    subtitle: 'Schema, versioning, erreurs',
    duration: '70 min',
    difficulty: 'intermediate',
    theory: `IPC et contrats de donnees

Objectif: stabiliser l echange frontend/backend.

Schemas:
- definir les structs et enums
- versionner les payloads
- documenter les champs

Serialisation:
- serde pour JSON
- champs optionnels pour compat
- eviter les breaking changes

Erreurs:
- Result<T, String> simple
- code d erreur + message
- mapping cote frontend

Bonnes pratiques:
- requests courtes et claires
- eviter les gros blobs
- gerer les timeouts
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/contracts.rs',
      code: `use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct CreateNoteReq {
    pub title: String,
    pub body: String,
    pub v: u8,
}

#[derive(Serialize, Deserialize)]
pub struct CreateNoteRes {
    pub id: String,
    pub created_at: String,
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quel outil pour JSON Rust ?', options: ['serde', 'regex', 'tokio', 'axum'], correctIndex: 0 },
        { id: 'q2', question: 'Pourquoi versionner un payload ?', options: ['compatibilite', 'style', 'performance', 'cache'], correctIndex: 0 },
        { id: 'q3', question: 'Quel type pour champ optionnel ?', options: ['Option<T>', 'Vec<T>', 'Result<T,E>', 'bool'], correctIndex: 0 },
        { id: 'q4', question: 'Quel format simple pour erreur ?', options: ['code + message', 'stacktrace seule', 'html', 'video'], correctIndex: 0 },
        { id: 'q5', question: 'Quel objectif pour requests ?', options: ['courtes et claires', 'le plus gros possible', 'minifier HTML', 'eviter JSON'], correctIndex: 0 },
        { id: 'q6', question: 'Quel risque des breaking changes ?', options: ['front casse', 'CPU baisse', 'CSS change', 'audio coupe'], correctIndex: 0 },
        { id: 'q7', question: 'Que faire avec gros blobs ?', options: ['eviter ou streamer', 'inline base64', 'imposer 1MB', 'ignorer'], correctIndex: 0 },
        { id: 'q8', question: 'Quel champ utile pour version ?', options: ['v', 'id', 'ok', 'size'], correctIndex: 0 },
        { id: 'q9', question: 'Quel transport principal Tauri ?', options: ['IPC', 'WebRTC', 'MQTT', 'SMTP'], correctIndex: 0 },
        { id: 'q10', question: 'Quel facteur critique ?', options: ['timeout', 'emoji', 'police', 'theme'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Contrat stable',
      description: 'Exposez une commande cree_note.',
      task: 'Acceptez CreateNoteReq et retournez CreateNoteRes avec un id court.',
      hints: ['Generez id simple', 'verifiez title non vide', 'retournez Result'],
      validation: {
        command: 'test_create_note',
        expectedOutput: 'note_created: true',
        successMessage: 'Contrat IPC stable.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-04',
    order: 4,
    title: 'Frontend + state UI',
    subtitle: 'navigation, cache et UX',
    duration: '75 min',
    difficulty: 'intermediate',
    theory: `Frontend + state UI

Objectif: connecter l experience utilisateur au backend.

Axes clefs:
- store local (zustand ou context)
- cache en memoire
- optimistic UI avec rollback
- gestion d erreurs visibles

Navigation:
- route par section
- restauration d etat
- scroll et anchors

Performance:
- debounce pour actions
- memoization des listes
- lazy load des sections

Accessibilite:
- raccourcis clavier
- focus visible
- aria pour les boutons
`,
    codeExample: {
      language: 'typescript',
      filename: 'src/state/courseStore.ts',
      code: `type CourseState = {
  activeSection: number;
  setActiveSection: (n: number) => void;
  progress: number;
  setProgress: (p: number) => void;
};

export const createCourseState = (): CourseState => ({
  activeSection: 0,
  setActiveSection: () => {},
  progress: 0,
  setProgress: () => {},
});
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quel pattern pour UI reactive ?', options: ['store local', 'global mutable', 'DOM direct', 'setTimeout'], correctIndex: 0 },
        { id: 'q2', question: 'Pourquoi optimistic UI ?', options: ['latence masquee', 'securite', 'CSS', 'audio'], correctIndex: 0 },
        { id: 'q3', question: 'Quel outil aide le scroll ?', options: ['anchors', 'cookies', 'drag', 'canvas'], correctIndex: 0 },
        { id: 'q4', question: 'Quel objectif pour cache ?', options: ['reduire appels', 'augmenter taille', 'eviter JSON', 'changer theme'], correctIndex: 0 },
        { id: 'q5', question: 'Quel indicateur accessibilite ?', options: ['focus visible', 'alpha 0', 'hover only', 'animations'], correctIndex: 0 },
        { id: 'q6', question: 'Quel outil pour limiter events ?', options: ['debounce', 'loop', 'sleep', 'fork'], correctIndex: 0 },
        { id: 'q7', question: 'Quel risque sans rollback ?', options: ['etat incoherent', 'build lent', 'icones cassees', 'font missing'], correctIndex: 0 },
        { id: 'q8', question: 'Quel axe UX critique ?', options: ['erreurs visibles', 'secret', 'silence', 'log only'], correctIndex: 0 },
        { id: 'q9', question: 'Quel benefice du lazy load ?', options: ['perf', 'couleurs', 'securite', 'audio'], correctIndex: 0 },
        { id: 'q10', question: 'Quel format pour etat ?', options: ['simple et serialisable', 'classe lourde', 'DOM', 'binary'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'State UX',
      description: 'Ajoutez sauvegarde d etat local.',
      task: 'Sauvegardez activeSection et progress et restaurez au reload.',
      hints: ['localStorage simple', 'sauvegarde lors de changement', 'restauration au demarrage'],
      validation: {
        command: 'test_ui_state',
        expectedOutput: 'state_restored: true',
        successMessage: 'UI persistante et stable.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-05',
    order: 5,
    title: 'Stockage local et persistance',
    subtitle: 'fichiers, cache, migrations',
    duration: '80 min',
    difficulty: 'advanced',
    theory: `Stockage local et persistance

Objectif: sauvegarder de maniere fiable et evolutive.

Choix de stockage:
- fichiers JSON pour simple
- SQLite pour volumes
- caches temporaires

Migrations:
- versionner les schemas
- migration additive
- backup avant migration

Fiabilite:
- ecriture atomique
- validation des donnees
- checksums simples

Nettoyage:
- TTL pour caches
- quotas par user
- logs de purge
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/storage.rs',
      code: `use std::fs;
use std::path::PathBuf;

pub fn save_json(path: &PathBuf, content: &str) -> Result<(), String> {
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(())
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quel format simple pour stockage ?', options: ['JSON', 'BMP', 'MP3', 'SVG'], correctIndex: 0 },
        { id: 'q2', question: 'Quand choisir SQLite ?', options: ['volumes importants', 'petites preferences', 'icones', 'logs bruts'], correctIndex: 0 },
        { id: 'q3', question: 'Pourquoi versionner schema ?', options: ['migrations', 'style', 'theme', 'audio'], correctIndex: 0 },
        { id: 'q4', question: 'Quel geste avant migration ?', options: ['backup', 'delete', 'rename UI', 'disable logs'], correctIndex: 0 },
        { id: 'q5', question: 'Qu est-ce qu ecriture atomique ?', options: ['tmp puis rename', 'append', 'write en boucle', 'sleep'], correctIndex: 0 },
        { id: 'q6', question: 'Pourquoi checksums ?', options: ['detecter corruption', 'charger UI', 'traduire texte', 'colorer'], correctIndex: 0 },
        { id: 'q7', question: 'Quel outil pour cache ?', options: ['TTL', 'CSS', 'DOM', 'SVG'], correctIndex: 0 },
        { id: 'q8', question: 'Quel risque sans validation ?', options: ['donnees incoherentes', 'temps CPU bas', 'icones floues', 'build plus rapide'], correctIndex: 0 },
        { id: 'q9', question: 'Quel objectif du quota ?', options: ['limiter espace', 'augmenter RAM', 'changer theme', 'activer audio'], correctIndex: 0 },
        { id: 'q10', question: 'Quel role des logs ?', options: ['trace de purge', 'decor', 'cache CSS', 'regex'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Storage fiable',
      description: 'Ajoutez sauvegarde atomique + backup.',
      task: 'Implementez save_json avec tmp et backup .bak si fichier existe.',
      hints: ['ecrire dans tmp', 'copier vers .bak si existe', 'rename atomique'],
      validation: {
        command: 'test_storage',
        expectedOutput: 'storage_ok: true',
        successMessage: 'Persistance fiable.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-06',
    order: 6,
    title: 'Securite Tauri v3',
    subtitle: 'permissions, csp, validation',
    duration: '85 min',
    difficulty: 'advanced',
    theory: `Securite Tauri v3

Objectif: limiter la surface d attaque et proteger les donnees.

Piliers:
- allowlist minimaliste
- capabilities par fenetre
- CSP stricte
- validation cote Rust

Permissions fines:
- fs scope par dossier
- shell allowlist par commande
- http allowlist par domaine

Anti attaques:
- bloquer path traversal
- refuser input trop long
- sanitiser les chemins

Audit rapide:
- verifier logs
- analyser erreurs
- tester avec cas limites
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/security.rs',
      code: `use regex::Regex;

pub fn validate_filename(name: &str) -> Result<(), String> {
    let re = Regex::new(r"^[a-zA-Z0-9._-]+$").unwrap();
    if !re.is_match(name) {
        return Err("invalid filename".to_string());
    }
    Ok(())
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quelle approche pour permissions ?', options: ['deny by default', 'allow all', 'random', 'manual only'], correctIndex: 0 },
        { id: 'q2', question: 'CSP sert a ?', options: ['limiter sources', 'accelerer GPU', 'changer theme', 'activer logs'], correctIndex: 0 },
        { id: 'q3', question: 'Quel risque sans validation ?', options: ['path traversal', 'css casse', 'fonts change', 'audio stop'], correctIndex: 0 },
        { id: 'q4', question: 'Qu est-ce qu allowlist ?', options: ['liste autorisee', 'liste noire', 'cache', 'mode debug'], correctIndex: 0 },
        { id: 'q5', question: 'Quel scope fs ideal ?', options: ['dossier minimal', 'racine disque', 'home complet', 'tout C:'], correctIndex: 0 },
        { id: 'q6', question: 'Pourquoi limiter input ?', options: ['eviter abuse', 'moins de CSS', 'plus de FPS', 'moins de RAM'], correctIndex: 0 },
        { id: 'q7', question: 'Quel pattern pour shell ?', options: ['allowlist', 'any command', 'download', 'eval'], correctIndex: 0 },
        { id: 'q8', question: 'Quel test utile ?', options: ['cas limites', 'animations', 'couleurs', 'fonts'], correctIndex: 0 },
        { id: 'q9', question: 'Quelle couche verifie ?', options: ['backend Rust', 'HTML', 'CSS', 'SVG'], correctIndex: 0 },
        { id: 'q10', question: 'Quel resultat attendu ?', options: ['surface reduite', 'build lent', 'UI lourde', 'audio fort'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Validation stricte',
      description: 'Bloquez les chemins dangereux.',
      task: 'Creez validate_path(path) qui refuse .. et caracteres interdits.',
      hints: ['Regex + verif de segments', 'refuser taille excessive', 'retourner Result'],
      validation: {
        command: 'test_security_paths',
        expectedOutput: 'security_ok: true',
        successMessage: 'Validation securisee.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-07',
    order: 7,
    title: 'Async et concurrence',
    subtitle: 'tokio, queues, backpressure',
    duration: '90 min',
    difficulty: 'expert',
    theory: `Async et concurrence

Objectif: executer des taches sans bloquer l UI.

Concepts:
- future et await
- tokio::spawn pour taches paralleles
- channels pour file d attente
- timeouts pour fiabilite

Backpressure:
- limiter le debit
- taille de queue controlee
- drop ou retry

Observabilite:
- logs par etape
- timing des taches
- erreurs centralisees
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/async_queue.rs',
      code: `use tokio::sync::mpsc;

pub async fn run_queue() {
    let (tx, mut rx) = mpsc::channel::<String>(32);
    let _ = tx.send("job".to_string()).await;

    while let Some(job) = rx.recv().await {
        println!("job: {}", job);
    }
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Quel runtime async Rust ?', options: ['tokio', 'node', 'deno', 'python'], correctIndex: 0 },
        { id: 'q2', question: 'Quel outil pour file d attente ?', options: ['mpsc channel', 'Vec global', 'localStorage', 'CSS'], correctIndex: 0 },
        { id: 'q3', question: 'Quel but du timeout ?', options: ['fiabilite', 'style', 'theme', 'audio'], correctIndex: 0 },
        { id: 'q4', question: 'Que fait spawn ?', options: ['tache en arriere plan', 'compile CSS', 'reset UI', 'download fonts'], correctIndex: 0 },
        { id: 'q5', question: 'Backpressure sert a ?', options: ['limiter debit', 'changer theme', 'activer logs', 'charger images'], correctIndex: 0 },
        { id: 'q6', question: 'Quel risque sans limite ?', options: ['queue infinie', 'cache trop petit', 'icones floues', 'fonts missing'], correctIndex: 0 },
        { id: 'q7', question: 'Quel signal utile ?', options: ['logs par etape', 'couleurs', 'animations', 'audio'], correctIndex: 0 },
        { id: 'q8', question: 'Quel type pour result async ?', options: ['Result', 'Option', 'Vec', 'bool'], correctIndex: 0 },
        { id: 'q9', question: 'Quel pattern pour retry ?', options: ['backoff', 'loop vide', 'panic', 'sleep 0'], correctIndex: 0 },
        { id: 'q10', question: 'Quel but principal ?', options: ['ne pas bloquer UI', 'grossir bundle', 'remplacer CSS', 'changer font'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Queue robuste',
      description: 'Implementez une queue async avec timeout.',
      task: 'Creez process_queue() qui traite jobs avec timeout 2s.',
      hints: ['tokio::time::timeout', 'channel mpsc', 'log des erreurs'],
      validation: {
        command: 'test_async_queue',
        expectedOutput: 'queue_ok: true',
        successMessage: 'Concurrence maitrisee.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-08',
    order: 8,
    title: 'OS integration',
    subtitle: 'filesystem, shell, notifications',
    duration: '85 min',
    difficulty: 'advanced',
    theory: `OS integration

Objectif: interagir proprement avec le systeme.

Filesystem:
- scopes limites
- lecture et ecriture atomique
- selection de fichiers

Shell:
- allowlist stricte
- environment controle
- capture stdout/stderr

System:
- notifications
- tray icon
- auto-start

Fiabilite:
- timeouts sur process
- logs d execution
- gestion des erreurs
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/process.rs',
      code: `use std::process::Command;

pub fn run_list(dir: &str) -> Result<String, String> {
    let out = Command::new("ls")
        .arg(dir)
        .output()
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Pourquoi limiter fs scope ?', options: ['securite', 'theme', 'css', 'audio'], correctIndex: 0 },
        { id: 'q2', question: 'Quel pattern pour shell ?', options: ['allowlist', 'any command', 'eval', 'download'], correctIndex: 0 },
        { id: 'q3', question: 'Que capturer pour debug ?', options: ['stdout et stderr', 'CSS', 'fonts', 'icons'], correctIndex: 0 },
        { id: 'q4', question: 'Quel risque sans timeout ?', options: ['process bloque', 'UI plus claire', 'bundle plus petit', 'logs propres'], correctIndex: 0 },
        { id: 'q5', question: 'Quel outil systeme utile ?', options: ['notifications', 'spinlock', 'GPU', 'canvas'], correctIndex: 0 },
        { id: 'q6', question: 'Que faire des erreurs ?', options: ['les remonter', 'les cacher', 'les supprimer', 'les ignorer'], correctIndex: 0 },
        { id: 'q7', question: 'Quel benefice tray icon ?', options: ['presence systeme', 'upgrade GPU', 'multi CSS', 'audio'], correctIndex: 0 },
        { id: 'q8', question: 'Quel pattern pour ecriture ?', options: ['atomique', 'append', 'random', 'truncate'], correctIndex: 0 },
        { id: 'q9', question: 'Quel besoin pour autostart ?', options: ['option user', 'force always', 'never', 'test only'], correctIndex: 0 },
        { id: 'q10', question: 'Quel but global ?', options: ['integration stable', 'bundle plus gros', 'theme neon', 'audio fort'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Commande systeme',
      description: 'Exposez une commande liste_dir.',
      task: 'Creez list_dir(path) qui retourne les fichiers ou une erreur.',
      hints: ['Command ou fs::read_dir', 'validez le path', 'retournez Result'],
      validation: {
        command: 'test_list_dir',
        expectedOutput: 'list_ok: true',
        successMessage: 'Integration OS validee.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-09',
    order: 9,
    title: 'Reseau et synchronisation',
    subtitle: 'http, offline, reprise',
    duration: '90 min',
    difficulty: 'advanced',
    theory: `Reseau et synchronisation

Objectif: connecter l app en restant robuste offline.

Client HTTP:
- timeout, retry, backoff
- gestion des codes 4xx/5xx
- cache local

Sync:
- file locale d operations
- reprise apres echec
- resolution de conflits simple

Offline first:
- mode degrade
- indicateurs visuels
- sync en background
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/http.rs',
      code: `use reqwest::Client;

pub async fn fetch_text(url: &str) -> Result<String, String> {
    let client = Client::new();
    let res = client.get(url).send().await.map_err(|e| e.to_string())?;
    res.text().await.map_err(|e| e.to_string())
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Pourquoi retry ?', options: ['resilience', 'style', 'theme', 'icons'], correctIndex: 0 },
        { id: 'q2', question: 'Quel code signifie client error ?', options: ['4xx', '2xx', '3xx', '5xx'], correctIndex: 0 },
        { id: 'q3', question: 'Quel code signifie server error ?', options: ['5xx', '2xx', '3xx', '4xx'], correctIndex: 0 },
        { id: 'q4', question: 'Pourquoi cache local ?', options: ['offline', 'CSS', 'fonts', 'GPU'], correctIndex: 0 },
        { id: 'q5', question: 'Que fait backoff ?', options: ['delai progressif', 'baisse resolution', 'change theme', 'mute audio'], correctIndex: 0 },
        { id: 'q6', question: 'Quel outil pour sync ?', options: ['file d operations', 'canvas', 'svg', 'shadow'], correctIndex: 0 },
        { id: 'q7', question: 'Quel risque sans conflit ?', options: ['ecrasement', 'CSS change', 'font break', 'audio'], correctIndex: 0 },
        { id: 'q8', question: 'Quel signal pour offline ?', options: ['indicateur visuel', 'silence', 'panic', 'freeze'], correctIndex: 0 },
        { id: 'q9', question: 'Quelle priorite ?', options: ['robustesse', 'neon', 'animations', 'audio'], correctIndex: 0 },
        { id: 'q10', question: 'Quel pattern pour reprise ?', options: ['retry + queue', 'panic', 'clear', 'stop'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Sync simple',
      description: 'Ajoutez une file offline.',
      task: 'Stockez les operations en local et rejouez quand online.',
      hints: ['liste locale', 'statut online', 'retry backoff'],
      validation: {
        command: 'test_sync',
        expectedOutput: 'sync_ok: true',
        successMessage: 'Sync robuste.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 'ch-10',
    order: 10,
    title: 'Build, release et observabilite',
    subtitle: 'CI, signature, monitoring',
    duration: '95 min',
    difficulty: 'expert',
    theory: `Build, release et observabilite

Objectif: livrer proprement et surveiller en production.

Build:
- profils release optimises
- LTO et strip
- tailles de bundle

Release:
- pipeline CI multi OS
- signature et notarization
- auto-updater

Observabilite:
- logs structures
- metriques de base
- alertes simples

Checklist prod:
- crash reports
- versioning clair
- rollback possible
`,
    codeExample: {
      language: 'rust',
      filename: 'src-tauri/src/metrics.rs',
      code: `use std::sync::atomic::{AtomicU64, Ordering};

pub struct Metrics {
    pub requests: AtomicU64,
    pub errors: AtomicU64,
}

impl Metrics {
    pub fn new() -> Self {
        Self { requests: AtomicU64::new(0), errors: AtomicU64::new(0) }
    }

    pub fn error_rate(&self) -> f64 {
        let r = self.requests.load(Ordering::Relaxed);
        let e = self.errors.load(Ordering::Relaxed);
        if r == 0 { 0.0 } else { (e as f64 / r as f64) * 100.0 }
    }
}
`
    },
    quiz: {
      questions: [
        { id: 'q1', question: 'Pourquoi LTO ?', options: ['optimiser taille', 'changer theme', 'activer audio', 'ajouter CSS'], correctIndex: 0 },
        { id: 'q2', question: 'Quel outil pour CI ?', options: ['pipeline multi OS', 'local only', 'manual only', 'ftp'], correctIndex: 0 },
        { id: 'q3', question: 'Pourquoi signature ?', options: ['confiance', 'speed', 'color', 'font'], correctIndex: 0 },
        { id: 'q4', question: 'Auto-updater sert a ?', options: ['mise a jour fiable', 'debug', 'theme', 'cache'], correctIndex: 0 },
        { id: 'q5', question: 'Quel type de logs ?', options: ['structures', 'random', 'binary only', 'none'], correctIndex: 0 },
        { id: 'q6', question: 'Quel indicateur utile ?', options: ['error_rate', 'css_size', 'font_count', 'audio_peak'], correctIndex: 0 },
        { id: 'q7', question: 'Pourquoi rollback ?', options: ['revenir en arriere', 'changer theme', 'plus de CSS', 'moins de CPU'], correctIndex: 0 },
        { id: 'q8', question: 'Quel type de versioning ?', options: ['clair et semantique', 'aleatoire', 'date only', 'no version'], correctIndex: 0 },
        { id: 'q9', question: 'Quel risque sans monitoring ?', options: ['erreurs invisibles', 'UI plus rapide', 'bundle plus petit', 'audio plus fort'], correctIndex: 0 },
        { id: 'q10', question: 'Quel objectif final ?', options: ['release stable', 'theme neon', 'fonts change', 'CSS inline'], correctIndex: 0 }
      ]
    },
    challenge: {
      title: 'Observabilite',
      description: 'Ajoutez un calcul simple de metriques.',
      task: 'Implementez Metrics avec error_rate et incrementation.',
      hints: ['AtomicU64', 'Ordering::Relaxed', 'calcul simple'],
      validation: {
        command: 'test_metrics',
        expectedOutput: 'error_rate: 1.0',
        successMessage: 'Build et monitoring prets.'
      }
    },
    isLocked: true,
    isCompleted: false,
    progress: 0
  }
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
export const getChapterById = (id: string): Chapter | undefined => {
  return tauriV3Curriculum.find(ch => ch.id === id);
};

export const getNextChapter = (currentId: string): Chapter | undefined => {
  const current = getChapterById(currentId);
  if (!current) return undefined;
  return tauriV3Curriculum.find(ch => ch.order === current.order + 1);
};

export const getProgressPercentage = (completedIds: string[]): number => {
  return Math.round((completedIds.length / tauriV3Curriculum.length) * 100);
};
