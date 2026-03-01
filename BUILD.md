# Guide de compilation (pas a pas)

Ce guide explique comment compiler TutoDeCode depuis la **racine du depot**. Il est ecrit pour que tout le monde reussisse, meme sans experience avancée.

## 1) Copier le projet (clone)
Si vous n'avez pas encore le projet:
```
git clone https://github.com/TUTODECODE-ORG/TUTODECODE_APP.git
cd TUTODECODE_APP
```

## 2) Installer les prerequis
- Node.js 20+
- Rust stable
- Tauri CLI (via Cargo)

Verifications rapides:
```
node -v
npm -v
rustc -V
cargo -V
```

## 3) Installer les dependances
A la racine du depot:
```
npm ci
```

## 4) Compiler le front web
```
npm run build
```

## 5) Compiler l'application desktop (Tauri)
```
npm run tauri:build
```

## 6) Ou trouver les fichiers generes
- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/deb/` et `src-tauri/target/release/bundle/appimage/`

## 7) Conseils si ca echoue
- Verifier que vous etes bien **a la racine** du depot.
- Supprimer `node_modules` puis relancer `npm ci`.
- Sur Linux, installer les dependances systeme (gtk/webkit).

## FAQ
**Q: Je suis sur Windows, je peux compiler macOS ou Linux ?**
R: Non. Utilisez GitHub Actions ou compilez sur la plateforme cible.

**Q: La build Tauri echoue sur Linux (webkit/gtk).**
R: Installez les dependances systeme puis relancez `npm run tauri:build`.

**Q: Je veux juste le web.**
R: Lancez uniquement `npm run build`.

**Q: Je ne trouve pas les fichiers generes.**
R: Regardez dans `src-tauri/target/release/bundle/`.

## 8) Compilation automatique via GitHub Actions
Vous pouvez aussi compiler sans rien installer localement:
1) Fork du depot
2) Activer GitHub Actions
3) Creer un tag `vX.Y.Z`
4) La release se compile automatiquement

Liens utiles:
- https://github.com/TUTODECODE-ORG/TUTODECODE_APP/actions
- https://github.com/TUTODECODE-ORG/TUTODECODE_APP/actions/workflows/release.yml
