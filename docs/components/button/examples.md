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
import { renderLitAsNode } from '@lion/ui/helpers.js';
import { Required, MinLength } from '@lion/ui/form-core.js';
import { loadDefaultFeedbackMessages } from '@lion/ui/validate-messages.js';
import '@lion/ui/define/lion-button.js';
import '@lion/ui/define/lion-button-submit.js';
import '@lion/ui/define/lion-button-reset.js';
import '@lion/ui/define/lion-form.js';
import '@lion/ui/define/lion-input.js';
import '@lion/ui/define-helpers/sb-action-logger.js';
import iconSvg from './src/icon.svg.js';

loadDefaultFeedbackMessages();
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
export const detachedFormButtons = () => {
  const actionLogger = renderLitAsNode(html`<sb-action-logger></sb-action-logger>`);
  const log = msg => {
    if (actionLogger && typeof actionLogger.log === 'function') {
      actionLogger.log(msg);
    } else {
      console.log(msg);
    }
  };

  return html`
    <lion-form
      id="detachedExampleForm"
      @submit=${ev => {
        const form = ev.target;
        if (form.hasFeedbackFor.includes('error')) {
          const invalidFields = form.formElements
            .filter(el => el.hasFeedbackFor.includes('error'))
            .map(el => el.name || el.label);
          log(`❌ Validation failed for: ${invalidFields.join(', ')}`);
          return;
        }
        log(`✅ Form submitted and saved! Data: ${JSON.stringify(form.serializedValue)}`);
      }}
      @reset=${() => {
        log('🔄 Form reset: inputs cleared and validation states reset.');
      }}
    >
      <form>
        <lion-input
          name="username"
          label="Username"
          .modelValue=${'johndoe'}
          .validators=${[new Required(), new MinLength(3)]}
        ></lion-input>
        <lion-input name="email" label="Email" .validators=${[new Required()]}></lion-input>
      </form>
    </lion-form>

    <div style="margin-top: 16px; margin-bottom: 16px;">
      <lion-button-submit form="detachedExampleForm">Submit</lion-button-submit>
      <lion-button-reset form="detachedExampleForm">Reset</lion-button-reset>
    </div>

    ${actionLogger}
  `;
};
```
