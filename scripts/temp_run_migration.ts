

const Terminal = "Terminal";
const Code = "Code";
const Database = "Database";
const Shield = "Shield";
const Cloud = "Cloud";
const Cpu = "Cpu";
const Lock = "Lock";
const Globe = "Globe";
const Server = "Server";
const Box = "Box";

const exampleCourses: Course[] = [
    {
        id: 'linux-basics',
        title: 'Les Bases de Linux',
        description: 'Maîtrisez les fondamentaux de Linux : navigation, commandes essentielles et gestion du système.',
        icon: Terminal,
        level: 'beginner',
        duration: '8h',
        category: 'linux',
        chapters: 10,
        keywords: ['linux', 'terminal', 'bash', 'commandes', 'unix'],
        content: [
            { id: 'intro', title: 'Introduction à Linux', content: `# Introduction à Linux\n\nLinux est un système d'exploitation libre et open source basé sur Unix.\n\n## Pourquoi Linux?\n- Gratuit et open source\n- Très stable et sécurisé\n- Utilisé massivement (serveurs, cloud, IoT)\n- Grande communauté\n- Personnalisable à l'infini`, duration: '30min' },
            { id: 'distros', title: 'Les Distributions Linux', content: `# Les Distributions\n\nIl existe des centaines de distributions Linux.\n\n## Populaires\n- Ubuntu : facile pour débuter\n- Debian : très stable\n- Fedora : technologies récentes\n- Arch : pour experts\n- CentOS/Rocky : serveurs entreprise`, duration: '25min' },
            { id: 'navigation', title: 'Navigation Système', content: `# Navigation\n\nCommandes de base pour se déplacer.\n\n## Commandes\n- pwd : répertoire actuel\n- ls : liste fichiers\n- cd : changer de répertoire\n- tree : arborescence`, duration: '45min', codeBlocks: [{ language: 'bash', code: 'pwd\nls -la\ncd /home/user\ncd ..\ncd ~\ntree -L 2', title: 'Navigation' }] },
            { id: 'files', title: 'Gestion des Fichiers', content: `# Gestion Fichiers\n\n## Commandes\n- touch : créer fichier\n- mkdir : créer dossier\n- cp : copier\n- mv : déplacer/renommer\n- rm : supprimer`, duration: '50min', codeBlocks: [{ language: 'bash', code: 'touch fichier.txt\nmkdir dossier\ncp file1 file2\nmv old new\nrm fichier', title: 'Fichiers' }] },
            { id: 'permissions', title: 'Permissions Unix', content: `# Permissions\n\nChaque fichier a des permissions.\n\n## Types\n- r : lecture (4)\n- w : écriture (2)\n- x : exécution (1)\n\nExemple : chmod 755 fichier`, duration: '1h', codeBlocks: [{ language: 'bash', code: 'ls -l\nchmod 755 script.sh\nchown user:group fichier\nsudo chgrp www-data /var/www', title: 'Permissions' }] },
            { id: 'processes', title: 'Gestion des Processus', content: `# Processus\n\n## Commandes\n- ps : liste processus\n- top/htop : monitoring\n- kill : arrêter processus\n- bg/fg : arrière-plan`, duration: '45min' },
            { id: 'network', title: 'Réseau sous Linux', content: `# Réseau\n\n## Commandes réseau\n- ifconfig/ip : config réseau\n- ping : tester connexion\n- netstat : connexions actives\n- ssh : connexion distante`, duration: '1h' },
            { id: 'packages', title: 'Gestion des Paquets', content: `# Paquets\n\n## Gestionnaires\n- apt (Debian/Ubuntu)\n- yum/dnf (RedHat/Fedora)\n- pacman (Arch)\n\nExemple : sudo apt update && sudo apt install nginx`, duration: '40min' },
            { id: 'shell', title: 'Scripts Shell', content: `# Scripts Bash\n\nAutomatisez vos tâches.\n\n## Exemple\n#!/bin/bash\necho "Hello"\nfor i in {1..5}; do\n  echo $i\ndone`, duration: '1h30' },
            { id: 'advanced', title: 'Techniques Avancées', content: `# Avancé\n\n- Cron : tâches planifiées\n- Systemd : gestion services\n- LVM : volumes logiques\n- SELinux : sécurité renforcée`, duration: '1h' }
        ]
    },
    {
        id: 'docker-intro',
        title: 'Docker - Conteneurisation',
        description: 'Maîtrisez Docker pour conteneuriser et déployer vos applications efficacement.',
        icon: Box,
        level: 'intermediate',
        duration: '10h',
        category: 'devops',
        chapters: 12,
        keywords: ['docker', 'conteneurs', 'devops', 'kubernetes'],
        content: [
            { id: 'intro', title: 'Introduction Docker', content: `# Docker\n\nPlateforme de conteneurisation.\n\n## Avantages\n- Portabilité totale\n- Isolation des apps\n- Déploiement rapide\n- Économie de ressources`, duration: '40min' },
            { id: 'install', title: 'Installation', content: `# Installation\n\n## Linux\nsudo apt install docker.io\nsudo systemctl start docker\nsudo usermod -aG docker $USER`, duration: '30min' },
            { id: 'images', title: 'Images Docker', content: `# Images\n\nTemplate pour créer des conteneurs.\n\n## Commandes\n- docker pull nginx\n- docker images\n- docker rmi image_id`, duration: '45min' },
            { id: 'containers', title: 'Conteneurs', content: `# Conteneurs\n\nInstance d'une image.\n\n## Commandes\n- docker run\n- docker ps\n- docker stop/start\n- docker rm`, duration: '1h', codeBlocks: [{ language: 'bash', code: 'docker run -d -p 80:80 nginx\ndocker ps\ndocker logs container_id\ndocker exec -it container_id bash', title: 'Conteneurs' }] },
            { id: 'dockerfile', title: 'Créer un Dockerfile', content: `# Dockerfile\n\nFichier de configuration.\n\n## Exemple\nFROM node:18\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]`, duration: '1h30' },
            { id: 'volumes', title: 'Volumes Docker', content: `# Volumes\n\nPersister les données.\n\n## Types\n- Volumes nommés\n- Bind mounts\n- tmpfs`, duration: '50min' },
            { id: 'networks', title: 'Réseaux Docker', content: `# Réseaux\n\nConnexion entre conteneurs.\n\n## Types\n- bridge\n- host\n- overlay\n- none`, duration: '45min' },
            { id: 'compose', title: 'Docker Compose', content: `# Docker Compose\n\nOrchestrer plusieurs conteneurs.\n\n## docker-compose.yml\nversion: '3'\nservices:\n  web:\n    image: nginx\n    ports:\n      - 80:80\n  db:\n    image: postgres`, duration: '1h30' },
            { id: 'registry', title: 'Docker Registry', content: `# Registry\n\nStockage d'images.\n\n- Docker Hub\n- Registres privés\n- Push/Pull images`, duration: '40min' },
            { id: 'security', title: 'Sécurité Docker', content: `# Sécurité\n\n- Ne pas utiliser root\n- Scanner vulnérabilités\n- Limiter ressources\n- Images minimales`, duration: '1h' },
            { id: 'optimization', title: 'Optimisation', content: `# Optimisation\n\n- Multi-stage builds\n- Layers caching\n- .dockerignore\n- Images alpine`, duration: '1h' },
            { id: 'production', title: 'Docker en Production', content: `# Production\n\n- Orchestration (Swarm, K8s)\n- Monitoring\n- Logs centralisés\n- Health checks`, duration: '1h30' }
        ]
    },
    {
        id: 'sql-basics',
        title: 'SQL - Bases de Données',
        description: 'Apprenez SQL pour interroger et gérer efficacement vos bases de données relationnelles.',
        icon: Database,
        level: 'beginner',
        duration: '12h',
        category: 'sql',
        chapters: 14,
        keywords: ['sql', 'database', 'mysql', 'postgresql', 'requêtes'],
        content: [
            { id: 'intro', title: 'Introduction SQL', content: `# SQL\n\nStructured Query Language.\n\n## Bases de données\n- MySQL\n- PostgreSQL\n- SQLite\n- SQL Server\n- Oracle`, duration: '45min' },
            { id: 'install', title: 'Installation MySQL', content: `# Installation\n\n## Ubuntu\nsudo apt install mysql-server\nsudo mysql_secure_installation`, duration: '30min' },
            { id: 'databases', title: 'Créer une BDD', content: `# Bases de données\n\nCREATE DATABASE ma_base;\nUSE ma_base;\nDROP DATABASE ma_base;`, duration: '30min', codeBlocks: [{ language: 'sql', code: 'CREATE DATABASE ecole;\nUSE ecole;\nSHOW DATABASES;', title: 'BDD' }] },
            { id: 'tables', title: 'Tables SQL', content: `# Tables\n\nCREATE TABLE users (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  nom VARCHAR(100),\n  email VARCHAR(255) UNIQUE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`, duration: '1h', codeBlocks: [{ language: 'sql', code: 'CREATE TABLE etudiants (\n  id INT PRIMARY KEY,\n  nom VARCHAR(100),\n  age INT,\n  classe VARCHAR(10)\n);', title: 'Tables' }] },
            { id: 'insert', title: 'INSERT - Ajouter', content: `# INSERT\n\nAjouter des données.\n\nINSERT INTO users (nom, email)\nVALUES ('Dupont', 'dupont@mail.com');`, duration: '45min' },
            { id: 'select', title: 'SELECT - Lire', content: `# SELECT\n\nLire des données.\n\nSELECT * FROM users;\nSELECT nom, email FROM users WHERE age > 18;\nSELECT * FROM users ORDER BY nom ASC;`, duration: '1h30' },
            { id: 'update', title: 'UPDATE - Modifier', content: `# UPDATE\n\nModifier des données.\n\nUPDATE users SET email = 'new@mail.com' WHERE id = 1;`, duration: '45min' },
            { id: 'delete', title: 'DELETE - Supprimer', content: `# DELETE\n\nSupprimer des données.\n\nDELETE FROM users WHERE id = 5;\nTRUNCATE TABLE users;`, duration: '40min' },
            { id: 'where', title: 'Clause WHERE', content: `# WHERE\n\nFiltrer les résultats.\n\n- Opérateurs : =, !=, >, <, >=, <=\n- LIKE : recherche pattern\n- IN : liste valeurs\n- BETWEEN : plage`, duration: '1h' },
            { id: 'joins', title: 'Jointures SQL', content: `# JOINS\n\nRelier plusieurs tables.\n\n- INNER JOIN\n- LEFT JOIN\n- RIGHT JOIN\n- FULL OUTER JOIN`, duration: '1h30', codeBlocks: [{ language: 'sql', code: 'SELECT u.nom, c.titre\nFROM users u\nINNER JOIN commandes c ON u.id = c.user_id;', title: 'Joins' }] },
            { id: 'aggregate', title: 'Fonctions Agrégation', content: `# Agrégation\n\n- COUNT() : compter\n- SUM() : somme\n- AVG() : moyenne\n- MIN/MAX : min/max\n- GROUP BY : grouper`, duration: '1h' },
            { id: 'index', title: 'Index et Performance', content: `# Index\n\nAccélérer les requêtes.\n\nCREATE INDEX idx_email ON users(email);\nSHOW INDEX FROM users;`, duration: '1h' },
            { id: 'transactions', title: 'Transactions', content: `# Transactions\n\nATOMICITÉ garantie.\n\nSTART TRANSACTION;\nUPDATE comptes SET solde = solde - 100 WHERE id = 1;\nUPDATE comptes SET solde = solde + 100 WHERE id = 2;\nCOMMIT;`, duration: '1h' },
            { id: 'advanced', title: 'SQL Avancé', content: `# Avancé\n\n- Sous-requêtes\n- Vues (VIEWs)\n- Procédures stockées\n- Triggers\n- CTEs`, duration: '1h30' }
        ]
    },
    {
        id: 'security-basics',
        title: 'Sécurité Web',
        description: 'Protégez vos applications : HTTPS, injections SQL, XSS, CSRF et bonnes pratiques.',
        icon: Shield,
        level: 'intermediate',
        duration: '10h',
        category: 'securite',
        chapters: 11,
        keywords: ['security', 'https', 'sql injection', 'xss', 'csrf', 'owasp'],
        content: [
            { id: 'intro', title: 'Introduction Sécurité', content: `# Sécurité Web\n\nCruciale pour toute app.\n\n## OWASP Top 10\n- Injection\n- Broken Auth\n- Sensitive Data\n- XXE\n- Access Control`, duration: '1h' },
            { id: 'https', title: 'HTTPS et TLS', content: `# HTTPS\n\nChiffrement des communications.\n\n## Certificats\n- Let's Encrypt (gratuit)\n- TLS 1.3\n- HSTS`, duration: '1h' },
            { id: 'sql-injection', title: 'Injections SQL', content: `# SQL Injection\n\nFaille très dangereuse.\n\n## Prévention\n- Requêtes préparées\n- ORM\n- Validation entrées\n- Principe moindre privilège`, duration: '1h30', codeBlocks: [{ language: 'javascript', code: '// MAUVAIS\nconst query = "SELECT * FROM users WHERE id = " + userId;\n\n// BON\nconst query = "SELECT * FROM users WHERE id = ?";\ndb.execute(query, [userId]);', title: 'SQL Injection' }] },
            { id: 'xss', title: 'Cross-Site Scripting', content: `# XSS\n\nInjection JavaScript.\n\n## Types\n- Reflected XSS\n- Stored XSS\n- DOM-based XSS\n\n## Protection\n- Échapper HTML\n- CSP headers\n- Sanitize inputs`, duration: '1h30' },
            { id: 'csrf', title: 'CSRF - Attaques', content: `# CSRF\n\nCross-Site Request Forgery.\n\n## Protection\n- CSRF tokens\n- SameSite cookies\n- Vérifier Origin header`, duration: '1h' },
            { id: 'auth', title: 'Authentification', content: `# Authentification\n\n## Bonnes pratiques\n- Hacher mots de passe (bcrypt)\n- 2FA\n- Sessions sécurisées\n- OAuth 2.0 / JWT`, duration: '1h30' },
            { id: 'passwords', title: 'Gestion Mots de Passe', content: `# Mots de passe\n\n## Règles\n- Minimum 12 caractères\n- Complexité\n- bcrypt/argon2\n- Pas de récupération (reset uniquement)`, duration: '45min' },
            { id: 'headers', title: 'Headers Sécurité', content: `# Security Headers\n\n- X-Frame-Options\n- X-Content-Type-Options\n- Content-Security-Policy\n- Strict-Transport-Security\n- X-XSS-Protection`, duration: '1h' },
            { id: 'cors', title: 'CORS Configuration', content: `# CORS\n\nCross-Origin Resource Sharing.\n\n## Configuration\nAccess-Control-Allow-Origin\nAccess-Control-Allow-Methods\nAccess-Control-Allow-Headers`, duration: '45min' },
            { id: 'api-security', title: 'Sécuriser APIs', content: `# API Security\n\n- Rate limiting\n- API keys\n- OAuth tokens\n- Input validation\n- HTTPS obligatoire`, duration: '1h' },
            { id: 'best-practices', title: 'Bonnes Pratiques', content: `# Best Practices\n\n- Principe moindre privilège\n- Défense en profondeur\n- Mise à jour régulière\n- Logging & monitoring\n- Tests de pénétration`, duration: '1h' }
        ]
    },
    {
        id: 'javascript-modern',
        title: 'JavaScript Moderne (ES6+)',
        description: 'Maîtrisez JavaScript moderne : ES6+, async/await, modules et fonctionnalités avancées.',
        icon: Code,
        level: 'intermediate',
        duration: '15h',
        category: 'javascript',
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
            { id: 'modules', title: 'Modules ES6', content: `# Modules\n\nOrganiser le code.\n\n// export\nconst PI = 3.14;\nexport function add(a,b) {}\n\n// import\nimport {PI, add} from './math.js';`, duration: '1h' },
            { id: 'classes', title: 'Classes ES6', content: `# Classes\n\nPOO en JavaScript.\n\nclass User {\n  constructor(nom) {\n    this.nom = nom;\n  }\n  \n  sayHello() {\n    return \`Hello \${this.nom}\`;\n  }\n}`, duration: '1h30' },
            { id: 'array-methods', title: 'Méthodes Array', content: `# Array Methods\n\n- map() : transformer\n- filter() : filtrer\n- reduce() : agréger\n- find() : chercher\n- some/every : tester`, duration: '1h30' },
            { id: 'optional-chaining', title: 'Optional Chaining', content: `# Optional Chaining\n\nÉviter erreurs null.\n\nconst name = user?.profile?.name;\nconst result = obj?.method?.();`, duration: '30min' },
            { id: 'nullish', title: 'Nullish Coalescing', content: `# Nullish ??\n\nValeur par défaut.\n\nconst value = input ?? 'default';\n// Seulement si null/undefined`, duration: '30min' },
            { id: 'symbols', title: 'Symbols & Iterators', content: `# Symbols\n\nIdentifiants uniques.\n\nconst sym = Symbol('desc');\nconst obj = {[sym]: 'value'};`, duration: '45min' },
            { id: 'proxy-reflect', title: 'Proxy & Reflect', content: `# Proxy\n\nIntercepter opérations.\n\nconst proxy = new Proxy(target, {\n  get(obj, prop) {\n    console.log(\`Get \${prop}\`);\n    return obj[prop];\n  }\n});`, duration: '1h' },
            { id: 'best-practices', title: 'Bonnes Pratiques JS', content: `# Best Practices\n\n- Utiliser const par défaut\n- Éviter var\n- Async/await > callbacks\n- ES modules\n- Strict mode`, duration: '1h' }
        ]
    },
    {
        id: 'react-fundamentals',
        title: 'React - Fondamentaux',
        description: 'Créez des applications web modernes avec React : composants, hooks, state management.',
        icon: Code,
        level: 'intermediate',
        duration: '18h',
        category: 'frontend',
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
            { id: 'best-practices', title: 'Bonnes Pratiques', content: `# Best Practices\n\n- Composants petits et focalisés\n- Props immutables\n- Hooks en haut du composant\n- Nommer composants clairement\n- TypeScript recommandé`, duration: '1h' }
        ]
    }
];

