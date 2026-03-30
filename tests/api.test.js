/**
 * Tests d'intégration de l'API Library.
 *
 * On utilise supertest pour faire des requêtes HTTP sur l'application Express
 * sans démarrer un vrai serveur (supertest injecte les requêtes directement).
 *
 * Prérequis : la base de données doit être accessible et avoir les migrations appliquées.
 * En CI/CD, on utilise une base de test dédiée (variable DATABASE_URL dans .env.test).
 *
 * Pour lancer les tests :
 *   npm test
 */

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

// Nettoyage de la base après tous les tests pour ne pas polluer les données
afterAll(async () => {
  await prisma.$disconnect();
});

// ─── Test de santé ────────────────────────────────────────────────────────────

describe("GET /health", () => {
  it("doit retourner 200 et le statut ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ─── Tests Utilisateurs ───────────────────────────────────────────────────────

describe("GET /api/users", () => {
  it("doit retourner 200 avec un tableau", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    // La réponse doit toujours être un tableau (même vide)
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/users", () => {
  // On utilise un email unique à chaque run pour éviter les conflits
  const testEmail = `test_${Date.now()}@example.com`;
  let createdUserId;

  it("doit créer un utilisateur et retourner 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Test User", email: testEmail });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(testEmail);

    // On mémorise l'ID pour le test suivant
    createdUserId = res.body.id;
  });

  it("doit retourner 409 si l'email est déjà utilisé", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Doublon", email: testEmail });

    expect(res.statusCode).toBe(409);
  });

  // Nettoyage : suppression de l'utilisateur créé pendant ce describe
  afterAll(async () => {
    if (createdUserId) {
      await prisma.user
        .delete({ where: { id: createdUserId } })
        .catch(() => {});
    }
  });
});

// ─── Test 404 ─────────────────────────────────────────────────────────────────

describe("Route inexistante", () => {
  it("doit retourner 404 pour une route inconnue", async () => {
    const res = await request(app).get("/api/inexistant");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("status", 404);
  });
});

// ─── Test métier : création d'emprunt ────────────────────────────────────────

describe("POST /api/loans - règle métier", () => {
  let userId;
  let bookId;
  let loanId;

  // Création d'un user et d'un livre pour les besoins du test
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { name: "Loan Test User", email: `loan_${Date.now()}@example.com` },
    });
    userId = user.id;

    const book = await prisma.book.create({
      data: {
        title: "Loan Test Book",
        isbn: `ISBN${Date.now()}`,
        publicationYear: 2024,
      },
    });
    bookId = book.id;
  });

  it("doit créer un emprunt et retourner 201", async () => {
    const res = await request(app).post("/api/loans").send({ userId, bookId });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("BORROWED");

    loanId = res.body.id;
  });

  it("doit refuser un 2ème emprunt du même livre (409)", async () => {
    // On essaie d'emprunter le même livre une deuxième fois
    const res = await request(app).post("/api/loans").send({ userId, bookId });

    expect(res.statusCode).toBe(409);
  });

  // Nettoyage après les tests d'emprunt
  afterAll(async () => {
    if (loanId)
      await prisma.loan.delete({ where: { id: loanId } }).catch(() => {});
    if (bookId)
      await prisma.book.delete({ where: { id: bookId } }).catch(() => {});
    if (userId)
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  });
});
