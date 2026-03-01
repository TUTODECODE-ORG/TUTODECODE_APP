// TutoDeCode Pro - PTY Terminal Module
// Fournit un terminal réel via Pseudoterminal (PTY)

use portable_pty::{CommandBuilder, NativePtySystem, PtyPair, PtySize, PtySystem};
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use uuid::Uuid;

/// Instance d'un terminal PTY
pub struct PtyInstance {
    pub id: String,
    pair: PtyPair,
    reader: Arc<Mutex<dyn Read + Send>>,
    writer: Arc<Mutex<dyn Write + Send>>,
    buffer: Arc<Mutex<String>>,
}

impl PtyInstance {
    /// Écrit des données dans le PTY
    pub fn write(&mut self, data: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut writer = self.writer.lock().map_err(|e| e.to_string())?;
        writer.write_all(data.as_bytes())?;
        writer.flush()?;
        Ok(())
    }
    
    /// Lit les données disponibles du PTY
    pub fn read(&mut self) -> Result<String, Box<dyn std::error::Error>> {
        let buffer = self.buffer.lock().map_err(|e| e.to_string())?;
        let data = buffer.clone();
        Ok(data)
    }
    
    /// Redimensionne le PTY
    pub fn resize(&mut self, cols: u16, rows: u16) -> Result<(), Box<dyn std::error::Error>> {
        self.pair.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;
        Ok(())
    }
}

/// Crée un nouveau PTY avec le shell par défaut du système
pub fn create_pty(cols: u16, rows: u16) -> Result<PtyInstance, Box<dyn std::error::Error>> {
    let pty_system = NativePtySystem::default();
    
    let pair = pty_system.openpty(PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    })?;
    
    // Détecte le shell approprié pour la plateforme
    let shell = detect_default_shell();
    
    let cmd = CommandBuilder::new(&shell);
    let child = pair.slave.spawn_command(cmd)?;
    
    // Détache le processus enfant (il continuera de tourner indépendamment)
    drop(child);
    
    let reader = pair.master.try_clone_reader()?;
    let writer = pair.master.take_writer()?;
    
    let buffer = Arc::new(Mutex::new(String::new()));
    let buffer_clone = Arc::clone(&buffer);
    
    // Thread de lecture pour collecter la sortie du terminal
    thread::spawn(move || {
        let mut reader = reader;
        let mut buf = [0u8; 1024];
        
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break, // EOF
                Ok(n) => {
                    if let Ok(output) = String::from_utf8(buf[..n].to_vec()) {
                        if let Ok(mut buffer) = buffer_clone.lock() {
                            buffer.push_str(&output);
                            // Limite la taille du buffer
                            if buffer.len() > 100000 {
                                let new_start = buffer.len() - 50000;
                                *buffer = buffer[new_start..].to_string();
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
        reader: Arc::new(Mutex::new(std::io::empty())),
        writer: Arc::new(Mutex::new(writer)),
        buffer,
    })
}

/// Détecte le shell par défaut selon la plateforme
fn detect_default_shell() -> String {
    #[cfg(target_os = "windows")]
    {
        // Utilise PowerShell sur Windows
        std::env::var("COMSPEC")
            .or_else(|_| std::env::var("PSModulePath").map(|_| "powershell.exe".to_string()))
            .unwrap_or_else(|_| "cmd.exe".to_string())
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        // Sur Unix, utilise le shell de l'utilisateur ou bash par défaut
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_detect_default_shell() {
        let shell = detect_default_shell();
        assert!(!shell.is_empty());
        
        #[cfg(target_os = "windows")]
        assert!(shell.contains("powershell") || shell.contains("cmd"));
        
        #[cfg(not(target_os = "windows"))]
        assert!(shell.contains("bash") || shell.contains("zsh") || shell.contains("fish"));
    }
}