// Ajout des 18 nouveaux cours
const newCourses: Course[] = [
    {
        id: 'git-github',
        title: 'Git & GitHub Complet',
        description: 'Maîtrisez Git pour versionner votre code et collaborer efficacement avec GitHub.',
        icon: Code,
        level: 'beginner',
        duration: '8h',
        category: 'devops',
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
            { id: 'advanced', title: 'Git Avancé', content: `# Avancé\n\n- Cherry-pick\n- Submodules\n- Git hooks\n- Tags\n- Bisect`, duration: '1h' }
        ]
    },
    {
        id: 'python-basics',
        title: 'Python pour Débutants',
        description: 'Apprenez Python de zéro : syntaxe, structures de données, POO et projets pratiques.',
        icon: Code,
        level: 'beginner',
        duration: '20h',
        category: 'python',
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
            { id: 'virtual-env', title: 'Virtual Environments', content: `# venv\n\npython3 -m venv env\nsource env/bin/activate\npip install package\ndeactivate\n\n# requirements\npip freeze > requirements.txt\npip install -r requirements.txt`, duration: '1h' }
        ]
    },
    {
        id: 'nodejs-backend',
        title: 'Node.js Backend',
        description: 'Créez des APIs REST avec Node.js, Express, et MongoDB pour vos applications.',
        icon: Server,
        level: 'intermediate',
        duration: '16h',
        category: 'backend',
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
            { id: 'deployment', title: 'Déploiement', content: `# Déploiement\n\n## Heroku\nheroku create\ngit push heroku main\n\n## PM2\nnpm install -g pm2\npm2 start server.js\npm2 logs\npm2 restart all`, duration: '1h30' }
        ]
    },
    {
        id: 'kubernetes',
        title: 'Kubernetes (K8s)',
        description: 'Orchestrez vos conteneurs avec Kubernetes : déploiements, services, scaling automatique.',
        icon: Cloud,
        level: 'advanced',
        duration: '14h',
        category: 'devops',
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
            { id: 'monitoring', title: 'Monitoring & Logs', content: `# Monitoring\n\n## Tools\n- Prometheus\n- Grafana\n- ELK Stack\n- Datadog\n\nkubectl logs pod-name\nkubectl logs -f pod-name\nkubectl top nodes\nkubectl top pods`, duration: '1h30' }
        ]
    },
    {
        id: 'html-css-fundamentals',
        title: 'HTML5 & CSS3 - Web Moderne',
        description: 'Construisez des sites web modernes et responsives avec HTML5 sémantique, CSS Grid et Flexbox.',
        icon: Globe,
        level: 'beginner',
        duration: '10h',
        category: 'frontend',
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
            { id: 'architecture', title: 'Architecture CSS', content: `# Architecture\n\n- BEM (Block Element Modifier)\n- Tailwind (Utility-first)\n- SASS/SCSS\n- CSS Modules`, duration: '1h' }
        ]
    }
];

