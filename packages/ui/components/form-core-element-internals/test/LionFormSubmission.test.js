import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import '@lion/ui/define/lion-form.js';
import { LionField, Required, MinLength } from '@lion/ui/form-core-element-internals.js';

/**
 * Tests for LionForm - Element Internals Integration
 * Submission flow with checkValidity(), reportValidity(), and FormData
 */

// Test field for forms
class TestFormField extends LionField {
  get slots() {
    return {
      ...super.slots,
      input: () => document.createElement('input'),
    };
  }
}
customElements.define('test-form-field', TestFormField);

describe('LionForm - Element Internals Submission Flow', () => {
  describe('Validation Before Submit', () => {
    it('allows submission when form is valid', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="email" .modelValue=${'test@example.com'}></test-form-field>
            <button type="submit">Submit</button>
          </form>
        </lion-form>
      `);

      setTimeout(() => el.submit());
      const { detail } = await oneEvent(el, 'submit');

      expect(detail).to.exist;
      expect(detail.formData).to.be.instanceOf(FormData);
      expect(detail.serializedValue).to.exist;
    });

    it('blocks submission when form is invalid', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field
              name="email"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
            <button type="submit">Submit</button>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      let submitFired = false;
      el.addEventListener('submit', () => {
        submitFired = true;
      });

      el.submit();
      await el.updateComplete;

      expect(submitFired).to.be.false;
    });

    it('calls checkValidity() before submission', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="email" .modelValue=${'test@example.com'}></test-form-field>
          </form>
        </lion-form>
      `);

      const form = el._formNode;
      let checkValidityCalled = false;

      const originalCheckValidity = form.checkValidity;
      form.checkValidity = function checkValidity() {
        checkValidityCalled = true;
        return originalCheckValidity.call(this);
      };

      el.submit();
      await el.updateComplete;

      expect(checkValidityCalled).to.be.true;

      // Restore
      form.checkValidity = originalCheckValidity;
    });

    it('calls reportValidity() when form is invalid', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field
              name="email"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      const form = el._formNode;
      let reportValidityCalled = false;

      const originalReportValidity = form.reportValidity;
      form.reportValidity = function reportValidity() {
        reportValidityCalled = true;
        return originalReportValidity.call(this);
      };

      el.submit();
      await el.updateComplete;

      expect(reportValidityCalled).to.be.true;

      // Restore
      form.reportValidity = originalReportValidity;
    });

    it('sets submitted state even when validation fails', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field
              name="email"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      expect(field.submitted).to.be.false;

      el.submit();
      await el.updateComplete;

      expect(field.submitted).to.be.true;
    });
  });

  describe('novalidate Attribute', () => {
    it('skips validation when novalidate is set', async () => {
      const el = await fixture(html`
        <lion-form novalidate>
          <form>
            <test-form-field
              name="email"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      setTimeout(() => el.submit());
      const { detail } = await oneEvent(el, 'submit');

      expect(detail).to.exist;
      expect(detail.formData).to.be.instanceOf(FormData);
    });

    it('validates when novalidate is false', async () => {
      const el = await fixture(html`
        <lion-form .noValidate=${false}>
          <form>
            <test-form-field
              name="email"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      let submitFired = false;
      el.addEventListener('submit', () => {
        submitFired = true;
      });

      el.submit();
      await el.updateComplete;

      expect(submitFired).to.be.false;
    });

    it('can toggle novalidate dynamically', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field
              name="email"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      // First submit - should be blocked
      let submitCount = 0;
      el.addEventListener('submit', () => {
        submitCount += 1;
      });

      el.submit();
      await el.updateComplete;
      expect(submitCount).to.equal(0);

      // Enable novalidate
      el.noValidate = true;
      await el.updateComplete;

      // Second submit - should pass
      setTimeout(() => el.submit());
      await oneEvent(el, 'submit');
      expect(submitCount).to.equal(1);
    });
  });

  describe('FormData in Submit Event', () => {
    it('includes FormData in event.detail', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="email" .modelValue=${'test@example.com'}></test-form-field>
            <test-form-field name="name" .modelValue=${'John Doe'}></test-form-field>
          </form>
        </lion-form>
      `);

      setTimeout(() => el.submit());
      const { detail } = await oneEvent(el, 'submit');

      expect(detail.formData).to.be.instanceOf(FormData);
      expect(detail.formData.get('email')).to.equal('test@example.com');
      expect(detail.formData.get('name')).to.equal('John Doe');
    });

    it('includes serializedValue for backward compatibility', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="email" .modelValue=${'test@example.com'}></test-form-field>
          </form>
        </lion-form>
      `);

      setTimeout(() => el.submit());
      const { detail } = await oneEvent(el, 'submit');

      expect(detail.serializedValue).to.exist;
      expect(detail.serializedValue.email).to.equal('test@example.com');
    });

    it('FormData and serializedValue match', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="field1" .modelValue=${'value1'}></test-form-field>
            <test-form-field name="field2" .modelValue=${'value2'}></test-form-field>
          </form>
        </lion-form>
      `);

      setTimeout(() => el.submit());
      const { detail } = await oneEvent(el, 'submit');

      expect(detail.formData.get('field1')).to.equal(detail.serializedValue.field1);
      expect(detail.formData.get('field2')).to.equal(detail.serializedValue.field2);
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('validates nested fieldsets', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <lion-fieldset name="address">
              <test-form-field
                name="street"
                .validators=${[new Required()]}
                .modelValue=${''}
              ></test-form-field>
              <test-form-field name="city" .modelValue=${'NYC'}></test-form-field>
            </lion-fieldset>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      let submitFired = false;
      el.addEventListener('submit', () => {
        submitFired = true;
      });

      el.submit();
      await el.updateComplete;

      expect(submitFired).to.be.false;
    });

    it('allows submission when all nested fields are valid', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <lion-fieldset name="address">
              <test-form-field name="street" .modelValue=${'123 Main St'}></test-form-field>
              <test-form-field name="city" .modelValue=${'NYC'}></test-form-field>
            </lion-fieldset>
          </form>
        </lion-form>
      `);

      setTimeout(() => el.submit());
      const { detail } = await oneEvent(el, 'submit');

      expect(detail.formData).to.be.instanceOf(FormData);
    });

    it('validates fields with multiple validators', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field
              name="password"
              .validators=${[new Required(), new MinLength(8)]}
              .modelValue=${'short'}
            ></test-form-field>
          </form>
        </lion-form>
      `);

      const field = el.querySelector('test-form-field');
      await field.validate();

      let submitFired = false;
      el.addEventListener('submit', () => {
        submitFired = true;
      });

      el.submit();
      await el.updateComplete;

      expect(submitFired).to.be.false;
    });
  });

  describe('Focus Management', () => {
    it('focuses first erroneous field when validation fails', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="field1" .modelValue=${'valid'}></test-form-field>
            <test-form-field
              name="field2"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-form-field>
            <test-form-field name="field3" .modelValue=${'valid'}></test-form-field>
          </form>
        </lion-form>
      `);

      const field2 = el.querySelectorAll('test-form-field')[1];
      await field2.validate();

      let focusedElement = null;
      const originalFocus = field2._focusableNode.focus;
      field2._focusableNode.focus = function focus() {
        focusedElement = this;
        return originalFocus.call(this);
      };

      el.submit();
      await el.updateComplete;

      expect(focusedElement).to.equal(field2._focusableNode);

      // Restore
      field2._focusableNode.focus = originalFocus;
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains old behavior when event listener ignores detail', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="email" .modelValue=${'test@example.com'}></test-form-field>
          </form>
        </lion-form>
      `);

      let eventFired = false;
      el.addEventListener('submit', () => {
        // Old-style listener that doesn't use detail
        eventFired = true;
      });

      setTimeout(() => el.submit());
      await oneEvent(el, 'submit');

      expect(eventFired).to.be.true;
    });

    it('submit event is still a CustomEvent with bubbles', async () => {
      const el = await fixture(html`
        <lion-form>
          <form>
            <test-form-field name="email" .modelValue=${'test@example.com'}></test-form-field>
          </form>
        </lion-form>
      `);

      setTimeout(() => el.submit());
      const event = await oneEvent(el, 'submit');

      expect(event).to.be.instanceOf(CustomEvent);
      expect(event.bubbles).to.be.true;
    });
  });
});
