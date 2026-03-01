# TutoDeCode

Plateforme souveraine de formation technique (Tauri + React) avec IA locale et zero telemetrie.

## A propos de TutoDeCode
TutoDeCode est une plateforme orientee pratique pour apprendre l'informatique via des parcours guides, des tickets de mission et une validation assistee par IA locale.
Ce depot contient le code source de l'application desktop Tauri et du frontend associe.

## Utilisation du code source
Le code source est public et protege par la licence de l'Association TUTODECODE.
Vous avez le droit d'utiliser, etudier, modifier et redistribuer le code dans le cadre de la licence AGPL-3.0-only.
En revanche, vous ne pouvez pas vous approprier le projet ni supprimer les mentions d'origine.
Toute reutilisation doit conserver la provenance du projet et indiquer clairement qu'il vient de TutoDeCode.
Pour les details juridiques complets, voir [LICENSE](LICENSE) et [LEGAL.md](LEGAL.md).

## Installation (utilisateurs)
Les installeurs officiels sont heberges sur https://tutodecode.org.
Merci de passer par le site pour installer l'application.

## Points forts
- IA locale via Ollama, mode guidance only
- Cours progressifs, QCM, challenges pratiques
- Terminal integre et scenarios de mise en situation
- Architecture offline-first, donnees locales

## Demarrage rapide (developpeurs)

### 1) Cloner le depot
```bash
git clone https://github.com/TUTODECODE-ORG/TUTODECODE_APP.git
cd TUTODECODE_APP
```

### 2) Prerequis
- Node.js 20+
- Rust stable
- Tauri CLI (via Cargo)

Verifier l'installation:
```bash
node -v
npm -v
rustc -V
cargo -V
```

### 3) Installer les dependances
```bash
npm ci
```

### 4) Lancer en dev (frontend + tauri)
```bash
npm run tauri:dev
```

### 5) Build complet (web + desktop)
```bash
npm run build
npm run tauri:build
```

Guide pas a pas + FAQ: [BUILD.md](BUILD.md)

## Tout se compile au meme endroit
Lancez toutes les commandes depuis la racine du depot:
- Frontend: `src/` + `public/`
- Desktop Tauri: `src-tauri/`

## Releases
Les releases de l'application sont publiees sur GitHub a chaque tag `vX.Y.Z`.
Voir [RELEASES.md](RELEASES.md) pour la procedure.

## Licences
Le projet applique une licence par composant. Voir [LEGAL.md](LEGAL.md).
Licence principale du code: AGPL-3.0-only (voir [LICENSE](LICENSE)).

## Securite
Voir [SECURITY.md](SECURITY.md).

## Contributions
Les contributions sont bienvenues sous reserve d'acceptation du CLA. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

---

© 2026 Association TUTODECODE
