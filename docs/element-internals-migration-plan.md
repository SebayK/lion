# ElementInternals Migration Plan

This document outlines an analysis of the `@lion/ui/components/form-core` and a feasible plan for migrating to the native `ElementInternals` API.

### 1. Analysis of the Current Implementation

The `@lion/ui/components/form-core` provides a comprehensive and highly extensible system for creating form elements. It is built upon a series of composable mixins that handle different aspects of a form control's lifecycle and behavior.

- **`FormRegisteringMixin` & `FormRegistrarMixin`**: This pair creates a custom, JavaScript-based form registration system, allowing parent groups to manage child controls. This is a system that `ElementInternals` is designed to replace natively.
- **`FormControlMixin`**: This is the foundational mixin that manages the core structure (label, help-text, input element) and accessibility via manual ARIA attribute wiring.
- **`FormatMixin`**: Manages value conversions (parsing, formatting, serialization). The `serializedValue` is a direct analog to the value `ElementInternals` would submit.
- **`ValidateMixin`**: A powerful, custom validation system that tracks multiple validation types and manages feedback visibility based on interaction states. This is the most complex part to map to `ElementInternals`.
- **`InteractionStateMixin`**: Tracks user interaction states like `touched` and `dirty`. These are application-level UX concerns that are mostly outside the scope of `ElementInternals`.
- **`FocusMixin`**: Manages `focused` and `focusedVisible` states, which can be partially replaced by native CSS pseudo-classes provided through `ElementInternals`.
- **`FormGroupMixin` & `ChoiceGroupMixin`**: These handle composite components like fieldsets and radio/checkbox groups, which require special consideration as `ElementInternals` is primarily for single-value controls.

### 2. Feasibility of Migration

Migrating to `ElementInternals` is **highly feasible and recommended**. It offers significant benefits by replacing custom machinery with native browser functionality, leading to simplification, better performance, and improved standards compliance.

However, the migration is **not a simple drop-in replacement**. The richness of the existing Lion API means a careful, feature-by-feature mapping is required.

### 3. Migration Plan

The migration can be broken down into the following phases:

---

#### ✅ Phase 1: Adopt `ElementInternals` and Refactor Form Association

1.  **Enable `ElementInternals`**:
    - In the base form component (`LionField`), add the static property: `static formAssociated = true;`.
    - In the constructor, attach the internals object: `this._internals = this.attachInternals();`.

2.  **Refactor `FormatMixin` for Value Submission**:
    - After computing the `serializedValue`, use the `ElementInternals` API to set the form value.
    - Modify `_calculateValues` to call `this._internals.setFormValue(this.serializedValue)`. This makes the component's value available to the parent `<form>`.

3.  **Deprecate Custom Registration System**:
    - The `FormRegisteringMixin` and `FormRegistrarMixin`, which rely on the `form-element-register` event, can be largely deprecated. Native form association is now handled by the browser.
    - The `formElements` collection in `FormGroupMixin` may still be useful for programmatic group management but is no longer needed for basic registration.

---

#### ✅ Phase 2: Migrate the Validation System

This is the most critical phase, mapping the custom `ValidateMixin` to `ElementInternals`.

1.  **Refactor `ValidateMixin` to use `setValidity()`**:
    - The primary goal of the `validate()` method will now be to construct a `ValidityStateFlags` object and a validation message.
    - This single call will replace the management of `hasFeedbackFor`, `showsFeedbackFor`, and `validationStates`.
    - `this._internals.setValidity(validityFlags, validationMessage);`

2.  **Map Lion Validators to `ValidityStateFlags`**:
    - `Required`: Maps to `setValidity({ valueMissing: true }, message)`.
    - `MinLength`: Maps to `setValidity({ tooShort: true }, message)`.
    - `MaxLength`: Maps to `setValidity({ tooLong: true }, message)`.
    - `Pattern`: Maps to `setValidity({ patternMismatch: true }, message)`.
    - `IsEmail`, `IsNumber`: Map to `setValidity({ typeMismatch: true }, message)`.
    - All other custom validators will use the generic flag: `setValidity({ customError: true }, message)`.
    - If validation passes, call `this._internals.setValidity({})`.

3.  **Utilize Native Validation pseudo-classes**:
    - Replace custom attribute-based styling (e.g., `:host([has-feedback-for~="error"])`) with the native pseudo-classes `:valid` and `:invalid`, which will now work directly on the host component.

4.  **Update Validation Message Display**:
    - The custom `lion-validation-feedback` component can be kept for consistent UI.
    - Instead of listening for custom events, it should now read the validation message directly from `this._internals.validationMessage`.
    - The logic in `InteractionStateMixin` (`touched`, `dirty`) should still be used to determine _when_ to show the feedback component, preserving the desired UX.

---

#### ✅ Phase 3: Simplify State Management

1.  **Refactor `FocusMixin` and `DisabledMixin`**:
    - The browser will now automatically apply `:focus`, `:focus-visible`, and `:disabled` pseudo-classes to the host component.
    - This reduces the need for JavaScript-based state tracking and attribute reflection for styling purposes. The mixins can be simplified to handle only the logic that remains necessary (like the `focusedVisible` polyfill).

2.  **Retain `InteractionStateMixin`**:
    - `ElementInternals` does not handle `dirty` or `touched` states. These are crucial for the user experience of showing validation messages and should be kept as they are.

---

#### ✅ Phase 4: Handle Composite Components

1.  **Address `FormGroupMixin` and `ChoiceGroupMixin`**:
    - `ElementInternals` is designed for single-value controls. A fieldset itself does not have a value for submission.
    - Therefore, the migration path here is a hybrid one:
      - The child elements (`lion-input`, `lion-checkbox`) within the group will use `ElementInternals` to associate with the parent `<form>`.
      - The `FormGroupMixin` and `ChoiceGroupMixin` will retain their roles for aggregating child values into a `modelValue` object, running group-level validations, and managing children (e.g., `resetGroup`). They will not use `setFormValue` themselves.

### Summary of Benefits

- **Native Form Integration**: Components will work seamlessly with `<form>` elements (submission, reset, `form.elements` collection).
- **Simplified Code**: The custom JavaScript-based form registration system can be removed.
- **Native Styling**: Direct use of standard CSS pseudo-classes like `:valid`, `:invalid`, `:disabled` on the host component.
- **Improved Standards Compliance**: Aligns with the modern web platform for building form-participating components.
