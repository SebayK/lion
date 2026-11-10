# 02: Implicit submission lifecycle in LionButtonSubmit for detached buttons

**What to build:** Ensure detached `<lion-button-submit>` elements targeting an external form correctly register an implicit submit helper button in that form's DOM tree. Pressing `Enter` inside any text input of the targeted form must trigger implicit form submission even when the submit button resides entirely outside the form. When the detached submit button is removed from the DOM or changes its form target, its registration in `implicitHelperMap` and its DOM helper button are cleaned up without leaking nodes or event listeners.

**Blocked by:** 01 (Form attribute and .formElement resolution in LionButtonReset)

**Status:** resolved

- [x] Detached `<lion-button-submit form="form-id">` creates or reuses an implicit submit helper in the targeted external form upon connection.
- [x] Pressing `Enter` in a form input triggers form submission via the implicit helper when the submit button is detached.
- [x] When multiple detached submit buttons target the same form, at most one implicit submit helper element is attached to that form.
- [x] When a detached submit button is disconnected or changes its `form` reference, its registration in `implicitHelperMap` is removed, and the helper element is removed from the form if no other submit button is registered.
- [x] Comprehensive unit tests in `LionButtonSubmit.suite.js` covering implicit submission on `Enter` keypress for detached submit buttons and lifecycle cleanup upon disconnect.

## Answer

Implemented implicit submission lifecycle and cleanup in `LionButtonSubmit` for detached buttons:

- Overrode `_setupSubmitAndResetHelper()` and `_teardownSubmitAndResetHelper()` instead of only `OnConnected`/`OnDisconnected` so that dynamic updates (`form`, `formElement`, `type`) properly register/deregister from `implicitHelperMap`.
- Ensured disconnecting or changing form targets removes the helper element and wrapper `div` without leaking orphaned DOM nodes or firing redundant MutationObserver callbacks.
- Added support for multiple detached submit buttons sharing a single implicit helper in the targeted form.
- Added dynamic `type` change handling in `updated(changedProperties)` to register/deregister implicit submit helpers.
- Added comprehensive unit tests in `LionButtonSubmit.suite.js` verifying implicit submission on `Enter` for detached native forms and `<lion-form>`s, sharing of a single helper between multiple detached buttons, lifecycle cleanup on disconnect, dynamic `form` and `.formElement` switching, and dynamic `type` transitions.
