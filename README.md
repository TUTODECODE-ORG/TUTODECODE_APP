# <img src="assets/logo.png" width="48" height="48" valign="middle" /> TUTODECODE

**Votre académie IT personnelle : 100% locale, performante et boostée à l'IA.**

[![Static Badge](https://img.shields.io/badge/Status-Active-success)](#)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Framework: Flutter](https://img.shields.io/badge/Framework-Flutter-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Local AI](https://img.shields.io/badge/AI-Local_Ollama-white?logo=smartthings&logoColor=black)](https://ollama.com)
[![Website](https://img.shields.io/badge/Website-tutodecode.org-02569B)](https://tutodecode.org)
[![Platform support](https://img.shields.io/badge/Platforms-Android_|_Windows_|_Linux-lightgrey)](#)

> [!IMPORTANT]
> **Suivez notre avancement :** Retrouvez toutes les actualités, les dernières versions et les jalons du projet directement sur notre site officiel : **[tutodecode.org](https://tutodecode.org)**.

---

## 🏢 À propos de l'Association TUTODECODE

> **Notre Mission Officielle :**
> *« Promouvoir l'apprentissage de l'informatique et du numérique sous toutes ses formes, créer et diffuser des contenus pédagogiques, tutoriels et documentations techniques accessibles à tous, gérer et administrer la plateforme internet dédiée à ces activités et favoriser l'entraide ainsi que le partage de connaissances entre passionnés et débutants. »*

## 💡 L'Apprentissage Repensé

TUTODECODE est une plateforme d'apprentissage technique portée par notre association à but non lucratif. Elle est conçue pour vous offrir un environnement riche, fluide et totalement indépendant du cloud. Montez en compétence sur les technologies d'aujourd'hui (Linux, Docker, Python, SQL) sans jamais dépendre d'une connexion internet ou sacrifier vos données personnelles.

### Pourquoi choisir TUTODECODE ?

*   **Privacy-First (100% Local)** : Vos cours, vos progressions et vos échanges avec l'IA ne quittent jamais votre machine.
*   **Performances Natives** : Une interface soignée, réactive et optimisée, développée avec Flutter pour tous vos écrans.
*   **Open Source** : Un projet transparent sous licence AGPL-3.0, garantissant que le code source reste librement consultable.

---

## ✨ Fonctionnalités Clés

### 🎓 Parcours Pédagogiques
Accédez à une bibliothèque de cours interactifs et structurés couvrant le développement, l'administration système et les fondamentaux de l'informatique.

### 💻 Laboratoires et Simulateurs
Pratiquez directement dans l'application. Nos interfaces simulent des terminaux et des environnements de configuration pour tester vos connaissances en temps réel, sans risque de casser votre système.

### 🧠 Ghost AI : Votre tuteur de poche
Bloqué sur un concept complexe ? **Ghost AI** est intégré directement à la plateforme. Propulsé localement par le moteur **Ollama**, il vous guide pas à pas sans aucun appel réseau.

> [!CAUTION]
> **Limites de l'IA (Hallucinations) :** Comme tout modèle de langage, Ghost AI peut générer des réponses incorrectes ou imprécises. Il doit être utilisé comme un outil d'accompagnement. Nous vous recommandons de toujours vérifier les commandes sensibles dans la documentation officielle fournie dans les cours.
>
> **Ressources Système :** L'exécution locale nécessite une machine avec au moins 8 Go de RAM et une puce graphique (GPU) compatible pour une expérience fluide.

---

## 📥 Téléchargements (Releases)

> [!WARNING]
> **Source de confiance unique :** Pour votre sécurité, téléchargez **TUTODECODE** exclusivement depuis ce dépôt officiel GitHub. Par mesure de sécurité et pour garantir l'intégrité de la chaîne de confiance, nous n'acceptons aucune collaboration externe directe sur le code noyau pour le moment.

| Fichier | Plateforme | Description | État |
|---------|------------|-------------|------|
| `TUTODECODE.apk` | **Android** | Plateforme d'apprentissage | ✅ Disponible |
| `TUTODECODE-Windows.zip` | **Windows** | **App & Éditeur** (Archive portable) | ✅ Disponible |
| `TUTODECODE.tar.gz` | **Linux** | Plateforme d'apprentissage | ✅ Disponible |
| `TUTODECODE.dmg` | **macOS** | Plateforme d'apprentissage | ⏳ Prochainement |

---

## 🛠 Procédure d'Installation

###  Windows (Recommandé)
L'application est distribuée sous forme d'archive portable pour éviter la friction des certificats auto-signés :
1. Téléchargez `TUTODECODE-Windows.zip`.
2. Extrayez l'archive et lancez `TUTODECODE.exe`.
3. Si un avertissement **SmartScreen** apparaît, cliquez sur *Informations complémentaires* puis *Exécuter quand même*. (Voir notre roadmap pour la signature professionnelle).

### 🤖 IA Pédagogique (Ghost AI)
1. Installez [Ollama](https://ollama.com).
2. Téléchargez un modèle léger (ex: `ollama pull qwen2.5:1.5b` ou `llama3.2`).
3. **TUTODECODE** détectera automatiquement le service IA au lancement.

---

## 🗺️ Vision & Roadmap 2026

Nous sommes conscients que la sécurité et l'ouverture sont des équilibres délicats. Voici nos objectifs prioritaires :

1.  **Signature Professionnelle (Priorité UX)** : Nous prévoyons l'acquisition d'un certificat **OV (Organization Validation)** pour supprimer les alertes SmartScreen et offrir une installation standardisée.
2.  **Ouverture du Noyau (CI/CD)** : Nous travaillons sur une infrastructure d'intégration continue rigoureuse (scans SAST, tests automatisés) afin d'ouvrir les **Pull Requests** en 2026 sans compromettre la sécurité des versions signées.
3.  **Vérification IA** : Intégration de mécanismes de "grounding" pour l'IA, liant ses réponses aux sources de cours internes pour réduire le risque d'hallucination.

---

## 🤝 Collaborations et Éthique

Bien que le noyau soit temporairement fermé aux Pull Requests directes pour sécuriser nos clés de signature, **TUTODECODE est et restera 100% Open Source**.

*   **Suggestions et Correctifs** : Vous souhaitez une nouvelle fonctionnalité ou corriger un bug ? Envoyez vos propositions à **contact@tutodecode.org**. 
*   **Transparence du Code** : Tout code intégré suite à vos suggestions sera publié et rendu auditable par tous. 
*   **Vérification de Sécurité** : Avant chaque publication officielle, nous effectuons un audit de sécurité exhaustif sur chaque ligne de code ajoutée. Cette étape est cruciale pour garantir qu'aucune vulnérabilité n'est introduite dans les versions distribuées et signées par l'association.
*   **Forks** : Vous êtes libres de fourcher le projet pour créer votre propre distribution sous votre propre responsabilité.

---

## 📄 Licence
Ce projet est sous licence **GNU Affero General Public License v3.0 (AGPL-3.0)**.
Toute modification ou redistribution doit être partagée sous cette même licence.

© 2026 Association TUTODECODE

