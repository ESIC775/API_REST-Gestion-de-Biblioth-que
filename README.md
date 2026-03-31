# API REST – Gestion de Bibliothèque

---

## Table des matières

1. [Fonctionnalités](#1-fonctionnalités)
2. [Architecture et qualité du code](#2-architecture-et-qualité-du-code)
3. [Conteneurisation et déploiement](#3-conteneurisation-et-déploiement)
4. [Tests et documentation](#4-tests-et-documentation)

---

## 1. Fonctionnalités

### Description du sujet

Ce projet est une **API RESTful de gestion de bibliothèque**. Elle permet de numériser le suivi d'un fonds documentaire : enregistrer des utilisateurs, gérer leurs profils, référencer des livres et leurs auteurs, et suivre les emprunts (date de prêt, retour, statut).

Le domaine choisi — la bibliothèque — illustre naturellement les trois types de relations relationnelles et offre une cohérence métier réelle (un livre ne peut pas être emprunté deux fois en même temps, un profil est unique par utilisateur, etc.).

### Fonctionnalités implémentées

**CRUD complet sur chaque ressource :**

| Ressource    | CREATE | READ (liste + par ID) |   UPDATE    | DELETE |
| ------------ | :----: | :-------------------: | :---------: | :----: |
| Utilisateurs |   ✅   |          ✅           |     ✅      |   ✅   |
| Profils      |   ✅   |          ✅           |     ✅      |   ✅   |
| Livres       |   ✅   |          ✅           |     ✅      |   ✅   |
| Auteurs      |   ✅   |          ✅           |     ✅      |   ✅   |
| Emprunts     |   ✅   |          ✅           | ✅ (retour) |   ✅   |

**Règles métier spécifiques :**

- Un utilisateur ne peut pas emprunter le même livre deux fois simultanément (retour 409)
- La suppression d'un utilisateur entraîne la suppression en cascade de son profil et de ses emprunts (`onDelete: Cascade`)
- Un emprunt passe par trois statuts : `BORROWED`, `RETURNED`, `OVERDUE`
- Un auteur peut être associé/dissocié d'un livre via des routes dédiées

**Gestion des erreurs :**

Toutes les erreurs sont interceptées de façon centralisée et renvoient des réponses JSON structurées :

| Code HTTP | Cause                                                               |
| --------- | ------------------------------------------------------------------- |
| `400`     | Données invalides (Zod) ou clé étrangère inexistante (Prisma P2003) |
| `404`     | Ressource introuvable (Prisma P2025 ou route inconnue)              |
| `409`     | Conflit d'unicité : email/ISBN déjà existant (Prisma P2002)         |
| `500`     | Erreur serveur inattendue                                           |

### Gestion des relations

| Type                   | Modèles concernés  | Implémentation Prisma                                                                  |
| ---------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| **1-1** (One-to-One)   | `User` ↔ `Profile` | `userId @unique` + `Profile?` sur `User`                                               |
| **1-n** (One-to-Many)  | `User` → `Loan[]`  | `userId` sur `Loan` + `loans Loan[]` sur `User`                                        |
| **1-n** (One-to-Many)  | `Book` → `Loan[]`  | `bookId` sur `Loan` + `loans Loan[]` sur `Book`                                        |
| **n-n** (Many-to-Many) | `Book` ↔ `Author`  | Table de jointure explicite `BookAuthor` avec clé composite `@@id([bookId, authorId])` |

La relation Many-to-Many est gérée via une **table de jointure explicite** (`BookAuthor`) pour permettre d'associer et dissocier les auteurs à la demande via des routes REST dédiées :

```
POST   /api/books/:bookId/authors/:authorId  → attacher un auteur
DELETE /api/books/:bookId/authors/:authorId  → détacher un auteur
```

### Cohérence avec le domaine choisi

Le domaine de la bibliothèque est pleinement exploité :

- Les trois types de relations relationnelles sont présents et justifiés par le métier
- Le champ `status` sur `Loan` (enum : `BORROWED` / `RETURNED` / `OVERDUE`) modélise le cycle de vie réel d'un emprunt
- La route `PATCH /api/loans/:id/return` correspond à une action métier explicite (retour d'un livre)
- Les données de seed (`prisma/seed.js`) reproduisent un scénario réaliste : deux membres, deux auteurs reconnus, deux livres techniques, un emprunt actif

---

## 2. Architecture et qualité du code

### Stack technique

| Technologie                 | Rôle                                         |
| --------------------------- | -------------------------------------------- |
| **Node.js + Express**       | Serveur HTTP et routage REST                 |
| **Prisma ORM**              | Accès à la base de données, migrations, seed |
| **MySQL 8**                 | Base de données relationnelle                |
| **Zod**                     | Validation des corps de requête              |
| **Swagger UI**              | Documentation interactive de l'API           |
| **Jest + Supertest**        | Tests d'intégration                          |
| **Docker + Docker Compose** | Conteneurisation et orchestration            |

### Structure du projet

```
Projet-SAE-API-REST/
├── prisma/
│   ├── schema.prisma       # Modèles de données (User, Profile, Book, Author, Loan)
│   └── seed.js             # Données initiales de démonstration
├── src/
│   ├── app.js              # Configuration Express (middlewares, routes, Swagger)
│   ├── server.js           # Point d'entrée HTTP
│   ├── config/
│   │   └── prisma.js       # Instance unique PrismaClient (singleton)
│   ├── controllers/        # Logique métier par ressource
│   │   ├── users.controller.js
│   │   ├── profiles.controller.js
│   │   ├── books.controller.js
│   │   ├── authors.controller.js
│   │   └── loans.controller.js
│   ├── routes/             # Définition des endpoints, un fichier par ressource
│   │   └── index.js        # Agrège toutes les routes sous /api
│   ├── middlewares/
│   │   ├── validate.js     # Validation Zod avant chaque contrôleur
│   │   ├── notFound.js     # Handler 404 pour routes inconnues
│   │   └── errorHandler.js # Gestion centralisée des erreurs
│   ├── validators/         # Schémas Zod par ressource
│   └── utils/
│       ├── asyncHandler.js # Wrapper pour éviter les try/catch répétitifs
│       └── parseId.js      # Parse et valide les paramètres :id (entier > 0)
├── tests/
│   └── api.test.js         # Tests d'intégration Jest + Supertest
├── docs/
│   └── swagger.js          # Spécification OpenAPI 3.0
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

Le code suit une architecture **MVC allégée** : routes → controllers → Prisma. Chaque couche a une responsabilité unique, ce qui facilite la maintenance et l'extension.

### Qualité du code

- **Lisibilité** : chaque fichier est documenté avec des JSDoc décrivant le rôle de chaque fonction, les paramètres et les codes de retour
- **Modularité** : un fichier par ressource dans `controllers/`, `routes/` et `validators/` ; les utilitaires transversaux sont isolés dans `utils/`
- **Normes** : nommage en camelCase, constantes nommées explicitement, pas de logique dans les routes
- **Commentaires utiles** : les commentaires expliquent le _pourquoi_ (ex : raison d'un `serializeBook()` pour aplatir la relation Prisma Many-to-Many), pas seulement le _quoi_

### Usage pertinent de l'ORM (Prisma)

Prisma est utilisé de façon idiomatique :

- **`include` imbriqués** pour charger les relations en une seule requête (ex : livre + auteurs + emprunts)
- **Table de jointure explicite** `BookAuthor` pour la relation Many-to-Many, permettant `connect` / `disconnect` via les routes dédiées
- **`onDelete: Cascade`** défini au niveau du schéma pour garantir la cohérence référentielle sans logique manuelle
- **Instance singleton** `PrismaClient` dans `src/config/prisma.js` pour éviter les fuites de connexion
- **Enum** `LoanStatus` géré directement par Prisma pour le typage fort du statut d'emprunt

### Gestion des erreurs et exceptions

La gestion des erreurs est **centralisée et structurée** en trois niveaux :

1. **`asyncHandler`** (`utils/asyncHandler.js`) : wrapper autour de chaque contrôleur async qui transmet automatiquement les exceptions à `next(err)`, évitant les blocs try/catch répétitifs
2. **`validate`** (`middlewares/validate.js`) : middleware de validation Zod exécuté avant le contrôleur — renvoie un 400 détaillé si le corps de la requête ne respecte pas le schéma
3. **`errorHandler`** (`middlewares/errorHandler.js`) : middleware final qui distingue trois types d'erreurs :
   - `ZodError` → 400 avec la liste des champs invalides
   - `PrismaClientKnownRequestError` → 409 (P2002 unicité), 400 (P2003 FK), 404 (P2025 introuvable)
   - Erreur générique → 500 ou `err.statusCode` si défini

### Versionnage Git

- Commits atomiques et descriptifs, un commit par fonctionnalité ou correctif
- Structure du dépôt claire : code source dans `src/`, configuration dans la racine, tests isolés dans `tests/`
- Fichier `.gitignore` excluant `node_modules/`, `.env` et les artefacts de build

---

## 3. Conteneurisation et déploiement

### Dockerfile

L'image est construite à partir de **`node:20-alpine`** (image légère) :

```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl   # requis par Prisma
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start"]
```

- Séparation des étapes `COPY package*.json` + `RUN npm install` avant `COPY . .` pour exploiter le **cache des couches Docker**
- `openssl` installé car requis par le client Prisma sur Alpine

### Orchestration via Docker Compose

Le fichier `docker-compose.yml` orchestre deux services :

```
┌─────────────────────────────────────────────────┐
│                Docker Network                    │
│                                                 │
│  ┌───────────────────┐    ┌──────────────────┐  │
│  │   library_api     │───▶│  library_mysql   │  │
│  │  Node.js/Express  │    │   MySQL 8.0      │  │
│  │  Prisma ORM       │    │   library_db     │  │
│  │  port interne 3000│    │   port interne   │  │
│  └────────┬──────────┘    │   3306           │  │
│           │               └──────────────────┘  │
└───────────┼─────────────────────────────────────┘
            │
     localhost:3002
```

| Conteneur       | Image       | Port hôte |
| --------------- | ----------- | --------- |
| `library_api`   | build local | `3002`    |
| `library_mysql` | `mysql:8.0` | `3308`    |

Points notables :

- **`depends_on` avec `condition: service_healthy`** : l'API attend que MySQL soit prêt avant de démarrer (healthcheck `mysqladmin ping`)
- **Volume nommé `mysql_data`** : les données MySQL persistent entre les redémarrages (`docker compose stop` ne les efface pas)
- **Variables d'environnement** paramétrables via `.env` avec valeurs par défaut dans le compose

### Déploiement local

```bash
# Démarrer l'ensemble (API + MySQL) — première fois
docker compose up --build

# Démarrages suivants (sans rebuild)
docker compose up

# Arrêter sans supprimer les données
docker compose stop

# Tout supprimer (conteneurs + volumes)
docker compose down -v
```

L'API est accessible sur `http://localhost:3002` dès que les deux conteneurs sont sains.

### Image Docker Hub

L'image de l'API est publiée sur Docker Hub :

**`https://hub.docker.com/r/mohameddaoudmed247/library-api`**

```bash
# Récupérer l'image
docker pull mohameddaoudmed247/library-api:latest

# Lancer avec une base MySQL existante
docker run -p 3002:3000 \
  -e DATABASE_URL="mysql://root:root@host.docker.internal:3306/library_db" \
  mohameddaoudmed247/library-api:latest
```

> Pour un déploiement complet (API + base), utiliser `docker compose up` avec le `docker-compose.yml` fourni dans ce dépôt.

---

## 4. Tests et documentation

### Tests automatisés

Les tests sont écrits avec **Jest** et **Supertest** (`tests/api.test.js`). Supertest injecte les requêtes directement dans l'application Express sans démarrer un vrai serveur réseau.

```bash
npm test
```

| Test                                  | Couverture                        |
| ------------------------------------- | --------------------------------- |
| `GET /health`                         | Retourne 200 + `{ status: "ok" }` |
| `GET /api/users`                      | Retourne 200 avec un tableau      |
| `POST /api/users`                     | Crée un utilisateur → 201 avec ID |
| `POST /api/users` (doublon)           | Email déjà utilisé → 409          |
| Route inconnue                        | → 404                             |
| `POST /api/loans` (doublon d'emprunt) | Même livre déjà emprunté → 409    |

Les tests nettoient les données qu'ils créent (`afterAll`) pour ne pas polluer la base.

### Documentation de l'API

**Swagger UI** est intégré et accessible une fois l'API démarrée :

| URL                                   | Contenu                                    |
| ------------------------------------- | ------------------------------------------ |
| `http://localhost:3002/api-docs`      | Interface Swagger interactive              |
| `http://localhost:3002/api-docs.json` | Spécification OpenAPI 3.0 (import Postman) |

La documentation liste tous les endpoints avec leurs paramètres, corps de requête attendus et codes de réponse.

### Endpoints disponibles

| Méthode | Route                                  | Description                    |
| ------- | -------------------------------------- | ------------------------------ |
| GET     | `/api/users`                           | Lister tous les utilisateurs   |
| GET     | `/api/users/:id`                       | Obtenir un utilisateur par ID  |
| POST    | `/api/users`                           | Créer un utilisateur           |
| PUT     | `/api/users/:id`                       | Modifier un utilisateur        |
| DELETE  | `/api/users/:id`                       | Supprimer un utilisateur       |
| GET     | `/api/profiles/:id`                    | Obtenir un profil par ID       |
| POST    | `/api/profiles`                        | Créer un profil                |
| PATCH   | `/api/profiles/:id`                    | Modifier un profil             |
| GET     | `/api/books`                           | Lister tous les livres         |
| GET     | `/api/books/:id`                       | Obtenir un livre par ID        |
| POST    | `/api/books`                           | Créer un livre                 |
| PUT     | `/api/books/:id`                       | Modifier un livre              |
| DELETE  | `/api/books/:id`                       | Supprimer un livre             |
| POST    | `/api/books/:bookId/authors/:authorId` | Associer un auteur à un livre  |
| DELETE  | `/api/books/:bookId/authors/:authorId` | Dissocier un auteur d'un livre |
| GET     | `/api/authors`                         | Lister tous les auteurs        |
| POST    | `/api/authors`                         | Créer un auteur                |
| PUT     | `/api/authors/:id`                     | Modifier un auteur             |
| DELETE  | `/api/authors/:id`                     | Supprimer un auteur            |
| GET     | `/api/loans`                           | Lister tous les emprunts       |
| POST    | `/api/loans`                           | Créer un emprunt               |
| PATCH   | `/api/loans/:id/return`                | Marquer un emprunt comme rendu |
| DELETE  | `/api/loans/:id`                       | Supprimer un emprunt           |

### Instructions de lancement

#### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

#### Avec Docker (recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-repo>/Projet-SAE-API-REST.git
cd Projet-SAE-API-REST

# 2. Démarrer l'ensemble (API + MySQL)
docker compose up --build
```

- API : `http://localhost:3002`
- Swagger : `http://localhost:3002/api-docs`

La base de données est automatiquement initialisée et peuplée avec des données de démonstration.

#### Sans Docker (en local)

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et configurer les variables d'environnement
cp .env.example .env

# 3. Générer le client Prisma
npm run prisma:generate

# 4. Appliquer le schéma (MySQL doit être accessible)
npx prisma db push

# 5. Peupler la base
npm run db:seed

# 6. Démarrer en mode développement
npm run dev
```

#### Variables d'environnement

| Variable              | Description                        | Valeur par défaut                      |
| --------------------- | ---------------------------------- | -------------------------------------- |
| `PORT`                | Port d'écoute de l'API             | `3000`                                 |
| `DATABASE_URL`        | URL de connexion Prisma (MySQL)    | `mysql://root:root@db:3306/library_db` |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL (Docker)   | `root`                                 |
| `MYSQL_DATABASE`      | Nom de la base de données (Docker) | `library_db`                           |

#### Données de seed

Le seed (`prisma/seed.js`) insère automatiquement :

- 2 utilisateurs : **Alice** et **Bob**
- 2 profils associés (adresse + téléphone)
- 2 auteurs : **Robert C. Martin** et **Martin Fowler**
- 2 livres : **Clean Code** et **Patterns of Enterprise Application Architecture**
- 1 emprunt actif (Alice emprunte Clean Code)

```bash
# Ré-exécuter le seed manuellement
npm run db:seed
```
