const { z } = require('zod');

/**
 * Schémas de validation Zod pour les profils utilisateurs.
 *
 * Un profil est lié à un utilisateur (relation One-to-One).
 * Le champ userId est requis à la création pour établir le lien.
 * À la mise à jour (PATCH), seuls address et phone sont modifiables.
 */

/**
 * Schéma pour la création d'un profil (POST /api/profiles).
 * - address : obligatoire, chaîne de 3 caractères minimum
 * - phone   : obligatoire, numéro de téléphone (5 caractères minimum)
 * - userId  : obligatoire, entier positif — doit correspondre à un User existant
 */
const createProfileSchema = z.object({
  address: z.string().min(3, 'Adresse trop courte (minimum 3 caractères).'),
  phone: z.string().min(5, 'Numéro de téléphone invalide (minimum 5 caractères).'),
  userId: z.number().int().positive('userId doit être un entier positif.')
});

/**
 * Schéma pour la mise à jour partielle d'un profil (PATCH /api/profiles/:id).
 * On n'autorise pas la modification de userId (clé étrangère figée après création).
 * Au moins un champ doit être fourni.
 */
const updateProfileSchema = z
  .object({
    address: z.string().min(3, 'Adresse trop courte.').optional(),
    phone: z.string().min(5, 'Numéro de téléphone invalide.').optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour.'
  });

module.exports = {
  createProfileSchema,
  updateProfileSchema
};
