/**
 * Wrapper pour les fonctions async dans Express.
 *
 * Problème : Express ne gère pas nativement les erreurs lancées dans les fonctions async.
 * Si une erreur est throws dans une fonction async sans try/catch, Express ne l'attrape pas
 * et le serveur reste bloqué sans réponse.
 *
 * Solution : ce wrapper enveloppe la fonction async dans une Promise.resolve()
 * et, en cas d'erreur, appelle automatiquement next(err) pour transmettre
 * l'erreur au middleware errorHandler.
 *
 * Utilisation dans un contrôleur :
 *   const listUsers = asyncHandler(async (req, res) => { ... });
 *
 * @param {Function} fn - Fonction async du contrôleur
 * @returns {import('express').RequestHandler}
 */
module.exports = function asyncHandler(fn) {
  return function wrappedAsync(req, res, next) {
    // Si fn() rejette une Promise, l'erreur est transmise à next() → errorHandler
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
