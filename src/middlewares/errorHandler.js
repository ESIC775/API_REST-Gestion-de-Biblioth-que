const { Prisma } = require('@prisma/client');
const { ZodError } = require('zod');

/**
 * Middleware de gestion centralisée des erreurs.
 *
 * Ce middleware est placé EN DERNIER dans app.js (après le notFound).
 * Il intercepte toutes les erreurs passées via next(err) dans l'application.
 *
 * Il gère trois types d'erreurs :
 * 1. ZodError        → erreur de validation des données (400)
 * 2. PrismaClientKnownRequestError → erreur base de données connue (409, 404, 400...)
 * 3. Erreur générique → toute autre erreur serveur (utilise err.statusCode ou 500)
 *
 * Codes Prisma utiles :
 * - P2002 : violation d'unicité (ex: email ou ISBN déjà utilisé)  → 409 Conflict
 * - P2003 : violation de clé étrangère (relation invalide)         → 400 Bad Request
 * - P2025 : enregistrement introuvable (delete/update sur ID inexistant) → 404 Not Found
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = function errorHandler(err, req, res, next) {
  // --- Erreur de validation Zod (données invalides envoyées par le client) ---
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation échouée.',
      status: 400,
      // err.errors contient le détail de chaque champ invalide
      errors: err.errors
    });
  }

  // --- Erreur Prisma connue (contrainte de base de données) ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violation d'unicité : email, ISBN ou autre champ @unique déjà existant
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'Conflit : une ressource avec cette valeur existe déjà.',
        status: 409
      });
    }

    // Violation de clé étrangère : on pointe vers un ID qui n'existe pas
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: 'Contrainte relationnelle invalide : identifiant étranger inexistant.',
        status: 400
      });
    }

    // Enregistrement introuvable lors d'un update ou delete
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Ressource introuvable.',
        status: 404
      });
    }
  }

  // --- Erreur générique (ex: erreur métier lancée manuellement dans les contrôleurs) ---
  // On utilise err.statusCode si défini, sinon 500 par défaut
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || 'Erreur interne du serveur.',
    status: statusCode
  });
};
