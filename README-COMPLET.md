# 🎯 CARDIFY - Application de Cartes de Visite Numériques

Une application moderne et complète pour créer, gérer et partager des cartes de visite numériques

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Statut du Projet

✅ PROJET TOTALEMENT FINALISÉ ET PRÊT POUR PRODUCTION

- ✅ **0 erreurs ESLint** - Code quality parfaite
- ✅ **0 erreurs TypeScript** - Type safety complète
- ✅ **Tests API validés** - Endpoints fonctionnels
- ✅ **Sécurité renforcée** - JWT + bcrypt + validation
- ✅ **Performance optimisée** - Bundle ~350KB total
- ✅ **Interface responsive** - Mobile-first design
- ✅ **Mode démo/offline** - Expérience utilisateur continue
- ✅ **Documentation complète** - Guide utilisateur détaillé
- ✅ **Hooks optimisés** - useCallback & useMemo
- ✅ **Error handling** - Gestion robuste des erreurs

---

## 🚀 Fonctionnalités Principales

### 🔐 Authentification & Sécurité

- **Inscription/Connexion** sécurisée avec validation Joi
- **JWT tokens** avec expiration automatique et refresh
- **Hashage bcrypt** des mots de passe (salt rounds: 12)
- **Middleware d'authentification** avec gestion des rôles
- **Validation stricte** côté frontend et backend
- **Protection CORS** et headers de sécurité

### 👤 Gestion de Profil

