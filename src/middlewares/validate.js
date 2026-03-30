/**
 * Middleware de validation des données entrantes avec Zod.
 *
 * Principe : on passe un schéma Zod en paramètre, et il retourne
 * un middleware Express qui valide req.body avant d'appeler le contrôleur.
 *
 * Si la validation échoue, Zod lance une ZodError qui sera interceptée
 * par le errorHandler global (src/middlewares/errorHandler.js).
 *
 * Avantage : les contrôleurs n'ont jamais à vérifier les données eux-mêmes,
 * ce qui les garde propres et focalisés sur la logique métier.
 *
 * @param {import('zod').ZodSchema} schema - Le schéma Zod à utiliser pour valider req.body
 * @returns {import('express').RequestHandler}
 */
module.exports = function validate(schema) {
  return (req, res, next) => {
    // schema.parse() lance une ZodError si les données sont invalides.
    // On réassigne req.body avec la valeur parsée pour profiter du typage et des valeurs par défaut.
    req.body = schema.parse(req.body);
    next();
  };
};
