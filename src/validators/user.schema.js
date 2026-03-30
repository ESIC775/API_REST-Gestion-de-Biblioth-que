const { z } = require('zod');

/**
 * Schémas de validation Zod pour les utilisateurs.
 *
 * Zod permet de décrire la forme attendue du body JSON et de valider
 * chaque champ automatiquement. Les erreurs sont remontées avec des
 * messages clairs et interceptées par le middleware errorHandler.
 */

/**
 * Schéma pour la création d'un utilisateur (POST /api/users).
 * - name  : obligatoire, au moins 2 caractères
 * - email : obligatoire, doit être un email valide (format xxx@xxx.xx)
 */
const createUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().email('Format email invalide (ex: alice@example.com).')
});

/**
 * Schéma pour la mise à jour d'un utilisateur (PUT /api/users/:id).
 * Tous les champs sont optionnels (.partial()), mais au moins un doit être fourni.
 * Ex: { "name": "Nouveau nom" } est valide, {} ne l'est pas.
 */
const updateUserSchema = createUserSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour.'
  });

module.exports = {
  createUserSchema,
  updateUserSchema
};
