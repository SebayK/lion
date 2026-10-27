# GitHub Issues Triage Report: Obsolete & Resolved Issues

> **Date**: October 2026  
> **Repository**: [ing-bank/lion](https://github.com/ing-bank/lion)  
> **Scope**: 96 open issues reviewed against `master` branch (commit `78c970b6f`)  
> **Summary**: 20 issues identified as either resolved in code, obsolete due to major architectural migrations, or invalid/wontfix.

---

## Quick Navigation

- [Group 1: Issues Already Resolved in Code (6)](#group-1-issues-already-resolved-in-code)
- [Group 2: Issues Obsolete via Major Migrations (9)](#group-2-issues-obsolete-via-major-migrations)
- [Group 3: Issues Not a Bug / User Configuration / Wontfix (5)](#group-3-issues-not-a-bug--user-configuration--wontfix)
- [Ready-to-use GitHub Closure Comments](#ready-to-use-github-closure-comments)

---

## Overview Table

|                        Issue #                        | Title                                                                                                          |      Category       |  Recommended Action  | Resolution / Reason                                                                                                             |
| :---------------------------------------------------: | -------------------------------------------------------------------------------------------------------------- | :-----------------: | :------------------: | ------------------------------------------------------------------------------------------------------------------------------- |
| [#1504](https://github.com/ing-bank/lion/issues/1504) | Indeterminate checkbox combined with disabled                                                                  |  Resolved in Code   |  Close as completed  | Fixed by PR [#1698](https://github.com/ing-bank/lion/pull/1698) (commit `05e17d69e`)                                            |
| [#1967](https://github.com/ing-bank/lion/issues/1967) | [LionCheckboxIndeterminate]                                                                                    |  Resolved in Code   |  Close as completed  | Fixed by PR [#2458](https://github.com/ing-bank/lion/pull/2458) (commit `22b8f2480`)                                            |
| [#1787](https://github.com/ing-bank/lion/issues/1787) | [input-datepicker] cannot extend LionInputDatePicker due to TypeScript problem                                 |  Resolved in Code   |  Close as completed  | Fixed by commit `8a02bdd67` (converted private to protected in mixin hosts)                                                     |
| [#2009](https://github.com/ing-bank/lion/issues/2009) | Extending LionTooltip results in typescript error                                                              |  Resolved in Code   |  Close as completed  | Fixed by commit `8a02bdd67`                                                                                                     |
| [#2065](https://github.com/ing-bank/lion/issues/2065) | Extending Input has incorrect types with typescript.                                                           |  Resolved in Code   |  Close as completed  | Fixed by commit `8a02bdd67`                                                                                                     |
| [#2336](https://github.com/ing-bank/lion/issues/2336) | [docs] dark theme                                                                                              |  Resolved in Code   |  Close as completed  | Implemented in Astro site (commits `efe5d28cd` & `946603382`)                                                                   |
| [#1592](https://github.com/ing-bank/lion/issues/1592) | Adding autofocus to lion-input/lion-button inside lion-dialog will give Maximum call stack size exceeded error |      Obsolete       |  Close as completed  | `contain-focus.js` deleted; migrated to native `<dialog>` in PR [#2700](https://github.com/ing-bank/lion/pull/2700)             |
| [#1754](https://github.com/ing-bank/lion/issues/1754) | [Overlays] Keyboard focus trap dialog breaks in Mozilla Firefox when content is scrollable                     |      Obsolete       |  Close as completed  | `contain-focus.js` deleted; migrated to native `<dialog>` in PR [#2700](https://github.com/ing-bank/lion/pull/2700)             |
| [#1773](https://github.com/ing-bank/lion/issues/1773) | [Overlays] Upon opening a modal in Safari, tabbing does not work when content is a webcomponent                |      Obsolete       |  Close as completed  | `contain-focus.js` deleted; migrated to native `<dialog>` in PR [#2700](https://github.com/ing-bank/lion/pull/2700)             |
| [#1513](https://github.com/ing-bank/lion/issues/1513) | Overlay events are not detected by React                                                                       |      Obsolete       |  Close as completed  | Content DOM no longer moved to `document.body`; retained in host slots (PR [#2700](https://github.com/ing-bank/lion/pull/2700)) |
| [#1761](https://github.com/ing-bank/lion/issues/1761) | Netlify search box seems to link to the wrong paths                                                            |      Obsolete       |  Close as obsolete   | Rocket docs replaced by Astro + Pagefind                                                                                        |
| [#2347](https://github.com/ing-bank/lion/issues/2347) | Docs: Size selector in demos breaks the demo                                                                   |      Obsolete       |  Close as obsolete   | Broken legacy Rocket size button disabled in `OJPreview.js`                                                                     |
| [#1565](https://github.com/ing-bank/lion/issues/1565) | Providence dashboard doesn't open under Windows                                                                |      Obsolete       |  Close as obsolete   | `es-dev-server` removed; replaced with `miniDevServer` (commit `8238df2cf`)                                                     |
| [#1566](https://github.com/ing-bank/lion/issues/1566) | providence.conf.js 404 in providence dashboard under Windows                                                   |      Obsolete       |  Close as obsolete   | Same as #1565; resolved by commit `8238df2cf`                                                                                   |
| [#1667](https://github.com/ing-bank/lion/issues/1667) | \[form-core\]\[input-tel\] Static class fields usage makes lion load fail through unpkg                        | Obsolete / External |   Close as wontfix   | Upstream unpkg parser bug with ES2022 static fields; unbundled packages consolidated to `@lion/ui`                              |
| [#2321](https://github.com/ing-bank/lion/issues/2321) | [LionSwitch] modelValue synced after @checked-changed event is fired                                           |      Not a Bug      | Close as not planned | Works as intended; consumers must listen to `@model-value-changed` on `LionSwitch`                                              |
| [#2178](https://github.com/ing-bank/lion/issues/2178) | (React) checkbox group and checkbox do not render                                                              |  User Config Error  | Close as not planned | Missing element definitions (`@lion/ui/define/lion-checkbox.js`)                                                                |
| [#2487](https://github.com/ing-bank/lion/issues/2487) | [LionInput] Screen reader announces twice if Input is set as a live region                                     |    Invalid Usage    | Close as not planned | Form inputs should not be configured with `aria-live="polite"`                                                                  |
| [#2571](https://github.com/ing-bank/lion/issues/2571) | [LionTextarea] Prefill value via HTML                                                                          |    Invalid Usage    | Close as not planned | Lit `.modelValue` property binding cannot be used in static Twig HTML templates                                                 |
| [#1382](https://github.com/ing-bank/lion/issues/1382) | Validators error                                                                                               |   Stale / Config    | Close as not planned | Duplicate package installation in legacy unbundled setup                                                                        |

---

## Detailed Findings

### Group 1: Issues Already Resolved in Code

#### 1. Issue [#1504](https://github.com/ing-bank/lion/issues/1504) - Indeterminate checkbox combined with disabled

- **Date**: Oct 1, 2021
- **Component**: `packages/ui/components/checkbox-group`
- **Resolution**: Fixed in PR [#1698](https://github.com/ing-bank/lion/pull/1698) (commit `05e17d69e`: `fix(checkbox-group): indeterminate checkbox respects disabled states (#1698)`).
- **Code Reference**: [LionCheckboxIndeterminate.js](file:///Users/sebastian/Projects/lion/packages/ui/components/checkbox-group/src/LionCheckboxIndeterminate.js#L167-L172). Lines 167–172 filter out disabled checkboxes when syncing checked states (`this._subCheckboxes.filter(checkbox => !checkbox.disabled).forEach(...)`).
- **Tests**: `packages/checkbox-group/test/lion-checkbox-indeterminate.test.js` contains comprehensive test assertions verifying that disabled children are preserved.

#### 2. Issue [#1967](https://github.com/ing-bank/lion/issues/1967) - [LionCheckboxIndeterminate]

- **Date**: Apr 19, 2023
- **Component**: `packages/ui/components/checkbox-group`
- **Resolution**: Fixed in PR [#2458](https://github.com/ing-bank/lion/pull/2458) (commit `22b8f2480`: `Fix indeterminate checkbox edge cases (#2458)`).
- **Root Cause & Fix**: The reporter noticed that `_onRequestToAddFormElement` called `_setOwnCheckedState()` prior to registering the child element. Commit `22b8f2480` introduced `__addToSubCheckboxes` and `__removeFromSubCheckboxes`, ensuring registration occurs prior to state synchronization.
- **Tests**: Unit tests added in `lion-checkbox-indeterminate.test.js` verifying edge cases for dynamically added and removed checkboxes.

#### 3. Issue [#1787](https://github.com/ing-bank/lion/issues/1787) - [input-datepicker] cannot extend LionInputDatePicker due to TypeScript problem

- **Date**: Oct 6, 2022
- **Component**: `packages/ui/components/input-datepicker`
- **Resolution**: Fixed by commit `8a02bdd67` (`feat(ui): make the emitted declarations consumer-clean without skipLibCheck`).
- **Root Cause & Fix**: Error TS2509 (`Type '...' is missing the following properties from type 'HTMLElement'`) was caused by private properties on Mixin Host classes, which collapsed prototype chains to `never`. All private properties were converted to `protected` in `*MixinTypes.ts`.
- **Verification**: Verified using `npx tsc -p packages/ui/tsconfig.json --noEmit` which exits cleanly with 0 errors.

#### 4. Issue [#2009](https://github.com/ing-bank/lion/issues/2009) - Extending LionTooltip results in typescript error

- **Date**: Jun 10, 2023
- **Component**: `packages/ui/components/tooltip`
- **Resolution**: Fixed by commit `8a02bdd67`.
- **Root Cause & Fix**: Same mixin inheritance issue as #1787. Subclassing `LionTooltip` previously failed TypeScript verification.
- **Verification**: Tested compiling `class DemoTooltip extends LionTooltip {}` under `packages/ui/tsconfig.json`; passes with 0 errors.

#### 5. Issue [#2065](https://github.com/ing-bank/lion/issues/2065) - Extending Input has incorrect types with typescript

- **Date**: Aug 24, 2023
- **Component**: `packages/ui/components/input`
- **Resolution**: Fixed by commit `8a02bdd67`.
- **Verification**: Tested extending `LionInput` in TypeScript; passes with 0 errors.

#### 6. Issue [#2336](https://github.com/ing-bank/lion/issues/2336) - [docs] dark theme

- **Date**: Aug 20, 2024
- **Component**: `src/` (Astro Portal)
- **Resolution**: Implemented via commits `efe5d28cd` (`feat(portal): one accent for both themes, and a theme that survives navigation`) and `946603382`.
- **Implementation**:
  - Theme configuration: `src/themes/lion-dark.json`
  - Zero-flash theme initialization: [ThemeInit.astro](file:///Users/sebastian/Projects/lion/src/components/ThemeInit.astro)
  - Navigation switcher: [TopNav.astro](file:///Users/sebastian/Projects/lion/src/components/TopNav.astro) with `auto`, `light`, and `dark` options.
  - Native CSS `light-dark()` color tokens across layouts.

---

### Group 2: Issues Obsolete via Major Migrations

#### Overlays / Dialog Focus Trapping (Issues #1592, #1754, #1773, #1513)

In PR [#2700](https://github.com/ing-bank/lion/pull/2700) (commit `b09b1af8f`), overlay focus trapping was rewritten to use the browser's native `<dialog>` element (`showModal()`), and `contain-focus.js` was deleted (-202 lines):

- **#1592**: Recursive call stack overflow (`handleFocusin` -> `setFocusInRootElement`) in `contain-focus.js` is gone.
- **#1754**: Firefox focus trap failure with scrollable elements in `contain-focus.js` is obsolete.
- **#1773**: Safari web component focus checking in `contain-focus.js` is obsolete.
- **#1513**: React event loss was caused by `OverlayManager` moving content to `document.body`. With native dialogs, content remains within the host element's slot structure and Shadow DOM, preserving React synthetic event trees.

#### Astro Site Migration (Issues #1761, #2347)

The documentation site was migrated from Rocket to Astro ([astro.config.mjs](file:///Users/sebastian/Projects/lion/astro.config.mjs)):

- **#1761**: Broken search URLs generated by Rocket search crawler are replaced by Pagefind (`astro-pagefind`).
- **#2347**: Broken size toggles in Rocket demo frames were removed/disabled in `OJPreview.js` line 849 (`const disableSizeForNow = true;`).

#### Providence Dev Server (Issues #1565, #1566)

- **#1565** & **#1566**: Unhandled rejections on Windows under `@open-wc/es-dev-server` and `systemjs` v6.9.0 were eliminated in commit `8238df2cf` by replacing `es-dev-server` with `miniDevServer` using native Node `http` and `oxc-resolver`.

#### Unpkg Parser (Issue #1667)

- **#1667**: Unpkg's `?module` query bug with ES2022 static fields (`mjackson/unpkg#304`). Lion requires modern ES bundlers (Vite, esm.sh, jsdelivr). Unbundled packages were also consolidated into `@lion/ui`.

---

### Group 3: Issues Not a Bug / User Configuration / Wontfix

- **#2321**: Maintainer `okadurin` clarified that `@checked-changed` is emitted by the inner `LionSwitchButton`. Consumers must listen to `@model-value-changed` on the parent `<lion-switch>`.
- **#2178**: Reporter imported `@lion/ui/checkbox-group.js` without registering custom elements via `@lion/ui/define/lion-checkbox.js`.
- **#2487**: Reporter applied `aria-live="polite"` directly to an input element, which triggers double announcements on all screen readers. Abandoned by author for >15 months.
- **#2571**: Reporter attempted to use Lit template property bindings (`.modelValue="..."`) inside static server-side Twig templates. Pure HTML requires slotted elements `<textarea slot="input">` or `value` attributes.
- **#1382**: User issue from 2021 regarding duplicate installations of unbundled `@lion/form-core`. Superseded by `@lion/ui`.

---

## Ready-to-use GitHub Closure Comments

### 1. Issue [#1504](https://github.com/ing-bank/lion/issues/1504)

**Label**: None (or remove `bug`)  
**Status**: Closed as completed

````markdown
Closing as resolved. This was resolved in PR #1698 (commit `05e17d69e`), which ensures that indeterminate checkboxes respect disabled states when checking/unchecking and skips disabled child checkboxes:

```js
this._subCheckboxes.filter(checkbox => !checkbox.disabled).forEach(...)
```
````

Unit tests verifying this behavior are in `packages/checkbox-group/test/lion-checkbox-indeterminate.test.js`.

````

---

### 2. Issue [#1967](https://github.com/ing-bank/lion/issues/1967)
**Label**: None (or remove `bug`)
**Status**: Closed as completed
```markdown
Closing as resolved. This lifecycle registration issue was resolved in PR #2458 (commit `22b8f2480`), which introduced `__addToSubCheckboxes` and `__removeFromSubCheckboxes` to guarantee that subcheckboxes are added prior to `_setOwnCheckedState()` executing. Unit tests for dynamically added and removed checkboxes are included in `lion-checkbox-indeterminate.test.js`.
````

---

### 3. Issue [#1787](https://github.com/ing-bank/lion/issues/1787)

**Label**: None  
**Status**: Closed as completed

```markdown
Closing as resolved. The TypeScript error TS2509 (`Type '...' is missing the following properties from type 'HTMLElement'`) was resolved in commit `8a02bdd67` (`feat(ui): make the emitted declarations consumer-clean without skipLibCheck`). Private property definitions on mixin host types were refactored to `protected`, ensuring subclass prototype chains no longer collapse to `never`.
```

---

### 4. Issue [#2009](https://github.com/ing-bank/lion/issues/2009)

**Label**: None  
**Status**: Closed as completed

```markdown
Closing as resolved. Subclassing `LionTooltip` in TypeScript previously resulted in `Type 'DemoTooltip' is missing the following properties from type 'HTMLElement'` due to mixin host type collapsing. This was resolved in commit `8a02bdd67`, which cleaned up emitted declarations across all mixin types. Subclassing now compiles cleanly with 0 TypeScript errors.
```

---

### 5. Issue [#2065](https://github.com/ing-bank/lion/issues/2065)

**Label**: None  
**Status**: Closed as completed

```markdown
Closing as resolved. The TypeScript typing incompatibility when subclassing `LionInput` has been resolved as part of the declaration cleanups in commit `8a02bdd67`.
```

---

### 6. Issue [#2336](https://github.com/ing-bank/lion/issues/2336)

**Label**: None  
**Status**: Closed as completed

```markdown
Closing as completed. Dark mode is now fully supported on the portal documentation site with system preference auto-detection (`auto`), manual switching between light and dark themes in the navigation bar, flash-prevention during navigation (`ThemeInit.astro`), and native `light-dark()` CSS tokens.
```

---

### 7. Issue [#1592](https://github.com/ing-bank/lion/issues/1592)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as completed / obsolete

```markdown
Closing as resolved / obsolete. The recursive call stack error (`handleFocusin` -> `setFocusInRootElement`) resided inside the legacy custom focus trapping utility `contain-focus.js`. As part of PR #2700 (commit `b09b1af8f`), `contain-focus.js` was deleted in favor of native `<dialog>` elements and browser modal focus management (`showModal()`), making this recursion issue obsolete.
```

---

### 8. Issue [#1754](https://github.com/ing-bank/lion/issues/1754)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as completed / obsolete

```markdown
Closing as resolved / obsolete. This issue was caused by Firefox-specific tab navigation handling inside the custom `contain-focus.js` focus trap when scrollable containers were present. `contain-focus.js` was removed in PR #2700, and focus trapping is now handled natively by the browser `<dialog>` implementation.
```

---

### 9. Issue [#1773](https://github.com/ing-bank/lion/issues/1773)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as completed / obsolete

```markdown
Closing as resolved / obsolete. This was related to active element checking in `contain-focus.js` when focusing shadow roots in WebKit/Safari. Following the migration to native `<dialog>` in PR #2700, custom focus trapping logic has been replaced with the browser's top-layer dialog implementation.
```

---

### 10. Issue [#1513](https://github.com/ing-bank/lion/issues/1513)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as completed / obsolete

```markdown
Closing as resolved / obsolete. Previously, `OverlayManager` relocated modal content to `document.body`, disconnecting elements from React's virtual DOM hierarchy and breaking React synthetic event propagation. In the current native `<dialog>` architecture (PR #2700), projected content retains its position within the component's slot/ShadowRoot hierarchy without being moved outside the host element, allowing React event listeners to capture events properly.
```

---

### 11. Issue [#1761](https://github.com/ing-bank/lion/issues/1761)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as obsolete

```markdown
Closing as obsolete. The documentation website has been migrated from Rocket to Astro, and site search is now powered by Pagefind (`astro-pagefind`), resolving the outdated indexing paths generated by the legacy Rocket crawler.
```

---

### 12. Issue [#2347](https://github.com/ing-bank/lion/issues/2347)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as resolved

```markdown
Closing as resolved. The broken Rocket demo viewer size selector was disabled in the Astro portal demo viewer component (`OJPreview.js`), preventing broken demo iframe states.
```

---

### 13. Issue [#1565](https://github.com/ing-bank/lion/issues/1565)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as obsolete

```markdown
Closing as obsolete / resolved. The legacy `@open-wc/es-dev-server` and `systemjs` stack responsible for unhandled rejections on Windows has been replaced in commit `8238df2cf` with a lightweight, native Node HTTP and `oxc-resolver` server (`miniDevServer`).
```

---

### 14. Issue [#1566](https://github.com/ing-bank/lion/issues/1566)

**Label**: `wontfix` / `obsolete`  
**Status**: Closed as obsolete

```markdown
Closing as obsolete / resolved. Resolved alongside #1565 via the introduction of `miniDevServer` in commit `8238df2cf`, removing the faulty path resolution in the old development server on Windows.
```

---

### 15. Issue [#1667](https://github.com/ing-bank/lion/issues/1667)

**Label**: `wontfix`  
**Status**: Closed as wontfix

```markdown
Closing as wontfix. This was caused by an upstream parser limitation in unpkg's legacy `?module` query (`mjackson/unpkg#304`) when parsing modern ES2022 static class fields. Lion requires modern ES and modern CDNs or bundlers (such as esm.sh, jsdelivr, or Vite). In addition, standalone packages `@lion/form-core` and `@lion/input-tel` have been consolidated into `@lion/ui`.
```

---

### 16. Issue [#2321](https://github.com/ing-bank/lion/issues/2321)

**Label**: `wontfix`  
**Status**: Closed as not planned

```markdown
Closing as works as intended. As noted by the maintainers, `@checked-changed` is dispatched by the internal `LionSwitchButton` child element before `LionSwitch` synchronizes its state. In Lion forms, consumer code should listen to `@model-value-changed` on the parent `<lion-switch>` element, which is guaranteed to dispatch after `modelValue` and checked state have updated.
```

---

### 17. Issue [#2178](https://github.com/ing-bank/lion/issues/2178)

**Label**: `wontfix`  
**Status**: Closed as not planned

```markdown
Closing as not planned (configuration error). The custom elements failed to render because only the class definitions were imported without registering the web components. Importing `@lion/ui/define/lion-checkbox.js` and `@lion/ui/define/lion-checkbox-group.js` registers the custom elements with `customElements.define` and resolves the issue.
```

---

### 18. Issue [#2487](https://github.com/ing-bank/lion/issues/2487)

**Label**: `wontfix`  
**Status**: Closed as not planned

```markdown
Closing as not planned. Form input elements should not have `aria-live="polite"` applied directly to them, as screen readers natively announce input changes, resulting in duplicate announcements when combined with live region notifications.
```

---

### 19. Issue [#2571](https://github.com/ing-bank/lion/issues/2571)

**Label**: `wontfix`  
**Status**: Closed as not planned

```markdown
Closing as not planned. Lit property binding syntax (`.modelValue="..."`) is only evaluated by Lit's HTML template tag, not by server-side template engines like Twig or native HTML parsers. For server-rendered HTML, prefill values using the standard slot: `<lion-textarea><textarea slot="input">Initial value</textarea></lion-textarea>` or set the `value` attribute on the slotted textarea.
```

---

### 20. Issue [#1382](https://github.com/ing-bank/lion/issues/1382)

**Label**: `wontfix`  
**Status**: Closed as not planned

```markdown
Closing as stale. The error `Validators array only accepts class instances of Validator` occurs when multiple duplicate versions of the validation library exist in `node_modules` (failing `instanceof Validator` checks). Following the consolidation of packages into `@lion/ui`, this issue is resolved when using standard package deduplication.
```
