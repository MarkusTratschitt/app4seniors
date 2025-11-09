# Copilot Instructions for App4Seniors

## Project Overview
This is a **Nuxt 4** PWA designed for seniors to learn technology through step-by-step tutorials. The app is built with strict **WCAG 2.2 AA accessibility** requirements, **offline-first** architecture, and **German UX/content**.

## Core Architecture

### Framework Stack
- **Nuxt 4** with Vue 3 Composition API and TypeScript strict mode
- **Pug templates** for HTML (`lang="pug"` in `<template>` blocks)
- **Less stylesheets** with CSS custom properties from `tokens.less`
- **Pinia** for state management (`stores/app.ts` contains contrast preferences)
- **Vitest + Playwright** for unit/e2e testing

### Content Structure
- **HowTo tutorials** are JSON files in `content/howtos/{platform}/filename.json`
- Each HowTo follows the strict schema in `types/content.ts` (id, slug, steps, media)
- Validation is enforced via `lib/validateHowTo.ts` and `scripts/validate-content.ts`
- Content is organized by platform: `android/`, `ios/`, `ipados/`, `macos/`, `windows/`

### Key Patterns

#### File Organization
```
app/                    # Main Nuxt app directory
├── pages/              # File-based routing
├── components/         # Vue SFCs with accessibility focus
├── layouts/            # Default layout with skip links, contrast toggle
└── assets/styles/      # Less files: base.less, tokens.less, howto.less

lib/                    # Business logic utilities
├── search.ts           # Content search functionality
├── validateHowTo.ts    # Content validation with German error messages
└── voice/              # Voice search platform abstraction
```

#### Component Conventions
- All components use **Pug templates** (`template lang="pug"`)
- **Scoped Less styles** with CSS custom properties from `tokens.less`
- **TypeScript strict** with proper `defineOptions({ name: "ComponentName" })`
- **Accessibility-first**: ARIA attributes, focus management, high contrast support

#### Content Loading Pattern
HowTo pages use **compile-time imports** via `import.meta.glob()`:
```typescript
const howToModules = import.meta.glob<HowTo>("../../../../content/howtos/**/*.json", {
  import: "default", 
  eager: true
});
```

#### Voice Search Architecture
- Platform-agnostic adapter pattern in `lib/voice/` 
- Web implementation via `webVoiceAdapter.ts`
- Stub adapters for Capacitor/Tauri with graceful fallbacks
- Components handle permission states and error recovery

#### Accessibility Requirements
- **High contrast toggle** with persistent localStorage (`app.ts` store)
- **Skip links** and proper heading hierarchy in all layouts
- **focus-visible** styles for keyboard navigation
- **Screen reader** announcements via `NuxtRouteAnnouncer`
- **German language** attributes and content (`html[lang="de"]`)

## Development Commands

```bash
npm run dev              # Development server
npm run build           # Production build
npm run test            # Unit tests with Vitest
npm run e2e             # Playwright e2e tests
npm run lint            # ESLint + Vue linting
npm run stylelint       # Less/CSS linting
npm run typecheck       # Vue TSC type checking
npm run validate-content # Validate HowTo JSON schemas
npm run run:codex       # AI-assisted code generation
```

## Critical Development Rules

### Content Validation
- **Always run** `npm run validate-content` after modifying HowTo JSON files
- Use TypeScript types from `types/content.ts` for all content operations
- HowTo slugs must be unique and URL-safe

### Accessibility Compliance  
- Test keyboard navigation (TAB, Enter, Escape)
- Verify 4.5:1 contrast ratio in both normal and high-contrast modes
- Include proper `alt` text for all media in HowTo steps
- Test with screen readers (VoiceOver/NVDA)

### Code Generation Integration
- The `Codex/` directory contains AI prompts for automated code generation
- Use `npm run run:codex` for AI-assisted feature development
- Follow the strict output format: `=== write:<path> ===` or `=== patch:<path> ===`

### Testing Strategy
- **Unit tests**: Vue Test Utils + Vitest for components and utilities
- **E2E tests**: Playwright for user workflows and accessibility
- **Content validation**: Automated schema checking for all HowTo files
- **Offline testing**: Service worker and PWA functionality

## Content Creation Workflow for HowTo Tutorials

### Creating New HowTo Content

1. **File Naming Convention**
   ```
   content/howtos/{platform}/{platform}-{feature-name}.json
   ```
   Examples: `android-screenshot.json`, `windows-taskleiste-pin.json`

2. **Required JSON Structure** (strictly validated)
   ```typescript
   {
     "id": "howto-{platform}-{feature}",        // Unique across all content
     "slug": "{platform}-{feature}",            // URL-safe, used in routing
     "os": "android|ios|ipados|macos|windows",  // Must match platform folder
     "osVersion": { "min": "12", "max": "14" }, // Version compatibility
     "title": "German user-friendly title",     // What users see
     "summary": "Brief explanation in German",  // Search/preview text
     "keywords": ["german", "terms"],           // For search functionality
     "estimatedMinutes": 5,                    // Realistic completion time
     "steps": [/* Step objects */]              // 2-6 steps typical
   }
   ```

3. **Step Structure Requirements**
   - Each step needs unique `id`, `order`, `title`, `description`
   - Media is optional but recommended (images/videos with proper `alt` text)
   - Tips are optional but helpful for complex steps
   - Use German language throughout with simple, senior-friendly wording

4. **Media Guidelines**
   - Store placeholder paths: `/media/placeholders/{platform}/filename.{ext}`
   - Always include descriptive `alt` text in German
   - Video files should include `poster` images
   - Use consistent naming: `{feature}-step{number}.{ext}`

5. **Validation Workflow**
   ```bash
   # After creating/editing any HowTo file:
   npm run validate-content
   ```
   - **Must pass validation** before committing
   - German error messages help identify issues
   - Checks schema compliance, required fields, and data types

6. **Content Guidelines**
   - **Target audience**: Seniors with basic tech knowledge
   - **Language**: Simple German, avoid jargon
   - **Step count**: 2-6 steps (longer tutorials become overwhelming)
   - **Completion time**: Realistic estimates (3-10 minutes typical)
   - **Platform specificity**: Match OS versions accurately

### Testing New Content

1. **Content Validation**: `npm run validate-content` (required)
2. **Local Testing**: Start dev server and navigate to `/howto/{slug}`
3. **Accessibility Testing**: Test keyboard navigation and screen reader compatibility
4. **Cross-browser Testing**: Ensure media files load properly

## Common Patterns to Follow

1. **New HowTo Content**: Use existing JSON structure, validate immediately
2. **New Components**: Pug + Less + TypeScript with accessibility attributes  
3. **Voice Features**: Extend adapters in `lib/voice/` with fallback handling
4. **Styling**: Use CSS custom properties from `tokens.less`, support high contrast
5. **Navigation**: Maintain skip links and proper focus management

When adding features, prioritize **progressive enhancement**, **offline capabilities**, and **accessibility** over complex functionality.