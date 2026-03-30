# API REST – Gestion de Bibliothèque

## Contexte et objectifs

Ce projet est une API RESTful de gestion d'une bibliothèque. Elle permet de gérer les **utilisateurs**, leurs **profils**, les **livres**, les **auteurs** et les **emprunts**.

L'application répond au besoin de numériser la gestion d'un fond documentaire : savoir qui a emprunté quel livre, quels auteurs ont écrit quels ouvrages, et gérer les retours.

Elle illustre les trois types de relations relationnelles :

- **One-to-One** : Utilisateur ↔ Profil
- **One-to-Many** : Utilisateur → Emprunts
- **Many-to-Many** : Livres ↔ Auteurs

---

## Stack technique

| Technologie                 | Rôle                                         |
| --------------------------- | -------------------------------------------- |
| **Node.js + Express**       | Serveur HTTP et routage REST                 |
| **Prisma ORM**              | Accès à la base de données, migrations, seed |
| **MySQL 8**                 | Base de données relationnelle                |
| **Zod**                     | Validation des corps de requête              |
| **Swagger UI**              | Documentation interactive de l'API           |
| **Jest + Supertest**        | Tests d'intégration                          |
| **Docker + Docker Compose** | Conteneurisation et orchestration            |

---

## Lancement avec Docker

```bash
# Construire et démarrer les conteneurs (API + MySQL)
docker compose up --build
```

L'API sera disponible sur `http://localhost:3002`.  
La documentation Swagger : `http://localhost:3002/api-docs`  
La base est automatiquement synchronisée et peuplée au premier démarrage.

Pour arrêter :

```bash
docker compose down
```

Pour tout remettre à zéro (volumes compris) :

```bash
docker compose down -v
```

---

## Lancement en local (sans Docker)

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations (MySQL doit être démarré)
npx prisma migrate dev

# Peupler la base avec les données de test
npm run db:seed

# Démarrer en mode développement (rechargement automatique)
npm run dev
```

---

## Variables d'environnement

Copier `.env.example` en `.env` et adapter les valeurs :

```bash
cp .env.example .env
```

| Variable              | Description                        | Valeur par défaut                      |
| --------------------- | ---------------------------------- | -------------------------------------- |
| `PORT`                | Port d'écoute de l'API             | `3000`                                 |
| `DATABASE_URL`        | URL de connexion Prisma (MySQL)    | `mysql://root:root@db:3306/library_db` |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL (Docker)   | `root`                                 |
| `MYSQL_DATABASE`      | Nom de la base de données (Docker) | `library_db`                           |

---

## Architecture Docker

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
     (navigateur / Postman / Swagger)
```

| Conteneur       | Image       | Port hôte |
| --------------- | ----------- | --------- |
| `library_api`   | build local | `3002`    |
| `library_mysql` | `mysql:8.0` | `3308`    |

---

## Documentation Swagger

Une fois l'API démarrée, la documentation interactive est disponible à :

**`http://localhost:3002/api-docs`**

Pour importer dans Postman : **`http://localhost:3002/api-docs.json`**

Elle liste tous les endpoints avec leurs paramètres, corps de requête et codes de réponse.

---

## Routes principales

### Utilisateurs

| Méthode | Route            | Description                   |
| ------- | ---------------- | ----------------------------- |
| GET     | `/api/users`     | Lister tous les utilisateurs  |
| GET     | `/api/users/:id` | Obtenir un utilisateur par ID |
| POST    | `/api/users`     | Créer un utilisateur          |
| PUT     | `/api/users/:id` | Modifier un utilisateur       |
| DELETE  | `/api/users/:id` | Supprimer un utilisateur      |

**Exemple — Créer un utilisateur :**

```json
POST /api/users
{
  "name": "Alice Martin",
  "email": "alice@example.com"
}
// Réponse 201
{
  "id": 1,
  "name": "Alice Martin",
  "email": "alice@example.com",
  "createdAt": "2026-03-30T12:00:00.000Z"
}
```

### Livres

