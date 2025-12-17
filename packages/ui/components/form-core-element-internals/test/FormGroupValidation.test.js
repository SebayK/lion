import { LionFieldset } from '@lion/ui/fieldset.js';
import {
  LionField,
  Required,
  MinLength,
  MaxLength,
} from '@lion/ui/form-core-element-internals.js';
import { expect, fixture, html } from '@open-wc/testing';

/**
 * Tests for FormGroupMixin - Element Internals Public API
 * checkValidity() and reportValidity() for groups
 */

// Test fieldset
class TestFieldset extends LionFieldset {}
customElements.define('test-fieldset-validation', TestFieldset);

// Test field
class TestField extends LionField {
  get slots() {
    return {
      ...super.slots,
      input: () => document.createElement('input'),
    };
  }
}
customElements.define('test-field-validation', TestField);

describe('FormGroupMixin - checkValidity() and reportValidity()', () => {
  describe('checkValidity()', () => {
    it('returns true when all children are valid', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation name="field1" .modelValue=${'value1'}></test-field-validation>
          <test-field-validation name="field2" .modelValue=${'value2'}></test-field-validation>
        </test-fieldset-validation>
      `);

      expect(el.checkValidity()).to.be.true;
    });

    it('returns false when any child is invalid', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
          <test-field-validation name="field2" .modelValue=${'value2'}></test-field-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[0].validate();

      expect(el.checkValidity()).to.be.false;
    });

    it('checks all children recursively', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation name="field1" .modelValue=${'value1'}></test-field-validation>
          <test-fieldset-validation name="nested">
            <test-field-validation
              name="field2"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-field-validation>
          </test-fieldset-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[1].formElements[0].validate();

      expect(el.checkValidity()).to.be.false;
    });

    it('works with multiple validators', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required(), new MinLength(5)]}
            .modelValue=${'abc'}
          ></test-field-validation>
          <test-field-validation
            name="field2"
            .validators=${[new MaxLength(10)]}
            .modelValue=${'valid'}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[0].validate();

      expect(el.checkValidity()).to.be.false;
    });

    it('returns true for empty group', async () => {
      const el = await fixture(html`<test-fieldset-validation></test-fieldset-validation>`);

      expect(el.checkValidity()).to.be.true;
    });

    it('handles children without checkValidity method (fallback)', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      const child = el.formElements[0];
      await child.validate();

      // Temporarily remove checkValidity to test fallback
      const originalCheckValidity = child.checkValidity;
      delete child.checkValidity;

      // Should fallback to hasFeedbackFor check
      expect(el.checkValidity()).to.be.false;

      // Restore
      child.checkValidity = originalCheckValidity;
    });
  });

  describe('reportValidity()', () => {
    it('returns true when all children are valid', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation name="field1" .modelValue=${'value1'}></test-field-validation>
          <test-field-validation name="field2" .modelValue=${'value2'}></test-field-validation>
        </test-fieldset-validation>
      `);

      expect(el.reportValidity()).to.be.true;
    });

    it('returns false when any child is invalid', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
          <test-field-validation name="field2" .modelValue=${'value2'}></test-field-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[0].validate();

      expect(el.reportValidity()).to.be.false;
    });

    it('calls reportValidity on all children', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
          <test-field-validation
            name="field2"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[0].validate();
      await el.formElements[1].validate();

      const child1Spy = [];
      const child2Spy = [];

      const originalReport1 = el.formElements[0].reportValidity;
      const originalReport2 = el.formElements[1].reportValidity;

      el.formElements[0].reportValidity = () => {
        child1Spy.push('called');
        return originalReport1.call(el.formElements[0]);
      };

      el.formElements[1].reportValidity = () => {
        child2Spy.push('called');
        return originalReport2.call(el.formElements[1]);
      };

      el.reportValidity();

      expect(child1Spy).to.have.lengthOf(1);
      expect(child2Spy).to.have.lengthOf(1);

      // Restore
      el.formElements[0].reportValidity = originalReport1;
      el.formElements[1].reportValidity = originalReport2;
    });

    it('focuses first invalid child', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
          <test-field-validation
            name="field2"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[0].validate();
      await el.formElements[1].validate();

      let focusedElement = null;

      const originalFocus1 = el.formElements[0].focus;
      const originalFocus2 = el.formElements[1].focus;

      el.formElements[0].focus = function focus() {
        focusedElement = this;
        return originalFocus1.call(this);
      };

      el.formElements[1].focus = function focus() {
        focusedElement = this;
        return originalFocus2.call(this);
      };

      el.reportValidity();

      expect(focusedElement).to.equal(el.formElements[0]);

      // Restore
      el.formElements[0].focus = originalFocus1;
      el.formElements[1].focus = originalFocus2;
    });

    it('handles nested groups correctly', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation name="field1" .modelValue=${'value1'}></test-field-validation>
          <test-fieldset-validation name="nested">
            <test-field-validation
              name="field2"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-field-validation>
          </test-fieldset-validation>
        </test-fieldset-validation>
      `);

      await el.formElements[1].formElements[0].validate();

      expect(el.reportValidity()).to.be.false;
    });

    it('handles children without reportValidity method (fallback)', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      const child = el.formElements[0];
      await child.validate();

      // Temporarily remove reportValidity to test fallback
      const originalReportValidity = child.reportValidity;
      delete child.reportValidity;

      // Should fallback to hasFeedbackFor check
      expect(el.reportValidity()).to.be.false;

      // Restore
      child.reportValidity = originalReportValidity;
    });
  });

  describe('Integration with Form', () => {
    it('integrates with native form.checkValidity()', async () => {
      const form = await fixture(html`
        <form>
          <test-fieldset-validation>
            <test-field-validation
              name="field1"
              .validators=${[new Required()]}
              .modelValue=${''}
            ></test-field-validation>
          </test-fieldset-validation>
        </form>
      `);

      const fieldset = form.querySelector('test-fieldset-validation');
      await fieldset.formElements[0].validate();

      // Fieldset's checkValidity should return false
      expect(fieldset.checkValidity()).to.be.false;
    });

    it('group validation matches individual field validation', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      const field = el.formElements[0];
      await field.validate();

      // Both should agree on validity
      expect(field.checkValidity()).to.be.false;
      expect(el.checkValidity()).to.be.false;
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined children gracefully', async () => {
      const el = await fixture(html`<test-fieldset-validation></test-fieldset-validation>`);

      expect(() => el.checkValidity()).to.not.throw();
      expect(() => el.reportValidity()).to.not.throw();
    });

    it('handles children becoming valid after initial validation', async () => {
      const el = await fixture(html`
        <test-fieldset-validation>
          <test-field-validation
            name="field1"
            .validators=${[new Required()]}
            .modelValue=${''}
          ></test-field-validation>
        </test-fieldset-validation>
      `);

      const field = el.formElements[0];
      await field.validate();

      expect(el.checkValidity()).to.be.false;

      // Make field valid
      field.modelValue = 'valid value';
      await field.validate();

      expect(el.checkValidity()).to.be.true;
    });
  });
});
