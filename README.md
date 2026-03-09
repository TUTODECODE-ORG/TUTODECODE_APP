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
Bloqué sur un concept complexe ? **Ghost AI** est intégré directement à la plateforme. Propulsé localement par le moteur **Ollama**, il vous guide pas à pas et répond à vos questions techniques sans aucun appel réseau vers des serveurs externes.

---

## 🔒 Sécurité et Chaîne de Confiance

La sécurité de nos utilisateurs est la priorité absolue de l'association **TUTODECODE**. Pour garantir l'intégrité de l'application, nous avons fait évoluer nos méthodes de distribution suite aux retours de notre communauté.

### L'évolution de notre distribution Windows
Afin de préserver la sécurité de votre système, nous avons **abandonné l'utilisation de certificats auto-signés** et l'installateur `.msix` qui nécessitaient de modifier les autorités de confiance de Windows. 
Voici notre nouvelle approche, plus standardisée et respectueuse de votre sécurité globale :

1. **La version "Portable" (Simplicité & Sécurité)** : L'application Windows est distribuée dans une simple archive `.zip`. Elle s'exécute de manière isolée sans rien installer ni modifier vos certificats. Si Windows affiche un avertissement "SmartScreen" (Éditeur inconnu), il suffit de cliquer sur "Informations complémentaires" puis "Exécuter quand même". L'application est sécurisée car elle ne demande aucune élévation de privilège systémique.
2. **Le dépôt "Winget" (En préparation)** : Nous ciblons une publication sur Winget, le gestionnaire de paquets officiel de Microsoft. La validation y est gérée de base par leurs soins et permet une installation propre et communautaire (`winget install tutodecode`).
3. **Reproducible Builds ("Attestations GitHub")** : Nous configurons nos GitHub Actions pour lier mathématiquement chaque fichier exécutable (`.exe`, `.apk`) directement au code source public, assurant une transparence et une vérifiabilité totales.
4. **Financement participatif** : Pour supprimer l'avertissement SmartScreen et les frictions d'installation sans recourir à des hacks, nous envisageons une cagnotte (HelloAsso, Tipeee) pour financer l'achat d'un certificat de signature (OV) professionnel officiel.

