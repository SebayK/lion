import { fixture, expect, html } from '@open-wc/testing';
import { LionField , Required } from '@lion/ui/form-core-element-internals.js';

/**
 * Testy integracji Element Internals API
 * 
 * Te testy sprawdzają:
 * - Integrację z natywnym <form>
 * - setValidity() i ValidityState
 * - setFormValue() i FormData
 * - CSS pseudo-klasy (:valid, :invalid)
 * - Form reset
 */

// Test element
class TestField extends LionField {
  static get properties() {
    return {
      type: String,
    };
  }

  get slots() {
    return {
      ...super.slots,
      input: () => {
        const input = document.createElement('input');
        input.type = this.type || 'text';
        return input;
      },
    };
  }
}

customElements.define('test-field-ei', TestField);

describe('Element Internals Integration', () => {
  describe('Form Association', () => {
    it('attaches ElementInternals on construction', async () => {
      const el = await fixture(html`<test-field-ei name="test"></test-field-ei>`);
      expect(el._internals).to.exist;
      expect(el._internals.form).to.be.null; // nie w formularzu
    });

    it('associates with parent <form>', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="username"></test-field-ei>
        </form>
      `);
      const field = form.querySelector('test-field-ei');

      expect(field._internals.form).to.equal(form);
      expect(form.elements.namedItem('username')).to.equal(field);
    });

    it('submits value with form', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="email" .modelValue=${'test@example.com'}></test-field-ei>
        </form>
      `);

      const formData = new FormData(form);
      expect(formData.get('email')).to.equal('test@example.com');
    });

    it('handles multiple fields in form', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="first" .modelValue=${'John'}></test-field-ei>
          <test-field-ei name="last" .modelValue=${'Doe'}></test-field-ei>
        </form>
      `);

      const formData = new FormData(form);
      expect(formData.get('first')).to.equal('John');
      expect(formData.get('last')).to.equal('Doe');
    });
  });

  describe('Validity State', () => {
    it('sets validity flags via setValidity()', async () => {
      const el = await fixture(html`
        <test-field-ei .validators=${[new Required()]}></test-field-ei>
      `);

      await el.validate();

      // Element Internals validity
      expect(el._internals.validity.valueMissing).to.be.true;
      expect(el._internals.validity.valid).to.be.false;

      // Public API (zachowane dla kompatybilności)
      expect(el.hasFeedbackFor).to.include('error');
    });

    it('clears validity when valid', async () => {
      const el = await fixture(html`
        <test-field-ei .validators=${[new Required()]} .modelValue=${'value'}></test-field-ei>
      `);

      await el.validate();

      expect(el._internals.validity.valid).to.be.true;
      expect(el.hasFeedbackFor).to.not.include('error');
    });

    it('provides validation message via validationMessage', async () => {
      const el = await fixture(html`
        <test-field-ei .validators=${[new Required()]}></test-field-ei>
      `);

      await el.validate();

      expect(el._internals.validationMessage).to.not.be.empty;
    });

    it('updates validity on modelValue change', async () => {
      const el = await fixture(html`
        <test-field-ei .validators=${[new Required()]}></test-field-ei>
      `);

      await el.validate();
      expect(el._internals.validity.valid).to.be.false;

      el.modelValue = 'now valid';
      await el.validate();
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('CSS Pseudo-classes', () => {
    it('applies :invalid when field has errors', async () => {
      const el = await fixture(html`
        <test-field-ei .validators=${[new Required()]}></test-field-ei>
      `);

      await el.validate();

      expect(el.matches(':invalid')).to.be.true;
      expect(el.matches(':valid')).to.be.false;
    });

    it('applies :valid when field is valid', async () => {
      const el = await fixture(html`
        <test-field-ei .modelValue=${'value'}></test-field-ei>
      `);

      expect(el.matches(':valid')).to.be.true;
      expect(el.matches(':invalid')).to.be.false;
    });

    it('updates pseudo-classes on validation change', async () => {
      const el = await fixture(html`
        <test-field-ei .validators=${[new Required()]}></test-field-ei>
      `);

      await el.validate();
      expect(el.matches(':invalid')).to.be.true;

      el.modelValue = 'value';
      await el.validate();
      expect(el.matches(':valid')).to.be.true;
    });
  });

  describe('Form Value Types', () => {
    it('sets simple string value', async () => {
      const el = await fixture(html`
        <test-field-ei name="text" .modelValue=${'hello'}></test-field-ei>
      `);

      const form = document.createElement('form');
      form.appendChild(el);
      const formData = new FormData(form);

      expect(formData.get('text')).to.equal('hello');
    });

    it('handles empty value', async () => {
      const el = await fixture(html`<test-field-ei name="empty"></test-field-ei>`);

      const form = document.createElement('form');
      form.appendChild(el);
      const formData = new FormData(form);

      expect(formData.get('empty')).to.equal('');
    });

    it('updates form value on modelValue change', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="field" .modelValue=${'initial'}></test-field-ei>
        </form>
      `);
      const field = form.querySelector('test-field-ei');

      let formData = new FormData(form);
      expect(formData.get('field')).to.equal('initial');

      field.modelValue = 'changed';
      await field.updateComplete;

      formData = new FormData(form);
      expect(formData.get('field')).to.equal('changed');
    });
  });

  describe('Form Reset', () => {
    it('resets to initial value on form.reset()', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="field" .modelValue=${'initial'}></test-field-ei>
        </form>
      `);
      const field = form.querySelector('test-field-ei');

      field.modelValue = 'changed';
      expect(field.modelValue).to.equal('changed');

      form.reset();

      // Element Internals automatycznie resetuje wartość
      expect(field.modelValue).to.equal('initial');
    });

    it('clears validation errors on reset', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei .validators=${[new Required()]}></test-field-ei>
        </form>
      `);
      const field = form.querySelector('test-field-ei');

      await field.validate();
      expect(field.hasFeedbackFor).to.include('error');

      form.reset();

      expect(field.hasFeedbackFor).to.not.include('error');
    });
  });

  describe('Form Disabled', () => {
    it('excludes disabled field from form data', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="enabled" .modelValue=${'value1'}></test-field-ei>
          <test-field-ei name="disabled" .modelValue=${'value2'} disabled></test-field-ei>
        </form>
      `);

      const formData = new FormData(form);
      expect(formData.get('enabled')).to.equal('value1');
      expect(formData.get('disabled')).to.be.null;
    });
  });

  describe('Name attribute', () => {
    it('uses name for form submission', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei name="myField" .modelValue=${'test'}></test-field-ei>
        </form>
      `);

      const formData = new FormData(form);
      expect(formData.get('myField')).to.equal('test');
    });

    it('ignores field without name', async () => {
      const form = await fixture(html`
        <form>
          <test-field-ei .modelValue=${'test'}></test-field-ei>
        </form>
      `);

      const formData = new FormData(form);
      expect(Array.from(formData.keys()).length).to.equal(0);
    });
  });
});
