/**
 * Convertit et valide un paramètre d'URL en entier positif.
 *
 * Les paramètres d'URL comme req.params.id arrivent toujours sous forme de STRING.
 * Cette fonction les convertit en Number et vérifie qu'il s'agit bien
 * d'un entier strictement positif (ex: 1, 2, 3...).
 *
 * Si la valeur est invalide (ex: "abc", "0", "-1", "1.5"),
 * une erreur avec statusCode 400 est lancée et interceptée par asyncHandler + errorHandler.
 *
 * @param {string} value - La valeur brute de req.params.id
 * @returns {number} L'identifiant sous forme d'entier valide
 * @throws {Error} Erreur 400 si l'identifiant est invalide
 */
module.exports = function parseId(value) {
  const id = Number(value);

  // Number.isInteger() exclut les floats, NaN et Infinity
  // id <= 0 exclut zéro et les négatifs
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('Identifiant invalide.');
    error.statusCode = 400;
    throw error;
  }

  return id;
};
