import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  getUserDocumentRole,
  canUserViewDocument,
  canUserEditDocument,
  canUserDeleteDocument,
} from "@/lib/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, roleTitle: true, avatarUrl: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, roleTitle: true, avatarUrl: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!canUserViewDocument(user.id, doc)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this document" },
        { status: 403 }
      );
    }

    const role = getUserDocumentRole(user.id, doc);

    return NextResponse.json({
      ...doc,
      currentUserRole: role,
    });
  } catch (error) {
    console.error("Failed to get document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!canUserEditDocument(user.id, doc)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to edit this document" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: { title?: string; content?: string } = {};

    if (typeof body.title === "string") {
      updateData.title = body.title.trim() || "Untitled Document";
    }
    if (typeof body.content === "string") {
      updateData.content = body.content;
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update document:", error);
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

    if (!canUserDeleteDocument(user.id, doc)) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can delete this document" },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