| Méthode | Route                                  | Description                    |
| ------- | -------------------------------------- | ------------------------------ |
| GET     | `/api/books`                           | Lister tous les livres         |
| GET     | `/api/books/:id`                       | Obtenir un livre par ID        |
| POST    | `/api/books`                           | Créer un livre                 |
| PUT     | `/api/books/:id`                       | Modifier un livre              |
| DELETE  | `/api/books/:id`                       | Supprimer un livre             |
| POST    | `/api/books/:bookId/authors/:authorId` | Associer un auteur à un livre  |
| DELETE  | `/api/books/:bookId/authors/:authorId` | Dissocier un auteur d'un livre |

### Emprunts

| Méthode | Route                   | Description                    |
| ------- | ----------------------- | ------------------------------ |
| GET     | `/api/loans`            | Lister tous les emprunts       |
| POST    | `/api/loans`            | Créer un emprunt               |
| PATCH   | `/api/loans/:id/return` | Marquer un emprunt comme rendu |
| DELETE  | `/api/loans/:id`        | Supprimer un emprunt           |

### Auteurs

| Méthode | Route              | Description             |
| ------- | ------------------ | ----------------------- |
| GET     | `/api/authors`     | Lister tous les auteurs |
| POST    | `/api/authors`     | Créer un auteur         |
| PUT     | `/api/authors/:id` | Modifier un auteur      |
| DELETE  | `/api/authors/:id` | Supprimer un auteur     |

### Profils

| Méthode | Route               | Description              |
| ------- | ------------------- | ------------------------ |
| GET     | `/api/profiles/:id` | Obtenir un profil par ID |
| POST    | `/api/profiles`     | Créer un profil          |
| PATCH   | `/api/profiles/:id` | Modifier un profil       |

---

## Données de test (seed)

Le fichier `prisma/seed.js` insère automatiquement :

- 2 utilisateurs : **Alice** et **Bob**
- 2 profils associés
- 2 auteurs : **Robert C. Martin** et **Martin Fowler**
- 2 livres : **Clean Code** et **Patterns of Enterprise Application Architecture**
- 1 emprunt actif (Alice emprunte Clean Code)

Pour ré-exécuter le seed manuellement :

```bash
npm run db:seed
```

---

## Tests

```bash
# Lancer tous les tests
npm test
```

Les tests utilisent **Jest** et **Supertest**. Ils couvrent :

- `GET /health` → vérification du statut de l'API
- `GET /api/users` → liste des utilisateurs
- `POST /api/users` → création et doublon (409)
- Route inconnue → 404
- `POST /api/loans` → règle métier (doublon d'emprunt refusé)

---

## Docker Hub

L'image Docker de l'API est disponible sur Docker Hub :

**🔗 `https://hub.docker.com/r/mohameddaoudmed247/library-api`**

```bash
docker pull mohameddaoudmed247/library-api:latest
```

Pour lancer uniquement le conteneur API (MySQL séparé) :

```bash
docker run -p 3002:3000 \
  -e DATABASE_URL="mysql://root:root@host.docker.internal:3306/library_db" \
  mohameddaoudmed247/library-api:latest
```

### Volume Docker

Un volume nommé `mysql_data` est configuré dans `docker-compose.yml` pour assurer la **persistance des données MySQL** entre les redémarrages du conteneur :

```yaml
volumes:
  mysql_data:

services:
  db:
    volumes:
      - mysql_data:/var/lib/mysql
```

Les données ne sont pas perdues si le conteneur est arrêté (`docker compose stop`). Pour tout effacer : `docker compose down -v`.

---

## Structure du projet

```
Projet-SAE-API-REST/
├── prisma/
│   ├── schema.prisma       # Modèles de données (User, Profile, Book, Author, Loan)
│   └── seed.js             # Données initiales
├── src/
│   ├── app.js              # Configuration Express (middlewares, routes, swagger)
│   ├── server.js           # Point d'entrée HTTP
│   ├── config/
│   │   └── prisma.js       # Instance unique PrismaClient
│   ├── controllers/        # Logique métier par ressource
│   ├── routes/             # Définition des endpoints
│   ├── middlewares/        # validate, notFound, errorHandler
│   ├── validators/         # Schémas Zod par ressource
│   ├── utils/              # asyncHandler, parseId
│   └── docs/
│       └── swagger.js      # Spécification OpenAPI 3.0
├── tests/
│   └── api.test.js         # Tests d'intégration
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```
