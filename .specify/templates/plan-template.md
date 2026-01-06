# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., TypeScript 5, Next.js 16.1.1, React 19.2.3 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., Tailwind CSS v4, or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, localStorage, API integration or N/A]  
**Testing**: N/A (Zero Testing Policy - manual verification only)  
**Target Platform**: [e.g., Web browsers (mobile-first responsive) or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **Code Quality**: Uses TypeScript with strict types, follows Next.js/React/Tailwind conventions
- [ ] **Simple UX**: Interface is immediately understandable, minimal clicks, familiar patterns
- [ ] **Responsive Design**: Works mobile-first across 320px-2560px+ viewports
- [ ] **Minimal Dependencies**: No unnecessary packages beyond Next.js/React/Tailwind/TypeScript stack
- [ ] **Zero Testing**: NO test files, test frameworks, or test scripts (manual verification only)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. For Next.js App Router projects, use the structure below.
  Delete unused options and expand the chosen structure with real paths.
  The delivered plan must not include Option labels.
-->

```text
# Next.js App Router Project (DEFAULT for hello-app)
app/
├── (routes)/           # Route groups
├── components/         # Reusable UI components
├── lib/               # Utility functions
├── globals.css        # Global styles (Tailwind)
├── layout.tsx         # Root layout
└── page.tsx           # Home page

public/                # Static assets

# NO tests/ directory - Zero Testing Policy
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
