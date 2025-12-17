import { fixture, expect, html } from '@open-wc/testing';
import { LionField ,
  Required,
  MinLength,
  MaxLength,
  Pattern,
  IsEmail,
  MinNumber,
  MaxNumber,
} from '@lion/ui/form-core-element-internals.js';

/**
 * Testy mapowania validatorów na ValidityStateFlags
 * 
 * Sprawdza czy różne typy validatorów są prawidłowo
 * mapowane na odpowiednie flagi ValidityState
 */

class TestField extends LionField {
  get slots() {
    return {
      ...super.slots,
      input: () => document.createElement('input'),
    };
  }
}

customElements.define('test-field-vsm', TestField);

describe('ValidityState Mapping', () => {
  describe('Required → valueMissing', () => {
    it('maps Required to valueMissing when empty', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new Required()]}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.valueMissing).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears valueMissing when filled', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new Required()]} .modelValue=${'filled'}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.valueMissing).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('MinLength → tooShort', () => {
    it('maps MinLength to tooShort when too short', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new MinLength(5)]} .modelValue=${'ab'}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.tooShort).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears tooShort when long enough', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new MinLength(5)]}
          .modelValue=${'abcdef'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.tooShort).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('MaxLength → tooLong', () => {
    it('maps MaxLength to tooLong when too long', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new MaxLength(5)]}
          .modelValue=${'abcdefgh'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.tooLong).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears tooLong when short enough', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new MaxLength(5)]} .modelValue=${'abc'}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.tooLong).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('Pattern → patternMismatch', () => {
    it('maps Pattern to patternMismatch when mismatch', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new Pattern(/^[A-Z]+$/)]}
          .modelValue=${'abc123'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.patternMismatch).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears patternMismatch when matches', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new Pattern(/^[A-Z]+$/)]}
          .modelValue=${'ABCD'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.patternMismatch).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('IsEmail → typeMismatch', () => {
    it('maps IsEmail to typeMismatch when invalid', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new IsEmail()]}
          .modelValue=${'not-an-email'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.typeMismatch).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears typeMismatch when valid email', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new IsEmail()]}
          .modelValue=${'test@example.com'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.typeMismatch).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('MinNumber → rangeUnderflow', () => {
    it('maps MinNumber to rangeUnderflow when too small', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new MinNumber(10)]} .modelValue=${5}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.rangeUnderflow).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears rangeUnderflow when large enough', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new MinNumber(10)]} .modelValue=${15}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.rangeUnderflow).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('MaxNumber → rangeOverflow', () => {
    it('maps MaxNumber to rangeOverflow when too large', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new MaxNumber(10)]} .modelValue=${15}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.rangeOverflow).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears rangeOverflow when small enough', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new MaxNumber(10)]} .modelValue=${5}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.rangeOverflow).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('Multiple validators', () => {
    it('sets multiple validity flags', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new Required(), new MinLength(5)]}
          .modelValue=${'ab'}
        ></test-field-vsm>
      `);

      await el.validate();
      // Required passes (not empty), MinLength fails
      expect(el._internals.validity.valueMissing).to.be.false;
      expect(el._internals.validity.tooShort).to.be.true;
      expect(el._internals.validity.valid).to.be.false;
    });

    it('clears all flags when all valid', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new Required(), new MinLength(5)]}
          .modelValue=${'abcdef'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validity.valueMissing).to.be.false;
      expect(el._internals.validity.tooShort).to.be.false;
      expect(el._internals.validity.valid).to.be.true;
    });
  });

  describe('validationMessage', () => {
    it('provides message for Required', async () => {
      const el = await fixture(html`
        <test-field-vsm .validators=${[new Required()]}></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validationMessage).to.not.be.empty;
      expect(el._internals.validationMessage).to.be.a('string');
    });

    it('clears message when valid', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new Required()]}
          .modelValue=${'value'}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validationMessage).to.equal('');
    });

    it('shows first error message for multiple validators', async () => {
      const el = await fixture(html`
        <test-field-vsm
          .validators=${[new Required(), new MinLength(5)]}
        ></test-field-vsm>
      `);

      await el.validate();
      expect(el._internals.validationMessage).to.not.be.empty;
    });
  });
});
