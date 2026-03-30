const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const parseId = require("../utils/parseId");

/**
 * Contrôleur pour les livres.
 *
 * Un livre peut avoir plusieurs auteurs (Many-to-Many via BookAuthor).
 * Comme pour les auteurs, on utilise serializeBook() pour aplatir
 * la structure de relation retournée par Prisma.
 *
 * Endpoints spéciaux :
 * - POST /api/books/:bookId/authors/:authorId → attacher un auteur à un livre
 * - DELETE /api/books/:bookId/authors/:authorId → détacher un auteur d'un livre
 */

/**
 * Transforme la structure Many-to-Many Prisma pour les livres.
 * Avant : authors = [{ bookId, authorId, author: { id, name, ... } }]
 * Après : authors = [{ id, name, ... }]
 *
 * @param {object} book - Le livre brut retourné par Prisma
 * @returns {object} Le livre avec authors aplatis
 */
function serializeBook(book) {
  return {
    ...book,
    authors: book.authors ? book.authors.map((item) => item.author) : [],
  };
}

/**
 * GET /api/books
 * Retourne tous les livres avec leurs auteurs et emprunts associés.
 */
const listBooks = asyncHandler(async (req, res) => {
  const books = await prisma.book.findMany({
    include: {
      authors: { include: { author: true } }, // navigation Many-to-Many
      loans: true,
    },
    orderBy: { id: "asc" },
  });

  res.json(books.map(serializeBook));
});

/**
 * GET /api/books/:id
 * Retourne un livre spécifique avec ses auteurs et emprunts.
 * Répond 404 si le livre n'existe pas.
 */
const getBookById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      authors: { include: { author: true } },
      loans: true,
    },
  });

  if (!book) {
    const error = new Error("Livre introuvable.");
    error.statusCode = 404;
    throw error;
  }

  res.json(serializeBook(book));
});

/**
 * POST /api/books
 * Crée un nouveau livre et peut associer des auteurs en même temps.
 * req.body contient { title, isbn, publicationYear, authorIds?: [] } validé par Zod.
 *
 * Si authorIds est fourni et non vide, on crée les entrées dans BookAuthor
 * directement dans la même requête Prisma grâce à l'imbrication create/connect.
 */
const createBook = asyncHandler(async (req, res) => {
  // On sépare authorIds du reste des données du livre
  const { authorIds = [], ...bookData } = req.body;

  const book = await prisma.book.create({
    data: {
      ...bookData,
      authors: authorIds.length
        ? {
            // create des entrées dans BookAuthor en connectant les auteurs existants
            create: authorIds.map((authorId) => ({
              author: { connect: { id: authorId } },
            })),
          }
        : undefined,
    },
    include: {
      authors: { include: { author: true } },
      loans: true,
    },
  });

  res.status(201).json(serializeBook(book));
});

/**
 * PUT /api/books/:id
 * Met à jour un livre. Si authorIds est fourni, on remplace toutes les associations :
 * 1. deleteMany : supprime toutes les entrées BookAuthor existantes pour ce livre
 * 2. create     : recrée les nouvelles associations
 *
 * Cette approche garantit que la liste d'auteurs est toujours cohérente avec authorIds.
 */
const updateBook = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { authorIds, ...bookData } = req.body;

  const data = { ...bookData };

  if (authorIds) {
    // Remplacement complet des associations auteurs
    data.authors = {
      deleteMany: {}, // supprime toutes les associations existantes
      create: authorIds.map((authorId) => ({
        author: { connect: { id: authorId } },
      })),
    };
  }

  const book = await prisma.book.update({
    where: { id },
    data,
    include: {
      authors: { include: { author: true } },
      loans: true,
    },
  });

  res.json(serializeBook(book));
});

/**
 * DELETE /api/books/:id
 * Supprime un livre.
 * Grâce à onDelete: Cascade, les entrées BookAuthor et les emprunts associés
 * sont supprimés automatiquement.
 */
const deleteBook = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await prisma.book.delete({ where: { id } });

  res.status(204).send();
});

/**
 * POST /api/books/:bookId/authors/:authorId
 * Associe un auteur existant à un livre existant.
 * Crée une entrée dans la table de jonction BookAuthor.
 * Répond 409 si l'association existe déjà (clé composée [bookId, authorId] @unique).
 */
const attachAuthorToBook = asyncHandler(async (req, res) => {
  const bookId = parseId(req.params.bookId);
  const authorId = parseId(req.params.authorId);

  await prisma.bookAuthor.create({
    data: { bookId, authorId },
  });

  // On retourne le livre mis à jour avec les auteurs
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      authors: { include: { author: true } },
      loans: true,
    },
  });

  res.json(serializeBook(book));
});

/**
 * DELETE /api/books/:bookId/authors/:authorId
 * Dissocie un auteur d'un livre.
 * Supprime l'entrée correspondante dans BookAuthor sans toucher l'auteur ni le livre.
 */
const detachAuthorFromBook = asyncHandler(async (req, res) => {
  const bookId = parseId(req.params.bookId);
  const authorId = parseId(req.params.authorId);

  // On cible la clé composée définie par @@id([bookId, authorId]) dans le schéma
  await prisma.bookAuthor.delete({
    where: {
      bookId_authorId: { bookId, authorId },
    },
  });

  res.status(204).send();
});

module.exports = {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  attachAuthorToBook,
  detachAuthorFromBook,
};
