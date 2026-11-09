# Ajaia Docs — Lightweight Collaborative Document Editor

> An AI-native full stack collaborative document editor inspired by Google Docs, engineered for Ajaia's productivity assessment within a strict timebox.

**🌐 Live Deployed Application**: [https://ajaia-assessment-virid.vercel.app](https://ajaia-assessment-virid.vercel.app/)  
**🎬 Walkthrough Video**: [Google Drive Video Link](https://drive.google.com/drive/home?dmr=1&ec=wgc-drive-%5Bmodule%5D-goto)

---

## 🚀 Live Demo & Quick Test
- **Deployed App**: **[https://ajaia-assessment-virid.vercel.app](https://ajaia-assessment-virid.vercel.app/)** — Explore and test all features instantly in your browser (no local setup required).
- **Walkthrough Video**: **[Google Drive Demo](https://drive.google.com/drive/home?dmr=1&ec=wgc-drive-%5Bmodule%5D-goto)**
- **Local Dev**: Run in 1 command (`npm run dev`) with zero external database configuration.
- **Test Accounts**: Instant one-click user switcher in the top navigation bar with 4 seeded personas (starts with 0 default documents for a clean slate). No login friction.

---

## 🌟 Key Features

### 1. Document Creation & Rich-Text Editing
- **Modern WYSIWYG Editor**: Built on top of **Tiptap (ProseMirror)** for bulletproof document state and clean HTML/JSON serialization.
- **Rich-Text Formatting**:
  - Headings: H1, H2, H3, and normal paragraphs
  - Inline Styling: Bold, Italic, Underline
  - Lists: Bulleted lists (`<ul>`), Numbered lists (`<ol>`)
  - Blocks: Blockquotes and styled Code blocks
  - History: Undo and Redo with keyboard shortcuts (`Cmd+Z`, `Cmd+Y`)
- **Document Management**:
  - Inline title editing with instant rename
  - Debounced auto-save with real-time cloud sync status ("Saving...", "Saved to cloud")
  - Word counter and character counter
  - Export document to **Markdown (`.md`)**, **HTML (`.html`)**, or **Print / Save as PDF**

### 2. Multi-Format File Upload & Import
- **Direct Document Import**: Upload `.md`, `.txt`, and `.docx` (Word) files via drag-and-drop or file picker from the dashboard.
- **Format Preservation**: Markdown headers, bolding, italics, and lists are automatically converted into live, editable rich text in the document canvas.
- **Document Attachments**: Attach reference files, specifications, or images directly to any document via an integrated file drawer.

### 3. Role-Based Sharing & Collaboration
- **Role Hierarchy**:
  - **Owner**: Full rights (view, edit, rename, invite/remove collaborators, change roles, delete).
  - **Editor**: Can view, edit content, and rename.
  - **Viewer**: Read-only access. The editor locks into view-only mode, disabling editing tools and displaying a clear status banner.
- **Dashboard Separation**: Clear separation between **"My Documents"** and **"Shared with Me"** with role badges and owner avatars.
- **Server-Side Enforcement**: Strict HTTP 403 authorization checks on all mutating API endpoints (`PATCH`, `DELETE`, `/share`).

### 4. Zero-Friction Multi-Persona Testing
- **Top-Bar User Switcher**: Switch instantly between pre-seeded team personas:
  - **Alex Johnson** (Engineering Lead) — Owner of engineering roadmap; editor on product specs.
  - **Sarah Chen** (Product Manager) — Owner of product spec; collaborator on engineering roadmap.
  - **Marcus Vance** (Product Designer) — Owner of design guidelines; viewer on engineering roadmap.
  - **Maya Patel** (Security & Compliance) — Uninvited user by default for testing zero-access state.

---

## 🛠️ Tech Stack & Decisions

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, React 19, TypeScript) | Unified full-stack repository; server-side API routes; optimized streaming. |
| **Rich Text Editor** | Tiptap 3 (ProseMirror Engine) | Rock-solid rich-text state without the cross-browser bugs of raw `contentEditable`. |
| **Styling** | Tailwind CSS v4 | High-velocity, accessible Google Docs-inspired aesthetic. |
| **Persistence** | Prisma ORM + SQLite (`file:./dev.db`) | Zero-config local execution for reviewers (no Docker or cloud DB account required). |
| **File Parsing** | Custom Markdown Lexer + Mammoth (.docx) | Client & server buffer parsing for multi-format imports. |
| **Testing** | Node.js Test Runner + TSX | Fast, zero-dependency automated test runner (permissions and file parsers). |

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation & Run

```bash
# 1. Clone repository & install dependencies
git clone <repository-url>
cd Ajaia_assessment
npm install

# 2. Push database schema & seed initial accounts & documents
npx prisma db push
npx prisma db seed

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the automated test suite covering access-control rules and file parser transformations:

```bash
npm test
```

### Test Coverage Highlights:
- **Permissions Suite**: Verifies Owner, Editor, Viewer, and Stranger role boundaries, write-protection, and revocation.
- **File Parser Suite**: Verifies conversion of Markdown headings, bold/italic, bullet/ordered lists, plain text line breaks, and file buffers.

---

## 📁 Repository Structure

```
Ajaia_assessment/
├── prisma/
│   ├── schema.prisma        # Prisma relational schema (User, Document, DocumentShare, Attachment)
│   ├── seed.ts              # Database seeder with 4 team personas & sample docs
│   └── dev.db               # SQLite database file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── users/       # GET seeded team accounts
│   │   │   ├── documents/   # GET, POST documents
│   │   │   │   ├── [id]/    # GET, PATCH, DELETE document
│   │   │   │   │   ├── share/       # POST/DELETE collaborator permissions
│   │   │   │   │   └── attachments/ # POST file attachments
│   │   │   │   └── import/  # POST file upload (.md, .txt, .docx)
│   │   ├── doc/[id]/page.tsx# Rich text document editor page
│   │   ├── layout.tsx       # Root layout with UserProvider
│   │   └── page.tsx         # Dashboard with My Docs / Shared with Me
│   ├── components/
│   │   ├── Editor.tsx       # Tiptap editor with toolbar & export handlers
│   │   ├── ShareModal.tsx   # Google Docs-style collaboration modal
│   │   ├── UserSwitcher.tsx # One-click multi-persona switcher dropdown
│   │   ├── FileImportModal.tsx # Drag & drop file importer
│   │   └── AttachmentDrawer.tsx# Document attachments management drawer
│   ├── context/
│   │   └── UserContext.tsx  # Global mock auth session state
│   └── lib/
│       ├── auth.ts          # Session user extraction & fallback
│       ├── permissions.ts   # Core role calculation & capability checks
│       ├── fileParser.ts    # Markdown, plain text, and docx converter
│       └── __tests__/       # Automated unit & integration tests
├── sample-files/            # Sample .md and .txt files for testing file import
├── ARCHITECTURE.md          # Architecture decisions, tradeoffs, and data model
├── AI_WORKFLOW.md           # AI tools, velocity impact, rejected outputs, verification
└── SUBMISSION.md            # Complete review manifest & checklist
```
