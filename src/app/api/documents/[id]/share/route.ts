import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canUserShareDocument } from "@/lib/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!canUserShareDocument(user.id, doc)) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can manage sharing permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (userId === doc.ownerId) {
      return NextResponse.json(
        { error: "Cannot share document with the owner" },
        { status: 400 }
      );
    }

    const shareRole = role === "viewer" ? "viewer" : "editor";

    // Upsert share record
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId,
        },
      },
      update: {
        role: shareRole,
      },
      create: {
        documentId: id,
        userId,
        role: shareRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true, roleTitle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error("Failed to share document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!canUserShareDocument(user.id, doc)) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can manage sharing permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
    }

    await prisma.documentShare.deleteMany({
      where: {
        documentId: id,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