// Fusion et export
const courses: Course[] = [...exampleCourses, ...newCourses];

const getCourseById = (id: string) => courses.find(c => c.id === id);
const getCoursesByCategory = (category: string) => courses.filter(c => c.category === category);
const getCoursesByLevel = (level: string) => courses.filter(c => c.level === level);
const searchCourses = (query: string) => {
    const q = query.toLowerCase();
    return courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some(k => k.toLowerCase().includes(q))
    );
};


import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
    console.log("Starting full migration (Schema + Data)...");
    try {
        try {
           await pb.collection('_superusers').authWithPassword('admin@tutodecode.com', '1234567890');
           console.log("Authenticated as superuser.");
        } catch (e: any) {
           console.log("Authentication failed. Ensure superuser exists.");
           process.exit(1);
        }

        // Create 'courses' collection
        try {
            await pb.collections.create({
                name: "courses",
                type: "base",
                schema: [
                    { name: "originalId", type: "text", required: true, unique: true },
                    { name: "title", type: "text", required: true },
                    { name: "description", type: "text" },
                    { name: "level", type: "select", options: { values: ["beginner", "intermediate", "advanced"] } },
                    { name: "duration", type: "text" },
                    { name: "category", type: "text" }, 
                    { name: "keywords", type: "json" }, 
                    { name: "icon", type: "text" }, 
                    { name: "image", type: "file", options: { mimeTypes: ["image/png","image/jpeg"], maxSelect: 1 } },
                    { name: "chaptersCount", type: "number" },
                ],
                listRule: "", // Public
                viewRule: "", // Public
            });
            console.log("Created 'courses' collection.");
        } catch (e: any) {
            // console.log("Courses collection setup: " + e.message);
        }

        // Create 'chapters' collection
        let coursesId = "";
        try {
            const c = await pb.collections.getOne("courses");
            coursesId = c.id;
        } catch(e) {}

        if (coursesId) {
            try {
                await pb.collections.create({
                    name: "chapters",
                    type: "base",
                    schema: [
                        { name: "course", type: "relation", required: true, options: { 
                            collectionId: coursesId,
                            cascadeDelete: true,
                            maxSelect: 1
                        }},
                        { name: "originalId", type: "text", required: true },
                        { name: "title", type: "text", required: true },
                        { name: "content", type: "text" }, // Markdown content
                        { name: "duration", type: "text" },
                        { name: "order", type: "number" },
                        { name: "codeBlocks", type: "json" }, 
                        { name: "infoBoxes", type: "json" }, 
                    ],
                    listRule: "", // Public
                    viewRule: "", // Public
                });
                console.log("Created 'chapters' collection.");
            } catch (e: any) {
                // console.log("Chapters collection setup: " + e.message);
            }
        }
        
        // Data Import
        const coursesData = courses;
        
        for (const course of coursesData) {
            try {
               const exist = await pb.collection('courses').getFirstListItem(`originalId="${course.id}"`);
               if(exist) {
                   console.log(`Skipping existing course: ${course.title}`);
                   continue;
               }
            } catch(e) {}

            console.log(`Migrating course: ${course.title}`);
            const coursePayload = {
                originalId: course.id,
                title: course.title,
                description: course.description,
                level: course.level,
                duration: course.duration,
                category: course.category,
                keywords: course.keywords,
                icon: course.icon, 
                chaptersCount: course.chapters || 0
            };
            
            try {
                const rec = await pb.collection('courses').create(coursePayload);
                
                if (course.content && course.content.length > 0) {
                    let order = 0;
                    for(const chap of course.content) {
                        try {
                            await pb.collection('chapters').create({
                               course: rec.id,
                               originalId: chap.id,
                               title: chap.title,
                               content: chap.content,
                               duration: chap.duration,
                               order: order++,
                               codeBlocks: chap.codeBlocks || [],
                               infoBoxes: chap.infoBoxes || [] 
                            });
                        } catch(err: any) {
                            console.error(`Failed to create chapter ${chap.title}: `, err.data || err.message);
                        }
                    }
                    console.log(`  - Migrated ${course.content.length} chapters.`);
                }
            } catch (err: any) {
                console.error(`Failed to create course ${course.title}: `, err.data || err.message);
            }
        }
        console.log("Migration complete.");
        
    } catch(e: any) { 
        console.error("Migration fatal error:", e); 
    }
}

run();
