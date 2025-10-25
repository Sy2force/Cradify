# 📇 Cardify - Système Complet de Gestion de Cartes de Visite Professionnelles

**Application Full-Stack moderne** pour créer, gérer et partager des cartes de visite numériques avec chat temps réel intégré.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-brightgreen)](https://mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Stack Technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Documentation API](#documentation-api)
- [Tests](#tests)
- [Déploiement](#déploiement)

## Vue d'ensemble

Cardify est une plateforme complète de gestion de cartes de visite numériques développée selon les standards HackerU. Elle permet aux professionnels de créer, gérer et partager leurs cartes de visite de manière moderne et sécurisée.

### Points Forts

- ✅ **Architecture MVC + Services** clean et modulaire
- ✅ **Double Frontend/Backend** avec React et Node.js
- ✅ **Chat temps réel** avec Socket.io
- ✅ **Authentification JWT** sécurisée
- ✅ **Base de données flexible** (MongoDB local ou Atlas)
- ✅ **Tests automatisés** (Jest, Supertest, Vitest)
- ✅ **Documentation complète** et professionnelle

## Stack Technique

### Backend (Node.js/Express)

- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.18+
- **Base de données**: MongoDB 5.0+ avec Mongoose ODM
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Sécurité**: bcryptjs, Helmet, CORS
- **Chat temps réel**: Socket.io
- **Email**: Nodemailer
- **Logging**: Winston + Morgan
- **Tests**: Jest + Supertest

### Frontend (React/TypeScript)

- **Framework**: React 18+ avec TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Tests**: Vitest + React Testing Library

## Fonctionnalités

### Système d'Utilisateurs

- 🔐 **Authentification complète** (register, login, logout)
- 👤 **3 types de comptes**: User, Business, Admin
- 📝 **Profils détaillés** avec adresse complète
- 🔄 **Gestion des permissions** par rôle
- 📧 **Emails de bienvenue** automatiques

### Gestion des Cartes

- 📇 **CRUD complet** des cartes de visite
- ❤️ **Système de likes** interactif
- 🔢 **Génération automatique** de bizNumber unique
- 🖼️ **Support images** avec alt text
- 📱 **Responsive design** mobile-first

### Fonctionnalités Avancées

- 💬 **Chat temps réel** multi-room avec Socket.io
- 🌓 **Dark/Light mode** avec persistance
- 🔍 **Recherche et filtres** avancés
- ⚡ **Lazy loading** et optimisations React
- 📊 **Dashboard admin** complet
- 🛡️ **Rate limiting** intelligent

## 📊 Routes API

### Authentification

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/users/register` | ❌ | Inscription utilisateur |
| `POST` | `/api/users/login` | ❌ | Connexion utilisateur |

### Utilisateurs

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| `GET` | `/api/users` | ✅ | Admin | Liste tous les utilisateurs |
| `GET` | `/api/users/:id` | ✅ | Admin | Détails d'un utilisateur |
| `PUT` | `/api/users/:id` | ✅ | Admin | Modifier un utilisateur |
| `PATCH` | `/api/users/:id` | ✅ | Admin | Changer statut business |
| `DELETE` | `/api/users/:id` | ✅ | Admin | Supprimer un utilisateur |

### Cartes de Visite

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| `GET` | `/api/cards` | 🔄 | Tous | Liste publique des cartes |
| `GET` | `/api/cards/:id` | 🔄 | Tous | Détails d'une carte |
| `GET` | `/api/cards/my-cards` | ✅ | Business | Mes cartes personnelles |
| `POST` | `/api/cards` | ✅ | Business | Créer une nouvelle carte |
| `PUT` | `/api/cards/:id` | ✅ | Business/Admin | Modifier une carte |
| `PATCH` | `/api/cards/:id` | ✅ | User+ | Like/Unlike une carte |
| `DELETE` | `/api/cards/:id` | ✅ | Business/Admin | Supprimer une carte |

**Légende :** ✅ Requis | ❌ Public | 🔄 Optionnel

## Architecture du Projet

```text
PROCARDS/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── dbService.js         # Configuration MongoDB dynamique
│   │   ├── controllers/
│   │   │   ├── user.controller.js   # Logique utilisateurs
│   │   │   └── card.controller.js   # Logique cartes
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT + rôles
│   │   │   ├── cors.middleware.js   # Configuration CORS
│   │   │   ├── error.middleware.js  # Gestion erreurs
│   │   │   └── validate.middleware.js # Validation Joi
│   │   ├── models/
│   │   │   ├── user.model.js        # Schéma User MongoDB
│   │   │   └── card.model.js        # Schéma Card MongoDB
│   │   ├── routes/
│   │   │   ├── user.routes.js       # Routes /api/users
│   │   │   └── card.routes.js       # Routes /api/cards
│   │   ├── services/
│   │   │   ├── user.service.js      # Logique métier users
│   │   │   ├── card.service.js      # Logique métier cards
│   │   │   └── email.service.js     # Service Nodemailer
│   │   ├── sockets/
│   │   │   └── chat.js              # Socket.io chat
│   │   ├── utils/
│   │   │   ├── jwt.js               # Helpers JWT
│   │   │   ├── logger.js            # Winston logger
│   │   │   └── seed.js              # Données initiales
│   │   ├── validators/
│   │   │   ├── user.validator.js    # Schémas Joi users
│   │   │   └── card.validator.js    # Schémas Joi cards
│   │   └── app.js                   # Configuration Express
│   ├── data/                        # Backup JSON
│   ├── logs/                        # Logs rotatifs
│   ├── tests/                       # Tests Jest/Supertest
│   ├── server.js                    # Point d'entrée
│   ├── .env.example                 # Template config
│   └── package.json                 # Dépendances backend
│
    ├── src/
    │   ├── assets/                  # Images, fonts
    │   ├── components/
    │   │   ├── auth/                # LoginForm, ProtectedRoute
    │   │   ├── cards/               # CardItem, CardList
    │   │   ├── layout/              # Navbar, Footer
    │   │   └── ui/                  # Button, Input, Modal
    │   ├── contexts/
    │   │   ├── AuthContext.tsx      # Gestion auth globale
    │   │   └── ThemeContext.tsx     # Dark/Light mode
    │   ├── hooks/
    │   │   ├── useAuth.tsx          # Hook authentification
    │   │   ├── useCards.tsx         # Hook gestion cartes
    │   │   └── usePermissions.tsx   # Hook permissions
    │   ├── lib/
    │   │   ├── api.ts               # Client Axios
    │   │   └── utils.ts             # Helpers
    │   ├── pages/
    │   │   ├── HomePage.tsx         # Page accueil
    │   │   ├── LoginPage.tsx        # Connexion
    │   │   ├── RegisterPage.tsx     # Inscription
    │   │   ├── CardsPage.tsx        # Liste cartes
    │   │   ├── CreateCardPage.tsx   # Créer carte
    │   │   ├── EditCardPage.tsx     # Éditer carte
    │   │   ├── AdminPage.tsx        # Dashboard admin
    │   │   └── SettingsPage.tsx     # Paramètres
    │   ├── services/
    │   │   └── api.ts               # Services API
    │   ├── types/
    │   │   └── index.ts             # Types TypeScript
    │   ├── tests/                   # Tests Vitest
    │   ├── App.tsx                  # Composant racine
    │   └── main.tsx                 # Point d'entrée
    ├── public/                      # Fichiers statiques
    ├── .env.example                 # Template config
    ├── index.html                   # HTML principal
    ├── package.json                 # Dépendances frontend
    ├── tailwind.config.js           # Config Tailwind
    ├── tsconfig.json                # Config TypeScript
    └── vite.config.ts               # Config Vite
```

## Installation

### Prérequis

- **Node.js** ≥ 16.0.0
- **MongoDB** ≥ 5.0
- **npm** ou **yarn**

### Installation des dépendances

```bash
npm install
```

### Configuration

```bash
# Copier le template de configuration
cp .env.example .env

# Modifier les variables selon votre environnement
nano .env
```

### Démarrage

```bash
# Développement
npm run dev

# Production  
npm start

# Tests
npm test

# Initialiser avec des données de test
npm run seed
```

## Variables d'Environnement

```bash
# Configuration serveur
NODE_ENV=development
PORT=5001

# Base de données MongoDB
MONGODB_URI_LOCAL=mongodb://localhost:27017/bcard
MONGODB_URI_ATLAS=mongodb+srv://user:pass@cluster.mongodb.net/bcard

# Sécurité JWT (minimum 256 bits)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# CORS et sécurité
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate limiting (optionnel)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs (optionnel)  
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

## Documentation API

### Codes de Réponse Standard

| Code | Statut | Description |
|------|--------|-------------|
| `200` | OK | Succès de la requête |
| `201` | Created | Ressource créée avec succès |
| `400` | Bad Request | Données invalides |
| `401` | Unauthorized | Authentification requise |
| `403` | Forbidden | Permissions insuffisantes |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Ressource déjà existante |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur |

### Formats de Réponse API

#### Réponse Succès

```json
{
  "success": true,
  "data": {
    "user": { /* objet utilisateur */ },
    "token": "jwt_token_here"
  },
  "message": "Utilisateur créé avec succès"
}
```

#### Réponse Erreur

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email déjà utilisé",
    "details": [
      {
        "field": "email",
        "message": "Cette adresse email est déjà enregistrée"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📋 Exemples d'Objets JSON

### Objet Utilisateur

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": {
    "first": "John",
    "middle": "",
    "last": "Doe"
  },
  "email": "john.doe@example.com",
  "phone": "050-1234567",
  "image": {
    "url": "https://example.com/avatars/john.jpg",
    "alt": "Photo de profil de John Doe"
  },
  "address": {
    "country": "Israel",
    "city": "Tel Aviv",
    "street": "Rothschild Boulevard",
    "houseNumber": 123,
    "state": "Tel Aviv District",
    "zip": 12345
  },
  "isBusiness": true,
  "isAdmin": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

### Objet Carte de Visite

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Développeur Full-Stack",
  "subtitle": "Expert en Node.js et React",
  "description": "Création d'applications web modernes et performantes",
  "phone": "050-1234567",
  "email": "john.doe@company.com",
  "web": "https://johndoe.dev",
  "image": {
    "url": "https://example.com/cards/card1.jpg",
    "alt": "Carte de John Doe - Développeur"
  },
  "address": {
    "country": "Israel",
    "city": "Tel Aviv",
    "street": "Rothschild Boulevard", 
    "houseNumber": 123,
    "state": "Tel Aviv District",
    "zip": 12345
  },
  "bizNumber": "1234567890",
  "likes": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "user_id": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

## 🔧 Bonnes Pratiques & Standards

### Standards de Code

- **ESLint** avec règles strictes activées
- **Prettier** pour formatage automatique  
- **Conventional Commits** pour les messages
- **JSDoc** pour documentation des fonctions
- **Tests unitaires** obligatoires pour nouvelles fonctionnalités

### Règles ESLint Appliquées

```javascript
{
  "no-console": "warn",           // Éviter console.log en prod
  "comma-dangle": "always",       // Virgules finales obligatoires
  "no-trailing-spaces": "error",  // Pas d'espaces en fin de ligne
  "quotes": ["error", "single"],  // Guillemets simples
  "semi": ["error", "always"]     // Points-virgules obligatoires
}
```

### Sécurité

- **Validation stricte** avec Joi sur toutes les entrées
- **Hachage bcrypt** avec salt rounds ≥ 12
- **Rate limiting** adaptatif selon les rôles utilisateur
- **Headers sécurisés** avec Helmet.js
- **CORS** configuré strictement selon l'environnement
- **Sanitisation** des données pour éviter les injections NoSQL

### Performance

- **Indexes MongoDB** optimisés pour les requêtes fréquentes
- **Pagination** sur toutes les listes importantes
- **Cache** des requêtes fréquentes (à implémenter)
- **Compression gzip** activée
- **Monitoring** des performances avec métriques détaillées

## Tests

### Lancer les Tests

```bash
# Tests complets
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

### Structure des Tests

```text
tests/
├── unit/
│   ├── models/         # Tests des modèles
│   ├── controllers/    # Tests des contrôleurs  
│   └── utils/          # Tests des utilitaires
├── integration/
│   ├── auth.test.js    # Tests d'authentification
│   ├── users.test.js   # Tests API utilisateurs
│   └── cards.test.js   # Tests API cartes
└── setup.js            # Configuration Jest
```

## Dépendances Principales

### Backend - Production

```json
{
  "express": "^4.18.2",          // Framework web
  "mongoose": "^8.0.3",          // ODM MongoDB
  "bcryptjs": "^2.4.3",          // Hachage mots de passe
  "jsonwebtoken": "^9.0.2",      // Authentification JWT
  "joi": "^17.11.0",             // Validation schémas
  "helmet": "^7.1.0",            // Headers sécurisés
  "cors": "^2.8.5",              // Cross-Origin Resource Sharing
  "morgan": "^1.10.0",           // Logger HTTP
  "winston": "^3.18.3",          // Logger applicatif
  "express-rate-limit": "^7.1.5", // Rate limiting
  "dotenv": "^16.3.1"            // Variables d'environnement
}
```

### Backend - Développement

```json
{
  "nodemon": "^3.0.1",           // Rechargement auto
  "jest": "^29.7.0",             // Framework de tests
  "supertest": "^6.3.3",         // Tests API
  "eslint": "^8.57.0",           // Linter JavaScript
  "prettier": "^3.2.5"           // Formatage code
}
```

## 🌐 Endpoints de Monitoring

```http
GET /api/health     # État de santé de l'API
GET /api/metrics    # Métriques de performance (Admin)
GET /api/docs       # Documentation Swagger interactive
GET /chat           # Interface de chat Socket.io
```

## Déploiement

### Configuration Production

```bash
# Variables d'environnement requises
NODE_ENV=production
MONGODB_URI_ATLAS=mongodb+srv://...
JWT_SECRET=production_secret_very_long_and_secure

# Build et démarrage
npm install --production
npm start
```

### Docker (Backend)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

### Docker (Frontend)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 🧪 Tests par défaut après seed

### Utilisateurs de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `user@example.com` | `Abc123!@#` | User |
| `business@example.com` | `Abc123!@#` | Business |
| `admin@example.com` | `Abc123!@#` | Admin |

### Cartes de test

3 cartes professionnelles sont créées automatiquement avec des données de démonstration.

## 💻 Scripts disponibles

### Backend

```bash
npm run dev       # Mode développement avec nodemon
npm start         # Mode production
npm test          # Lancer les tests Jest
npm run seed      # Initialiser avec données de test
```

### Frontend  

```bash
npm run dev       # Serveur de développement Vite
npm run build     # Build production
npm run preview   # Prévisualiser le build
npm test          # Lancer les tests Vitest
```

## 🚢 URLs de développement

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
- **API Health**: `http://localhost:5001/api/health`
- **Chat Interface**: `http://localhost:5001/chat`
- **API Docs**: `http://localhost:5001/api/docs`

## 🎓 Conformité HackerU

Ce projet respecte tous les standards et exigences du cours HackerU :

✅ **Architecture MVC** avec séparation des couches  
✅ **JWT Authentication** avec payload structuré  
✅ **MongoDB flexible** (local + Atlas)  
✅ **Socket.io Chat** temps réel multi-room  
✅ **Joi Validation** sur toutes les entrées  
✅ **CORS sécurisé** avec whitelist  
✅ **Nodemailer** pour emails transactionnels  
✅ **File System** pour backup JSON  
✅ **Error Handling** global avec logging  
✅ **Initial Data** avec script de seed  
✅ **React TypeScript** avec Vite  
✅ **Context API** pour state management  
✅ **Tailwind CSS** avec dark mode  
✅ **Protected Routes** par rôle  
✅ **Tests automatisés** Jest + Vitest  

## 📄 Licence

**MIT License** - Utilisation libre pour projets personnels et commerciaux.

## 👨‍💻 Auteur

Développé pour le projet final **HackerU Full-Stack Web Development**.

Plateforme professionnelle de gestion de cartes de visite numériques démontrant la maîtrise complète du développement Full-Stack moderne avec les meilleures pratiques de l'industrie.
# CardifY-
