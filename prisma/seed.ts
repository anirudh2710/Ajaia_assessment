import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding user accounts (clean document slate)...");

  // Clear all documents, shares, and attachments
  await prisma.attachment.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Seed user personas so reviewers can switch accounts to test sharing
  await prisma.user.create({
    data: {
      id: "user_alex",
      email: "alex@ajaia.internal",
      name: "Alex Johnson",
      roleTitle: "Engineering Lead",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  });

  await prisma.user.create({
    data: {
      id: "user_sarah",
      email: "sarah@ajaia.internal",
      name: "Sarah Chen",
      roleTitle: "Product Manager",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  });

  await prisma.user.create({
    data: {
      id: "user_marcus",
      email: "marcus@ajaia.internal",
      name: "Marcus Vance",
      roleTitle: "Product Designer",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
  });

  await prisma.user.create({
    data: {
      id: "user_maya",
      email: "maya@ajaia.internal",
      name: "Maya Patel",
      roleTitle: "Security & Compliance Lead",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    },
  });

  console.log("Clean slate ready: 4 user personas initialized with 0 default documents.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
