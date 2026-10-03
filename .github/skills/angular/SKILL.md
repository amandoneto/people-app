---
name: angular
description: You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.
---

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
## Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
## Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
## Styling
- Use Tailwind CSS utility classes as the default way to style Angular templates.
- Prefer responsive, state, and accessibility variants provided by Tailwind over custom CSS when they express the design clearly.
- Use component stylesheets for styles that cannot be expressed cleanly with Tailwind utilities; avoid duplicating Tailwind rules in custom CSS.
- Keep class lists readable and preserve consistent spacing, color, and typography choices across the application.
## UI Components
- Use shadcn/ui as the default component system and design reference for UI work. Prefer its reusable primitives and patterns for buttons, fields, cards, dialogs, and other common controls instead of rebuilding those controls ad hoc in feature templates.
- Use an Angular-compatible shadcn implementation already present in the project when available. Do not import React shadcn/ui components into Angular code.
- If no Angular-compatible shadcn components are installed, build only the shadcn-style Angular primitives needed for the requested UI using the project's Tailwind setup, native Angular templates, and accessible HTML semantics. Keep reusable primitives separate from feature components; do not add a component library dependency unless the task requires it.
- Preserve the shadcn component API and interaction patterns where practical, including variants, sizes, disabled/focus states, labels, descriptions, and validation states.
### Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
## State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
## Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).
- Do not write Regular expressions in templates (they are not supported).
## Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Follow the [Angular Service Structure Rule](./rules/service-structure.md) when placing services and domain code.