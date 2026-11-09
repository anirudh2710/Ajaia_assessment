# AI-Native Workflow Note

> **Evaluation Objective**: Demonstrate mature, practical AI engineering workflow, judgment, and verification discipline without outsourcing engineering rigor.

---

## 1. AI Tools Utilized

- **Antigravity / Gemini 3.8 Flash (Agentic Assistant)**: Interactive paired code generation, project scaffolding, schema modeling, and continuous sanity checking.
- **Claude / Gemini Pro**: Initial system evaluation, edge-case analysis of Google Docs core workflows, and architectural review.

---

## 2. Where AI Materially Sped Up the Work

1. **Rapid Scaffolding & Boilerplate Generation**:
   - Creating initial Prisma schemas with relational foreign keys (`DocumentShare`, `Attachment`).
   - Drafting repetitive Tailwind styling classes for Google Docs-like toolbar buttons, active states, and modal overlays.
   - Velocity acceleration: Saved approximately 60–90 minutes of baseline setup.

2. **Regex & Lexical Parsing for File Formats**:
   - AI generated the regex patterns for converting Markdown tokens (`#`, `##`, `*`, `**`, `- `, `1. `, `> `) into sanitized HTML strings compatible with Tiptap.
   - Velocity acceleration: Reduced file parser implementation time to under 15 minutes.

3. **Comprehensive Test Suite Generation**:
   - AI generated tabular permission test matrices (`canUserViewDocument`, `canUserEditDocument`, `canUserShareDocument`, `canUserDeleteDocument`) covering edge cases (such as unauthorized strangers attempting edits or viewers attempting deletions).

---

## 3. What AI-Generated Output Was Changed or Rejected

| Area | Initial AI Suggestion | Why It Was Changed / Rejected | Human Intervention |
| :--- | :--- | :--- | :--- |
| **Rich-Text Editor** | Raw `contentEditable` or heavy Quill.js wrapper | Raw `contentEditable` causes erratic cursor jumping, browser discrepancies, and corrupted DOM on paste. Quill has outdated React 19 compatibility. | Enforced **Tiptap 3 / ProseMirror**, providing a rock-solid schema and clean JSON/HTML serialization. |
| **Authentication Strategy** | NextAuth / Supabase Auth with OAuth providers | Full OAuth requires reviewers to create external developer credentials, configure redirect URIs, and handle third-party login flows, adding immense review friction. | Replaced with an **in-app Persona Switcher** dropdown + session cookie. Kept genuine backend permission validation while cutting review testing time to seconds. |
| **Test Runner** | Vitest with Rolldown / Vite 8 beta | Vitest 5+ pulled in optional Rolldown native bindings that triggered build engine incompatibilities in the sandboxed runtime. | Rejected the external test framework and switched to **Node.js 22's native `node:test` runner with `tsx`**, achieving 218ms test runs with zero dependencies. |
| **Fonts & Asset Fetching** | `next/font/google` with external CDN downloads | Attempted to download fonts over the network at build time, failing under sandboxed or offline build constraints. | Replaced with clean system font stacks (`-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`), guaranteeing instant zero-latency rendering and 100% offline build reliability. |

---

## 4. How Correctness, UX Quality, and Reliability Were Verified

1. **Automated Assertion Testing**:
   - Executed `npm test` across all permission boundaries and file parser functions (8 tests passing in ~220ms).
2. **Server-Side Authorization Penetration Tests**:
   - Used CLI curl commands to simulate unauthorized malicious requests (e.g. Marcus, a `viewer`, attempting a `PATCH /api/documents/doc_eng_roadmap`).
   - Verified that the backend strictly returns `403 Forbidden` with `{ error: "Forbidden: You do not have permission to edit this document" }`.
3. **Cross-Persona UI Verification**:
   - Tested real-time user switching between **Alex (Owner)**, **Sarah (Collaborator)**, and **Marcus (Viewer)**:
     - Confirmed that switching to Marcus instantly switches the editor to read-only mode, disables the toolbar, and surfaces the "Viewing only" banner.
     - Confirmed that switching back to Alex restores full editing capabilities.
4. **End-to-End File Import Testing**:
   - Imported both `.md` and `.txt` files via the drag-and-drop modal, verifying that titles, headings, bullet points, and paragraphs accurately populated the Tiptap canvas.
5. **Production Build Compilation**:
   - Ran `npm run build` to verify zero TypeScript errors, clean route prerendering, and optimized bundle chunks.
