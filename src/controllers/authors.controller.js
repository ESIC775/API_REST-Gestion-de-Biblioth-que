const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const parseId = require("../utils/parseId");

/**
 * Contrôleur pour les auteurs.
 *
 * Un auteur est lié à des livres via la table de jonction BookAuthor (Many-to-Many).
 * Prisma retourne la relation sous la forme : author.books = [{ book: {...} }, ...]
 *
 * Pour simplifier les réponses API, la fonction serializeAuthor() transforme
 * cette structure en : author.books = [{ ...book }, ...]
 * Ce "aplatissement" rend les réponses plus lisibles pour le client.
 */

/**
 * Transforme la structure de relation Many-to-Many de Prisma.
 * Avant : books = [{ bookId, authorId, book: { id, title, ... } }]
 * Après : books = [{ id, title, ... }]
 *
 * @param {object} author - L'auteur brut retourné par Prisma
 * @returns {object} L'auteur avec books aplatis
 */
function serializeAuthor(author) {
  return {
    ...author,
    books: author.books ? author.books.map((item) => item.book) : [],
  };
}

/**
 * GET /api/authors
 * Retourne tous les auteurs avec leurs livres associés.
 */
const listAuthors = asyncHandler(async (req, res) => {
  const authors = await prisma.author.findMany({
    include: {
      books: {
        include: { book: true }, // on navigue à travers la table de jonction BookAuthor
      },
    },
    orderBy: { id: "asc" },
  });

  res.json(authors.map(serializeAuthor));
});

/**
 * GET /api/authors/:id
 * Retourne un auteur spécifique avec ses livres.
 * Répond 404 si l'auteur n'existe pas.
 */
const getAuthorById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const author = await prisma.author.findUnique({
    where: { id },
    include: {
      books: {
        include: { book: true },
      },
    },
  });

  if (!author) {
    const error = new Error("Auteur introuvable.");
    error.statusCode = 404;
    throw error;
  }

  res.json(serializeAuthor(author));
});

/**
 * POST /api/authors
 * Crée un nouvel auteur.
 * req.body contient { name, bio? } validé par Zod.
 * Répond 409 si le nom est déjà utilisé (name @unique dans le schéma).
 */
const createAuthor = asyncHandler(async (req, res) => {
  const author = await prisma.author.create({
    data: req.body,
  });

  res.status(201).json(author);
});

/**
 * PUT /api/authors/:id
 * Met à jour un auteur existant.
 * Prisma lance P2025 si l'ID n'existe pas → errorHandler répond 404.
 */
const updateAuthor = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const author = await prisma.author.update({
    where: { id },
    data: req.body,
  });

  res.json(author);
});

/**
 * DELETE /api/authors/:id
 * Supprime un auteur.
 * Grâce à onDelete: Cascade dans BookAuthor, les associations livre-auteur
 * correspondantes sont supprimées automatiquement (mais pas les livres eux-mêmes).
 */
const deleteAuthor = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await prisma.author.delete({ where: { id } });

  res.status(204).send();
});

module.exports = {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
