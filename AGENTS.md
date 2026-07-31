# 🏗️ Architecture & Stack Overview
- Next.js (App Router, Server vs Client component separation).
- Tailwind CSS for styling.
- PostgreSQL (Database queries via Pool/Prisma).
- Component Directory: `src/components` (UI elements, buttons, modals, loaders).

# 🧩 Reusable Component & DRY Policy (CRITICAL)
- Mandatory rule: BEFORE creating any new UI component, utility function, or icon, the agent MUST search `src/components/` and `src/lib/` for existing implementations.
- Reuse existing design tokens, modals, buttons, and loading animations. Do NOT create duplicate UI components.

# 🔄 Shared Component & Ripple Effect Policy (CRITICAL)
- **Global Impact Search**: BEFORE modifying any component in `src/components/` or any shared utility, you MUST search for all usages of that component across the entire codebase (`src/`).
- **Backward Compatibility**: Any changes to a shared component MUST NOT break other templates, pages, or views where it is used.
- **Multi-Template Verification**: If a shared component is modified, you MUST list every file that imports it and verify that those imports remain fully typed and visually compatible.

# ⚙️ Development & Code Standards
- Strict TypeScript typing (no implicit `any`).
- Clean separation of Server Components (data fetching) and Client Components (`"use client"` for interactivity).
- Maintain existing state structures; do not refactor untouched files or global layouts without explicit instruction.

# 📋 Execution Workflow Rules (Preventing Code Regressions)
- Step 1: **Research, Dependency Mapping & Plan**: Search the codebase for existing implementations. If editing an existing component or utility, find ALL files importing it across all templates. Present an execution plan showing how changes remain backward-compatible BEFORE writing code.
- Step 2: **Targeted Edits**: Modify ONLY files directly related to the current task.
- Step 3: **Verification & Type Check**: Verify that imports exist, running TypeScript/lint checks where possible, ensuring no untouched pages or components were broken. **CRITICAL: You must explicitly verify there are no console errors or warnings overlaying the screen before completing the task.**

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
