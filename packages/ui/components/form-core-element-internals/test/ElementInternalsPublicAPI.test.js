import { LionField } from '@lion/ui/form-core-element-internals.js';
import { Required, MinLength, MaxLength } from '@lion/ui/form-core-element-internals.js';
import { expect, fixture, html } from '@open-wc/testing';

/**
 * Tests for Element Internals Public API
 * checkValidity(), reportValidity(), validity, validationMessage, willValidate
 */

// Test element
class TestFieldAPI extends LionField {
  get slots() {
    return {
      ...super.slots,
      input: () => document.createElement('input'),
    };
  }
}
customElements.define('test-field-api', TestFieldAPI);

describe('ValidateMixin - Element Internals Public API', () => {

  describe('checkValidity()', () => {
    it('returns true when field is valid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]} .modelValue=${'valid value'}></test-field-api>
      `);

      expect(el.checkValidity()).to.be.true;
    });

    it('returns false when field is invalid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();

      expect(el.checkValidity()).to.be.false;
    });

    it('returns false when Required validator fails', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]} .modelValue=${''}></test-field-api>
      `);

      await el.validate();

      expect(el.checkValidity()).to.be.false;
    });

    it('returns false when MinLength validator fails', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new MinLength(5)]} .modelValue=${'abc'}></test-field-api>
      `);

      await el.validate();

      expect(el.checkValidity()).to.be.false;
    });

    it('returns true when all validators pass', async () => {
      const el = await fixture(html`
        <test-field-api 
          .validators=${[new Required(), new MinLength(3), new MaxLength(10)]} 
          .modelValue=${'valid'}
        ></test-field-api>
      `);

      await el.validate();

      expect(el.checkValidity()).to.be.true;
    });

    it('integrates with native form.checkValidity()', async () => {
      const form = await fixture(html`
        <form>
          <test-field-api name="field" .validators=${[new Required()]}></test-field-api>
        </form>
      `);
      const field = form.querySelector("test-field-api");

      await field.validate();

      // Field is invalid, so form should be invalid
      expect(form.checkValidity()).to.be.false;
    });

    it('works with valid form submission', async () => {
      const form = await fixture(html`
        <form>
          <test-field-api name="field" .validators=${[new Required()]} .modelValue=${'value'}></test-field-api>
        </form>
      `);
      const field = form.querySelector("test-field-api");

      await field.validate();

      expect(form.checkValidity()).to.be.true;
    });
  });

  describe('reportValidity()', () => {
    it('returns true when field is valid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]} .modelValue=${'value'}></test-field-api>
      `);

      await el.validate();

      expect(el.reportValidity()).to.be.true;
    });

    it('returns false when field is invalid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();

      expect(el.reportValidity()).to.be.false;
    });

    // Note: We can't test the actual browser tooltip display in unit tests
    // That would require manual/visual testing or E2E tests
    it('triggers native validation UI (integration test)', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();

      // reportValidity should return false for invalid field
      const result = el.reportValidity();

      expect(result).to.be.false;
      // Browser shows tooltip (can't be tested in unit test)
    });
  });

  describe('validity property', () => {
    it('returns ValidityState object', async () => {
      const el = await fixture(html`<test-field-api></test-field-api>`);

      const validity = el.validity;

      expect(validity).to.have.property('valid');
      expect(validity).to.have.property('valueMissing');
      expect(validity).to.have.property('tooShort');
      expect(validity).to.have.property('tooLong');
      expect(validity).to.have.property('patternMismatch');
      expect(validity).to.have.property('typeMismatch');
      expect(validity).to.have.property('rangeUnderflow');
      expect(validity).to.have.property('rangeOverflow');
      expect(validity).to.have.property('customError');
    });

    it('shows valid: true when field is valid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]} .modelValue=${'value'}></test-field-api>
      `);

      await el.validate();

      expect(el.validity.valid).to.be.true;
    });

    it('shows valid: false when field is invalid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();

      expect(el.validity.valid).to.be.false;
    });

    it('shows valueMissing: true for Required validator', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();

      expect(el.validity.valueMissing).to.be.true;
      expect(el.validity.valid).to.be.false;
    });

    it('shows tooShort: true for MinLength validator', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new MinLength(5)]} .modelValue=${'abc'}></test-field-api>
      `);

      await el.validate();

      expect(el.validity.tooShort).to.be.true;
      expect(el.validity.valid).to.be.false;
    });

    it('shows tooLong: true for MaxLength validator', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new MaxLength(3)]} .modelValue=${'abcdef'}></test-field-api>
      `);

      await el.validate();

      expect(el.validity.tooLong).to.be.true;
      expect(el.validity.valid).to.be.false;
    });

    it('updates when validation state changes', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();
      expect(el.validity.valid).to.be.false;

      el.modelValue = 'now valid';
      await el.updateComplete;
      await el.validate();

      expect(el.validity.valid).to.be.true;
    });
  });

  describe('validationMessage property', () => {
    it('returns empty string when field is valid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]} .modelValue=${'value'}></test-field-api>
      `);

      await el.validate();

      expect(el.validationMessage).to.equal('');
    });

    it('returns message when field is invalid', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      await el.validate();

      // validationMessage should be set by Element Internals
      expect(el.validationMessage).to.not.equal('');
    });
  });

  describe('willValidate property', () => {
    it('returns true for validatable field', async () => {
      const el = await fixture(html`<test-field-api></test-field-api>`);

      expect(el.willValidate).to.be.true;
    });

    it('returns false when field is disabled', async () => {
      const el = await fixture(html`<test-field-api disabled></test-field-api>`);

      expect(el.willValidate).to.be.false;
    });
  });

  describe('Integration with form submission', () => {
    it('prevents form submission when checkValidity fails', async () => {
      const form = await fixture(html`
        <form>
          <test-field-api name="field" .validators=${[new Required()]}></test-field-api>
          <button type="submit">Submit</button>
        </form>
      `);
      const field = form.querySelector("test-field-api");

      await field.validate();

      // Form should not be valid
      expect(form.checkValidity()).to.be.false;
    });

    it('allows form submission when checkValidity passes', async () => {
      const form = await fixture(html`
        <form>
          <test-field-api name="field" .validators=${[new Required()]} .modelValue=${'value'}></test-field-api>
          <button type="submit">Submit</button>
        </form>
      `);
      const field = form.querySelector("test-field-api");

      await field.validate();

      // Form should be valid
      expect(form.checkValidity()).to.be.true;
    });
  });

  describe('Backward compatibility', () => {
    it('works without Element Internals (fallback)', async () => {
      const el = await fixture(html`
        <test-field-api .validators=${[new Required()]}></test-field-api>
      `);

      // Temporarily remove _internals to test fallback
      const originalInternals = el._internals;
      el._internals = null;

      await el.validate();

      expect(el.checkValidity()).to.be.false;
      expect(el.reportValidity()).to.be.false;
      expect(el.validity.valid).to.be.false;

      // Restore
      el._internals = originalInternals;
    });
  });
});
