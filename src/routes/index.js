const { Router } = require("express");

const usersRoutes = require("./users.routes");
const profilesRoutes = require("./profiles.routes");
const authorsRoutes = require("./authors.routes");
const booksRoutes = require("./books.routes");
const loansRoutes = require("./loans.routes");

/**
 * Routeur principal de l'API.
 *
 * Ce fichier centralise toutes les routes de l'application.
 * Il est importé dans app.js sous le préfixe /api.
 *
 * Résultat final des URLs accessibles :
 * /api/users      → users.routes.js
 * /api/profiles   → profiles.routes.js
 * /api/authors    → authors.routes.js
 * /api/books      → books.routes.js
 * /api/loans      → loans.routes.js
 *
 * Avantage de ce fichier index : app.js reste simple et lisible,
 * et l'ajout d'une nouvelle ressource se fait en une ligne ici.
 */
const router = Router();

router.use("/users", usersRoutes);
router.use("/profiles", profilesRoutes);
router.use("/authors", authorsRoutes);
router.use("/books", booksRoutes);
router.use("/loans", loansRoutes);

module.exports = router;
