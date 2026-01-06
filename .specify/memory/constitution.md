# Hello-App Constitution

<!--
SYNC IMPACT REPORT (2026-01-06):
  Version: 1.0.0 (Initial Constitution)
  
  Principles Defined:
    - Code Quality & Standards
    - Simple UX First
    - Responsive Design
    - Minimal Dependencies
    - Zero Testing Policy
  
  Templates Requiring Updates:
    ✅ plan-template.md - Updated to remove testing requirements
    ✅ spec-template.md - Updated to clarify testing is optional
    ✅ tasks-template.md - Already notes tests are optional
  
  Follow-up TODOs: None
-->

## Core Principles

### I. Code Quality & Standards

**MUST**:
- Use TypeScript for all code with strict type checking enabled
- Follow Next.js 16.1.1, React 19.2.3, and Tailwind CSS v4 conventions as defined in package.json
- Use functional components and React hooks; avoid class components
- Maintain consistent code formatting via ESLint configuration
- Write self-documenting code with clear variable/function names
- Keep components small and focused (single responsibility)
- Use Next.js App Router patterns exclusively

**RATIONALE**: Maintainable code prevents technical debt and enables rapid iteration. TypeScript catches errors at compile time. Consistency reduces cognitive load when reading code.

### II. Simple UX First

**MUST**:
- Design for clarity over cleverness; users should immediately understand the interface
- Minimize clicks/steps required to accomplish tasks
- Use familiar UI patterns; avoid reinventing standard interactions
- Provide clear visual feedback for all user actions
- Ensure text content is readable (adequate contrast, sizing, spacing)
- Test interfaces with real user scenarios before considering complete

**MUST NOT**:
- Add features that don't directly support user goals
- Create complex navigation structures; prefer flat hierarchies
- Use animations/transitions that delay user actions
- Overwhelm users with options; progressive disclosure when complexity unavoidable

**RATIONALE**: Simple experiences reduce user frustration and support onboarding. Complex UX creates barriers and increases support burden. User time is the most valuable resource.

### III. Responsive Design

**MUST**:
- Design mobile-first, then progressively enhance for larger screens
- Ensure all features work across viewport sizes (320px to 2560px+)
- Use Tailwind's responsive utilities (sm:, md:, lg:, xl:, 2xl:) for layout adaptation
- Test layouts at mobile (375px), tablet (768px), and desktop (1440px) breakpoints minimum
- Ensure touch targets are minimum 44×44px on mobile
- Use fluid typography and spacing that scales with viewport

**MUST NOT**:
- Rely on fixed pixel dimensions that break at different viewports
- Hide critical features on mobile; adapt, don't remove
- Assume input method (support both touch and mouse/keyboard)
- Use horizontal scrolling unless explicitly designed (e.g., carousels with clear affordance)

**RATIONALE**: Users access applications from diverse devices. A poor mobile experience alienates a significant user base. Responsive design is non-negotiable in modern web development.

### IV. Minimal Dependencies

**MUST**:
- Evaluate necessity before adding any new dependency (npm package)
- Prefer built-in Next.js/React/Tailwind solutions over third-party libraries
- Document justification for each dependency beyond core stack (Next.js, React, Tailwind, TypeScript)
- Remove unused dependencies immediately
- Audit dependencies regularly for security vulnerabilities (npm audit)

**MUST NOT**:
- Install packages for trivial functionality that can be implemented in <50 lines
- Add UI component libraries; use Tailwind to build custom components
- Install multiple packages that solve the same problem

**RATIONALE**: Dependencies increase bundle size, create security risks, and add maintenance burden. Each dependency is a potential point of failure or version conflict. Lean projects are faster, more secure, and easier to maintain.

### V. Zero Testing Policy (NON-NEGOTIABLE)

**MUST NOT**:
- Write unit tests, integration tests, or end-to-end tests
- Install testing frameworks (Jest, Vitest, React Testing Library, Playwright, Cypress, etc.)
- Create test files or test directories
- Add test scripts to package.json
- Reference testing in documentation or workflows

**MUST**:
- Verify functionality manually during development
- Use TypeScript's type system to catch errors at compile time
- Rely on ESLint for code quality enforcement
- Test manually in browser across required viewports

**RATIONALE**: This is a learning/study project focused on observability, not production deployment. Testing infrastructure adds complexity and slows iteration. Manual verification is sufficient for the project's educational goals.

## Technology Stack

**Core Stack** (locked versions from package.json):
- Next.js: 16.1.1
- React: 19.2.3
- React DOM: 19.2.3
- Tailwind CSS: v4
- TypeScript: v5
- ESLint: v9 (with eslint-config-next 16.1.1)

**Rationale for Stack**:
- Next.js provides server-side rendering, routing, and build optimization
- React 19+ offers latest performance improvements and concurrent features
- Tailwind v4 enables rapid, consistent styling without CSS files
- TypeScript ensures type safety and better IDE support
- ESLint enforces code quality without test suites

**Permitted Additions**:
- Observability/monitoring tools (project focus area)
- Necessary API clients (if feature requires external service integration)

**Forbidden Additions**:
- Any testing library or framework
- UI component libraries (use Tailwind to build components)
- State management libraries unless complexity clearly justifies (start with React state/context)
- Alternative styling solutions (CSS-in-JS libraries, Sass, etc.)

## Development Workflow

### Code Review Requirements

- All changes reviewed for adherence to these principles
- Manual verification required: reviewer MUST run code and test user scenarios
- TypeScript compilation MUST pass with zero errors
- ESLint MUST pass with zero errors/warnings
- Changes MUST work responsively across mobile, tablet, desktop

### Quality Gates

1. **Constitution Check**: Feature MUST align with all five principles
2. **Type Safety**: No TypeScript `any` types without explicit justification
3. **Responsive Verification**: Manual testing at 375px, 768px, 1440px minimum
4. **Bundle Impact**: New dependencies require explicit justification in PR description
5. **UX Clarity**: Reviewer MUST understand feature immediately without explanation

### Complexity Justification

If a change violates simplicity principles (complex state, nested logic, performance optimization), the PR MUST include:
- Description of the problem requiring complexity
- Explanation of why simpler alternatives were insufficient
- Comment in code explaining complex sections

## Governance

This constitution supersedes all other development practices and guidelines.

**Amendment Process**:
1. Propose changes in written form with rationale
2. Discuss impact on existing code and development velocity
3. Update constitution version following semantic versioning
4. Update all dependent templates and documentation
5. Communicate changes to all contributors

**Versioning Policy**:
- MAJOR: Removing/redefining core principles (e.g., allowing tests would be 2.0.0)
- MINOR: Adding new principles or expanding guidance (e.g., new section)
- PATCH: Clarifications, typo fixes, non-semantic refinements

**Compliance Review**:
- All pull requests MUST verify alignment with constitution
- Constitution violations require explicit justification
- Repeated violations trigger constitution amendment discussion

**Version**: 1.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
