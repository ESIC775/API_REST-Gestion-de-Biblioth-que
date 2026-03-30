const { Router } = require("express");
const validate = require("../middlewares/validate");
const { createLoanSchema } = require("../validators/loan.schema");
const {
  listLoans,
  getLoanById,
  createLoan,
  returnLoan,
  deleteLoan,
} = require("../controllers/loans.controller");

/**
 * Routes pour les emprunts.
 *
 * GET    /api/loans              → liste tous les emprunts
 * GET    /api/loans/:id          → récupère un emprunt par ID
 * POST   /api/loans              → crée un emprunt (body : { userId, bookId })
 * PATCH  /api/loans/:id/return   → enregistre le retour du livre (statut → RETURNED)
 * DELETE /api/loans/:id          → supprime un emprunt
 *
 * Note : on utilise PATCH pour le retour car on ne modifie que deux champs
 * (status et returnDate), pas l'intégralité de la ressource.
 *
 * La route PATCH /return est définie AVANT /:id pour éviter qu'Express
 * interprète "return" comme un paramètre :id.
 */
const router = Router();

router.get("/", listLoans);
router.get("/:id", getLoanById);
router.post("/", validate(createLoanSchema), createLoan);
router.patch("/:id/return", returnLoan); // doit être avant /:id pour éviter les conflits
router.delete("/:id", deleteLoan);

module.exports = router;
