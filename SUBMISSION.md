# Ajaia Assessment — Submission Manifest

**Applicant / Role**: AI-Native Full Stack Developer Assessment  
**Project**: Ajaia Docs (Lightweight Collaborative Document Editor)  
**Live Deployed Application**: [https://ajaia-assessment-virid.vercel.app](https://ajaia-assessment-virid.vercel.app/)  
**Walkthrough Video**: [Google Drive Video Link](https://drive.google.com/file/d/1yGiekRwNAIO15rdk50JHaB-F5yYKifcC/view?usp=sharing)  
**Status**: Complete, Verified & Tested

---

## 📦 What Is Included

1. **Source Code**:
   - Complete TypeScript Next.js 16 (App Router) codebase.
   - Rich text editing powered by Tiptap 3 / ProseMirror.
   - Relational database schema with Prisma ORM & SQLite persistence.
   - Multi-format file importer (`.md`, `.txt`, `.docx`).
   - Role-based sharing permissions system (`Owner`, `Editor`, `Viewer`).
   - Document attachments manager.
2. **Automated Test Suite**:
   - 8 unit and integration tests executing in ~220ms via Node.js native test runner (`npm test`).
3. **Documentation**:
   - `README.md`: Quick start guide, architecture summary, and command reference.
   - `ARCHITECTURE.md`: Prioritization tradeoffs, deprioritized features, data schema, and security matrix.
   - `AI_WORKFLOW.md`: AI tool breakdown, velocity impact, rejected AI suggestions, and validation protocol.
   - `WALKTHROUGH_VIDEO.txt`: Video walkthrough link and demo feature overview.
4. **Sample Test Files**:
   - `sample-files/sample-engineering-principles.md` (Markdown import demo)
   - `sample-files/sample-meeting-notes.txt` (Plain text import demo)

---

## 👥 Seeded Test Personas & Credentials

No manual signup or passwords required. Use the **Simulated User Switcher** in the top navigation bar to switch between personas instantly:

| Persona | Name | Role | Seeded Scenario |
| :--- | :--- | :--- | :--- |
| **User 1 (Default)** | Alex Johnson | Engineering Lead (`alex@ajaia.internal`) | Default active user (starts with a clean document slate). |
| **User 2** | Sarah Chen | Product Manager (`sarah@ajaia.internal`) | Team member available to receive shares or create docs. |
| **User 3** | Marcus Vance | Product Designer (`marcus@ajaia.internal`) | Team member available to test Viewer vs Editor access. |
| **User 4** | Maya Patel | Security Lead (`maya@ajaia.internal`) | Team member to test restricted/zero-access states. |

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Push schema and seed database
npx prisma db push
npx prisma db seed

# 3. Run automated tests
npm test

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🌐 Live Product Deployment

- **Deployment URL**: *(Insert your Vercel / Railway / Render live URL here, e.g. `https://ajaia-docs.vercel.app`)*
- **Local Testing**: Runs seamlessly on `http://localhost:3000` with zero external service dependencies.

---

## 🎯 Feature Completion Breakdown

### What Is Working 100% End-to-End
- [x] **Document Creation**: Blank document generation from dashboard with auto-redirect.
- [x] **Document Editing**: Rich-text formatting (Bold, Italic, Underline, Headings H1/H2/H3, Bullet lists, Numbered lists, Blockquotes, Code blocks, Undo/Redo).
- [x] **Document Renaming**: Live inline title editing in header with auto-save.
- [x] **Persistence**: Full SQLite persistence across reloads via Prisma.
- [x] **Debounced Auto-save**: Background saving with real-time UI status indicators ("Saving..." / "Saved").
- [x] **File Upload / Import**: Uploading `.md`, `.txt`, and `.docx` files directly turns them into editable documents with formatting intact.
- [x] **Document Attachments**: Uploading attachments directly attached to a document drawer.
- [x] **Sharing & Access Control**: 
  - Add collaborators by selecting directory users.
  - Role management: Toggle between **Editor** and **Viewer**, or revoke access.
  - Viewers locked in read-only mode with disabled toolbar and warning banner.
  - Dashboard divided into "My Documents" and "Shared with Me" with role pills and owner avatars.
- [x] **Server-Side Enforcement**: 403 Forbidden returned on unauthorized mutations.
- [x] **Export Capabilities**: Export to Markdown (`.md`), HTML (`.html`), or Print / PDF.
- [x] **Automated Tests**: Permissions matrix and file parser test suite passing with 0 failures.

### What Was Intentionally Deprioritized
- Real-time multi-cursor collaboration via Yjs / WebSockets (deprioritized to avoid race conditions within the 4–6 hour limit).
- Complex third-party OAuth redirect flows (replaced with high-utility in-app persona switcher).

### What I Would Build Next (With 2–4 Additional Hours)
1. **Real-time Presence & Cursor Indicators**: Integrate Liveblocks or Yjs over WebSockets to show active collaborator avatars and real-time cursor positions.
2. **Document Version History**: Store delta snapshots in an `AuditLog` / `DocumentVersion` table with a time-travel slider to restore previous revisions.
3. **In-line Comments & Suggestions**: ProseMirror mark decorations allowing collaborators to leave targeted comment threads on highlighted text.
