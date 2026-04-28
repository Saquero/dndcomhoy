const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Hashear contraseña
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Crear admin inicial
  const admin = await prisma.admin.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Admin creado/actualizado:", admin.email);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
