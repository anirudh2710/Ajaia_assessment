import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Documents owned by the current user
    const owned = await prisma.document.findMany({
      where: { ownerId: user.id },
      include: {
        owner: { select: { id: true, name: true, email: true, roleTitle: true, avatarUrl: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Documents shared with the current user
    const sharedShares = await prisma.documentShare.findMany({
      where: { userId: user.id },
      include: {
        document: {
          include: {
            owner: { select: { id: true, name: true, email: true, roleTitle: true, avatarUrl: true } },
            shares: {
              include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const shared = sharedShares.map((share) => ({
      ...share.document,
      currentUserRole: share.role,
    }));

    return NextResponse.json({
      currentUser: user,
      owned: owned.map((d) => ({ ...d, currentUserRole: "owner" })),
      shared,
    });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled Document";
    const content = typeof body.content === "string" ? body.content : "";

    const newDoc = await prisma.document.create({
      data: {
        title,
        content,
        ownerId: user.id,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
