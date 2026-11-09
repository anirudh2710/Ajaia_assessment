import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel serverless functions, copy the SQLite database to /tmp so writes succeed
if (process.env.VERCEL) {
  const tmpDbPath = "/tmp/dev.db";
  const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

  if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
    try {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
    } catch (err) {
      console.error("Failed to copy sqlite db to /tmp on Vercel:", err);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
