# 04: Documentation, interactive demos, and changeset

**What to build:** Update the documentation and examples for Lion Button to demonstrate usage with detached forms (e.g., sticky action footers and dialogs using `form="form-id"` and `.formElement`), update TypeScript type definitions in `exports/types/button.ts`, and create a changeset for `@lion/ui`.

**Blocked by:** 01 (Form attribute and .formElement resolution in LionButtonReset), 02 (Implicit submission lifecycle in LionButtonSubmit), 03 (ID and native node management in LionForm)

**Type:** task

**Status:** resolved

- [x] Documentation updated in `docs/components/button/use-cases.md` with an example of `<lion-button-submit form="...">` and `<lion-button-reset form="...">` placed outside `<form>`.
- [x] TypeScript types in `packages/ui/components/button/types/index.ts` and `packages/ui/exports/types/button.ts` include `form` and `formElement` properties.
- [x] A minor changeset is created via `.changeset/` documenting the new detached form button capability on `@lion/ui`.
- [x] All build checks, lint, and test suites across the repository pass green.

## Answer

Completed documentation, TypeScript type exports, and changeset for detached form button support:

- Documented detached form usage in `docs/components/button/use-cases.md`, including an interactive preview story using `form="form-id"`, explanations of polymorphic `<form>` and `<lion-form>` resolution, Shadow DOM fallback, `aria-controls` reflection, and `.formElement` property usage, as well as sticky footers and dialog action bars.
- Defined and exported `FormAssociation` and `FormElementTarget` in `packages/ui/components/button/types/index.ts` and `packages/ui/exports/types/button.ts`.
- Documented `@property {string} [form]` and `@property {HTMLFormElement | import('../../form/src/LionForm.js').LionForm} [formElement]` on `LionButtonReset` and `LionButtonSubmit`.
- Created changeset `.changeset/detached-form-buttons.md` documenting minor release for `@lion/ui`.
