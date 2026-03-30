const { Router } = require("express");
const validate = require("../middlewares/validate");
const {
  createBookSchema,
  updateBookSchema,
} = require("../validators/book.schema");
const {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  attachAuthorToBook,
  detachAuthorFromBook,
} = require("../controllers/books.controller");

/**
 * Routes pour les livres.
 *
 * CRUD classique :
 * GET    /api/books                           → liste tous les livres
 * GET    /api/books/:id                       → récupère un livre par ID
 * POST   /api/books                           → crée un livre (avec authorIds optionnel)
 * PUT    /api/books/:id                       → met à jour un livre
 * DELETE /api/books/:id                       → supprime un livre
 *
 * Gestion de la relation Many-to-Many Livre ↔ Auteur :
 * POST   /api/books/:bookId/authors/:authorId → attache un auteur à un livre
 * DELETE /api/books/:bookId/authors/:authorId → détache un auteur d'un livre
 *
 * Ces deux derniers endpoints permettent de gérer les associations
 * sans passer par le body (les IDs sont dans l'URL).
 */
const router = Router();

// Routes CRUD
router.get("/", listBooks);
router.get("/:id", getBookById);
router.post("/", validate(createBookSchema), createBook);
router.put("/:id", validate(updateBookSchema), updateBook);
router.delete("/:id", deleteBook);

// Routes de gestion des associations Livre ↔ Auteur
router.post("/:bookId/authors/:authorId", attachAuthorToBook);
router.delete("/:bookId/authors/:authorId", detachAuthorFromBook);

module.exports = router;
