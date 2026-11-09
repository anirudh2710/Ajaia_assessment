import { prisma } from "./prisma";
import { NextRequest } from "next/server";

export const DEFAULT_USER_ID = "user_alex";

export async function getSessionUser(req?: NextRequest) {
  let userId: string | null = null;

  if (req) {
    userId = req.headers.get("x-user-id") || req.cookies.get("ajaia_user_id")?.value || null;
  }

  if (!userId) {
    userId = DEFAULT_USER_ID;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user ?? (await prisma.user.findFirst());
}
