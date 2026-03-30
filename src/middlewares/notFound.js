/**
 * Middleware 404 — Route introuvable.
 *
 * Ce middleware est placé APRÈS toutes les routes dans app.js.
 * Si une requête arrive ici, c'est qu'aucune route ne l'a prise en charge.
 *
 * On renvoie systématiquement un JSON structuré avec un message clair,
 * plutôt que la page HTML par défaut d'Express (qui ne convient pas à une API REST).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports = function notFound(req, res) {
  res.status(404).json({
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
    status: 404
  });
};
