<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
# AGENTS.md

# Engineering OS

## Purpose

Engineering OS is a personal AI-powered Engineering Growth Operating System.

This project is NOT a generic LMS, Todo App, Habit Tracker, or Note Taking application.

Its purpose is to continuously guide one engineer towards becoming a world-class AI Backend Engineer through personalized learning, coding practice, projects, analytics, GitHub insights, and AI mentoring.

This project is built ONLY for one user.

Never introduce multi-user architecture unless explicitly requested.

---

# Tech Stack

Frontend

- React
- TypeScript (Strict Mode)
- Vite
- Tailwind CSS
- shadcn/ui

Charts

- Recharts

State

- React Query
- Zustand (only when shared state is truly necessary)

Forms

- React Hook Form
- Zod

Icons

- Lucide React

Backend

- Node.js
- Express
- TypeScript

Future AI

- Gemini
- Claude
- OpenAI

Future Database

- JSON first
- SQLite or PostgreSQL if persistence is later required

---

# Primary Goal

Every engineering decision should optimize for

- maintainability
- readability
- scalability
- modularity
- developer experience

Never optimize for writing the fewest lines of code.

Optimize for long-term maintainability.

---

# Architecture

Use Feature Based Architecture.

Example

src/

    app/

    components/

    features/

        dashboard/

        roadmap/

        coding/

        github/

        analytics/

        ai/

        projects/

        journal/

        knowledge/

        interview/

    hooks/

    lib/

    services/

    store/

    types/

    constants/

    utils/

    assets/

Each feature should own

- components
- hooks
- services
- types
- utilities

Avoid giant shared folders.

---

# Component Rules

Every component must

- have a single responsibility
- be reusable
- be composable
- remain under approximately 250 lines whenever practical
- avoid duplicated logic

Prefer composition over inheritance.

Never create unnecessary wrapper components.

---

# TypeScript

Strict mode only.

Never use

- any

Avoid type assertions unless absolutely necessary.

Prefer

- interfaces
- utility types
- discriminated unions

Create reusable domain models.

---

# React

Prefer

- Functional Components
- Hooks
- Composition

Avoid

- Class Components

Keep state as local as possible.

Do not create global state unless multiple unrelated features require it.

---

# Styling

Use Tailwind CSS.

Use shadcn/ui components whenever possible.

Never duplicate utility classes across components.

Extract reusable UI components.

Dark mode is the default design.

Desktop first.

Responsive on all devices.

---

# Folder Rules

Never place business logic inside UI components.

Business logic belongs in

services/

Utilities belong in

utils/

Types belong in

types/

Never mix responsibilities.

---

# Services

Create services for

Roadmaps

Analytics

GitHub

Learning Engine

Knowledge Graph

AI

Journal

Projects

Never call APIs directly inside components.

---

# State Management

Use

Local State

↓

React Query

↓

Zustand

Only escalate when necessary.

Avoid unnecessary global stores.

---

# Performance

Always consider

- memoization
- lazy loading
- route splitting
- caching
- virtualization

Optimize only after identifying a real need.

Avoid premature optimization.

---

# Error Handling

Every asynchronous operation should have

- loading state
- success state
- error state
- retry mechanism where appropriate

Never silently ignore errors.

---

# Accessibility

Always include

- semantic HTML
- keyboard navigation
- focus visibility
- ARIA labels where appropriate
- sufficient color contrast

---

# Engineering Principles

Always follow

- SOLID
- DRY
- KISS
- Separation of Concerns
- Clean Architecture

Never overengineer.

---

# Code Quality

Prefer

Readable code

over

Short code.

Prefer

Explicit code

over

Magic.

Avoid deeply nested logic.

Extract reusable functions.

---

# Naming

Variables

camelCase

Components

PascalCase

Hooks

useSomething()

Interfaces

IUser is NOT allowed.

Use

User

Roadmap

LearningStats

etc.

Files

kebab-case

---

# Comments

Do not comment obvious code.

Comment

- architectural decisions
- algorithms
- business rules

Avoid noisy comments.

---

# Data

Never hardcode roadmap data inside React components.

Roadmaps should be stored as structured JSON.

Knowledge Graph data should be separate.

Analytics should be calculated from stored data.

---

# AI Modules

Future AI features include

- AI Mentor
- Weakness Engine
- Mission Generator
- Interview Coach
- Code Review Assistant

Keep AI implementation provider-independent.

Never tightly couple to a specific LLM.

Create adapters.

---

# GitHub

All GitHub integration must use a dedicated service layer.

Never mix GitHub logic with UI.

Support future expansion.

---

# Security

Never expose

- API Keys
- Secrets
- Tokens

Use environment variables.

Validate all external input.

Sanitize user-generated content before rendering.

---

# Documentation

Whenever architecture changes,

update

README.md

Architecture.md

if required.

Keep documentation synchronized with implementation.

---

# Testing

Prefer

Vitest

React Testing Library

Write tests for

- services
- utilities
- business logic

UI snapshot tests are optional.

---

# Refactoring Rules

Before creating new code

Search for existing implementation.

Reuse existing logic.

Do not duplicate functionality.

Modify the smallest possible surface area.

---

# Pull Request Behaviour

Before finishing any task

Review

- duplication
- naming
- performance
- accessibility
- TypeScript
- responsiveness
- architecture

Only then complete the task.

---

# Decision Priority

When multiple implementations exist choose in this order

1. Simplicity
2. Maintainability
3. Readability
4. Performance
5. Cleverness

Never choose clever code over readable code.

---

# Mission

This project should feel like a premium engineering operating system used daily by an ambitious software engineer.

Every implementation should help the user

- learn faster
- code better
- think like an engineer
- build production-quality software
- prepare for elite AI startup interviews

Always think long-term.

Act like the permanent Staff Engineer responsible for this repository.
# AI Agent Behavior

Before writing code:

1. Read the relevant files.
2. Understand the existing architecture.
3. Search for reusable components.
4. Reuse existing utilities whenever possible.
5. Do not introduce duplicate logic.
6. Explain architectural decisions briefly.
7. Modify the minimum number of files required.
8. Never rewrite working code without a strong reason.
9. If requirements are ambiguous, make the smallest reasonable assumption and clearly document it.
10. Leave the repository in a buildable state after every change.