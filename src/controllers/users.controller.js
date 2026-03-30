const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');

/**
 * Contrôleur pour les utilisateurs.
 *
 * Chaque fonction est enveloppée dans asyncHandler pour propager
 * automatiquement les erreurs async vers le middleware errorHandler.
 *
 * Les données sont toujours validées en amont par le middleware validate()
 * dans les routes, donc ici on ne revalide pas les champs.
 *
 * Relations incluses dans les réponses :
 * - profile : le profil One-to-One de l'utilisateur
 * - loans   : la liste des emprunts One-to-Many
 */

/**
 * GET /api/users
 * Retourne tous les utilisateurs triés par ID croissant,
 * avec leur profil et leurs emprunts.
 */
const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      profile: true, // relation One-to-One
      loans: true    // relation One-to-Many
    },
    orderBy: { id: 'asc' }
  });

  res.json(users);
});

/**
 * GET /api/users/:id
 * Retourne un utilisateur spécifique par son ID.
 * Répond 404 si l'utilisateur n'existe pas.
 */
const getUserById = asyncHandler(async (req, res) => {
  // parseId valide et convertit req.params.id (string → integer positif)
  const id = parseId(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      loans: true
    }
  });

  if (!user) {
    // On crée une erreur avec un statusCode personnalisé intercepté par errorHandler
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  res.json(user);
});

/**
 * POST /api/users
 * Crée un nouvel utilisateur.
 * req.body contient { name, email } déjà validé par Zod.
 * Répond 409 si l'email est déjà utilisé (géré par errorHandler via P2002).
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.create({
    data: req.body,
    include: {
      profile: true,
      loans: true
    }
  });

  // 201 Created : convention REST pour la création d'une ressource
  res.status(201).json(user);
});

/**
 * PUT /api/users/:id
 * Met à jour un utilisateur existant (remplacement partiel ou total).
 * Prisma lance P2025 si l'ID n'existe pas → errorHandler répond 404.
 */
const updateUser = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const user = await prisma.user.update({
    where: { id },
    data: req.body,
    include: {
      profile: true,
      loans: true
    }
  });

  res.json(user);
});

/**
 * DELETE /api/users/:id
 * Supprime un utilisateur par son ID.
 * Grâce à onDelete: Cascade dans le schéma Prisma,
 * le profil et les emprunts associés sont supprimés automatiquement.
 * Répond 204 No Content (pas de body dans la réponse).
 */
const deleteUser = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await prisma.user.delete({ where: { id } });

  // 204 No Content : convention REST pour une suppression réussie sans body
  res.status(204).send();
});

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
