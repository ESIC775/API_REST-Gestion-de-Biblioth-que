const { Router } = require("express");
const validate = require("../middlewares/validate");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validators/user.schema");
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

/**
 * Routes pour les utilisateurs.
 *
 * Chaque route utilise le middleware validate() pour valider le body
 * avec le schéma Zod correspondant AVANT d'appeler le contrôleur.
 * Si la validation échoue, errorHandler renvoie automatiquement un 400.
 *
 * GET    /api/users         → liste tous les utilisateurs
 * GET    /api/users/:id     → récupère un utilisateur par ID
 * POST   /api/users         → crée un nouvel utilisateur
 * PUT    /api/users/:id     → met à jour un utilisateur
 * DELETE /api/users/:id     → supprime un utilisateur
 */
const router = Router();

router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
