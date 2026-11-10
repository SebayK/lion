# 03: ID and native node management in LionForm

**What to build:** In `LionForm`, automatically manage unique ID assignment for the internal native `_formNode` to eliminate duplicate ID collisions between `<lion-form id="x">` and its nested `<form>` in the DOM. If `<lion-form>` has an ID, assign a unique suffixed ID (`x__native`) to `_formNode` (unless the user has explicitly defined an ID on `<form>`). If no ID is present, assign the inherited `_inputId` from `FormControlMixin`.

**Blocked by:** 01 (Form attribute and .formElement resolution in LionButtonReset)

**Type:** task

**Status:** resolved

- [x] In `LionForm.connectedCallback()`, inspects `this._formNode`.
- [x] If `!this._formNode.id`:
  - If `this.id` is present on `<lion-form>`, sets `this._formNode.id = \`${this.id}\_\_native\``.
  - Otherwise sets `this._formNode.id = this._inputId`.
- [x] Does not overwrite any pre-existing custom `id` explicitly defined on `<form>`.
- [x] Guarantees no duplicate IDs exist between `<lion-form>` and `<form>` in the document.
- [x] Unit tests in `lion-form.test.js` validating ID assignment logic, avoiding collisions, and verifying compatibility with external button form targets.
