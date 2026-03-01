// @ts-nocheck
import type { Course } from '../../types/index';
import { Terminal, Code, Database, Shield, Cloud, Cpu, Lock, Globe, Server, Box } from 'lucide-react';

export const exampleCourses: Course[] = [
    {
        id: 'linux-basics',
        title: 'Les Bases de Linux',
        description: 'Maîtrisez les fondamentaux de Linux : navigation, commandes essentielles et gestion du système.',
        icon: Terminal,
        level: 'beginner',
        duration: '8h',
        category: 'kernel',
        chapters: 10,
        keywords: ['linux', 'terminal', 'bash', 'commandes', 'unix'],
        content: [
            { id: 'intro', title: 'Introduction à Linux', content: `# Introduction à Linux\n\nBienvenue dans le monde de Linux, le cœur battant d'internet. Vous pensiez que Windows dirigeait le monde ? Pensez-y à deux fois. La quasi-totalité des serveurs mondiaux, des supercalculateurs, et même des smartphones (Android) tournent sous Linux.\n\n## 🐧 Pourquoi Linux est-il incontournable ?\n- **C'est gratuit et open-source** : Tout le monde peut auditer le code.\n- **Stabilité légendaire** : Des serveurs peuvent tourner des années sans jamais avoir besoin d'un redémarrage.\n- **Sécurité** : Pas de .exe mystérieux, une gestion des droits stricte.\n- **Le vrai pouvoir** : Le terminal vous donne un contrôle absolu. Il n'y a pas d'interface graphique pour vous limiter.\n\n> 💡 **Le saviez-vous ?** Linus Torvalds a créé Linux en 1991 dans sa chambre d'étudiant parce qu'il n'avait pas les moyens de se payer Unix. Aujourd'hui, même Microsoft utilise Linux pour faire tourner Azure !`, duration: '30min' },
            { id: 'distros', title: 'Les Distributions Linux', content: `# Les Distributions (Distros)\n\nContrairement à Windows ou macOS qui sont des blocs monolithiques, Linux est en fait juste un "Noyau" (Kernel). Autour de ce noyau, des milliers d'organisations construisent leur propre système d'exploitation : ce sont les **distributions**.\n\n## 🌍 Les Familles Principales\n- **Debian / Ubuntu** : Les plus connues. Ubuntu est la reine des débutants, Debian est la reine de la stabilité.\n- **RedHat / Fedora / CentOS** : Le standard des grandes entreprises et banques américaines.\n- **Arch Linux** : Pour les puristes. Vous assemblez votre OS brique par brique. Si vous l'utilisez, vous êtes moralement obligé de dire *"I use Arch, by the way"*.\n- **Kali Linux** : La boîte à outils des hackers (Pentesting).\n\n*Choisissez votre arme, mais rappelez-vous : sous le capot, le terminal bash reste votre meilleur ami.*`, duration: '25min' },
            { id: 'navigation', title: 'Navigation Système', content: `# Navigation\n\nCommandes de base pour se déplacer.\n\n## Commandes\n- pwd : répertoire actuel\n- ls : liste fichiers\n- cd : changer de répertoire\n- tree : arborescence`, duration: '45min', codeBlocks: [{ language: 'bash', code: 'pwd\nls -la\ncd /home/user\ncd ..\ncd ~\ntree -L 2', title: 'Navigation' }], terminalObjectives: [{ cmd: 'pwd', description: 'Afficher le répertoire actuel' }, { cmd: 'ls', description: 'Lister le contenu du dossier' }], terminalBriefing: "Pour réussir cette mission, vous devez explorer votre environnement.\n1. Tapez 'pwd' pour voir où vous êtes.\n2. Tapez 'ls' pour voir les fichiers présents.\nC'est la base de tout administrateur !" },
            { id: 'files', title: 'Gestion des Fichiers', content: `# Gestion Fichiers - Le Couteau Suisse\n\nSous Linux, l'adage est simple : **"Tout est un fichier"**. Même votre clavier ou votre écran sont considérés comme des fichiers texte par le système !\n\n## 🛠️ L'Arsenal de Base\n- \`touch <fichier>\` : Crée un fichier vide instantanément.\n- \`mkdir <dossier>\` : Crée un répertoire (Make Directory).\n- \`cp <source> <destination>\` : Copie vos données.\n- \`mv <source> <destination>\` : Déplace ou renomme. Il n'y a pas de commande magique "rename" par défaut, on déplace le fichier vers un nouveau nom.\n- \`rm <fichier>\` : Supprime définitivement. **Attention : Il n'y a PAS de corbeille dans le terminal.** C'est effacé pour toujours.\n\n> ☠️ **L'erreur fatale** : Taper \`rm -rf /\` en tant qu'administrateur effacera instantanément l'intégralité de votre disque dur. N'essayez jamais ça sur une vraie machine !`, duration: '50min', codeBlocks: [{ language: 'bash', code: 'touch fichier.txt\nmkdir dossier\ncp file1 file2\nmv old new\nrm fichier', title: 'Fichiers' }], terminalObjectives: [{ cmd: 'mkdir', description: 'Créer un nouveau dossier' }, { cmd: 'touch', description: 'Créer un fichier vide' }], terminalBriefing: "Organisons notre système !\n1. Utilisez 'mkdir lab' pour créer un dossier nommé lab.\n2. Utilisez 'touch lab/note.txt' pour créer un fichier dedans.\nApprendre à structurer ses données est essentiel." },
            { id: 'permissions', title: 'Permissions Unix', content: `# Permissions\n\nChaque fichier a des permissions.\n\n## Types\n- r : lecture (4)\n- w : écriture (2)\n- x : exécution (1)\n\nExemple : chmod 755 fichier`, duration: '1h', codeBlocks: [{ language: 'bash', code: 'ls -l\nchmod 755 script.sh\nchown user:group fichier\nsudo chgrp www-data /var/www', title: 'Permissions' }] },
            { id: 'processes', title: 'Gestion des Processus', content: `# Processus\n\n## Commandes\n- ps : liste processus\n- top/htop : monitoring\n- kill : arrêter processus\n- bg/fg : arrière-plan`, duration: '45min' },
            { id: 'network', title: 'Réseau sous Linux', content: `# Réseau\n\n## Commandes réseau\n- ifconfig/ip : config réseau\n- ping : tester connexion\n- netstat : connexions actives\n- ssh : connexion distante`, duration: '1h' },
            { id: 'packages', title: 'Gestion des Paquets', content: `# Paquets\n\n## Gestionnaires\n- apt (Debian/Ubuntu)\n- yum/dnf (RedHat/Fedora)\n- pacman (Arch)\n\nExemple : sudo apt update && sudo apt install nginx`, duration: '40min' },
            { id: 'shell', title: 'Scripts Shell', content: `# Scripts Bash\n\nAutomatisez vos tâches.\n\n## Exemple\n#!/bin/bash\necho "Hello"\nfor i in {1..5}; do\n  echo $i\ndone`, duration: '1h30' },
            { id: 'advanced', title: 'Techniques Avancées', content: `# Avancé\n\n- Cron : tâches planifiées\n- Systemd : gestion services\n- LVM : volumes logiques\n- SELinux : sécurité renforcée`, duration: '1h', terminalBriefing: "Examen Final Linux.\nLisez le fichier de configuration secret pour trouver le mot de passe admin.", terminalObjectives: [{ cmd: 'cat /etc/passwd', description: 'Afficher les utilisateurs' }, { cmd: 'cat /root/secrets.txt', description: 'Lire le fichier secret' }], fileSystem: [{ name: 'root', type: 'dir', children: [{ name: 'secrets.txt', type: 'file', content: 'TUTODECODE{LINUX_MASTER}' }] }, { name: 'etc', type: 'dir', children: [{ name: 'passwd', type: 'file', content: 'root:x:0:0:root:/root:/bin/bash' }] }] }
        ]
    },
    {
        id: 'docker-intro',
        title: 'Docker - Conteneurisation',
        description: 'Maîtrisez Docker pour conteneuriser et déployer vos applications efficacement.',
        icon: Box,
        level: 'intermediate',
        duration: '10h',
        category: 'ship',
        chapters: 12,
        keywords: ['docker', 'conteneurs', 'devops', 'kubernetes'],
        content: [
            { id: 'intro', title: 'Introduction Docker', content: `# Docker : La Révolution des Conteneurs\n\nDocker a fondamentalement changé la façon dont nous concevons, distribuons et exécutons les logiciels.\n\n## 🐋 Qu'est-ce qu'un Conteneur ?\nImaginez une boîte hermétique dans laquelle vous jetez votre code, vos librairies (comme Python ou Node.js), et toutes vos configurations. Cette boîte s'exécutera ***exactement*** de la même manière sur votre ordinateur portable, sur un serveur Amazon AWS, ou même dans l'espace.\n\n## ✨ La Magie de l'Isolation\n- **Portabilité totale** : Le fameux "Ça marche sur ma machine" n'existe plus.\n- **Légèreté absolue** : Contrairement aux machines virtuelles (VM) qui émulent tout un faux ordinateur pesant des gigaoctets, un conteneur peut peser que 5 Mégaoctets !\n- **Le standard de l'industrie** : Si vous construisez un projet moderne en 2026, on s'attendra à ce que vous fournissiez un "Dockerfile".\n\n> 💣 **Anecdote Docker** : Au début de sa création en 2013 par le Français Solomon Hykes, Docker était juste un projet interne pour une entreprise d'hébergement appelée dotCloud. Aujourd'hui, des milliards de conteneurs sont générés chaque jour sur la planète.`, duration: '40min' },
            { id: 'install', title: 'Installation', content: `# Installation\n\n## Linux\nsudo apt install docker.io\nsudo systemctl start docker\nsudo usermod -aG docker $USER`, duration: '30min' },
            { id: 'images', title: 'Images vs Conteneurs', content: `# Images et Conteneurs : La Différence Vitale\n\nSi vous ne retenez qu'une chose, retenez ceci :\n\n- **L'Image** : C'est le plan de construction (le moule). C'est un assemblage "en lecture seule". L'image contient votre code source.\n- **Le Conteneur** : C'est l'exécution vivante de l'image. C'est le gâteau qui sort du moule.\n\n## 🛠️ Comment ça marche ?\n1. Oubliez les installations complexes. Vous voulez un serveur de base de données PostgreSQL ?\n2. \`docker pull postgres\` (Télécharge le moule)\n3. \`docker run postgres\` (Cuit le gâteau)\n\nC'est l'équivalent de l'App Store, mais pour des infrastructures informatiques entières.`, duration: '45min' },
            { id: 'containers', title: 'Conteneurs', content: `# Conteneurs\n\nInstance d'une image.\n\n## Commandes\n- docker run\n- docker ps\n- docker stop/start\n- docker rm`, duration: '1h', codeBlocks: [{ language: 'bash', code: 'docker run -d -p 80:80 nginx\ndocker ps\ndocker logs container_id\ndocker exec -it container_id bash', title: 'Conteneurs' }], terminalObjectives: [{ cmd: 'docker ps', description: 'Lister les conteneurs actifs' }, { cmd: 'docker run', description: 'Lancer un nouveau conteneur' }], terminalBriefing: "Prêt pour la conteneurisation ?\n- Vérifiez les conteneurs avec 'docker ps'.\n- Lancez votre premier serveur avec 'docker run nginx'.\nDocker va simuler le téléchargement et le lancement." },
            { id: 'dockerfile', title: 'Créer un Dockerfile', content: `# Le Dockerfile : La Recette du Chef\n\nLe Dockerfile est simplement un fichier texte clair contenant les instructions pour fabriquer votre image sur-mesure. Fini les *README* de 40 pages décrivant comment configurer un projet !\n\n## 📝 Grammaire Docker\n- \`FROM\` : L'ingrédient de base. Ex: \`FROM python:3.10\` commence avec un système contenant déjà Python.\n- \`WORKDIR\` : Choisit votre dossier de travail à l'intérieur de la boîte.\n- \`COPY\` : Aspire les fichiers de *votre* ordinateur vers l'intérieur de *la boîte*.\n- \`RUN\` : Exécute une commande (ex: installer des dépendances) pendant la création du moule.\n- \`CMD\` : La commande par défaut qui se lancera quand le conteneur démarre.\n\n> 💡 **Le Hack Ultime** : Séparez toujours \`COPY package.json\` et \`COPY .\` dans vos fichiers Docker pour profiter du *Système de Cache*. Cela rendra vos compilations 100x plus rapides !`, duration: '1h30' },
            { id: 'volumes', title: 'Volumes Docker', content: `# Volumes\n\nPersister les données.\n\n## Types\n- Volumes nommés\n- Bind mounts\n- tmpfs`, duration: '50min' },
            { id: 'networks', title: 'Réseaux Docker', content: `# Réseaux\n\nConnexion entre conteneurs.\n\n## Types\n- bridge\n- host\n- overlay\n- none`, duration: '45min' },
            { id: 'compose', title: 'Docker Compose', content: `# Docker Compose\n\nOrchestrer plusieurs conteneurs.\n\n## docker-compose.yml\nversion: '3'\nservices:\n  web:\n    image: nginx\n    ports:\n      - 80:80\n  db:\n    image: postgres`, duration: '1h30' },
            { id: 'registry', title: 'Docker Registry', content: `# Registry\n\nStockage d'images.\n\n- Docker Hub\n- Registres privés\n- Push/Pull images`, duration: '40min' },
            { id: 'security', title: 'Sécurité Docker', content: `# Sécurité\n\n- Ne pas utiliser root\n- Scanner vulnérabilités\n- Limiter ressources\n- Images minimales`, duration: '1h' },
            { id: 'optimization', title: 'Optimisation', content: `# Optimisation\n\n- Multi-stage builds\n- Layers caching\n- .dockerignore\n- Images alpine`, duration: '1h' },
            { id: 'production', title: 'Docker en Production', content: `# Production\n\n- Orchestration (Swarm, K8s)\n- Monitoring\n- Logs centralisés\n- Health checks`, duration: '1h30', terminalBriefing: "Validation Docker.\nVérifiez l'état de vos conteneurs et lisez le manifeste en attente.", terminalObjectives: [{ cmd: 'docker ps', description: 'Vérifier les conteneurs en production' }, { cmd: 'cat /app/Dockerfile', description: 'Examiner le Dockerfile de production' }], fileSystem: [{ name: 'app', type: 'dir', children: [{ name: 'Dockerfile', type: 'file', content: 'FROM alpine:latest\nCMD ["echo", "TUTODECODE{DOCKER_PRO}"]' }] }] }
        ]
    },
    {
        id: 'sql-basics',
        title: 'SQL - Bases de Données',
        description: 'Apprenez SQL pour interroger et gérer efficacement vos bases de données relationnelles.',
        icon: Database,
        level: 'beginner',
        duration: '12h',
        category: 'forge',
        chapters: 14,
        keywords: ['sql', 'database', 'mysql', 'postgresql', 'requêtes'],
        content: [
            { id: 'intro', title: 'Introduction SQL', content: `# La Puissance du SQL\n\nLe SQL (Structured Query Language) est littéralement le dialecte avec lequel nous parlons aux bases de données depuis les années 1970.\n\n## 🗄️ Pourquoi c'est le langage le plus important ?\n- **Incontournable** : Que vous fassiez du web, de la Data Science, ou de l'IA, les données sont stockées en SQL.\n- **Indépendant** : Ce n'est pas lié à un langage de programmation. Vous utilisez la même syntaxe en Python, Java, ou PHP.\n- **Déclaratif** : Vous ne dites pas à la machine *comment* chercher, vous lui dites *ce que* vous voulez. La machine se débrouille pour trouver le chemin le plus rapide.\n\n> 💡 **Le saviez-vous ?** Les bases de données comme PostgreSQL sont capables de traverser des téraoctets de données et de vous donner un résultat en moins d'une milliseconde, si la base est bien "indexée".`, duration: '45min' },
            { id: 'install', title: 'Installation MySQL', content: `# Installation\n\n## Ubuntu\nsudo apt install mysql-server\nsudo mysql_secure_installation`, duration: '30min' },
            { id: 'databases', title: 'Créer une BDD', content: `# Bases de données\n\nCREATE DATABASE ma_base;\nUSE ma_base;\nDROP DATABASE ma_base;`, duration: '30min', codeBlocks: [{ language: 'sql', code: 'CREATE DATABASE ecole;\nUSE ecole;\nSHOW DATABASES;', title: 'BDD' }] },
            { id: 'tables', title: 'Création de Tables', content: `# L'Art de la Modélisation (Tables)\n\nUne table en SQL ressemble à un tableau Excel sous stéroïdes. Vous devez définir la structure (le "Schéma") à l'avance.\n\n## 🏗️ Anatomie d'une Table\n1. **Colonnes** : Elles ont des "Types" stricts (Texte, Entier, Date).\n2. **Clé Primaire (Primary Key)** : L'identifiant unique. C'est sacré. Souvent un \`id\` généré automatiquement.\n3. **Contraintes** : \`UNIQUE\` (pas de doublon), \`NOT NULL\` (champ obligatoire).\n\n\`\`\`sql\nCREATE TABLE utilisateurs (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  age INT CHECK (age >= 18)\n);\n\`\`\`\n\nDans le vrai monde, on passe 30% du temps à coder et 70% à réfléchir à la structure des tables pour ne pas s'enfermer dans une mauvaise architecture.`, duration: '1h', codeBlocks: [{ language: 'sql', code: 'CREATE TABLE etudiants (\n  id INT PRIMARY KEY,\n  nom VARCHAR(100),\n  age INT,\n  classe VARCHAR(10)\n);', title: 'Tables' }] },
            { id: 'insert', title: 'INSERT - Ajouter', content: `# INSERT\n\nAjouter des données.\n\nINSERT INTO users (nom, email)\nVALUES ('Dupont', 'dupont@mail.com');`, duration: '45min' },
            { id: 'select', title: 'SELECT - Lire', content: `# SELECT\n\nLire des données.\n\nSELECT * FROM users;\nSELECT nom, email FROM users WHERE age > 18;\nSELECT * FROM users ORDER BY nom ASC;`, duration: '1h30' },
            { id: 'update', title: 'UPDATE - Modifier', content: `# UPDATE\n\nModifier des données.\n\nUPDATE users SET email = 'new@mail.com' WHERE id = 1;`, duration: '45min' },
            { id: 'delete', title: 'DELETE - Supprimer', content: `# DELETE\n\nSupprimer des données.\n\nDELETE FROM users WHERE id = 5;\nTRUNCATE TABLE users;`, duration: '40min' },
            { id: 'where', title: 'Clause WHERE', content: `# WHERE\n\nFiltrer les résultats.\n\n- Opérateurs : =, !=, >, <, >=, <=\n- LIKE : recherche pattern\n- IN : liste valeurs\n- BETWEEN : plage`, duration: '1h' },
            { id: 'joins', title: 'Maîtriser les Jointures', content: `# Jointures (JOINS) : Le Pouvoir du Relationnel\n\nC'est la fonctionnalité qui donne son "R" aux SGBDR (Systèmes de Gestion de Bases de Données **Relationnelles**).\n\n## 🔗 Relier les informations\nAu lieu d'avoir une table avec 100 colonnes "utilisateur_adresse1, adresse2", on sépare l'utilisateur et l'adresse dans 2 tables, puis on les "joint".\n\n- **INNER JOIN** : Croisement strict. Je veux les utilisateurs qui *ont* une commande.\n- **LEFT JOIN** : Garde tout à gauche. Je veux *tous* les utilisateurs, même s'ils n'ont pas commandé (affichera NULL).\n\nLes jointures sont la bête noire des débutants, mais c'est exactement là que se situe la différence entre un junior et un senior.`, duration: '1h30', codeBlocks: [{ language: 'sql', code: 'SELECT u.nom, c.titre\nFROM users u\nINNER JOIN commandes c ON u.id = c.user_id;', title: 'Joins' }] },
            { id: 'aggregate', title: 'Fonctions Agrégation', content: `# Agrégation\n\n- COUNT() : compter\n- SUM() : somme\n- AVG() : moyenne\n- MIN/MAX : min/max\n- GROUP BY : grouper`, duration: '1h' },
            { id: 'index', title: 'Index et Performance', content: `# Index\n\nAccélérer les requêtes.\n\nCREATE INDEX idx_email ON users(email);\nSHOW INDEX FROM users;`, duration: '1h' },
            { id: 'transactions', title: 'Transactions', content: `# Transactions\n\nATOMICITÉ garantie.\n\nSTART TRANSACTION;\nUPDATE comptes SET solde = solde - 100 WHERE id = 1;\nUPDATE comptes SET solde = solde + 100 WHERE id = 2;\nCOMMIT;`, duration: '1h' },
            { id: 'advanced', title: 'SQL Avancé', content: `# Avancé\n\n- Sous-requêtes\n- Vues (VIEWs)\n- Procédures stockées\n- Triggers\n- CTEs`, duration: '1h30', terminalBriefing: "Validation SQL.\nAffichez les connexions actives et trouvez le dump secret.", terminalObjectives: [{ cmd: 'netstat -tulnp', description: 'Voir les ports ouverts' }, { cmd: 'cat /var/db/backup.sql', description: 'Inspecter le dump SQL' }], fileSystem: [{ name: 'var', type: 'dir', children: [{ name: 'db', type: 'dir', children: [{ name: 'backup.sql', type: 'file', content: 'CREATE DATABASE auth;\n-- TUTODECODE{SQL_LEET}' }] }] }] }
        ]
    },
    {
        id: 'security-basics',
        title: 'Sécurité Web',
        description: 'Protégez vos applications : HTTPS, injections SQL, XSS, CSRF et bonnes pratiques.',
        icon: Shield,
        level: 'intermediate',
        duration: '10h',
        category: 'shield',
        chapters: 11,
        keywords: ['security', 'https', 'sql injection', 'xss', 'csrf', 'owasp'],
        content: [
            { id: 'intro', title: 'La Paranoïa comme standard', content: `# Introduction Sécurité\n\nEn développement, vous devez coder avec un état d'esprit précis : **Tout le monde est malveillant, tout fichier est infecté, toute requête est une attaque**.\n\n## 🏰 La Philosophie\n1. Ne faites jamais confiance au client (Le navigateur ou l'App).\n2. Validez toujours vos données côté Serveur (Backend).\n3. L'OWASP (Open Worldwide Application Security Project) liste les 10 failles critiques de l'année. Apprenez ce top 10 par cœur.\n\nSi vous laissez une base de données ouverte sans mot de passe sur un serveur cloud, il faut en moyenne moins de 8 heures pour qu'un robot scanneur automatique (botnet) la trouve et y injecte un ransomware.`, duration: '1h' },
            { id: 'https', title: 'HTTPS et TLS', content: `# HTTPS\n\nChiffrement des communications.\n\n## Certificats\n- Let's Encrypt (gratuit)\n- TLS 1.3\n- HSTS`, duration: '1h' },
            { id: 'sql-injection', title: 'Injections SQL (Le Fléau)', content: `# SQL Injection : Tromper la Machine\n\nMalgré son âge, c'est l'attaque la plus dévastatrice.\n\n## ⚔️ L'Attaque\nImaginons un code : \`SELECT * FROM users WHERE nom = '\` + valeur_saisie + \`'\`\nSi un pirate saisit : \`' OR '1'='1\`\nLa requête devient : \`SELECT * FROM users WHERE nom = '' OR '1'='1'\`.\nL'IA de la BDD évalue \`1=1\` comme "VRAI", et renvoie donc **TOUT** le contenu de la table (mots de passe inclus).\n\n## 🛡️ La Défense (Prepared Statements)\nOn sépare le "Schéma" de la requête de sa "Valeur". La base de données analysera d'abord la logique, puis collera simplement la variable saisie en tant que texte idiot, la rendant inoffensive.`, duration: '1h30', codeBlocks: [{ language: 'javascript', code: '// MAUVAIS (Injection SQL facile)\nconst query = "SELECT * FROM users WHERE id = " + userId;\n\n// BON (Requête paramétrée)\nconst query = "SELECT * FROM users WHERE id = ?";\ndb.execute(query, [userId]);', title: 'SQL Injection' }] },
            { id: 'xss', title: 'Cross-Site Scripting (XSS)', content: `# XSS : Empoisonnement de page\n\nIci, l'attaquant ne vise pas votre serveur. Il utilise votre site comme un tremplin pour attaquer les **autres utilisateurs** de votre site.\n\nIl injecte un script invisible dans un commentaire public. Quand Alice visite la page, son navigateur exécute le faux commentaire pensant qu'il fait partie de votre site. Le script vole les cookies de session d'Alice et les envoie au pirate.\n\n## 🛡️ La Défense\nÉchappez toujours (Sanitize) le code que vous affichez. Transformer les \`<\` en \`&lt;\`. C'est pour ça que la plupart des frameworks modernes comme React le font automatiquement pour vous (sauf si vous utilisez \`dangerouslySetInnerHTML\`).`, duration: '1h30' },
            { id: 'csrf', title: 'CSRF - Attaques', content: `# CSRF\n\nCross-Site Request Forgery.\n\n## Protection\n- CSRF tokens\n- SameSite cookies\n- Vérifier Origin header`, duration: '1h' },
            { id: 'auth', title: 'Authentification', content: `# Authentification\n\n## Bonnes pratiques\n- Hacher mots de passe (bcrypt)\n- 2FA\n- Sessions sécurisées\n- OAuth 2.0 / JWT`, duration: '1h30' },
            { id: 'passwords', title: 'Gestion Mots de Passe', content: `# Mots de passe\n\n## Règles\n- Minimum 12 caractères\n- Complexité\n- bcrypt/argon2\n- Pas de récupération (reset uniquement)`, duration: '45min' },
            { id: 'headers', title: 'Headers Sécurité', content: `# Security Headers\n\n- X-Frame-Options\n- X-Content-Type-Options\n- Content-Security-Policy\n- Strict-Transport-Security\n- X-XSS-Protection`, duration: '1h' },
            { id: 'cors', title: 'CORS Configuration', content: `# CORS\n\nCross-Origin Resource Sharing.\n\n## Configuration\nAccess-Control-Allow-Origin\nAccess-Control-Allow-Methods\nAccess-Control-Allow-Headers`, duration: '45min' },
            { id: 'api-security', title: 'Sécuriser APIs', content: `# API Security\n\n- Rate limiting\n- API keys\n- OAuth tokens\n- Input validation\n- HTTPS obligatoire`, duration: '1h' },
            { id: 'best-practices', title: 'Bonnes Pratiques', content: `# Best Practices\n\n- Principe moindre privilège\n- Défense en profondeur\n- Mise à jour régulière\n- Logging & monitoring\n- Tests de pénétration`, duration: '1h', terminalBriefing: "Audit Final.\nIdentifiez votre identité puis récupérez le rapport de pentest.", terminalObjectives: [{ cmd: 'whoami', description: 'Assurez-vous de votre identité' }, { cmd: 'cat /root/report.txt', description: 'Ouvrir le rapport final' }], fileSystem: [{ name: 'root', type: 'dir', children: [{ name: 'report.txt', type: 'file', content: '0 Critical, 0 High.\nFélicitations. TUTODECODE{SEC_PRO}' }] }] }
        ]
    },
    {
        id: 'javascript-modern',
        title: 'JavaScript Moderne (ES6+)',
        description: 'Maîtrisez JavaScript moderne : ES6+, async/await, modules et fonctionnalités avancées.',
        icon: Code,
        level: 'intermediate',
        duration: '15h',
        category: 'forge',
        chapters: 15,
        keywords: ['javascript', 'es6', 'async', 'promises', 'modules'],
        content: [
            { id: 'intro', title: 'JavaScript ES6+', content: `# JS Moderne\n\nÉvolution du langage.\n\n## Nouveautés\n- let/const\n- Arrow functions\n- Template literals\n- Destructuring\n- Spread operator`, duration: '1h' },
            { id: 'variables', title: 'let, const, var', content: `# Variables\n\n- var : function scope (ancien)\n- let : block scope\n- const : constante (block scope)`, duration: '45min' },
            { id: 'arrow-functions', title: 'Arrow Functions', content: `# Arrow Functions\n\nSyntaxe moderne.\n\n// Ancien\nfunction add(a, b) {\n  return a + b;\n}\n\n// Moderne\nconst add = (a, b) => a + b;`, duration: '1h', codeBlocks: [{ language: 'javascript', code: 'const double = n => n * 2;\nconst sum = (a, b) => a + b;\n\nconst users = [1,2,3].map(n => n * 2);', title: 'Arrow' }] },
            { id: 'destructuring', title: 'Destructuring', content: `# Destructuring\n\nExtraire valeurs facilement.\n\nconst {nom, age} = user;\nconst [first, ...rest] = array;`, duration: '1h' },
            { id: 'spread', title: 'Spread & Rest', content: `# Spread\n\ncopier/fusionner.\n\nconst arr2 = [...arr1];\nconst obj2 = {...obj1, new: 'value'};`, duration: '45min' },
            { id: 'promises', title: 'Promises', content: `# Promises\n\nGérer l'asynchrone.\n\nfetch(url)\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`, duration: '1h30' },
            { id: 'async-await', title: 'Async/Await', content: `# Async/Await\n\nPromises plus lisibles.\n\nasync function getData() {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}`, duration: '1h30', codeBlocks: [{ language: 'javascript', code: 'async function loadUser(id) {\n  const response = await fetch(`/api/users/${id}`);\n  return await response.json();\n}', title: 'Async' }] },
            { id: 'modules', title: 'Modules ES6', content: `# Modules\n\nOrganiser le code.\n\n// export\nexport const PI = 3.14;\nexport function add(a,b) {}\n\n// import\nimport {PI, add} from './math.js';`, duration: '1h' },
            { id: 'classes', title: 'Classes ES6', content: `# Classes\n\nPOO en JavaScript.\n\nclass User {\n  constructor(nom) {\n    this.nom = nom;\n  }\n  \n  sayHello() {\n    return \`Hello \${this.nom}\`;\n  }\n}`, duration: '1h30' },
            { id: 'array-methods', title: 'Méthodes Array', content: `# Array Methods\n\n- map() : transformer\n- filter() : filtrer\n- reduce() : agréger\n- find() : chercher\n- some/every : tester`, duration: '1h30' },
            { id: 'optional-chaining', title: 'Optional Chaining', content: `# Optional Chaining\n\nÉviter erreurs null.\n\nconst name = user?.profile?.name;\nconst result = obj?.method?.();`, duration: '30min' },
            { id: 'nullish', title: 'Nullish Coalescing', content: `# Nullish ??\n\nValeur par défaut.\n\nconst value = input ?? 'default';\n// Seulement si null/undefined`, duration: '30min' },
            { id: 'symbols', title: 'Symbols & Iterators', content: `# Symbols\n\nIdentifiants uniques.\n\nconst sym = Symbol('desc');\nconst obj = {[sym]: 'value'};`, duration: '45min' },
            { id: 'proxy-reflect', title: 'Proxy & Reflect', content: `# Proxy\n\nIntercepter opérations.\n\nconst proxy = new Proxy(target, {\n  get(obj, prop) {\n    console.log(\`Get \${prop}\`);\n    return obj[prop];\n  }\n});`, duration: '1h' },
            { id: 'best-practices', title: 'Bonnes Pratiques JS', content: `# Best Practices\n\n- Utiliser const par défaut\n- Éviter var\n- Async/await > callbacks\n- ES modules\n- Strict mode`, duration: '1h', terminalBriefing: "Déploiement JS.\nVérifiez la version de Node et lisez le package.json.", terminalObjectives: [{ cmd: 'node -v', description: 'Vérifier l\'environnement' }, { cmd: 'cat /app/package.json', description: 'Vérifier les dépendances' }], fileSystem: [{ name: 'app', type: 'dir', children: [{ name: 'package.json', type: 'file', content: '{\n  "name": "tutodecode-js",\n  "version": "1.0.0",\n  "secret": "TUTODECODE{JS_BOSS}"\n}' }] }] }
        ]
    },
    {
        id: 'react-fundamentals',
        title: 'React - Fondamentaux',
        description: 'Créez des applications web modernes avec React : composants, hooks, state management.',
        icon: Code,
        level: 'intermediate',
        duration: '18h',
        category: 'forge',
        chapters: 16,
        keywords: ['react', 'hooks', 'components', 'jsx', 'frontend'],
        content: [
            { id: 'intro', title: 'Introduction React', content: `# React\n\nBibliothèque UI JavaScript.\n\n## Pourquoi React?\n- Composants réutilisables\n- Virtual DOM\n- Écosystème riche\n- Performance`, duration: '45min' },
            { id: 'setup', title: 'Setup Environnement', content: `# Setup\n\nnpx create-react-app my-app\ncd my-app\nnpm start\n\n// ou Vite (plus rapide)\nnpm create vite@latest my-app -- --template react`, duration: '30min' },
            { id: 'jsx', title: 'JSX Syntaxe', content: `# JSX\n\nJavaScript XML.\n\nconst element = <h1>Hello!</h1>;\n\nconst user = {\n  name: 'Alice'\n};\nconst greeting = <h1>Hello {user.name}</h1>;`, duration: '1h', codeBlocks: [{ language: 'jsx', code: 'const App = () => {\n  const title = "TutoDecode";\n  return <h1>{title}</h1>;\n};', title: 'JSX' }] },
            { id: 'components', title: 'Composants React', content: `# Composants\n\nBriques de base.\n\n// Function Component\nfunction Welcome(props) {\n  return <h1>Hello {props.name}</h1>;\n}\n\n// Arrow function\nconst Welcome = ({name}) => <h1>Hello {name}</h1>;`, duration: '1h30' },
            { id: 'props', title: 'Props', content: `# Props\n\nPasser des données.\n\n<UserCard name="Alice" age={25} />\n\nfunction UserCard({name, age}) {\n  return <div>{name}: {age} ans</div>;\n}`, duration: '1h' },
            { id: 'state', title: 'State avec useState', content: `# useState Hook\n\nÉtat local.\n\nimport {useState} from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}`, duration: '1h30', codeBlocks: [{ language: 'jsx', code: 'const [value, setValue] = useState("");\nconst [items, setItems] = useState([]);', title: 'useState' }] },
            { id: 'useEffect', title: 'useEffect Hook', content: `# useEffect\n\nEffets de bord.\n\nuseEffect(() => {\n  // Code à exécuter\n  console.log('Mounted');\n  \n  return () => {\n    // Cleanup\n    console.log('Unmounted');\n  };\n}, [dependencies]);`, duration: '2h' },
            { id: 'events', title: 'Gestion Événements', content: `# Events\n\nGérer interactions.\n\nfunction Button() {\n  const handleClick = (e) => {\n    e.preventDefault();\n    console.log('Clicked!');\n  };\n  \n  return <button onClick={handleClick}>Click</button>;\n}`, duration: '1h' },
            { id: 'forms', title: 'Formulaires React', content: `# Forms\n\nContrôler les inputs.\n\nconst [value, setValue] = useState('');\n\n<input \n  value={value}\n  onChange={(e) => setValue(e.target.value)}\n/>`, duration: '1h30' },
            { id: 'lists', title: 'Listes et Clés', content: `# Lists\n\nAfficher tableaux.\n\nconst items = ['a', 'b', 'c'];\n\nreturn (\n  <ul>\n    {items.map((item, i) => (\n      <li key={i}>{item}</li>\n    ))}\n  </ul>\n);`, duration: '1h' },
            { id: 'conditional', title: 'Rendu Conditionnel', content: `# Conditional\n\n{isLoggedIn ? <Dashboard /> : <Login />}\n\n{error && <ErrorMessage />}\n\n{loading ? <Spinner /> : <Content />}`, duration: '45min' },
            { id: 'useContext', title: 'useContext Hook', content: `# Context API\n\nPartager données globalement.\n\nconst ThemeContext = React.createContext();\n\nfunction App() {\n  return (\n    <ThemeContext.Provider value="dark">\n      <Child />\n    </ThemeContext.Provider>\n  );\n}`, duration: '1h30' },
            { id: 'useRef', title: 'useRef Hook', content: `# useRef\n\nRéférences DOM.\n\nconst inputRef = useRef();\n\nuseEffect(() => {\n  inputRef.current.focus();\n}, []);\n\n<input ref={inputRef} />`, duration: '1h' },
            { id: 'custom-hooks', title: 'Custom Hooks', content: `# Custom Hooks\n\nRéutiliser logique.\n\nfunction useLocalStorage(key) {\n  const [value, setValue] = useState(\n    () => localStorage.getItem(key)\n  );\n  \n  useEffect(() => {\n    localStorage.setItem(key, value);\n  }, [key, value]);\n  \n  return [value, setValue];\n}`, duration: '1h30' },
            { id: 'performance', title: 'Optimisation Performance', content: `# Performance\n\n- useMemo : mémoriser calculs\n- useCallback : mémoriser fonctions\n- React.memo : mémoriser composants\n- Lazy loading\n- Code splitting`, duration: '1h30' },
            { id: 'best-practices', title: 'Bonnes Pratiques', content: `# Best Practices\n\n- Composants petits et focalisés\n- Props immutables\n- Hooks en haut du composant\n- Nommer composants clairement\n- TypeScript recommandé`, duration: '1h', terminalBriefing: "Validation React.\nVérifiez le processus de build.", terminalObjectives: [{ cmd: 'ls build', description: 'Lister le dossier de build' }, { cmd: 'cat build/index.html', description: 'Vérifier le fichier généré' }], fileSystem: [{ name: 'build', type: 'dir', children: [{ name: 'index.html', type: 'file', content: '<!DOCTYPE html><html><head><title>App</title></head><body><div id="root">TUTODECODE{REACT_NINJA}</div></body></html>' }] }] }
        ]
    }
];

