import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml, plainTextToHtml, parseUploadedFile } from "../fileParser";

describe("File Parser", () => {
  it("converts basic markdown headings and inline styles to HTML", () => {
    const md = "# Heading 1\n\nThis is **bold** and *italic* text.\n\n## Subheading";
    const html = markdownToHtml(md);

    assert.ok(html.includes("<h1>Heading 1</h1>"));
    assert.ok(html.includes("<strong>bold</strong>"));
    assert.ok(html.includes("<em>italic</em>"));
    assert.ok(html.includes("<h2>Subheading</h2>"));
  });

  it("converts markdown bullet and ordered lists", () => {
    const md = "- Item A\n- Item B\n\n1. First\n2. Second";
    const html = markdownToHtml(md);

    assert.ok(html.includes("<ul><li>Item A</li><li>Item B</li></ul>"));
    assert.ok(html.includes("<ol><li>First</li><li>Second</li></ol>"));
  });

  it("converts plain text line breaks into paragraphs", () => {
    const text = "Paragraph one.\n\nParagraph two.";
    const html = plainTextToHtml(text);

    assert.equal(html, "<p>Paragraph one.</p><p>Paragraph two.</p>");
  });

  it("parses uploaded markdown file buffer with capitalized title", async () => {
    const buffer = Buffer.from("# Project Kickoff\nTeam priorities for the sprint.");
    const result = await parseUploadedFile("project-kickoff.md", buffer);

    assert.equal(result.title, "Project-kickoff");
    assert.ok(result.htmlContent.includes("<h1>Project Kickoff</h1>"));
    assert.ok(result.htmlContent.includes("<p>Team priorities for the sprint.</p>"));
  });
});
