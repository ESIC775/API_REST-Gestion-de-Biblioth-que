const { Router } = require("express");
const validate = require("../middlewares/validate");
const {
  createAuthorSchema,
  updateAuthorSchema,
} = require("../validators/author.schema");
const {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authors.controller");

/**
 * Routes pour les auteurs.
 *
 * GET    /api/authors        → liste tous les auteurs avec leurs livres
 * GET    /api/authors/:id    → récupère un auteur par ID avec ses livres
 * POST   /api/authors        → crée un nouvel auteur
 * PUT    /api/authors/:id    → met à jour un auteur
 * DELETE /api/authors/:id    → supprime un auteur (les associations BookAuthor sont supprimées en cascade)
 *
 * Note : pour associer un auteur à un livre, utiliser les routes dédiées dans books.routes.js :
 * POST   /api/books/:bookId/authors/:authorId
 * DELETE /api/books/:bookId/authors/:authorId
 */
const router = Router();

router.get("/", listAuthors);
router.get("/:id", getAuthorById);
router.post("/", validate(createAuthorSchema), createAuthor);
router.put("/:id", validate(updateAuthorSchema), updateAuthor);
router.delete("/:id", deleteAuthor);

module.exports = router;
