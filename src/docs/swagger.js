/**
 * Configuration de la documentation Swagger / OpenAPI 3.0.
 *
 * Ce fichier définit manuellement la spécification OpenAPI de l'API.
 * Elle est servie via swagger-ui-express dans app.js sur la route /api-docs.
 *
 * Accès : http://localhost:3000/api-docs
 *
 * La documentation couvre tous les endpoints avec :
 * - les paramètres de requête (path params, body)
 * - les codes de réponse HTTP
 * - des exemples de payload
 *
 * Pour ajouter un nouvel endpoint : ajouter une entrée dans swaggerSpec.paths.
 */
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Library API",
    version: "1.0.0",
    description:
      "API REST de gestion de bibliothèque. Permet de gérer les utilisateurs, leurs profils, les livres, les auteurs et les emprunts.",
  },
  servers: [
    {
      url: "http://localhost:3002",
      description: "Serveur local de développement",
    },
  ],
  tags: [
    { name: "Health", description: "Santé du serveur" },
    { name: "Utilisateurs", description: "Gestion des utilisateurs" },
    { name: "Profils", description: "Profils des utilisateurs (One-to-One)" },
    { name: "Auteurs", description: "Gestion des auteurs" },
    {
      name: "Livres",
      description:
        "Gestion des livres et associations avec les auteurs (Many-to-Many)",
    },
    { name: "Emprunts", description: "Gestion des emprunts (One-to-Many)" },
  ],
  paths: {
    // ─── Santé ───────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Vérifier que le serveur fonctionne",
        responses: {
          200: { description: "Serveur opérationnel" },
        },
      },
    },

    // ─── Utilisateurs ────────────────────────────────────────────────────────
    "/api/users": {
      get: {
        tags: ["Utilisateurs"],
        summary: "Lister tous les utilisateurs",
        responses: {
          200: {
            description:
              "Liste des utilisateurs avec leur profil et leurs emprunts",
          },
        },
      },
      post: {
        tags: ["Utilisateurs"],
        summary: "Créer un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email"],
                properties: {
                  name: { type: "string", example: "Alice Martin" },
                  email: { type: "string", example: "alice@example.com" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Utilisateur créé" },
          400: { description: "Données invalides (Zod)" },
          409: { description: "Email déjà utilisé" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Utilisateurs"],
        summary: "Récupérer un utilisateur par ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Utilisateur trouvé" },
          404: { description: "Utilisateur introuvable" },
        },
      },
      put: {
        tags: ["Utilisateurs"],
        summary: "Mettre à jour un utilisateur",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Alice Dupont" },
                  email: {
                    type: "string",
                    example: "alice.dupont@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Utilisateur mis à jour" },
          404: { description: "Utilisateur introuvable" },
        },
      },
      delete: {
        tags: ["Utilisateurs"],
        summary: "Supprimer un utilisateur",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Utilisateur supprimé" },
          404: { description: "Utilisateur introuvable" },
        },
      },
    },

    // ─── Profils ─────────────────────────────────────────────────────────────
    "/api/profiles": {
      post: {
        tags: ["Profils"],
        summary: "Créer un profil utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["address", "phone", "userId"],
                properties: {
                  address: { type: "string", example: "12 rue de Paris, Lyon" },
                  phone: { type: "string", example: "0600000001" },
                  userId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Profil créé" },
          409: { description: "Profil déjà existant pour cet utilisateur" },
        },
      },
    },
    "/api/profiles/{id}": {
      get: {
        tags: ["Profils"],
        summary: "Récupérer un profil par ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Profil trouvé" },
          404: { description: "Profil introuvable" },
        },
      },
      patch: {
        tags: ["Profils"],
        summary: "Mettre à jour partiellement un profil",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  address: {
                    type: "string",
                    example: "8 avenue Victor Hugo, Marseille",
                  },
                  phone: { type: "string", example: "0600000099" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profil mis à jour" },
          404: { description: "Profil introuvable" },
        },
      },
    },

    // ─── Auteurs ─────────────────────────────────────────────────────────────
    "/api/authors": {
      get: {
        tags: ["Auteurs"],
        summary: "Lister tous les auteurs avec leurs livres",
        responses: {
          200: { description: "Liste des auteurs" },
        },
      },
      post: {
        tags: ["Auteurs"],
        summary: "Créer un auteur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Robert C. Martin" },
                  bio: { type: "string", example: "Auteur de Clean Code." },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Auteur créé" },
          409: { description: "Nom d'auteur déjà existant" },
        },
      },
    },
    "/api/authors/{id}": {
      get: {
        tags: ["Auteurs"],
        summary: "Récupérer un auteur par ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Auteur trouvé" },
          404: { description: "Auteur introuvable" },
        },
      },
      put: {
        tags: ["Auteurs"],
        summary: "Mettre à jour un auteur",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  bio: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Auteur mis à jour" },
          404: { description: "Auteur introuvable" },
        },
      },
      delete: {
        tags: ["Auteurs"],
        summary: "Supprimer un auteur",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Auteur supprimé" },
          404: { description: "Auteur introuvable" },
        },
      },
    },

    // ─── Livres ───────────────────────────────────────────────────────────────
    "/api/books": {
      get: {
        tags: ["Livres"],
        summary: "Lister tous les livres avec leurs auteurs",
        responses: {
          200: { description: "Liste des livres" },
        },
      },
      post: {
        tags: ["Livres"],
        summary: "Créer un livre (avec auteurs optionnels)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "isbn", "publicationYear"],
                properties: {
                  title: { type: "string", example: "Clean Code" },
                  isbn: { type: "string", example: "9780132350884" },
                  publicationYear: { type: "integer", example: 2008 },
                  authorIds: {
                    type: "array",
                    items: { type: "integer" },
                    example: [1],
                    description: "IDs des auteurs à associer (optionnel)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Livre créé" },
          409: { description: "ISBN déjà existant" },
        },
      },
    },
    "/api/books/{id}": {
      get: {
        tags: ["Livres"],
        summary: "Récupérer un livre par ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Livre trouvé" },
          404: { description: "Livre introuvable" },
        },
      },
      put: {
        tags: ["Livres"],
        summary: "Mettre à jour un livre",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  isbn: { type: "string" },
                  publicationYear: { type: "integer" },
                  authorIds: { type: "array", items: { type: "integer" } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Livre mis à jour" },
          404: { description: "Livre introuvable" },
        },
      },
      delete: {
        tags: ["Livres"],
        summary: "Supprimer un livre",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Livre supprimé" },
          404: { description: "Livre introuvable" },
        },
      },
    },
    "/api/books/{bookId}/authors/{authorId}": {
      post: {
        tags: ["Livres"],
        summary: "Associer un auteur à un livre (Many-to-Many)",
        parameters: [
          {
            in: "path",
            name: "bookId",
            required: true,
            schema: { type: "integer" },
          },
          {
            in: "path",
            name: "authorId",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Auteur associé au livre" },
          409: { description: "Association déjà existante" },
        },
      },
      delete: {
        tags: ["Livres"],
        summary: "Dissocier un auteur d'un livre",
        parameters: [
          {
            in: "path",
            name: "bookId",
            required: true,
            schema: { type: "integer" },
          },
          {
            in: "path",
            name: "authorId",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Association supprimée" },
          404: { description: "Association introuvable" },
        },
      },
    },

    // ─── Emprunts ─────────────────────────────────────────────────────────────
    "/api/loans": {
      get: {
        tags: ["Emprunts"],
        summary: "Lister tous les emprunts",
        responses: {
          200: { description: "Liste des emprunts avec utilisateur et livre" },
        },
      },
      post: {
        tags: ["Emprunts"],
        summary: "Créer un emprunt",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "bookId"],
                properties: {
                  userId: { type: "integer", example: 1 },
                  bookId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Emprunt créé" },
          409: { description: "Livre déjà emprunté" },
        },
      },
    },
    "/api/loans/{id}": {
      get: {
        tags: ["Emprunts"],
        summary: "Récupérer un emprunt par ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Emprunt trouvé" },
          404: { description: "Emprunt introuvable" },
        },
      },
      delete: {
        tags: ["Emprunts"],
        summary: "Supprimer un emprunt",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Emprunt supprimé" },
          404: { description: "Emprunt introuvable" },
        },
      },
    },
    "/api/loans/{id}/return": {
      patch: {
        tags: ["Emprunts"],
        summary: "Enregistrer le retour d'un livre",
        description:
          "Met le statut à RETURNED et définit returnDate à maintenant.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Retour enregistré" },
          404: { description: "Emprunt introuvable" },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
