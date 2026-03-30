const { PrismaClient, LoanStatus } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: "mohamed@example.com" },
    update: { name: "Mohamed Daoud" },
    create: { name: "Mohamed Daoud", email: "mohamed@example.com" },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "djibril@example.com" },
    update: { name: "Djibril Koné" },
    create: { name: "Djibril Koné", email: "djibril@example.com" },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "omar@example.com" },
    update: { name: "Omar Benali" },
    create: { name: "Omar Benali", email: "omar@example.com" },
  });

  const user4 = await prisma.user.upsert({
    where: { email: "ahmed@example.com" },
    update: { name: "Ahmed Saidi" },
    create: { name: "Ahmed Saidi", email: "ahmed@example.com" },
  });

  await prisma.profile.upsert({
    where: { userId: user1.id },
    update: { address: "12 rue de Paris, Lyon", phone: "0765432299" },
    create: {
      address: "12 rue de Paris, Lyon",
      phone: "0765432299",
      userId: user1.id,
    },
  });

  await prisma.profile.upsert({
    where: { userId: user2.id },
    update: { address: "5 avenue Victor Hugo, Paris", phone: "0765432298" },
    create: {
      address: "5 avenue Victor Hugo, Paris",
      phone: "0765432298",
      userId: user2.id,
    },
  });

  await prisma.profile.upsert({
    where: { userId: user3.id },
    update: { address: "8 boulevard des Lilas, Nice", phone: "0765432297" },
    create: {
      address: "8 boulevard des Lilas, Nice",
      phone: "0765432297",
      userId: user3.id,
    },
  });

  await prisma.profile.upsert({
    where: { userId: user4.id },
    update: { address: "3 rue de la Paix, Marseille", phone: "0765432296" },
    create: {
      address: "3 rue de la Paix, Marseille",
      phone: "0765432296",
      userId: user4.id,
    },
  });

  const author1 = await prisma.author.upsert({
    where: { name: "Robert C. Martin" },
    update: {},
    create: { name: "Robert C. Martin", bio: "Auteur de Clean Code." },
  });

  const author2 = await prisma.author.upsert({
    where: { name: "Martin Fowler" },
    update: {},
    create: {
      name: "Martin Fowler",
      bio: "Auteur spécialisé en architecture logicielle.",
    },
  });

  const book1 = await prisma.book.upsert({
    where: { isbn: "9780132350884" },
    update: {},
    create: {
      title: "Clean Code",
      isbn: "9780132350884",
      publicationYear: 2008,
    },
  });

  const book2 = await prisma.book.upsert({
    where: { isbn: "9780321127426" },
    update: {},
    create: {
      title: "Patterns of Enterprise Application Architecture",
      isbn: "9780321127426",
      publicationYear: 2002,
    },
  });

  await prisma.bookAuthor.upsert({
    where: { bookId_authorId: { bookId: book1.id, authorId: author1.id } },
    update: {},
    create: { bookId: book1.id, authorId: author1.id },
  });

  await prisma.bookAuthor.upsert({
    where: { bookId_authorId: { bookId: book2.id, authorId: author2.id } },
    update: {},
    create: { bookId: book2.id, authorId: author2.id },
  });

  const existingLoan = await prisma.loan.findFirst({
    where: { userId: user1.id, bookId: book1.id, status: LoanStatus.BORROWED },
  });

  if (!existingLoan) {
    await prisma.loan.create({
      data: { userId: user1.id, bookId: book1.id, status: LoanStatus.BORROWED },
    });
  }

  console.log("Seed terminé avec succès.");
}

main()
  .catch((error) => {
    console.error("Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
