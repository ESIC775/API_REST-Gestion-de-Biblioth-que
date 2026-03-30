const { z } = require('zod');

/**
 * Schémas de validation Zod pour les auteurs.
 *
 * Un auteur peut être associé à plusieurs livres (relation Many-to-Many via BookAuthor).
 * Le champ bio est optionnel et peut être null (auteur sans biographie).
 */

/**
 * Schéma pour la création d'un auteur (POST /api/authors).
 * - name : obligatoire, au moins 2 caractères
 * - bio  : optionnel, peut être null ou une chaîne de texte libre
 */
const createAuthorSchema = z.object({
  name: z.string().min(2, 'Le nom de l\'auteur doit contenir au moins 2 caractères.'),
  bio: z.string().optional().nullable()
});

/**
 * Schéma pour la mise à jour d'un auteur (PUT /api/authors/:id).
 * Tous les champs sont optionnels, mais au moins un doit être présent.
 */
const updateAuthorSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').optional(),
    bio: z.string().optional().nullable()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour.'
  });

module.exports = {
  createAuthorSchema,
  updateAuthorSchema
};
