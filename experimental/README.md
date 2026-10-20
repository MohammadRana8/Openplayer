# Experimental code (not part of the build)

`ui-kit/` is a set of UI components that nothing in the app uses yet. It does not
type-check as-is (`Button` and `Input` import a `LucideIcon` component that does not exist,
and `Button` reads `tokens.colors.text.on-accent`), so it lives outside `src/` and is
excluded from `tsc`, ESLint and the app bundle.

To adopt a component: move it back into `src/components/`, fix its imports, and use it from a screen.
