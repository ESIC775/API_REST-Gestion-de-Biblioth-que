-- =============================================================
-- Jeu de données minimal de test — Library API
-- Base de données : library_db
-- =============================================================

-- Utilisateurs
INSERT IGNORE INTO `User` (id, name, email, createdAt, updatedAt) VALUES
(1, 'Mohamed Daoud', 'mohamed@example.com', NOW(), NOW()),
(2, 'Djibril Koné',  'djibril@example.com', NOW(), NOW()),
(3, 'Omar Benali',   'omar@example.com',    NOW(), NOW()),
(4, 'Ahmed Saidi',   'ahmed@example.com',   NOW(), NOW());

-- Profils (One-to-One avec User)
INSERT IGNORE INTO `Profile` (id, address, phone, userId, createdAt, updatedAt) VALUES
(1, '12 rue de Paris, Lyon',       '0765432299', 1, NOW(), NOW()),
(2, '5 avenue Victor Hugo, Paris', '0765432298', 2, NOW(), NOW()),
(3, '8 boulevard des Lilas, Nice', '0765432297', 3, NOW(), NOW()),
(4, '3 rue de la Paix, Marseille', '0765432296', 4, NOW(), NOW());

-- Auteurs
INSERT IGNORE INTO `Author` (id, name, bio, createdAt, updatedAt) VALUES
(1, 'Robert C. Martin', 'Ingénieur logiciel américain, auteur de Clean Code.', NOW(), NOW()),
(2, 'Martin Fowler',    'Architecte logiciel, expert en patterns enterprise.',  NOW(), NOW());

-- Livres
INSERT IGNORE INTO `Book` (id, title, isbn, publicationYear, createdAt, updatedAt) VALUES
(1, 'Clean Code',                                        '978-0132350884', 2008, NOW(), NOW()),
(2, 'Patterns of Enterprise Application Architecture',   '978-0321127426', 2002, NOW(), NOW());

-- Associations Livres ↔ Auteurs (Many-to-Many)
INSERT IGNORE INTO `BookAuthor` (bookId, authorId) VALUES
(1, 1),
(2, 2);

-- Emprunts (One-to-Many : User → Loans)
INSERT IGNORE INTO `Loan` (id, loanDate, returnDate, status, userId, bookId, createdAt, updatedAt) VALUES
(1, NOW(), NULL, 'BORROWED', 1, 1, NOW(), NOW());
