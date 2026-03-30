const { Router } = require("express");
const validate = require("../middlewares/validate");
const {
  createProfileSchema,
  updateProfileSchema,
} = require("../validators/profile.schema");
const {
  getProfileById,
  createProfile,
  updateProfile,
} = require("../controllers/profiles.controller");

/**
 * Routes pour les profils utilisateurs.
 *
 * Un profil est unique par utilisateur (One-to-One).
 * On n'expose pas de liste de profils (GET /) car ils sont accessibles
 * via GET /api/users/:id qui inclut déjà le profil associé.
 *
 * GET   /api/profiles/:id   → récupère un profil par son ID
 * POST  /api/profiles       → crée un profil (body : { address, phone, userId })
 * PATCH /api/profiles/:id   → mise à jour partielle (address et/ou phone)
 *
 * Note : on utilise PATCH ici (mise à jour partielle) plutôt que PUT (remplacement total)
 * car on ne modifie jamais l'intégralité des champs d'un profil en une seule fois.
 */
const router = Router();

router.get("/:id", getProfileById);
router.post("/", validate(createProfileSchema), createProfile);
router.patch("/:id", validate(updateProfileSchema), updateProfile);

module.exports = router;
