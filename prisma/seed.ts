import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing
  await prisma.attachment.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const alex = await prisma.user.create({
    data: {
      id: "user_alex",
      email: "alex@ajaia.internal",
      name: "Alex Johnson",
      roleTitle: "Engineering Lead",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: "user_sarah",
      email: "sarah@ajaia.internal",
      name: "Sarah Chen",
      roleTitle: "Product Manager",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      id: "user_marcus",
      email: "marcus@ajaia.internal",
      name: "Marcus Vance",
      roleTitle: "Product Designer",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
  });

  const maya = await prisma.user.create({
    data: {
      id: "user_maya",
      email: "maya@ajaia.internal",
      name: "Maya Patel",
      roleTitle: "Security & Compliance Lead",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    },
  });

  // Doc 1: Owned by Alex
  const doc1 = await prisma.document.create({
    data: {
      id: "doc_eng_roadmap",
      title: "Q3 Architecture & Engineering Roadmap",
      content: `<h1>Q3 Engineering & Platform Roadmap</h1>
<p>This document outlines our core architectural milestones for the upcoming quarter. The primary goal is delivering high-performance, collaborative document experiences with minimal operational overhead.</p>
<h2>1. Core Objectives</h2>
<ul>
  <li><strong>Real-time state synchronization</strong>: Transition to conflict-free replicated data structures.</li>
  <li><strong>Sub-second document save</strong>: Optimize debounced background synchronization.</li>
  <li><strong>Multi-tenant isolation</strong>: Enforce robust role-based access control.</li>
</ul>
<h2>2. Technical Principles</h2>
<ol>
  <li>Zero-friction local development experience.</li>
  <li>Strict server-side authorization on all mutating endpoints.</li>
  <li>Graceful fallback for offline editing states.</li>
</ol>
<blockquote>"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra</blockquote>`,
      ownerId: alex.id,
    },
  });

  // Share Doc 1 with Sarah (Editor) and Marcus (Viewer)
  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: sarah.id,
      role: "editor",
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: marcus.id,
      role: "viewer",
    },
  });

  // Doc 2: Owned by Sarah
  const doc2 = await prisma.document.create({
    data: {
      id: "doc_product_spec",
      title: "Ajaia Docs v1 - Product Requirements",
      content: `<h1>Product Requirements Document: Ajaia Docs v1</h1>
<p><strong>Status:</strong> Active Draft<br/><strong>Author:</strong> Sarah Chen (PM)</p>
<h2>Executive Summary</h2>
<p>Teams move faster when document editing is lightweight, responsive, and intuitive. Ajaia Docs focuses on high-frequency team workflows: quick drafts, file imports, and seamless permissions.</p>
<h2>User Stories</h2>
<ul>
  <li><strong>As a creator</strong>, I want to paste or upload markdown and Word documents so I don't lose formatting.</li>
  <li><strong>As a collaborator</strong>, I want to review shared documents with clear permissions (editing vs viewing only).</li>
  <li><strong>As a lead</strong>, I need confidence that document versions are automatically preserved.</li>
</ul>`,
      ownerId: sarah.id,
    },
  });

  // Share Doc 2 with Alex (Editor)
  await prisma.documentShare.create({
    data: {
      documentId: doc2.id,
      userId: alex.id,
      role: "editor",
    },
  });

  // Doc 3: Owned by Marcus
  const doc3 = await prisma.document.create({
    data: {
      id: "doc_design_system",
      title: "Design System Guidelines & Typography",
      content: `<h1>Ajaia Design System Tokens</h1>
<p>Typography and component guidelines for internal developer and productivity tooling.</p>
<h2>Type Scale</h2>
<ul>
  <li><strong>Heading 1:</strong> 28px / Semi-bold (Inter or Geist)</li>
  <li><strong>Heading 2:</strong> 22px / Medium</li>
  <li><strong>Body Text:</strong> 15px / Regular with 1.6 line height</li>
</ul>
<p><em>Note: Ensure all interactive states meet WCAG AAA contrast ratios.</em></p>`,
      ownerId: marcus.id,
    },
  });

  // Share Doc 3 with Alex (Viewer)
  await prisma.documentShare.create({
    data: {
      documentId: doc3.id,
      userId: alex.id,
      role: "viewer",
    },
  });

  console.log("Database seeded successfully with 4 users and 3 documents!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
