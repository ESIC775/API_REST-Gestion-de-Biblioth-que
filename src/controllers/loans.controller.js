const { LoanStatus } = require("@prisma/client");
const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const parseId = require("../utils/parseId");

/**
 * Contrôleur pour les emprunts (Loan).
 *
 * Un emprunt relie un utilisateur à un livre (relations One-to-Many).
 * Statuts possibles (définis dans l'enum LoanStatus du schéma Prisma) :
 * - BORROWED : livre actuellement emprunté (par défaut à la création)
 * - RETURNED : livre rendu
 * - OVERDUE  : emprunt en retard (non géré automatiquement ici, peut être mis à jour manuellement)
 *
 * Règle métier importante : un même livre ne peut pas être emprunté deux fois en même temps.
 * Avant toute création, on vérifie qu'il n'existe pas d'emprunt actif (BORROWED) pour ce livre.
 */

/**
 * GET /api/loans
 * Retourne tous les emprunts avec l'utilisateur et le livre associés.
 */
const listLoans = asyncHandler(async (req, res) => {
  const loans = await prisma.loan.findMany({
    include: {
      user: true, // relation vers User
      book: true, // relation vers Book
    },
    orderBy: { id: "asc" },
  });

  res.json(loans);
});

/**
 * GET /api/loans/:id
 * Retourne un emprunt spécifique avec l'utilisateur et le livre.
 * Répond 404 si l'emprunt n'existe pas.
 */
const getLoanById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      user: true,
      book: true,
    },
  });

  if (!loan) {
    const error = new Error("Emprunt introuvable.");
    error.statusCode = 404;
    throw error;
  }

  res.json(loan);
});

/**
 * POST /api/loans
 * Crée un nouvel emprunt.
 * req.body contient { userId, bookId } validé par Zod.
 *
 * Règle métier : on vérifie d'abord qu'aucun emprunt BORROWED actif n'existe pour ce livre.
 * Si le livre est déjà emprunté, on répond 409 Conflict.
 *
 * Le statut est automatiquement mis à BORROWED et la date d'emprunt à maintenant.
 */
const createLoan = asyncHandler(async (req, res) => {
  const { userId, bookId } = req.body;

  // Vérification métier : le livre est-il déjà emprunté ?
  const activeLoan = await prisma.loan.findFirst({
    where: {
      bookId,
      status: LoanStatus.BORROWED, // on cherche un emprunt actif pour ce livre
    },
  });

  if (activeLoan) {
    const error = new Error("Ce livre est déjà emprunté et non disponible.");
    error.statusCode = 409;
    throw error;
  }

  const loan = await prisma.loan.create({
    data: {
      userId,
      bookId,
      status: LoanStatus.BORROWED, // statut initial obligatoirement BORROWED
    },
    include: {
      user: true,
      book: true,
    },
  });

  res.status(201).json(loan);
});

/**
 * PATCH /api/loans/:id/return
 * Enregistre le retour d'un livre.
 * Met à jour le statut à RETURNED et définit la date de retour (returnDate) à maintenant.
 * Prisma lance P2025 si l'ID n'existe pas → errorHandler répond 404.
 */
const returnLoan = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const loan = await prisma.loan.update({
    where: { id },
    data: {
      status: LoanStatus.RETURNED,
      returnDate: new Date(), // on enregistre la date et heure exactes du retour
    },
    include: {
      user: true,
      book: true,
    },
  });

  res.json(loan);
});

/**
 * DELETE /api/loans/:id
 * Supprime un emprunt (utile en cas d'erreur de saisie, par exemple).
 * Ne supprime pas l'utilisateur ni le livre.
 */
const deleteLoan = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await prisma.loan.delete({ where: { id } });

  res.status(204).send();
});

module.exports = {
  listLoans,
  getLoanById,
  createLoan,
  returnLoan,
  deleteLoan,
};
