const { z } = require('zod');

/**
 * Schémas de validation Zod pour les livres.
 *
 * Un livre peut avoir plusieurs auteurs (relation Many-to-Many).
 * À la création, on peut passer une liste d'IDs d'auteurs (authorIds)
 * pour les associer directement au livre via la table BookAuthor.
 */

/**
 * Schéma pour la création d'un livre (POST /api/books).
 * - title           : obligatoire, non vide
 * - isbn            : obligatoire, minimum 10 caractères (ISBN-10 ou ISBN-13)
 * - publicationYear : obligatoire, entier compris entre 0 et 3000
 * - authorIds       : optionnel, tableau d'IDs d'auteurs à associer au livre
 *                     Valeur par défaut : [] (tableau vide si non fourni)
 */
const createBookSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire.'),
  isbn: z.string().min(10, 'ISBN invalide (minimum 10 caractères).'),
  publicationYear: z
    .number()
    .int('L\'année de publication doit être un entier.')
    .min(0, 'Année invalide.')
    .max(3000, 'Année invalide.'),
  authorIds: z
    .array(z.number().int().positive('Chaque authorId doit être un entier positif.'))
    .optional()
    .default([])
});

/**
 * Schéma pour la mise à jour d'un livre (PUT /api/books/:id).
 * Tous les champs sont optionnels, mais au moins un doit être fourni.
 * Si authorIds est fourni, les associations existantes seront remplacées.
 */
const updateBookSchema = z
  .object({
    title: z.string().min(1).optional(),
    isbn: z.string().min(10).optional(),
    publicationYear: z.number().int().min(0).max(3000).optional(),
    authorIds: z.array(z.number().int().positive()).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour.'
  });

module.exports = {
  createBookSchema,
  updateBookSchema
};