// Ajout des nouveaux cours et de la Masterclass
const newCourses: Course[] = [
    {
        id: 'ia-masterclass',
        title: 'Masterclass : IA & Terminal Interactif',
        description: 'L\'expérience ultime. Apprenez la théorie par la pratique : plongez dans un environnement simulé interactif où une IA analyse et corrige votre code réseau et système en temps réel.',
        icon: Terminal,
        level: 'advanced',
        duration: '15h',
        category: 'shield',
        chapters: 5,
        keywords: ['ia', 'terminal', 'interactif', 'masterclass', 'temps-réel', 'survie'],
        content: [
            {
                id: 'recon',
                title: 'Phase 1 : Reconnaissance Système',
                content: `# Le Mode Survie Interactive\n\nCeci n'est pas un tutoriel ou un PDF copié-collé d'internet. Vous êtes face à un terminal simulé sous haute surveillance.\n\nL'**IA de correction en temps réel** est active. Si vous tapez une commande destructrice (ex: \`rm -rf /\`), le bac à sable vous bloquera.\n\n## Votre Mission :\n1. Identifier les processus zombies de notre serveur.\n2. Vérifier les connexions entrantes suspectes.\n\nC'est à vous de jouer. Démarrez l'audit.`,
                duration: '1h',
                codeBlocks: [{ language: 'bash', code: '# Scanner les ports ouverts (Simulé)\nnmap -sS -p 1-65535 localhost\n\n# Analyser la RAM\nfree -h', title: 'Audit de démarrage' }],
                terminalBriefing: "Système IA initialisé (Latence: 12ms). L'analyse de vos commandes est enclenchée.\nProuvez vos compétences en administration : vérifiez qui est connecté sur cette machine.",
                terminalObjectives: [
                    { cmd: 'whoami', description: 'Identifier votre identité de session (Utilisateur actuel)' },
                    { cmd: 'netstat -tulnp', description: 'Lister les ports TCP/UDP en écoute avec les processus associés' }
                ]
            },
            {
                id: 'code-review',
                title: 'Phase 2 : Code Review par l\'IA',
                content: `# Programmation Réactive\n\nL'IA a détecté une faille dans le script Node.js gérant l'authentification. L'exécution est asynchrone mais ne gère pas les Promesses correctement, causant des fuites mémoire importantes.\n\n## Code Vulnérable :\nExaminez le snippet ci-dessous. Le \`catch\` est absent et les variables globales polluent la stack.\n\nDemandez à l'IA du terminal de vous aider ou corrigez le code via le bash intégré.`,
                duration: '2h',
                codeBlocks: [{ language: 'javascript', code: '// Bad Code - SQL Injection + Callback Hell\napp.post("/login", function(req, res) {\n  var user = req.body.user;\n  db.query("SELECT * FROM users WHERE name = \'" + user + "\'", function(err, result) {\n    res.send(result);\n  });\n});', title: 'Faille Critique' }],
                terminalBriefing: "Évaluation de sécurité en cours...\nL'IA locale est prête à patcher le code. Vérifiez d'abord la santé du système.",
                terminalObjectives: [
                    { cmd: 'node check-auth.js', description: 'Lancer l\'analyseur de vulnérabilité statique (Simulé)' }
                ]
            },
            {
                id: 'deployment',
                title: 'Phase 3 : Déploiement Zero-Downtime',
                content: `# Orchestration Finale\n\nMaintenant que le code est sécurisé, vous devez déployer les nouveaux conteneurs sans interrompre le trafic actuel (Zero-Downtime Deployment).\n\n## Objectifs Kubernetes\nNous utilisons K8s pour router le trafic de la v1.0 vers la v2.0 (Canary Release).`,
                duration: '3h',
                codeBlocks: [{ language: 'yaml', code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: auth-v2\nspec:\n  replicas: 3\n  strategy:\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0', title: 'Zero Downtime' }],
                terminalBriefing: "Objectif Final : Déploiement. L'IA monitorera l'uptime du cluster. Appliquez les manifestes K8s simulés.",
                terminalObjectives: [
                    { cmd: 'kubectl apply -f deployment.yaml', description: 'Appliquer la nouvelle configuration de déploiement' },
                    { cmd: 'kubectl get pods -w', description: 'Surveiller le démarrage des pods en temps réel' }
                ]
            }
        ]
    },
    {
        id: 'git-github',
        title: 'Git & GitHub Complet',
        description: 'Maîtrisez Git pour versionner votre code et collaborer efficacement avec GitHub.',
        icon: Code,
        level: 'beginner',
        duration: '8h',
        category: 'ship',
        chapters: 11,
        keywords: ['git', 'github', 'version control', 'vcs'],
        content: [
            { id: 'intro', title: 'Introduction Git', content: `# Git\n\nSystème de contrôle de version distribué.\n\n## Pourquoi Git?\n- Historique complet\n- Branches faciles\n- Collaboration\n- Gratuit et open source`, duration: '30min' },
            { id: 'install', title: 'Installation', content: `# Installation\n\n## Linux\nsudo apt install git\n\n## Configuration\ngit config --global user.name "Nom"\ngit config --global user.email "email@mail.com"`, duration: '20min' },
            { id: 'basics', title: 'Commandes de Base', content: `# Bases Git\n\ngit init\ngit add file.txt\ngit add .\ngit commit -m "Message"\ngit status\ngit log`, duration: '1h', codeBlocks: [{ language: 'bash', code: 'git init\ngit add .\ngit commit -m "Initial commit"\ngit log --oneline', title: 'Git Basics' }] },
            { id: 'branches', title: 'Branches Git', content: `# Branches\n\nTravail parallèle.\n\ngit branch feature\ngit checkout feature\n# ou\ngit checkout -b feature\n\ngit branch -d feature`, duration: '1h' },
            { id: 'merge', title: 'Merge et Conflits', content: `# Merge\n\nFusionner branches.\n\ngit checkout main\ngit merge feature\n\n## Conflits\n- Résoudre manuellement\n- git add .\n- git commit`, duration: '1h30' },
            { id: 'remote', title: 'Dépôts Distants', content: `# Remote\n\ngit remote add origin url\ngit push -u origin main\ngit pull origin main\ngit fetch`, duration: '1h' },
            { id: 'github', title: 'GitHub Workflow', content: `# GitHub\n\n1. Fork repository\n2. Clone localement\n3. Créer branche\n4. Commit changes\n5. Push\n6. Pull Request`, duration: '1h' },
            { id: 'gitignore', title: '.gitignore', content: `# .gitignore\n\nIgnorer fichiers.\n\nnode_modules/\n.env\n*.log\ndist/\n.DS_Store`, duration: '30min' },
            { id: 'rebase', title: 'Rebase et Rewrite', content: `# Rebase\n\nRéécrire historique.\n\ngit rebase main\ngit rebase -i HEAD~3\n\n## Amend\ngit commit --amend`, duration: '1h' },
            { id: 'stash', title: 'Stash et Reset', content: `# Stash\n\nSauvegarder temporairement.\n\ngit stash\ngit stash pop\ngit stash list\n\n## Reset\ngit reset --hard HEAD\ngit reset --soft HEAD~1`, duration: '45min' },
            { id: 'advanced', title: 'Git Avancé', content: `# Avancé\n\n- Cherry-pick\n- Submodules\n- Git hooks\n- Tags\n- Bisect`, duration: '1h', terminalBriefing: "Examen Final Git.\nVérifiez le statut du dépôt et lisez le README.", terminalObjectives: [{ cmd: 'git status', description: 'Vérifier l\'état du dépôt' }, { cmd: 'cat /readme.md', description: 'Lire les instructions' }], fileSystem: [{ name: 'readme.md', type: 'file', content: '# Projet Final\nValidation: TUTODECODE{GIT_EXPERT}' }] }
        ]
    },
    {
        id: 'python-basics',
        title: 'Python pour Débutants',
        description: 'Apprenez Python de zéro : syntaxe, structures de données, POO et projets pratiques.',
        icon: Code,
        level: 'beginner',
        duration: '20h',
        category: 'forge',
        chapters: 18,
        keywords: ['python', 'programming', 'scripting', 'poo'],
        content: [
            { id: 'intro', title: 'Introduction Python', content: `# Python\n\nLangage polyvalent et simple.\n\n## Usages\n- Web (Django, Flask)\n- Data Science\n- Automation\n- AI/ML`, duration: '30min' },
            { id: 'install', title: 'Installation', content: `# Setup\n\nsudo apt install python3 python3-pip\npython3 --version\npip3 install numpy`, duration: '20min' },
            { id: 'syntax', title: 'Syntaxe de Base', content: `# Syntaxe\n\nprint("Hello")\n\n# Variables\nnom = "Alice"\nage = 25\nprix = 19.99\n\n# Commentaires\n# Commentaire ligne\n""" Multi\nligne """`, duration: '1h', codeBlocks: [{ language: 'python', code: 'name = "Python"\nversion = 3.12\nprint(f"Hello {name} {version}")', title: 'Syntaxe' }] },
            { id: 'types', title: 'Types de Données', content: `# Types\n\n- int : entiers\n- float : décimaux\n- str : chaînes\n- bool : True/False\n- list : [1,2,3]\n- tuple : (1,2,3)\n- dict : {"key": "value"}\n- set : {1,2,3}`, duration: '1h30' },
            { id: 'conditions', title: 'Conditions', content: `# if/elif/else\n\nif age >= 18:\n    print("Majeur")\nelif age >= 13:\n    print("Ado")\nelse:\n    print("Enfant")`, duration: '1h' },
            { id: 'loops', title: 'Boucles', content: `# Loops\n\n# for\nfor i in range(5):\n    print(i)\n\nfor item in liste:\n    print(item)\n\n# while\nwhile x < 10:\n    x += 1`, duration: '1h30' },
            { id: 'functions', title: 'Fonctions', content: `# Functions\n\ndef saluer(nom):\n    return f"Bonjour {nom}"\n\ndef add(a, b=0):\n    return a + b\n\n# Lambda\nsquare = lambda x: x**2`, duration: '1h30', codeBlocks: [{ language: 'python', code: 'def calculate(x, y, op="+"):\n    if op == "+":\n        return x + y\n    return x - y', title: 'Functions' }] },
            { id: 'lists', title: 'Listes', content: `# Lists\n\nliste = [1, 2, 3]\nliste.append(4)\nliste.remove(2)\nliste[0] = 10\n\n# Slicing\nliste[1:3]\nliste[::-1]`, duration: '1h30' },
            { id: 'dict', title: 'Dictionnaires', content: `# Dictionaries\n\nuser = {\n    "nom": "Alice",\n    "age": 25\n}\n\nuser["email"] = "a@mail.com"\nprint(user.get("nom"))`, duration: '1h' },
            { id: 'strings', title: 'Strings', content: `# Strings\n\ntext = "Python"\ntext.upper()\ntext.lower()\ntext.split()\n\n# f-strings\nnom = "Alice"\nage = 25\nprint(f"{nom} a {age} ans")`, duration: '1h' },
            { id: 'files', title: 'Fichiers I/O', content: `# Files\n\n# Lire\nwith open("file.txt", "r") as f:\n    content = f.read()\n\n# Écrire\nwith open("file.txt", "w") as f:\n    f.write("Hello")`, duration: '1h' },
            { id: 'exceptions', title: 'Exceptions', content: `# Exceptions\n\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Erreur!")\nfinally:\n    print("Fin")`, duration: '1h' },
            { id: 'modules', title: 'Modules', content: `# Modules\n\nimport math\nfrom datetime import datetime\nimport requests as req\n\n# Créer module\n# mymodule.py\ndef hello():\n    print("Hi")`, duration: '1h' },
            { id: 'oop', title: 'POO - Classes', content: `# Classes\n\nclass User:\n    def __init__(self, nom):\n        self.nom = nom\n    \n    def saluer(self):\n        return f"Bonjour {self.nom}"\n\nuser = User("Alice")\nprint(user.saluer())`, duration: '2h' },
            { id: 'inheritance', title: 'Héritage', content: `# Héritage\n\nclass Animal:\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"`, duration: '1h30' },
            { id: 'comprehensions', title: 'Comprehensions', content: `# List Comprehension\n\nsquares = [x**2 for x in range(10)]\n\n# Dict Comprehension\nd = {x: x**2 for x in range(5)}\n\n# Conditions\neven = [x for x in range(10) if x % 2 == 0]`, duration: '1h' },
            { id: 'decorators', title: 'Decorators', content: `# Decorators\n\ndef timer(func):\n    def wrapper(*args):\n        import time\n        start = time.time()\n        result = func(*args)\n        print(f"Temps: {time.time()-start}s")\n        return result\n    return wrapper\n\n@timer\ndef slow():\n    time.sleep(1)`, duration: '1h30' },
            { id: 'virtual-env', title: 'Virtual Environments', content: `# venv\n\npython3 -m venv env\nsource env/bin/activate\npip install package\ndeactivate\n\n# requirements\npip freeze > requirements.txt\npip install -r requirements.txt`, duration: '1h', terminalBriefing: "Validation Python.\nConsultez les dépendances installées.", terminalObjectives: [{ cmd: 'ls', description: 'Lister les fichiers' }, { cmd: 'cat requirements.txt', description: 'Vérifier les exigences' }], fileSystem: [{ name: 'requirements.txt', type: 'file', content: 'flask==2.0.1\nnumpy==1.21.0\n# TUTODECODE{PYTHON_SNAKE}' }] }
        ]
    },
    {
        id: 'nodejs-backend',
        title: 'Node.js Backend',
        description: 'Créez des APIs REST avec Node.js, Express, et MongoDB pour vos applications.',
        icon: Server,
        level: 'intermediate',
        duration: '16h',
        category: 'forge',
        chapters: 14,
        keywords: ['nodejs', 'express', 'api', 'backend', 'mongodb'],
        content: [
            { id: 'intro', title: 'Introduction Node.js', content: `# Node.js\n\nJavaScript côté serveur.\n\n## Avantages\n- JavaScript full-stack\n- Asynchrone non-bloquant\n- NPM écosystème\n- Performance`, duration: '45min' },
            { id: 'install', title: 'Installation', content: `# Setup\n\n## Via nvm (recommandé)\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\nnvm install --lts\nnode --version\nnpm --version`, duration: '30min' },
            { id: 'basics', title: 'Node.js Basics', content: `# Basics\n\n// server.js\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, {'Content-Type': 'text/plain'});\n  res.end('Hello Node!');\n});\n\nserver.listen(3000);`, duration: '1h', codeBlocks: [{ language: 'javascript', code: 'const fs = require("fs");\nfs.readFile("file.txt", "utf8", (err, data) => {\n  console.log(data);\n});', title: 'Node Basics' }] },
            { id: 'npm', title: 'NPM Packages', content: `# NPM\n\nnpm init -y\nnpm install express\nnpm install --save-dev nodemon\n\n// package.json\n"scripts": {\n  "start": "node server.js",\n  "dev": "nodemon server.js"\n}`, duration: '45min' },
            { id: 'express', title: 'Express Framework', content: `# Express\n\nFramework web minimaliste.\n\nconst express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello Express!');\n});\n\napp.listen(3000);`, duration: '1h30', codeBlocks: [{ language: 'javascript', code: 'const express = require("express");\nconst app = express();\n\napp.get("/api/users", (req, res) => {\n  res.json([{id: 1, name: "Alice"}]);\n});', title: 'Express' }] },
            { id: 'routing', title: 'Routing Express', content: `# Routing\n\n// Routes\napp.get('/users', getUsers);\napp.post('/users', createUser);\napp.put('/users/:id', updateUser);\napp.delete('/users/:id', deleteUser);\n\n// Params\napp.get('/users/:id', (req, res) => {\n  const id = req.params.id;\n});`, duration: '1h30' },
            { id: 'middleware', title: 'Middleware', content: `# Middleware\n\nFonctions intermédiaires.\n\n// Logger\napp.use((req, res, next) => {\n  console.log(\`\${req.method} \${req.url}\`);\n  next();\n});\n\n// Body parser\napp.use(express.json());\napp.use(express.urlencoded({extended: true}));`, duration: '1h30' },
            { id: 'mongodb', title: 'MongoDB Integration', content: `# MongoDB\n\nnpm install mongodb mongoose\n\nconst mongoose = require('mongoose');\n\nmongoose.connect('mongodb://localhost/mydb', {\n  useNewUrlParser: true\n});`, duration: '1h30' },
            { id: 'models', title: 'Mongoose Models', content: `# Models\n\nconst userSchema = new mongoose.Schema({\n  nom: String,\n  email: {type: String, unique: true},\n  age: Number,\n  createdAt: {type: Date, default: Date.now}\n});\n\nconst User = mongoose.model('User', userSchema);`, duration: '1h30' },
            { id: 'crud', title: 'CRUD Operations', content: `# CRUD\n\n// Create\nconst user = new User({nom: "Alice"});\nawait user.save();\n\n// Read\nconst users = await User.find();\nconst user = await User.findById(id);\n\n// Update\nawait User.findByIdAndUpdate(id, {nom: "Bob"});\n\n// Delete\nawait User.findByIdAndDelete(id);`, duration: '2h', codeBlocks: [{ language: 'javascript', code: 'app.post("/api/users", async (req, res) => {\n  const user = new User(req.body);\n  await user.save();\n  res.json(user);\n});', title: 'CRUD' }] },
            { id: 'auth', title: 'Authentication JWT', content: `# JWT Auth\n\nnpm install jsonwebtoken bcryptjs\n\nconst jwt = require('jsonwebtoken');\n\n// Créer token\nconst token = jwt.sign({userId}, 'secret', {expiresIn: '1d'});\n\n// Vérifier\nconst decoded = jwt.verify(token, 'secret');`, duration: '2h' },
            { id: 'validation', title: 'Validation', content: `# Validation\n\nnpm install joi\n\nconst Joi = require('joi');\n\nconst schema = Joi.object({\n  nom: Joi.string().min(3).required(),\n  email: Joi.string().email().required()\n});\n\nconst {error} = schema.validate(data);`, duration: '1h' },
            { id: 'error-handling', title: 'Error Handling', content: `# Errors\n\n// Error middleware\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({error: err.message});\n});\n\n// Async errors\nconst asyncHandler = fn => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);`, duration: '1h' },
            { id: 'deployment', title: 'Déploiement', content: `# Déploiement\n\n## Heroku\nheroku create\ngit push heroku main\n\n## PM2\nnpm install -g pm2\npm2 start server.js\npm2 logs\npm2 restart all`, duration: '1h30', terminalBriefing: "Validation Node.js Backend.\nVérifiez les logs de production.", terminalObjectives: [{ cmd: 'pm2 logs', description: 'Consulter les logs' }, { cmd: 'cat /var/log/app.log', description: 'Lire le fichier log' }], fileSystem: [{ name: 'var', type: 'dir', children: [{ name: 'log', type: 'dir', children: [{ name: 'app.log', type: 'file', content: 'Server started on port 3000\nConnexion DB OK\nTUTODECODE{NODE_BACKEND}' }] }] }] }
        ]
    },
    {
        id: 'kubernetes',
        title: 'Kubernetes (K8s)',
        description: 'Orchestrez vos conteneurs avec Kubernetes : déploiements, services, scaling automatique.',
        icon: Cloud,
        level: 'advanced',
        duration: '14h',
        category: 'ship',
        chapters: 12,
        keywords: ['kubernetes', 'k8s', 'orchestration', 'containers', 'devops'],
        content: [
            { id: 'intro', title: 'Introduction Kubernetes', content: `# Kubernetes\n\nOrchestration de conteneurs.\n\n## Fonctionnalités\n- Auto-scaling\n- Self-healing\n- Load balancing\n- Rollouts\n- Service discovery`, duration: '1h' },
            { id: 'architecture', title: 'Architecture K8s', content: `# Architecture\n\n## Control Plane\n- API Server\n- Scheduler\n- Controller Manager\n- etcd\n\n## Worker Nodes\n- Kubelet\n- Kube-proxy\n- Container runtime`, duration: '1h30' },
            { id: 'install', title: 'Installation', content: `# Installation\n\n## Minikube (local)\ncurl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64\nsudo install minikube-linux-amd64 /usr/local/bin/minikube\nminikube start\n\n## kubectl\ncurl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"\nsudo install kubectl /usr/local/bin/`, duration: '45min' },
            { id: 'pods', title: 'Pods', content: `# Pods\n\nUnité de base K8s.\n\n## pod.yaml\napiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx\nspec:\n  containers:\n  - name: nginx\n    image: nginx:latest\n    ports:\n    - containerPort: 80`, duration: '1h30', codeBlocks: [{ language: 'yaml', code: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: myapp\nspec:\n  containers:\n  - name: app\n    image: myapp:1.0', title: 'Pod' }] },
            { id: 'deployments', title: 'Deployments', content: `# Deployments\n\nGérer réplicas.\n\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.19`, duration: '1h30' },
            { id: 'services', title: 'Services', content: `# Services\n\nExposer applications.\n\n## Types\n- ClusterIP (défaut)\n- NodePort\n- LoadBalancer\n- ExternalName\n\napiVersion: v1\nkind: Service\nmetadata:\n  name: nginx\nspec:\n  selector:\n    app: nginx\n  ports:\n  - port: 80\n  type: LoadBalancer`, duration: '1h30' },
            { id: 'configmaps', title: 'ConfigMaps & Secrets', content: `# ConfigMaps\n\nConfiguration externe.\n\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: config\ndata:\n  database_url: "postgres://..."\n\n# Secrets\napiVersion: v1\nkind: Secret\nmetadata:\n  name: secret\ntype: Opaque\ndata:\n  password: cGFzc3dvcmQ=`, duration: '1h30' },
            { id: 'volumes', title: 'Volumes Persistants', content: `# Volumes\n\nStockage persistant.\n\n## Types\n- emptyDir\n- hostPath\n- PersistentVolume\n- PersistentVolumeClaim\n- StorageClass`, duration: '1h' },
            { id: 'namespaces', title: 'Namespaces', content: `# Namespaces\n\nIsolation logique.\n\nkubectl create namespace dev\nkubectl get pods -n dev\n\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: production`, duration: '45min' },
            { id: 'ingress', title: 'Ingress', content: `# Ingress\n\nRouting HTTP/S.\n\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: app\n            port:\n              number: 80`, duration: '1h' },
            { id: 'scaling', title: 'Auto-Scaling', content: `# HPA\n\nHorizontal Pod Autoscaler.\n\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: app-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: app\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 70`, duration: '1h' },
            { id: 'monitoring', title: 'Monitoring & Logs', content: `# Monitoring\n\n## Tools\n- Prometheus\n- Grafana\n- ELK Stack\n- Datadog\n\nkubectl logs pod-name\nkubectl logs -f pod-name\nkubectl top nodes\nkubectl top pods`, duration: '1h30', terminalBriefing: "Validation K8s.\nContrôlez les pods en cours d'exécution.", terminalObjectives: [{ cmd: 'kubectl get pods', description: 'Lister les pods' }, { cmd: 'cat /kube/config', description: 'Vérifier la config kube' }], fileSystem: [{ name: 'kube', type: 'dir', children: [{ name: 'config', type: 'file', content: 'apiVersion: v1\nclusters:\n- cluster:\n    server: https://k8s.tutodecode.com\n  name: tutodecode-k8s\n# TUTODECODE{K8S_ADM}' }] }] }
        ]
    },
    {
        id: 'html-css-fundamentals',
        title: 'HTML5 & CSS3 - Web Moderne',
        description: 'Construisez des sites web modernes et responsives avec HTML5 sémantique, CSS Grid et Flexbox.',
        icon: Globe,
        level: 'beginner',
        duration: '10h',
        category: 'forge',
        chapters: 14,
        keywords: ['html', 'css', 'web', 'frontend', 'responsive'],
        content: [
            { id: 'html-intro', title: 'Structure HTML5', content: `# HTML5\n\nLangage de balisage.\n\n## Structure\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Titre</title>\n  </head>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>`, duration: '30min' },
            { id: 'semantics', title: 'Sémantique Web', content: `# Sémantique\n\nUtiliser les bonnes balises.\n\n- <header> : en-tête\n- <nav> : navigation\n- <main> : contenu principal\n- <article> : article autonome\n- <footer> : pied de page`, duration: '45min' },
            { id: 'forms', title: 'Formulaires HTML', content: `# Forms\n\n<form action="/submit">\n  <label for="email">Email:</label>\n  <input type="email" id="email" required>\n  <button type="submit">Envoyer</button>\n</form>`, duration: '45min' },
            { id: 'css-basics', title: 'Bases CSS', content: `# CSS\n\nCascading Style Sheets.\n\n## Sélecteurs\n- element (p)\n- class (.btn)\n- id (#header)\n- attribut ([type="text"])`, duration: '1h', codeBlocks: [{ language: 'css', code: 'body {\n  font-family: sans-serif;\n  color: #333;\n}\n.btn {\n  background: blue;\n  color: white;\n}', title: 'CSS Basics' }] },
            { id: 'box-model', title: 'Box Model', content: `# Box Model\n\nTout est une boîte.\n\n- Content\n- Padding (interne)\n- Border\n- Margin (externe)\n\n* {\n  box-sizing: border-box;\n}`, duration: '1h' },
            { id: 'flexbox', title: 'Flexbox Layout', content: `# Flexbox\n\nAlignement unidimensionnel.\n\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`, duration: '1h30', codeBlocks: [{ language: 'css', code: '.row {\n  display: flex;\n  gap: 1rem;\n  flex-wrap: wrap;\n}', title: 'Flexbox' }] },
            { id: 'grid', title: 'CSS Grid', content: `# Grid Layout\n\nAlignement bidimensionnel.\n\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}`, duration: '1h30' },
            { id: 'responsive', title: 'Responsive Design', content: `# Responsive\n\nAdapter à tous les écrans.\n\n@media (max-width: 768px) {\n  .nav {\n    flex-direction: column;\n  }\n}`, duration: '1h', codeBlocks: [{ language: 'css', code: '@media (min-width: 1024px) {\n  .container {\n    max-width: 960px;\n  }\n}', title: 'Media Queries' }] },
            { id: 'typography', title: 'Web Typography', content: `# Typography\n\n- font-family\n- font-weight\n- line-height\n- letter-spacing\n\n@import url('https://fonts.googleapis.com...');`, duration: '45min' },
            { id: 'colors', title: 'Couleurs & Gradients', content: `# Colors\n\n- Hex: #ff0000\n- RGB: rgb(255, 0, 0)\n- HSL: hsl(0, 100%, 50%)\n- Gradients: linear-gradient(to right, red, blue)`, duration: '45min' },
            { id: 'animations', title: 'Animations CSS', content: `# Animations\n\n@keyframes slide {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\n.slide-in {\n  animation: slide 0.5s ease-out;\n}`, duration: '1h', codeBlocks: [{ language: 'css', code: '.btn:hover {\n  transform: scale(1.05);\n  transition: transform 0.2s;\n}', title: 'Transitions' }] },
            { id: 'pseudo', title: 'Pseudo-classes', content: `# Pseudo-classes\n\n- :hover\n- :focus\n- :nth-child(2)\n- ::before\n- ::after`, duration: '45min' },
            { id: 'variables', title: 'Variables CSS', content: `# CSS Variables\n\n:root {\n  --primary: #007bff;\n}\n\n.btn {\n  background: var(--primary);\n}`, duration: '30min' },
            { id: 'architecture', title: 'Architecture CSS', content: `# Architecture\n\n- BEM (Block Element Modifier)\n- Tailwind (Utility-first)\n- SASS/SCSS\n- CSS Modules`, duration: '1h', terminalBriefing: "Validation Web & CSS.\nConsultez les variables de style compilées.", terminalObjectives: [{ cmd: 'ls css', description: 'Lister le dossier css' }, { cmd: 'cat css/style.css', description: 'Examiner la feuille de style' }], fileSystem: [{ name: 'css', type: 'dir', children: [{ name: 'style.css', type: 'file', content: ':root {\n  --primary-color: #39FF14;\n}\n/* TUTODECODE{CSS_MASTER} */' }] }] }
        ]
    },
    {
        id: 'self-hosting-pro',
        title: 'Auto-hébergement Pro (Debian/Ubuntu)',
        description: 'Montez un serveur souverain et sécurisé pour héberger Nextcloud, Vaultwarden et VPN personnel.',
        icon: Server,
        level: 'intermediate',
        duration: '14h',
        category: 'ship',
        chapters: 9,
        keywords: ['debian', 'ubuntu', 'self-hosting', 'nextcloud', 'vaultwarden', 'vpn', 'hardening'],
        content: [
            { id: 'base', title: 'Base OS & SSH', content: `# Serveur Souverain\n\n- Installation minimale Debian/Ubuntu\n- SSH par clés uniquement\n- Firewall UFW + fail2ban\n\nObjectif: une base propre, sans surface d'attaque inutile.`, duration: '2h' },
            { id: 'services', title: 'Services Auto-hébergés', content: `# Stack Privée\n\nDéployez:\n- Nextcloud\n- Vaultwarden\n- WireGuard\n\nAvec reverse proxy et TLS local.`, duration: '4h' },
            { id: 'ops', title: 'Ops & Sauvegardes', content: `# Exploitation Long Terme\n\n- Snapshots\n- Backups chiffrés\n- Monitoring\n- Procédures de reprise`, duration: '3h', terminalBriefing: "Audit final self-hosting: validez l'état du firewall et la stratégie backup.", terminalObjectives: [{ cmd: 'sudo ufw status', description: 'Vérifier les règles firewall' }, { cmd: 'ls /srv/backups', description: 'Vérifier les sauvegardes' }] }
        ]
    },
    {
        id: 'proxmox-sovereign-cloud',
        title: 'Virtualisation avec Proxmox',
        description: 'Construisez votre cloud privé avec VMs, conteneurs LXC et segmentation réseau.',
        icon: Cloud,
        level: 'advanced',
        duration: '12h',
        category: 'ship',
        chapters: 8,
        keywords: ['proxmox', 'virtualisation', 'lxc', 'vm', 'cluster', 'souverain'],
        content: [
            { id: 'cluster', title: 'Architecture Proxmox', content: `# Cloud Privé\n\n- Nœuds Proxmox\n- Stockage local/NAS\n- Réseau de management\n\nDesign orienté résilience et contrôle.`, duration: '2h' },
            { id: 'vm-lxc', title: 'VM & LXC', content: `# Workloads Mixtes\n\n- VMs pour isolation forte\n- LXC pour densité\n- Templates reproductibles`, duration: '3h' },
            { id: 'ha-backup', title: 'HA, Snapshots, DR', content: `# Continuité d'activité\n\n- Plan de reprise\n- Stratégie snapshot\n- Vérification restauration`, duration: '2h' }
        ]
    },
    {
        id: 'mesh-networks-wireguard',
        title: 'Réseaux Maillés: WireGuard, Tailscale, ZeroTier',
        description: 'Créez un réseau privé chiffré entre plusieurs sites sans exposition publique directe.',
        icon: Globe,
        level: 'advanced',
        duration: '10h',
        category: 'shield',
        chapters: 7,
        keywords: ['wireguard', 'tailscale', 'zerotier', 'mesh', 'vpn', 's2s'],
        content: [
            { id: 'principles', title: 'Principes du Mesh', content: `# Mesh Privé\n\n- Chiffrement bout-à-bout\n- Topologies hub/spoke/full-mesh\n- Gestion des clés`, duration: '2h' },
            { id: 'deployment', title: 'Déploiement Multi-sites', content: `# Interconnexion\n\n- Site A/B/C\n- ACL strictes\n- DNS privé`, duration: '3h' },
            { id: 'observability', title: 'Observabilité & Audit', content: `# Contrôle\n\n- Journalisation des sessions\n- Détection d'anomalies\n- Revocation rapide`, duration: '2h' }
        ]
    },
    {
        id: 'os-hardening-blue-team',
        title: 'Durcissement d’OS (Blue Team)',
        description: 'Durcissez Windows Pro et Linux contre les intrusions avec politiques strictes et minimisation de surface.',
        icon: Shield,
        level: 'advanced',
        duration: '16h',
        category: 'shield',
        chapters: 10,
        keywords: ['hardening', 'windows', 'linux', 'gpo', 'security baseline', 'blue-team'],
        content: [
            { id: 'baseline', title: 'Baselines de sécurité', content: `# Hardening by Default\n\n- Désactivation services inutiles\n- Politiques de mot de passe\n- Restriction exécution`, duration: '3h' },
            { id: 'windows', title: 'Windows Pro sécurisé', content: `# GPO & Surface Reduction\n\n- AppLocker\n- Defender ASR\n- Journalisation avancée`, duration: '4h' },
            { id: 'linux', title: 'Linux blindé', content: `# Linux Security\n\n- SSH hardening\n- Sysctl\n- Auditing\n- Least privilege`, duration: '4h', terminalBriefing: "Validez le hardening Linux: SSH, services et audit.", terminalObjectives: [{ cmd: 'sudo systemctl list-unit-files --type=service', description: 'Contrôler les services' }, { cmd: 'sudo sshd -T', description: 'Vérifier la config SSH effective' }] }
        ]
    },
    {
        id: 'wireshark-for-threat-detection',
        title: 'Analyse de Flux Réseau avec Wireshark',
        description: 'Détectez comportements suspects, exfiltration et erreurs de protocoles dans des captures réelles.',
        icon: Shield,
        level: 'advanced',
        duration: '11h',
        category: 'shield',
        chapters: 8,
        keywords: ['wireshark', 'pcap', 'network forensics', 'dns', 'tls', 'exfiltration'],
        content: [
            { id: 'filters', title: 'Filtres & Protocoles', content: `# Méthode d'analyse\n\n- Filtres display/capture\n- DNS/TLS/HTTP\n- Décodage de sessions`, duration: '2h' },
            { id: 'hunt', title: 'Threat Hunting', content: `# Chasse réseau\n\n- Beaconing\n- C2 patterns\n- Volumes anormaux`, duration: '3h' },
            { id: 'reporting', title: 'Rapport d’incident', content: `# Restitution pro\n\n- Timeline\n- IOCs\n- Recommandations correctives`, duration: '2h' }
        ]
    },
    {
        id: 'local-llm-deployment',
        title: 'Déploiement de LLM Locaux',
        description: 'Déployez Llama/Mistral en local avec Ollama ou LM Studio pour une IA privée et performante.',
        icon: Cpu,
        level: 'intermediate',
        duration: '10h',
        category: 'forge',
        chapters: 7,
        keywords: ['ollama', 'llama', 'mistral', 'local ai', 'privacy', 'inference'],
        content: [
            { id: 'hardware', title: 'Sizing matériel', content: `# Sizing\n\n- RAM/VRAM\n- Quantization\n- Latence vs qualité`, duration: '2h' },
            { id: 'runtime', title: 'Ollama/LM Studio', content: `# Exécution locale\n\n- Gestion modèles\n- Prompting robuste\n- Monitoring perf`, duration: '3h' },
            { id: 'integration', title: 'Intégration app', content: `# Intégration produit\n\n- API locale\n- Fallback\n- Politique de confidentialité`, duration: '2h' }
        ]
    },
    {
        id: 'private-rag-systems',
        title: 'RAG Privé pour Documents Internes',
        description: 'Construisez une IA qui répond uniquement sur vos documents internes, sans fuite de données.',
        icon: Database,
        level: 'advanced',
        duration: '13h',
        category: 'forge',
        chapters: 9,
        keywords: ['rag', 'embeddings', 'vector', 'documents', 'private knowledge base'],
        content: [
            { id: 'pipeline', title: 'Pipeline RAG', content: `# Pipeline\n\n- Ingestion\n- Chunking\n- Embeddings\n- Retrieval`, duration: '3h' },
            { id: 'evaluation', title: 'Qualité & Hallucinations', content: `# Évaluation\n\n- Precision@k\n- Guardrails\n- Tests de confiance`, duration: '3h' },
            { id: 'security', title: 'Gouvernance des données', content: `# Gouvernance\n\n- ACL documentaires\n- Chiffrement\n- Rétention`, duration: '2h' }
        ]
    },
    {
        id: 'duckdb-data-science-local',
        title: 'Data Science Locale avec DuckDB',
        description: 'Analysez des millions de lignes localement, vite, sans dépendre d’un entrepôt cloud.',
        icon: Database,
        level: 'intermediate',
        duration: '9h',
        category: 'forge',
        chapters: 6,
        keywords: ['duckdb', 'analytics', 'parquet', 'sql', 'local-first'],
        content: [
            { id: 'engine', title: 'Moteur colonne', content: `# DuckDB\n\n- Exécution vectorisée\n- Formats colonnes\n- Performance locale`, duration: '2h' },
            { id: 'pipelines', title: 'Pipelines analytiques', content: `# Pipeline\n\n- CSV/Parquet\n- Joins massifs\n- Fenêtres analytiques`, duration: '3h' },
            { id: 'notebooks', title: 'Exploration reproductible', content: `# Repro\n\n- Scripts SQL versionnés\n- Exports\n- QA des résultats`, duration: '2h' }
        ]
    },
    {
        id: 'zfs-btrfs-integrity',
        title: 'Systèmes de Fichiers Avancés: ZFS & Btrfs',
        description: 'Protégez l’intégrité de vos données avec snapshots, scrubbing et stratégie de restauration.',
        icon: Lock,
        level: 'advanced',
        duration: '8h',
        category: 'kernel',
        chapters: 6,
        keywords: ['zfs', 'btrfs', 'snapshot', 'integrity', 'filesystem', 'raid'],
        content: [
            { id: 'concepts', title: 'Intégrité & checksums', content: `# Data Integrity\n\n- Copy-on-write\n- Checksums bout-en-bout\n- Corruption silencieuse`, duration: '2h' },
            { id: 'ops', title: 'Snapshots & restauration', content: `# Résilience\n\n- Politiques de snapshots\n- Rollback\n- Réplication`, duration: '2h' },
            { id: 'runbook', title: 'Runbook d’exploitation', content: `# Exploitation\n\n- Scrub périodique\n- Alerting\n- Plan de capacité`, duration: '2h' }
        ]
    },
    {
        id: 'docs-as-code-mermaid',
        title: 'Documentation As Code (Markdown + Mermaid)',
        description: 'Créez une documentation technique versionnée qui évolue en même temps que le code.',
        icon: Code,
        level: 'intermediate',
        duration: '7h',
        category: 'ship',
        chapters: 5,
        keywords: ['documentation', 'markdown', 'mermaid', 'adr', 'architecture'],
        content: [
            { id: 'principles', title: 'Doc vivante', content: `# Documentation durable\n\n- Single source of truth\n- Lien code <-> doc\n- Revue en pull request`, duration: '1h30' },
            { id: 'diagrams', title: 'Diagrammes Mermaid', content: `# Visualisation\n\n- Flowcharts\n- Sequence diagrams\n- Archi map`, duration: '2h' },
            { id: 'governance', title: 'Processus équipe', content: `# Gouvernance\n\n- ADR\n- DoD documentaire\n- Automatisation qualité`, duration: '1h30' }
        ]
    },
    {
        id: 'git-advanced-workflows',
        title: 'Git Avancé: Rebase, Cherry-pick & Historiques propres',
        description: 'Passez au niveau pro avec des workflows Git robustes pour équipes exigeantes.',
        icon: Box,
        level: 'advanced',
        duration: '8h',
        category: 'ship',
        chapters: 6,
        keywords: ['git', 'rebase', 'cherry-pick', 'history', 'workflow'],
        content: [
            { id: 'history', title: 'Hygiène d’historique', content: `# Historique lisible\n\n- Commits atomiques\n- Message conventionnel\n- Squash intelligent`, duration: '2h' },
            { id: 'advanced', title: 'Rebase & Cherry-pick', content: `# Opérations avancées\n\n- Rebase interactif\n- Cherry-pick sélectif\n- Résolution de conflits`, duration: '3h' },
            { id: 'team', title: 'Workflow équipe', content: `# Collaboration\n\n- Trunk based\n- Hotfix propre\n- Release tags`, duration: '2h' }
        ]
    },
    {
        id: 'unsafe-rust-memory-mastery',
        title: 'Unsafe Rust: Maîtrise Absolue de la Mémoire',
        description: 'Plongée dans les profondeurs d\'unsafe Rust, gestion manuelle des pointeurs raw, transmutes, et FFI avancé.',
        icon: Lock,
        level: 'advanced',
        duration: '8h30',
        category: 'kernel',
        chapters: 8,
        keywords: ['unsafe', 'rust', 'raw pointers', 'transmute', 'memory safety', 'ffi'],
        content: [
            { id: 'pointers', title: 'Raw pointers & aliasing', content: `# Unsafe Foundations\n\n- *const/*mut\n- aliasing rules\n- invariants mémoire`, duration: '2h30' },
            { id: 'transmute', title: 'Transmute & layout', content: `# Layout Control\n\n- repr(C)\n- transmute sécurisé\n- UB patterns à éviter`, duration: '3h' },
            { id: 'audit', title: 'Audit de sécurité unsafe', content: `# Revue experte\n\n- checklists\n- tests Miri\n- documentation des invariants`, duration: '2h' }
        ]
    },
    {
        id: 'zero-copy-io-architecture',
        title: 'Zero-Copy Architecture: I/O Sans Allocation',
        description: 'Techniques avancées de zero-copy, vecteurs d\'I/O, scatter-gather, et traitement de données en streaming.',
        icon: Cpu,
        level: 'advanced',
        duration: '6h45',
        category: 'kernel',
        chapters: 7,
        keywords: ['zero-copy', 'io_uring', 'scatter-gather', 'streaming', 'performance'],
        content: [
            { id: 'principles', title: 'Principes zero-copy', content: `# Data Path\n\n- éviter les copies\n- buffer reuse\n- pinning`, duration: '2h' },
            { id: 'sg', title: 'Scatter-gather I/O', content: `# Vecteurs I/O\n\n- readv/writev\n- framing binaire\n- batching`, duration: '2h15' },
            { id: 'profiling', title: 'Profilage de pipeline', content: `# Mesure réelle\n\n- flamegraphs\n- perf counters\n- budget latence`, duration: '1h30' }
        ]
    },
    {
        id: 'lock-free-data-structures',
        title: 'Structures de Données Lock-Free',
        description: 'Queues MPSC/MPMC lock-free, hazard pointers, RCU, et algorithmes de consensus distribué.',
        icon: Server,
        level: 'advanced',
        duration: '10h00',
        category: 'kernel',
        chapters: 9,
        keywords: ['lock-free', 'mpsc', 'mpmc', 'hazard pointers', 'rcu', 'consensus'],
        content: [
            { id: 'queues', title: 'MPSC/MPMC queues', content: `# Concurrency\n\n- CAS loops\n- contention\n- throughput`, duration: '3h30' },
            { id: 'memory-reclamation', title: 'Hazard pointers & RCU', content: `# Reclamation\n\n- ABA problem\n- epoch based GC\n- quiescent states`, duration: '3h' },
            { id: 'validation', title: 'Tests de correction', content: `# Correctness\n\n- stress tests\n- model checking\n- linearizability`, duration: '2h' }
        ]
    },
    {
        id: 'advanced-ffi-bindgen',
        title: 'FFI Avancé et Bindgen Automatisé',
        description: 'Création de bindings FFI sécurisés, utilisation de bindgen, et patterns de sécurité mémoire.',
        icon: Code,
        level: 'advanced',
        duration: '7h15',
        category: 'forge',
        chapters: 7,
        keywords: ['ffi', 'bindgen', 'c abi', 'unsafe boundary', 'rust'],
        content: [
            { id: 'abi', title: 'ABI et frontières FFI', content: `# ABI Contracts\n\n- repr(C)\n- ownership crossing\n- panic safety`, duration: '2h15' },
            { id: 'bindgen', title: 'Pipeline bindgen', content: `# Automatisation\n\n- génération headers\n- wrappers safe\n- CI validation`, duration: '2h30' },
            { id: 'hardening', title: 'Hardening des bindings', content: `# Sécurité\n\n- fuzzing\n- sanitizers\n- contrats explicites`, duration: '2h' }
        ]
    },
    {
        id: 'tokio-runtime-from-scratch',
        title: 'Runtime Asynchrone: Construire Tokio from Scratch',
        description: 'Implémentation d\'un runtime async from scratch, executors, wakers, et polling.',
        icon: Terminal,
        level: 'advanced',
        duration: '12h00',
        category: 'kernel',
        chapters: 10,
        keywords: ['tokio', 'runtime', 'waker', 'executor', 'polling', 'futures'],
        content: [
            { id: 'futures', title: 'Futures & polling', content: `# Async internals\n\n- state machine\n- Pin\n- Poll::Pending`, duration: '4h' },
            { id: 'executor', title: 'Executor et scheduler', content: `# Runtime core\n\n- task queue\n- fairness\n- wake strategy`, duration: '4h' },
            { id: 'io-loop', title: 'Event loop I/O', content: `# Intégration I/O\n\n- epoll/kqueue\n- timers\n- cancellation`, duration: '3h' }
        ]
    },
    {
        id: 'procedural-macros-dsl-generation',
        title: 'Procedural Macros: DSL et Code Generation',
        description: 'Création de macros procédurales dérivées, attributs, et fonction pour DSL.',
        icon: Code,
        level: 'advanced',
        duration: '8h00',
        category: 'forge',
        chapters: 8,
        keywords: ['procedural macros', 'syn', 'quote', 'dsl', 'codegen'],
        content: [
            { id: 'derive', title: 'Derive macros', content: `# Derive\n\n- parse AST\n- générer impl\n- diagnostics`, duration: '2h30' },
            { id: 'attributes', title: 'Attribute macros', content: `# Attribute DSL\n\n- validation\n- transformations\n- ergonomie`, duration: '2h30' },
            { id: 'function-like', title: 'Function-like macros', content: `# Codegen avancé\n\n- mini DSL\n- erreurs lisibles\n- tests snapshot`, duration: '2h' }
        ]
    },
    {
        id: 'shared-memory-mmap',
        title: 'Mémoire Partagée et mmap',
        description: 'Memory-mapped files, shared memory IPC, et synchronisation entre processus.',
        icon: Database,
        level: 'advanced',
        duration: '6h30',
        category: 'kernel',
        chapters: 7,
        keywords: ['mmap', 'shared memory', 'ipc', 'synchronisation', 'page cache'],
        content: [
            { id: 'mapped-files', title: 'Memory-mapped files', content: `# mmap\n\n- mapping modes\n- coherence\n- fsync`, duration: '2h' },
            { id: 'ipc', title: 'IPC mémoire partagée', content: `# Inter-process\n\n- ring buffers\n- lock discipline\n- failure modes`, duration: '2h15' },
            { id: 'consistency', title: 'Cohérence & recovery', content: `# Robustesse\n\n- crash consistency\n- checksums\n- replay`, duration: '1h30' }
        ]
    },
    {
        id: 'simd-cpu-optimizations',
        title: 'SIMD et Optimisations CPU',
        description: 'Vectorisation SIMD avec std::simd, autovectorisation, et profilage.',
        icon: Cpu,
        level: 'advanced',
        duration: '7h00',
        category: 'kernel',
        chapters: 7,
        keywords: ['simd', 'cpu', 'autovectorization', 'profiling', 'cache'],
        content: [
            { id: 'simd-basics', title: 'std::simd pratique', content: `# Vectorisation\n\n- lanes\n- alignment\n- fallback scalar`, duration: '2h15' },
            { id: 'compiler', title: 'Autovectorisation', content: `# Compiler hints\n\n- patterns optimisables\n- flags\n- pitfalls`, duration: '2h' },
            { id: 'perf', title: 'Profilage CPU', content: `# Performance\n\n- cache misses\n- branch prediction\n- benchmark rigoureux`, duration: '1h45' }
        ]
    },
    {
        id: 'ebpf-kernel-programming',
        title: 'eBPF: Programmation Kernel-Space',
        description: 'Écriture de programmes eBPF, instrumentation du kernel, et sécurité.',
        icon: Shield,
        level: 'advanced',
        duration: '9h30',
        category: 'shield',
        chapters: 8,
        keywords: ['ebpf', 'kernel', 'xdp', 'tracing', 'security'],
        content: [
            { id: 'foundation', title: 'Fondations eBPF', content: `# eBPF model\n\n- verifier\n- maps\n- helpers`, duration: '3h' },
            { id: 'observability', title: 'Tracing & observabilité', content: `# Instrumentation\n\n- uprobes/kprobes\n- latency maps\n- event streams`, duration: '3h' },
            { id: 'security', title: 'Use-cases sécurité', content: `# Défense runtime\n\n- détection anomalies\n- policy enforcement\n- forensic`, duration: '2h' }
        ]
    },
    {
        id: 'mini-wasmtime-runtime',
        title: 'Runtime WebAssembly: Créer un Mini-Wasmtime',
        description: 'Implémentation d\'un runtime WASM, parsing des modules, et exécution.',
        icon: Box,
        level: 'advanced',
        duration: '10h00',
        category: 'forge',
        chapters: 9,
        keywords: ['wasm', 'runtime', 'bytecode', 'sandbox', 'jit'],
        content: [
            { id: 'format', title: 'Format binaire WASM', content: `# Module structure\n\n- sections\n- imports/exports\n- validation`, duration: '3h' },
            { id: 'engine', title: 'Interpréteur minimal', content: `# Execution engine\n\n- stack machine\n- memory model\n- traps`, duration: '3h30' },
            { id: 'host', title: 'Host functions sécurisées', content: `# Sandbox\n\n- capabilities\n- limits\n- resource governance`, duration: '2h' }
        ]
    },
    {
        id: 'async-ipc-channels-streaming',
        title: 'IPC Asynchrone: Channels et Streaming',
        description: 'Communication bidirectionnelle avancée, streaming de données, channels multiplexés et gestion des backpressure.',
        icon: Globe,
        level: 'advanced',
        duration: '7h30',
        category: 'ship',
        chapters: 7,
        keywords: ['ipc', 'async', 'channels', 'streaming', 'backpressure'],
        content: [
            { id: 'patterns', title: 'Patterns IPC asynchrones', content: `# Communication\n\n- request/reply\n- pub/sub\n- bidi streams`, duration: '2h30' },
            { id: 'multiplex', title: 'Multiplexage de channels', content: `# Routing\n\n- framing\n- priority\n- congestion control`, duration: '2h30' },
            { id: 'reliability', title: 'Backpressure & fiabilité', content: `# Robustesse\n\n- flow control\n- retries\n- idempotence`, duration: '1h30' }
        ]
    },
    {
        id: 'sidecars-custom-protocol-handlers',
        title: 'Sidecars et Custom Protocol Handlers',
        description: 'Intégration de binaires externes, gestion de processus sidecar, et création de protocols URI personnalisés.',
        icon: Server,
        level: 'advanced',
        duration: '6h00',
        category: 'ship',
        chapters: 6,
        keywords: ['sidecar', 'protocol handlers', 'process management', 'uri'],
        content: [
            { id: 'sidecar-model', title: 'Architecture sidecar', content: `# Sidecar lifecycle\n\n- spawn\n- supervise\n- shutdown`, duration: '2h' },
            { id: 'protocols', title: 'Custom URI protocols', content: `# Deep links\n\n- registration\n- security validation\n- routing`, duration: '2h' },
            { id: 'ops', title: 'Observabilité processus', content: `# Production\n\n- logs structurés\n- watchdog\n- auto-restart`, duration: '1h30' }
        ]
    },
    {
        id: 'custom-invocation-system',
        title: 'Système d\'Invocation Personnalisé',
        description: 'Création d\'un système de commandes avec middleware, validation, et gestion d\'erreurs avancée.',
        icon: Terminal,
        level: 'advanced',
        duration: '5h45',
        category: 'forge',
        chapters: 6,
        keywords: ['invocation', 'middleware', 'validation', 'error handling', 'commands'],
        content: [
            { id: 'pipeline', title: 'Pipeline de commande', content: `# Invocation flow\n\n- parsing\n- context\n- middleware chain`, duration: '2h' },
            { id: 'validation', title: 'Validation stricte', content: `# Input contracts\n\n- schema validation\n- typed errors\n- domain rules`, duration: '2h' },
            { id: 'errors', title: 'Gestion d\'erreurs avancée', content: `# Failure handling\n\n- error taxonomy\n- retries\n- observability`, duration: '1h15' }
        ]
    },
    {
        id: 'filesystem-watcher-sync',
        title: 'File System Watcher et Synchronisation',
        description: 'Surveillance de fichiers en temps réel, synchronisation bidirectionnelle, et gestion des conflits.',
        icon: Database,
        level: 'advanced',
        duration: '5h30',
        category: 'ship',
        chapters: 6,
        keywords: ['filesystem watcher', 'synchronisation', 'conflicts', 'events'],
        content: [
            { id: 'watchers', title: 'Watchers cross-platform', content: `# Event streams\n\n- debouncing\n- coalescing\n- rename semantics`, duration: '2h' },
            { id: 'sync', title: 'Sync bidirectionnelle', content: `# Sync engine\n\n- tombstones\n- merge policy\n- ordering`, duration: '2h' },
            { id: 'conflicts', title: 'Résolution de conflits', content: `# Conflict strategy\n\n- LWW vs CRDT\n- preview diff\n- rollback`, duration: '1h' }
        ]
    },
    {
        id: 'cross-platform-notification-system',
        title: 'Système de Notifications Cross-Platform',
        description: 'Notifications natives, badges, tray icons, et actions interactives.',
        icon: Globe,
        level: 'advanced',
        duration: '4h30',
        category: 'ship',
        chapters: 5,
        keywords: ['notifications', 'tray', 'badges', 'desktop', 'cross-platform'],
        content: [
            { id: 'native', title: 'Canaux natifs', content: `# Native notifications\n\n- Windows/macOS/Linux\n- permissions\n- UX timing`, duration: '1h30' },
            { id: 'actions', title: 'Actions interactives', content: `# User actions\n\n- deep links\n- quick actions\n- click handling`, duration: '1h30' },
            { id: 'tray', title: 'Tray, badges et état', content: `# Presence model\n\n- tray menu\n- badge counters\n- lifecycle`, duration: '1h' }
        ]
    },
    {
        id: 'auto-update-system',
        title: 'Système de Mise à Jour Automatique',
        description: 'Mise à jour delta, rollback, canary releases, et signature de paquets.',
        icon: Shield,
        level: 'advanced',
        duration: '6h00',
        category: 'ship',
        chapters: 6,
        keywords: ['auto update', 'delta', 'rollback', 'canary', 'signatures'],
        content: [
            { id: 'strategy', title: 'Stratégie de release', content: `# Delivery\n\n- channels\n- canary rollout\n- kill switch`, duration: '2h' },
            { id: 'integrity', title: 'Signature et intégrité', content: `# Trust chain\n\n- package signing\n- verification\n- anti-tamper`, duration: '2h' },
            { id: 'rollback', title: 'Rollback automatique', content: `# Recovery\n\n- health checks\n- rollback policy\n- incident playbook`, duration: '1h30' }
        ]
    }
];

// Fusion et export
export const courses: Course[] = [...exampleCourses, ...newCourses];

export const getCourseById = (id: string) => courses.find(c => c.id === id);
export const getCoursesByCategory = (category: string) => courses.filter(c => c.category === category);
export const getCoursesByLevel = (level: string) => courses.filter(c => c.level === level);
export const searchCourses = (query: string) => {
    const q = query.toLowerCase();
    return courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some(k => k.toLowerCase().includes(q))
    );
};