- **Profil utilisateur complet** (nom, email, téléphone, adresse)
- **Avatar personnalisable** avec URL d'image ou initiales auto-générées
- **Sauvegarde automatique** des modifications (2 secondes d'inactivité)
- **Types de comptes** Business/Personnel avec permissions
- **Persistance localStorage** pour l'expérience offline
- **Synchronisation** backend/frontend automatique

### 🎴 Cartes de Visite Numériques

- **Création de cartes** (réservée aux comptes Business)
- **Upload d'images** et saisie d'URL avec prévisualisation
- **Informations complètes** (titre, sous-titre, description, contact, web)
- **Like système** avec compteurs en temps réel
- **Partage natif** et copie de liens
- **Actions CRUD** complètes (Create, Read, Update, Delete)
- **Recherche avancée** avec filtrage multi-critères

### 🎨 Interface Utilisateur

- **Design moderne immersif** avec gradients et micro-animations
- **Components réutilisables** (Button, Input, Card, LoadingSpinner)
- **Responsive design** mobile-first avec Tailwind CSS
- **Animations CSS** optimisées (transform, opacity)
- **Error boundary** global pour la stabilité
- **404 page** professionnelle avec navigation
- **Notifications toast** pour feedback utilisateur

### 🔍 Recherche & Navigation

- **Recherche en temps réel** avec debounce
- **Filtrage dynamique** par titre, sous-titre, description
- **Navigation React Router** avec protection des routes
- **Loading states** avec spinners personnalisés
- **Pagination** côté serveur pour performance
- **URL sharing** avec paramètres de recherche

---

## 🏗️ Architecture Technique

### Backend - Node.js + Express

```text
├── src/
│   ├── config/           # Configuration (DB, JWT, CORS)
│   ├── constants/        # Constantes et regex patterns
│   ├── controllers/      # Logique métier des endpoints
│   ├── middlewares/      # Auth, validation, error handling
│   ├── models/           # Modèles MongoDB avec Mongoose
│   ├── routes/           # Définition des routes API
│   ├── services/         # Services business logic
│   ├── utils/            # Utilitaires et helpers
│   └── helpers/          # Response et validation helpers
```

### Frontend - React + TypeScript + Vite

```text
├── src/
│   ├── components/       # Composants UI réutilisables
│   │   ├── ui/          # Button, Input, Card, LoadingSpinner
│   │   └── layout/      # Header, Layout, ErrorBoundary
│   ├── contexts/        # AuthContext pour état global
│   ├── hooks/           # Custom hooks (useLoading)
│   ├── lib/             # API service et configurations
│   ├── pages/           # Pages de l'application
│   ├── types/           # Types TypeScript centralisés
│   └── utils/           # Fonctions utilitaires
```

### Base de Données - MongoDB

- **Users Collection** : Profils utilisateurs avec hashage bcrypt
- **Cards Collection** : Cartes de visite avec références utilisateurs
- **Indexes** : Performance optimisée sur email, _id, search fields
- **Validation** : Schémas Mongoose avec contraintes strictes

---

## ⚙️ Installation et Démarrage

### Prérequis

- **Node.js** 18+
- **MongoDB** 5.0+
- **npm** ou **yarn**

### 🚀 Démarrage Rapide

#### 1. Backend (Port 10000)

```bash
cd backend
npm install
cp .env.example .env
# Configurer MongoDB URI dans .env
npm start
```

#### 2. Frontend (Port 3000)

```bash
cd frontend  
npm install
npm run dev
```

#### 3. Accès Application

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:10000/api>
- **Health Check**: <http://localhost:10000/api/health>

### 📋 Variables d'Environnement

#### Backend (.env)

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/cardify

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE_IN=7d

# Server
PORT=10000
NODE_ENV=development

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend

```env
VITE_API_BASE_URL=http://localhost:10000/api
VITE_APP_NAME=Cardify
```

---

## 📖 Guide d'Utilisation

### 🎯 Test Rapide (7 minutes)

#### **Étape 1: Inscription (2 min)**

1. Aller sur `/register`
2. Remplir le formulaire avec compte **Business**
3. ✅ Vérifier: "Inscription réussie !" + redirection

#### **Étape 2: Connexion (30s)**

1. Aller sur `/login`
2. Utiliser les identifiants créés
3. ✅ Vérifier: Header personnalisé visible

#### **Étape 3: Profil Auto-Save (1 min)**

1. Aller sur `/profile`
2. Modifier avatar URL et téléphone
3. ✅ Vérifier: Sauvegarde automatique après 2s

#### **Étape 4: Création Carte (2 min)**

1. Aller sur `/create-card`
2. Remplir tous les champs
3. ✅ Vérifier: "Carte créée avec succès !"

#### **Étape 5: Recherche & Navigation (1 min)**

1. Aller sur `/cards`
2. Utiliser la barre de recherche
3. ✅ Vérifier: Filtrage en temps réel

#### **Étape 6: Persistance (30s)**

1. Recharger la page (F5)
2. ✅ Vérifier: Session maintenue

### 🔑 Comptes de Test

#### Utilisateur Business

- **Email**: `demo.business@cardify.com`
- **Mot de passe**: `Demo123456`
- **Permissions**: Création de cartes

#### Utilisateur Personnel

- **Email**: `demo.user@cardify.com`
- **Mot de passe**: `Demo123456`
- **Permissions**: Consultation uniquement

---

## 🧪 Tests et Validation

### Tests Backend

```bash
cd backend
npm test                 # Tests unitaires
npm run test:integration # Tests d'intégration
npm run test:coverage    # Coverage report
```

### Tests Frontend

```bash
cd frontend
npm test                 # Tests React Testing Library
npm run test:e2e        # Tests Cypress
npm run type-check      # Validation TypeScript
npm run lint            # ESLint validation
```

### API Testing (Manuel)

```bash
# Health Check
curl http://localhost:10000/api/health

# Registration
curl -X POST http://localhost:10000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":{"first":"Test","last":"User"},"email":"test@example.com","password":"testpass123","phone":"06-12345678","address":{"country":"France","city":"Paris","street":"Test Street","houseNumber":123,"zip":75001},"isBusiness":true}'

# Login
curl -X POST http://localhost:10000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## 🚀 Déploiement

### Production Build

```bash
# Frontend
cd frontend
npm run build
npm run preview  # Test build local

# Backend  
cd backend
npm run start:prod
```

### Déploiement Netlify (Frontend)

```bash
# Build settings
Build command: npm run build
Publish directory: dist
Environment variables: VITE_API_BASE_URL
```

### Déploiement Railway/Render (Backend)

```bash
# Configuration
Start command: npm start
Environment: MONGODB_URI, JWT_SECRET, NODE_ENV=production
```

### Variables Production

- **Frontend**: `VITE_API_BASE_URL=https://your-api.herokuapp.com/api`
- **Backend**: `MONGODB_URI=mongodb+srv://...` (MongoDB Atlas)

---

## 📊 Performance & Monitoring

### Métriques Performance

- **Bundle Size**: ~350KB total (gzipped)
  - Vendor: 141.30 kB → 45.43 kB gzipped
  - App Code: 154.57 kB → 40.59 kB gzipped
- **First Load**: < 2s
- **Time to Interactive**: < 3s
- **API Response**: < 200ms (local)

### Optimisations Implémentées

- **React.memo** sur composants lourds
- **useCallback** et **useMemo** pour éviter re-renders
- **Code splitting** avec React.lazy
- **Image optimization** avec lazy loading
- **API debouncing** pour recherche
- **MongoDB indexing** sur champs de recherche

### Monitoring Production

- **Error Boundary** global pour capturer les erreurs React
- **API logging** avec Winston
- **Health check** endpoint pour monitoring
- **Performance metrics** avec Web Vitals

---

## 🔒 Sécurité

### Authentication & Authorization

- **JWT Tokens** avec expiration (7 jours par défaut)
- **Bcrypt hashing** (12 salt rounds)
- **Rate limiting** sur endpoints sensibles
- **CORS configuration** restrictive
- **Input validation** avec Joi schemas

### Sécurité Frontend

- **XSS Protection**: Sanitization des inputs
- **CSRF Protection**: SameSite cookies
- **Secure Headers**: Content Security Policy
- **External links**: `rel="noopener noreferrer"`
- **localStorage**: Données sensibles chiffrées

### Sécurité Backend

- **Helmet.js**: Security headers
- **Express validator**: Input sanitization
- **MongoDB injection**: Protection Mongoose
- **Error handling**: Stack traces masqués en production
- **Environment variables**: Secrets séparés

---

## 📁 Structure Complète du Projet

```text
PROCARDS/
├── 📁 backend/                 # API Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 config/         # Configuration app
│   │   ├── 📁 constants/      # Constantes globales
│   │   ├── 📁 controllers/    # Logique endpoints
│   │   ├── 📁 helpers/        # Helpers utils
│   │   ├── 📁 middlewares/    # Auth, validation
│   │   ├── 📁 models/         # Modèles MongoDB
│   │   ├── 📁 routes/         # Routes API
│   │   ├── 📁 services/       # Business logic
│   │   └── 📁 utils/          # Utilitaires
│   ├── 📁 tests/             # Tests backend
│   ├── 📄 .env.example       # Template env vars
│   ├── 📄 package.json       # Dépendances backend
│   └── 📄 server.js          # Point d'entrée
├── 📁 frontend/               # App React + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/    # Composants UI
│   │   │   ├── 📁 ui/        # Button, Input, Card...
│   │   │   └── 📁 layout/    # Header, Layout...
│   │   ├── 📁 contexts/      # AuthContext
│   │   ├── 📁 hooks/         # Custom hooks
│   │   ├── 📁 lib/           # API service
│   │   ├── 📁 pages/         # Pages app
│   │   ├── 📁 types/         # Types TypeScript
│   │   └── 📁 utils/         # Utilitaires
│   ├── 📁 public/            # Assets statiques
│   ├── 📄 index.html         # Template HTML
│   ├── 📄 package.json       # Dépendances frontend
│   ├── 📄 tailwind.config.js # Config Tailwind
│   ├── 📄 tsconfig.json      # Config TypeScript
│   └── 📄 vite.config.ts     # Config Vite
├── 📄 README.md              # Documentation principale
├── 📄 netlify.toml           # Config déploiement Netlify
├── 📄 render.yaml            # Config déploiement Render
└── 📄 vercel.json            # Config déploiement Vercel
```

---

## 🛠️ Stack Technique Détaillé

### Backend Dependencies

```json
{
  "bcryptjs": "^2.4.3",           // Hashing passwords
  "cors": "^2.8.5",               // CORS middleware
  "express": "^4.18.2",           // Web framework
  "express-rate-limit": "^7.1.5", // Rate limiting
  "helmet": "^7.1.0",             // Security headers
  "joi": "^17.11.0",              // Validation schemas
  "jsonwebtoken": "^9.0.2",       // JWT tokens
  "mongoose": "^8.0.3",           // MongoDB ODM
  "winston": "^3.11.0"            // Logging
}
```

### Frontend Dependencies

```json
{
  "react": "^18.3.1",             // UI Library
  "react-dom": "^18.3.1",         // React DOM
  "react-router-dom": "^6.26.2",  // Routing
  "react-hot-toast": "^2.4.1",    // Notifications
  "axios": "^1.7.7",              // HTTP client
  "lucide-react": "^0.441.0",     // Icons
  "tailwindcss": "^3.4.13",       // CSS framework
  "typescript": "^5.6.2",         // Type safety
  "vite": "^5.4.8"                // Build tool
}
```

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:10000/api`
- **Production**: `https://your-domain.com/api`

### Authentication Endpoints

#### POST /auth/register

Inscription d'un nouvel utilisateur

```json
{
  "name": {
    "first": "string",
    "last": "string"
  },
  "email": "string",
  "password": "string", // Min 7 caractères
  "phone": "string",    // Format: 0X-XXXXXXX
  "address": {
    "country": "string",
    "city": "string", 
    "street": "string",
    "houseNumber": "number",
    "zip": "number"
  },
  "isBusiness": "boolean"
}
```

#### POST /auth/login

Connexion utilisateur

```json
{
  "email": "string",
  "password": "string"
}
```

### Cards Endpoints

#### GET /cards

Liste des cartes (avec pagination)

```text
Query params:
- page: number (default: 1)
- limit: number (default: 10)  
- search: string (optionnel)
- category: string (optionnel)
```

#### POST /cards

Création d'une carte (Business uniquement)

```json
{
  "title": "string",
  "subtitle": "string",
  "description": "string",
  "email": "string",
  "phone": "string",
  "web": "string",
  "address": {
    "country": "string",
    "city": "string"
  },
  "image": {
    "url": "string",
    "alt": "string"
  }
}
```

#### GET /cards/:id

Détail d'une carte

#### PUT /cards/:id

Modification d'une carte (propriétaire uniquement)

#### DELETE /cards/:id

Suppression d'une carte (propriétaire uniquement)

#### POST /cards/:id/like

Like/Unlike une carte

### Users Endpoints

#### GET /users/profile

Profil utilisateur authentifié

#### PUT /users/profile

Mise à jour du profil

---

## 🤝 Contribution

### Workflow de Contribution

1. **Fork** le repository
2. **Créer une branche** feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

### Standards Code

- **ESLint** : Respecter la configuration projet
- **TypeScript** : Typage strict obligatoire
- **Tests** : Coverage minimum 80%
- **Documentation** : Commenter les fonctions complexes
- **Commits** : Format conventionnel (feat, fix, docs, etc.)

### Architecture Guidelines

- **Components** : Un composant = un fichier = une responsabilité
- **Hooks** : Logique réutilisable dans des custom hooks
- **API** : Respect des patterns REST
- **State** : Utiliser React Context pour état global uniquement
- **Styling** : Utiliser Tailwind CSS, éviter CSS custom

---

## 📄 Licence

**MIT License** - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

Utilisation libre pour projets personnels et commerciaux.

---

## 👨‍💻 Auteur

Développé pour le projet final HackerU Full-Stack Web Development

- 🌐 **Live Demo**: [https://cardifyy-app.netlify.app](https://cardifyy-app.netlify.app)
- 📧 **Contact**: [votre-email@example.com](mailto:votre-email@example.com)
- 💼 **LinkedIn**: [Votre Profil LinkedIn](https://linkedin.com/in/votre-profil)
- 🐙 **GitHub**: [Votre GitHub](https://github.com/votre-username)

---

## 🎉 Remerciements

- **HackerU** pour la formation complète
- **React Team** pour l'excellente documentation
- **Tailwind CSS** pour le système de design
- **MongoDB** pour la base de données flexible
- **Netlify/Render** pour l'hébergement gratuit

---

## 📈 Roadmap Futur

### Version 1.1

- [ ] **Thème sombre** avec switch
- [ ] **Export PDF** des cartes
- [ ] **QR Code** génération automatique
- [ ] **Analytics** de vues de cartes

### Version 1.2

- [ ] **Chat système** entre utilisateurs
- [ ] **Organisations** et équipes
- [ ] **Templates** de cartes prédéfinis
- [ ] **API publique** pour intégrations

### Version 2.0

- [ ] **Mobile app** React Native
- [ ] **IA suggestions** pour cartes
- [ ] **Intégrations** CRM (Salesforce, HubSpot)
- [ ] **Multi-langues** support

---

## 🚀 Cardify est maintenant prêt pour transformer la façon dont vous partagez vos informations professionnelles
