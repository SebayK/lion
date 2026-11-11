---
'@lion/ui': minor
---

Support detached form buttons and the `form` attribute on `<lion-button-submit>` and `<lion-button-reset>`.

Buttons can now be placed outside of `<form>` and `<lion-form>` elements (such as in sticky footers, headers, drawers, or dialog actions):

- **`form="form-id"` attribute**: Polymorphic association resolving native `<form>` elements and `<lion-form>` custom elements, with Shadow DOM fallback to host document scope.
- **`.formElement` property**: Direct object reference (`HTMLFormElement | LionForm`) to bypass Shadow DOM encapsulation boundaries.
- **Accessibility**: Automatic synchronization of `aria-controls="form-id"`.
- **Implicit submission**: Automatic registration with `implicitHelperMap` ensures pressing `Enter` inside form inputs continues to submit the form.
- **ID management in `LionForm`**: Automatic suffixed native ID assignment (`foo__native` or fallback `_inputId`) eliminates duplicate ID collisions in the document.
