import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseUploadedFile } from "@/lib/fileParser";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Supported formats
    const allowedExtensions = ["txt", "md", "markdown", "docx"];
    const ext = file.name.toLowerCase().split(".").pop() || "";

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type .${ext}. Only .txt, .md, and .docx are supported.`,
        },
        { status: 400 }
      );
    }

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse file into title and html
    const { title, htmlContent } = await parseUploadedFile(file.name, buffer);

    const doc = await prisma.document.create({
      data: {
        title,
        content: htmlContent,
        ownerId: user.id,
      },
    });

    return NextResponse.json(
      {
        id: doc.id,
        title: doc.title,
        message: "File imported successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to import file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse and import file",
      },
      { status: 500 }
    );
  }
}
