---
title: 'Examples'
parts:
  - Button
  - Examples
eleventyNavigation:
  key: 'Button: Examples'
  order: 30
  parent: Button
  title: Examples
---

# Examples

```js script
import { html } from '@mdjs/mdjs-preview';
import '@lion/ui/define/lion-button.js';
import '@lion/ui/define/lion-button-submit.js';
import '@lion/ui/define/lion-button-reset.js';
import iconSvg from './src/icon.svg.js';
```

## Icon button

```js preview-story
export const iconButton = () => html`<lion-button>${iconSvg(html)}Bug</lion-button>`;
```

## Icon only button

When only an icon is used, make sure the button still have an accessible name, via `aria-label`.

```js preview-story
export const iconOnly = () => html`<lion-button aria-label="Bug">${iconSvg(html)}</lion-button>`;
```

## Multiple buttons inline

```js preview-story
export const mainAndIconButton = () => html`
  <lion-button>Default</lion-button>
  <lion-button>${iconSvg(html)} Bug</lion-button>
`;
```

## Detached form buttons

Buttons can be placed outside a form and connected using the `form` attribute:

```js preview-story
export const detachedFormButtons = () => html`
  <form
    id="detachedExampleForm"
    @submit=${ev => {
      ev.preventDefault();
      console.log('Submitted detached form');
    }}
  >
    <label for="exampleInput">Username</label>
    <input id="exampleInput" name="username" />
  </form>

  <div style="margin-top: 16px;">
    <lion-button-submit form="detachedExampleForm">Submit</lion-button-submit>
    <lion-button-reset form="detachedExampleForm">Reset</lion-button-reset>
  </div>
`;
```
