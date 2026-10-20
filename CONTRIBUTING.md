# Contributing to OpenPlayer

Thank you for your interest in contributing to OpenPlayer! This document outlines the guidelines for contributing.

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/openplayer.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feat/your-feature`
5. Make your changes
6. Run tests: `npm test`
7. Run lint: `npm run lint`
8. Run typecheck: `npm run typecheck`
9. Commit: `git commit -m "feat: your feature"`
10. Push and open a PR

## Development Guidelines

### Code Style

- Use **TypeScript** for all application code
- Follow **Prettier** formatting (config in `.prettierrc`)
- Use **ESLint** with the project's rules
- Write **self-documenting code** — avoid comments unless necessary
- Use **semantic variable names**

### Architecture Principles

1. **No network**: no code changes should introduce network calls
2. **Offline First**: All features must work without internet
3. **Privacy First**: No analytics, crash reporting, or tracking
4. **Local Storage**: Use SQLite (Drizzle ORM) for structured data, MMKV for preferences

### Database Changes

- Append a new entry to `MIGRATIONS` in `src/db/migrations.ts`. Never edit a migration that has shipped.
- Update `src/db/schema.ts` so the Drizzle definitions match the SQL
- Update `src/services/DatabaseService.ts` with new CRUD methods

### State Management

- Use Zustand for client-side state
- Use DatabaseService for persisted state
- Separate concerns: Player, Library, UI, Equalizer, Settings
- Never duplicate server state in stores

### UI Components

- Use the design tokens from `replica/design/tokens.json`
- All components must meet WCAG AA contrast
- Touch targets ≥ 48×48dp
- Support dark mode
- Use Lucide React Native for icons (no custom icon sets)

## Testing

```bash
# Unit tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Writing Tests

- Place tests in `__tests__/` directory alongside the modules they test
- Use `@testing-library/react-native` for component tests
- Use `jest` for utility and service tests
- Aim for 80%+ code coverage

## Pull Request Process

1. Ensure all checks pass (CI will run them)
2. Update README/docs if needed
3. Add entry to changelog (if applicable)
4. Get at least one review from maintainers
5. Squash and merge

## Code of Conduct

### Privacy & Open Source Compliance

All contributions must:
- Not introduce any network permissions
- Not add proprietary or non-free libraries
- Not include tracking, analytics, or advertising
- Be compatible with the MIT license
- Be original work or properly attributed

### Reporting Security Issues

Please read our [Security Policy](SECURITY.md) to report vulnerabilities.

## Questions?

- Join our [GitHub Discussions](https://github.com/openplayer-project/openplayer/discussions)
- File an issue with the `question` label

Happy coding!