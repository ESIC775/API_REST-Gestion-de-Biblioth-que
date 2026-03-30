const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');

/**
 * Contrôleur pour les profils utilisateurs.
 *
 * Un profil est lié à un utilisateur par une relation One-to-One.
 * Chaque utilisateur peut avoir au maximum un seul profil (userId @unique dans le schéma).
 *
 * On inclut toujours l'utilisateur lié dans les réponses pour fournir
 * une représentation complète de la ressource.
 */

/**
 * GET /api/profiles/:id
 * Retourne un profil par son ID (et non par userId).
 * Répond 404 si le profil n'existe pas.
 */
const getProfileById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { user: true } // on inclut l'utilisateur lié
  });

  if (!profile) {
    const error = new Error('Profil introuvable.');
    error.statusCode = 404;
    throw error;
  }

  res.json(profile);
});

/**
 * POST /api/profiles
 * Crée un profil pour un utilisateur existant.
 * req.body contient { address, phone, userId } validé par Zod.
 *
 * Cas d'erreur automatiques gérés par errorHandler :
 * - P2002 : userId déjà utilisé (profil déjà existant pour cet utilisateur) → 409
 * - P2003 : userId ne correspond à aucun utilisateur → 400
 */
const createProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.profile.create({
    data: req.body,
    include: { user: true }
  });

  res.status(201).json(profile);
});

/**
 * PATCH /api/profiles/:id
 * Mise à jour partielle d'un profil (adresse et/ou téléphone).
 * On n'autorise pas la modification du userId (clé étrangère).
 * Prisma lance P2025 si l'ID n'existe pas → errorHandler répond 404.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const profile = await prisma.profile.update({
    where: { id },
    data: req.body, // req.body ne contient que address et/ou phone (validé par Zod)
    include: { user: true }
  });

  res.json(profile);
});

module.exports = {
  getProfileById,
  createProfile,
  updateProfile
};
