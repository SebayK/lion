# 01: Form attribute and .formElement resolution in LionButtonReset

**What to build:** Enable `<lion-button-reset>` (and through inheritance `<lion-button-submit>`) to bind to an external form via the `form="form-id"` attribute or the `.formElement` object property when placed outside the form. The button resolves both native `<form>` elements and `<lion-form>` custom elements, falls back to the host document if inside a ShadowRoot, reacts to property changes at runtime, performs lazy resolution on click if mounting was delayed, and synchronizes `aria-controls` for accessibility.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Declares reactive property `form` (`{ type: String, reflect: true }`) and object property `formElement` on `LionButtonReset`.
- [x] Implements `_resolveForm()` resolving `formElement` (direct reference), `form` attribute via `this.getRootNode().getElementById(...)`, with fallback to `this.ownerDocument.getElementById(...)` when the local root is a `ShadowRoot`.
- [x] Correctly resolves `target._formNode` if the matched element is a `LionForm`, or uses the target directly if it is an `HTMLFormElement`.
- [x] If no `form` or `formElement` is specified, preserves default ancestral form discovery.
- [x] Automatically synchronizes `aria-controls="<form-id>"` on the button element when a form ID is present.
- [x] In `updated(changedProperties)`, cleanly unbinds from the old form via `_teardownSubmitAndResetHelper()` and binds to the newly resolved form via `_setupSubmitAndResetHelper()`.
- [x] In `__clickDelegationHandler`, performs lazy resolution if `!this._form` before delegating the click event.
- [x] In `disconnectedCallback()`, ensures `_teardownSubmitAndResetHelper()` is called.
- [x] Comprehensive tests in `LionButtonReset.suite.js` covering external `<form>`, external `<lion-form>`, `.formElement` property, Shadow DOM document fallback, dynamic form switching, and `aria-controls`.

## Answer

Implemented polymorphic form resolution and lifecycle management in `LionButtonReset`:

- Added `form` reactive property and `formElement` property.
- Added `_resolveForm()` supporting direct references (`formElement`), ID lookup with Shadow DOM host document fallback, resolution of `_formNode` on `LionForm`, and ancestral form discovery.
- Added automatic `aria-controls` synchronization.
- Added dynamic unbinding/rebinding in `updated()` when `form` or `formElement` changes.
- Added lazy resolution in `__clickDelegationHandler` for forms mounted asynchronously after button connection.
- Added cleanup in `disconnectedCallback()`.
- Added unit tests in `LionButtonReset.suite.js` covering detached native forms, detached `<lion-form>`s, `.formElement` property, Shadow DOM host document fallback, dynamic target switching, lazy resolution on late mount, and `aria-controls` sync.
