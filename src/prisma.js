const { PrismaClient } = require("@prisma/client");
const logger = require("./logger"); // Asegúrate que el path es correcto

const prisma = new PrismaClient();

prisma.$on("error", (e) => {
  logger.error(`Prisma error: ${e.message}`);
});

module.exports = prisma;
