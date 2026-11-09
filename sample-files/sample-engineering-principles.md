# Ajaia Product Engineering Principles

Ajaia is building productivity workflows that empower distributed teams to make high-velocity decisions.

## 1. Speed as a Feature
- Every user interaction must feel instantaneous.
- Latency above 100ms on typing breaks user immersion.
- Background persistence should never block client-side UI threads.

## 2. Pragmatic Architecture
- Pick standard, battle-tested abstractions (ProseMirror / Tiptap over buggy contentEditable).
- Prefer zero-friction setup for team evaluation over complex multi-step OAuth.
- Keep server-side authorization strict and decoupled from presentation.

## 3. High Context Collaboration
- Roles should be transparent: Document Owners, Editors, and Viewers.
- Clear distinction between owned drafts and shared team assets.
