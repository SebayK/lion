---
title: 'Use Cases'
parts:
  - Use Cases
  - Button
eleventyNavigation:
  key: Button >> Use Cases
  title: Use Cases
  order: 20
  parent: Button
---

# Use Cases

```js script
import { html } from '@mdjs/mdjs-preview';
import '@lion/ui/define/lion-button.js';
import '@lion/ui/define/lion-button-reset.js';
import '@lion/ui/define/lion-button-submit.js';
```

## With click handler

```js preview-story
export const handler = () => html`
  <lion-button @click="${ev => console.log('clicked/spaced/entered', ev)}">
    Click | Space | Enter me and see log
  </lion-button>
`;
```

## Disabled button

```js preview-story
export const disabled = () => html`<lion-button disabled>Disabled</lion-button>`;
```

## Minimum click area

The minimum click area needs to be at least `44px` by `44px` according to [WCAG Success Criterion 2.5.5 Target Size (Enhanced)](https://www.w3.org/TR/WCAG22/#target-size-enhanced).

```js preview-story
export const minimumClickArea = () =>
  html` <style>
      .small {
        padding: 4px;
        line-height: 1em;
      }
      .small::before {
        border: 1px dashed #000;
      }
    </style>
    <lion-button class="small">xs</lion-button>`;
```

## Usage with native form

`<lion-button-reset>` and `<lion-button-submit>` are especially created to supports the following use cases:

- Submit on button click
- Submit on button enter or space keypress
- Submit on enter keypress inside an input
- Reset native form fields when using type="reset"

```js preview-story
export const withinForm = () => html`
  <form
    @submit=${ev => {
      ev.preventDefault();
      console.log('submit handler', ev.target);
    }}
  >
    <label for="firstNameId">First name</label>
    <input id="firstNameId" name="firstName" />
    <label for="lastNameId">Last name</label>
    <input id="lastNameId" name="lastName" />
    <lion-button-submit @click=${ev => console.log('click submit handler', ev.target)}
      >Submit</lion-button-submit
    >
    <lion-button-reset @click=${ev => console.log('click reset handler', ev.target)}
      >Reset</lion-button-reset
    >
  </form>
`;
```

Important notes:

- A `<lion-button-submit>` is mandatory for the last use case, if you have multiple inputs. This is native behaviour.
- `@click` on `<lion-button-submit>` and `@submit` on `<form>` are triggered by these use cases. We strongly encourage you to listen to the submit handler if your goal is to do something on form-submit.
- To prevent form submission full page reloads, add a **submit handler on the form** `@submit` with `event.preventDefault()`. Adding it on the `<lion-button-submit>` is not enough.

## Usage with detached forms

`<lion-button-submit>` and `<lion-button-reset>` can be placed outside the `<form>` DOM tree (such as in sticky footers, headers, drawers, or dialog action bars).

### Via `form` attribute

Use the standard HTML `form="form-id"` attribute to associate the button with a `<form>` or `<lion-form>` element elsewhere in the DOM:

```js preview-story
export const detachedForm = () => html`
  <form
    id="detachedFormId"
    @submit=${ev => {
      ev.preventDefault();
      console.log('detached form submit', ev.target);
    }}
    @reset=${ev => {
      ev.preventDefault();
      console.log('detached form reset', ev.target);
    }}
  >
    <label for="detachedFirstName">First name</label>
    <input id="detachedFirstName" name="firstName" />
    <label for="detachedLastName">Last name</label>
    <input id="detachedLastName" name="lastName" />
  </form>

  <!-- Buttons placed outside the form -->
  <div style="margin-top: 16px;">
    <lion-button-submit form="detachedFormId">Submit</lion-button-submit>
    <lion-button-reset form="detachedFormId">Reset</lion-button-reset>
  </div>
`;
```

When targeting an external form via the `form` attribute:

- **Polymorphic lookup**: Works with both native `<form>` elements and `<lion-form>` custom elements (the button automatically binds to the underlying native form node).
- **Shadow DOM fallback**: If the button is rendered inside a `ShadowRoot` and the form ID is not found locally, the button falls back to searching the host document scope.
- **`aria-controls`**: The button automatically reflects `aria-controls="form-id"` to announce the programmatic relationship to assistive technologies.
- **Implicit submission**: Pressing `Enter` in any text field of the form continues to submit the form even when `<lion-button-submit>` is detached.

### Sticky action footers and dialog actions

A common UI pattern places submit and reset actions inside a sticky page footer or dialog action bar, separated from the form container:

```html
<!-- Main dialog content -->
<div class="dialog-body">
  <lion-form id="dialogForm">
    <form>
      <lion-input name="user" label="Username"></lion-input>
      <lion-input name="email" label="Email address"></lion-input>
    </form>
  </lion-form>
</div>

<!-- Sticky dialog action footer -->
<div class="dialog-actions">
  <lion-button-reset form="dialogForm">Cancel</lion-button-reset>
  <lion-button-submit form="dialogForm">Save changes</lion-button-submit>
</div>
```

### Via `.formElement` property

When custom components use Shadow DOM encapsulation where IDs cannot cross boundary walls, pass a direct form reference via the `.formElement` object property:

```js
const submitBtn = document.querySelector('lion-button-submit');
const formEl = document.querySelector('#detachedFormId');

// Direct object reference (accepts HTMLFormElement or LionForm)
submitBtn.formElement = formEl;
```

Or declaratively in Lit templates:

```js
html` <lion-button-submit .formElement=${this.formRef}>Submit</lion-button-submit> `;
```

## Considerations

### Why a Web Component?

There are multiple reasons why we used a Web Component as opposed to a CSS component.

- **Target size**: The minimum target size is 40 pixels, which makes even the small buttons easy to activate. A container element was needed to make this size possible.
- **Advanced styling**: There are advanced styling options regarding icons in buttons, where it is a lot more maintainable to handle icons in our button using slots. An example is that a sticky icon-only buttons may looks different from buttons which have both icons and text.
- **Native form integration**: The `<lion-button-submit>` works with native `<form>` submission, and even implicit form submission on-enter. A lot of delegation logic had to be created for this to work.

### Event target

We want to ensure that the event target returned to the user is `<lion-button>`, not `<button>`. Therefore, simply delegating the click to the native button immediately, is not desired. Instead, we catch the click event in the `<lion-button>`, and ensure delegation inside of there.

### Flashing a native button click as a direct child of form

By delegating the `click()` to the native button, it will bubble back up to `<lion-button-reset>` and `<lion-button-submit>` which would cause duplicate actions. We have to simulate the full `.click()` however, otherwise form submission is not triggered. So this bubbling cannot be prevented.
Therefore, on click, we flash a `<button>` to the form as a direct child and fire the click on that button. We then immediately remove that button. This is a fully synchronous process; users or developers will not notice this, it should not cause problems.

### Native button & implicit form submission

Flashing the button in the way we do solves almost all issues except for one.
One of the specs of W3C is that when you have a form with multiple inputs,
pressing enter while inside one of the inputs only triggers a form submit if that form has a button of type submit.

To get this particular implicit form submission to work, having a native button in our `<lion-button-submit>` is a hard requirement.
Therefore, not only do we flash a native button on the form to delegate `<lion-button-submit>` trigger to `<button>`
and thereby trigger form submission, we **also** add a native `button` inside the `<lion-button-submit>`
whose `type` property is synchronized with the type of the `<lion-button-submit>`.