### 🛡️ Source Officielle Unique
Pour votre sécurité, téléchargez **uniquement** les versions publiées sur nos espaces officiels :
*   **Organisation GitHub :** [github.com/TUTODECODE-ORG](https://github.com/TUTODECODE-ORG)
*   **Dépôt Officiel :** [github.com/TUTODECODE-ORG/TUTODECODE_APP](https://github.com/TUTODECODE-ORG/TUTODECODE_APP)

> [!CAUTION]
> **N'installez jamais de version provenant d'un autre site ou d'un dépôt tiers.** Seuls les fichiers présents ici sont authentiques.

> [!NOTE]  
> **Transparence et Intégrité du Code**
> Le code source est auditable librement sous licence AGPL-3.0. Grâce aux futures Attestations GitHub (Reproducible builds), la correspondance exacte entre le code et l'exécutable sera garantie par un tiers de confiance.

### 🛡️ Plan de Réaction et Sécurité (Worst-Case Scenario)
Parce qu'une sécurité sérieuse consiste à tout prévoir, l'association **TUTODECODE** s'engage à une transparence totale en cas d'incident :
*   **Réactivité face au piratage** : Si une faille majeure ou une compromission de nos clés de signature devait survenir, une alerte critique sera immédiatement publiée sur **[tutodecode.org](https://tutodecode.org)**.
*   **Protection des utilisateurs** : Dans un tel scénario, les **procédures détaillées** pour identifier, désinstaller et éliminer les fichiers compromis seront publiées en priorité sur notre site officiel.
*   **Rétablissement de la chaîne de confiance** : Toute nouvelle clé de signature, certificat sain ou correctif de sécurité sera déployé ici même sur **GitHub**. Les utilisateurs n'auront qu'à suivre les instructions du site pour télécharger les nouveaux fichiers officiels sécurisés.
*   **Continuité** : Nous révoquerons les certificats compromis par les voies officielles pour neutraliser la menace à la racine.

---

## 📥 Téléchargements

| Plateforme | Fichier | Type |
| :--- | :--- | :--- |
| **Android** | `TUTODECODE.apk` | Application mobile & tablette |
| **Windows** | `TUTODECODE-Portable.zip` | Application Desktop (Archive portable, aucun installateur) |
| **Linux** | `TUTODECODE.tar.gz` | Archive binaire compilée |

---

## 🚀 Guide d'Installation Rapide

### Windows (Recommandé)
Nous privilégions désormais une version portable garantissant qu'aucune modification profonde de votre système (telle que l'ajout manuel de certificats) n'est nécessaire.

1. Téléchargez l'archive `TUTODECODE-Portable.zip` depuis la section [Releases officielle](https://github.com/TUTODECODE-ORG/TUTODECODE_APP/releases).
2. Extrayez le contenu de l'archive dans le dossier de votre choix (par exemple, dans `C:\Program Files\TUTODECODE` ou sur votre Bureau).
3. Double-cliquez sur `tutodecode.exe` pour lancer la plateforme.

> [!NOTE]
> **Avertissement SmartScreen** : Comme notre application n'a pas encore de certificat commercial officiel (financement à venir), Windows SmartScreen peut afficher le message "Windows a protégé votre ordinateur". Cliquez alors sur **Informations complémentaires**, puis sur **Exécuter quand même**. L'application restera isolée.

### Android
1. Téléchargez le fichier `TUTODECODE.apk`.
2. Autorisez temporairement l'installation d'applications de sources inconnues dans vos paramètres de sécurité.
3. Installez et lancez TUTODECODE.

### Activer Ghost AI (Ollama)
Pour débloquer l'assistant IA local :
1. Installez le moteur [Ollama](https://ollama.com).
2. Ouvrez un terminal et téléchargez un modèle léger et performant (ex: `ollama pull qwen2.5:1.5b` ou `ollama pull phi3`).
3. Relancez TUTODECODE : la plateforme détectera automatiquement votre modèle au démarrage.

---

## 🤝 Collaborations et Contributions

Pour garantir une sécurité maximale et l'intégrité totale de la chaîne de confiance, l'association **TUTODECODE** a fait le choix de ne pas accepter directement de collaborations externes via "Pull Requests" sur le dépôt noyau.

*   **Pourquoi ce choix ?** Nous ne pouvons pas donner à des personnes extérieures à l'association la possibilité de modifier le code qui sera ensuite signé officiellement par nos clés privées. C'est une mesure de sécurité vitale pour éviter toute injection de code malveillant dans nos versions distribuées.
*   **Comment proposer une amélioration ?** Si vous souhaitez suggérer des corrections ou des améliorations de code, nous vous invitons à nous les envoyer par mail à **contact@tutodecode.org**. Notre équipe technique analysera, testera et intégrera manuellement les propositions validées.
*   **Audit et Retours** : Signalez des bugs ou suggérez des idées via les [Issues](https://github.com/TUTODECODE-ORG/TUTODECODE_APP/issues).
*   **Forks** : Conformément à la licence **AGPL-3.0**, vous restez totalement libre de fourcher le projet pour vos besoins personnels, expérimentaux ou pour créer votre propre distribution (sous votre propre responsabilité et signature).

---

## 🛡️ Réponses aux Inquiétudes de Sécurité (FAQ technique)

Nous comprenons et encourageons le scepticisme sain des utilisateurs avertis. Voici notre position sur les points de friction identifiés :

1. **L'abandon du certificat auto-signé** : Nous avons écouté les suggestions de nos contributeurs. Installer un certificat racine ouvrait une vulnérabilité théorique de confiance que nous avions sous-estimée pour les OS de nos utilisateurs. La nouvelle version portable isole notre application et élimine ce risque systémique pour votre machine de travail, tout en enlevant cette pénible friction.
2. **Le "Silo" de sécurité** : Fermer le noyau aux PR directes peut sembler paradoxal pour de l'Open Source, mais c'est le seul moyen de garantir que l'exécutable final correspond exactement au code audité par nos soins. C'est une "chaîne de confiance fermée" pour la distribution officielle, tout en gardant un code 100% ouvert (auditable) pour la communauté.
3. **Preuve du "100% Local"** : La documentation est notre engagement. Nous encourageons activement les experts à analyser le trafic réseau de l'application avec des outils comme **Wireshark ou Fiddler**. La transparence du code Flutter (visible dans le dossier `lib/`) permet également de vérifier l'absence totale de modules de télémétrie ou d'appels "cachés".

---

## 📄 Licence
Ce projet est distribué sous licence **GNU Affero General Public License v3.0 (AGPL-3.0)**. 
Un exemplaire détaillé est disponible dans le fichier `LICENSE` à la racine du projet.

---
© 2026 Association TUTODECODE — [tutodecode.org](https://tutodecode.org)  
*Apprenez en toute liberté.*
