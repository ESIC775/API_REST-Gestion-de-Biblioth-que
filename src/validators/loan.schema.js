const { z } = require('zod');

/**
 * Schéma de validation Zod pour les emprunts.
 *
 * Un emprunt relie un utilisateur à un livre (relation One-to-Many).
 * À la création, on fournit uniquement userId et bookId.
 * Le statut est initialisé automatiquement à BORROWED côté serveur (contrôleur).
 * La date d'emprunt est également définie automatiquement par Prisma (loanDate @default(now())).
 */

/**
 * Schéma pour la création d'un emprunt (POST /api/loans).
 * - userId : obligatoire, entier positif — doit correspondre à un User existant
 * - bookId : obligatoire, entier positif — doit correspondre à un Book existant
 *
 * Note : le contrôleur vérifiera que le livre n'est pas déjà emprunté (statut BORROWED actif).
 */
const createLoanSchema = z.object({
  userId: z.number().int().positive('userId doit être un entier positif.'),
  bookId: z.number().int().positive('bookId doit être un entier positif.')
});

module.exports = {
  createLoanSchema
};
