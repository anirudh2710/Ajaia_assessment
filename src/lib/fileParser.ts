import mammoth from "mammoth";

export interface ParsedDocumentResult {
  title: string;
  htmlContent: string;
}

/**
 * Converts basic markdown formatting into HTML for Tiptap editor.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split(/\r?\n/);
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    // Check headings
    if (line.startsWith("### ")) {
      closeLists();
      output.push(`<h3>${formatInline(line.substring(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeLists();
      output.push(`<h2>${formatInline(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeLists();
      output.push(`<h1>${formatInline(line.substring(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      closeLists();
      output.push(`<blockquote><p>${formatInline(line.substring(2))}</p></blockquote>`);
      continue;
    }

    // Bullet list
    const ulMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (ulMatch) {
      if (inOl) {
        output.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        output.push("<ul>");
        inUl = true;
      }
      output.push(`<li>${formatInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) {
        output.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        output.push("<ol>");
        inOl = true;
      }
      output.push(`<li>${formatInline(olMatch[1])}</li>`);
      continue;
    }

    // Close any lists if normal line
    closeLists();

    // Blank line
    if (line.trim() === "") {
      continue;
    }

    // Normal paragraph
    output.push(`<p>${formatInline(line)}</p>`);
  }

  closeLists();

  function closeLists() {
    if (inUl) {
      output.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      output.push("</ol>");
      inOl = false;
    }
  }

  function formatInline(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  return output.join("");
}

/**
 * Converts plain text into HTML paragraphs.
 */
export function plainTextToHtml(text: string): string {
  if (!text) return "";
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p.replace(/\r?\n/g, "<br/>")}</p>`);

  return paragraphs.length > 0 ? paragraphs.join("") : `<p>${text}</p>`;
}

/**
 * Parses uploaded file buffer into title and HTML content based on extension.
 */
export async function parseUploadedFile(
  fileName: string,
  buffer: Buffer
): Promise<ParsedDocumentResult> {
  const ext = fileName.toLowerCase().split(".").pop();
  const rawTitle = fileName.replace(/\.[^/.]+$/, "");
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  if (ext === "md" || ext === "markdown") {
    const text = buffer.toString("utf-8");
    return {
      title,
      htmlContent: markdownToHtml(text),
    };
  }

  if (ext === "docx") {
    try {
      const result = await mammoth.convertToHtml({ buffer });
      return {
        title,
        htmlContent: result.value || "<p>Empty document</p>",
      };
    } catch (err) {
      throw new Error(`Failed to parse Word (.docx) document: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Fallback to plain text (.txt, etc.)
  const text = buffer.toString("utf-8");
  return {
    title,
    htmlContent: plainTextToHtml(text),
  };
}
