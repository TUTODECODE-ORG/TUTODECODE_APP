# Releases

Les releases sont publiees automatiquement via GitHub Actions quand un tag `vX.Y.Z` est pousse.

## Installation (utilisateurs)
Les installeurs officiels sont disponibles sur https://tutodecode.org.
Le depot GitHub est destine au code source et aux releases techniques.

## Procedure rapide
1) Mettre a jour la version (optionnel):
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
2) Creer un tag:
   - `git tag v1.0.1`
   - `git push origin v1.0.1`
3) GitHub Actions genere:
   - Windows: .msi
   - macOS: .dmg
   - Linux: .deb et .AppImage

## Dossier unique de compilation
Toutes les commandes se lancent **a la racine du depot**.
Le frontend est dans `src/` et `public/`, et la partie desktop dans `src-tauri/`.

## Notes
- Les builds macOS/Linux se font sur GitHub runners.
- La signature est desactivee tant que les certificats ne sont pas fournis.
