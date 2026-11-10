import { html } from 'lit/static-html.js';
import { LionField, Required } from '@lion/ui/form-core.js';
import '@lion/ui/define/lion-validation-feedback.js';
import { LionFieldset } from '@lion/ui/fieldset.js';
import { LionCheckbox, LionCheckboxGroup } from '@lion/ui/checkbox-group.js';
import '@lion/ui/define/lion-checkbox-group.js';
import { LionRadio, LionRadioGroup } from '@lion/ui/radio-group.js';
import '@lion/ui/define/lion-radio-group.js';
import '@lion/ui/define/lion-fieldset.js';
import '@lion/ui/define/lion-checkbox.js';
import { LionListbox, LionOption } from '@lion/ui/listbox.js';
import '@lion/ui/define/lion-listbox.js';
import '@lion/ui/define/lion-option.js';
import '@lion/ui/define/lion-field.js';
import '@lion/ui/define/lion-radio.js';
import { LionForm } from '@lion/ui/form.js';
import '@lion/ui/define/lion-form.js';
import { LionButtonSubmit, LionButtonReset } from '@lion/ui/button.js';
import { spy } from 'sinon';
import {
  fixture as _fixture,
  unsafeStatic,
  aTimeout,
  defineCE,
  oneEvent,
  expect,
} from '@open-wc/testing';
import { resolveSuiteTag } from '../../core/test-helpers/resolveSuiteTag.js';
import { isActiveElement } from '../../core/test-helpers/isActiveElement.js';

/**
 * @typedef {import('@lion/ui/types/test-suites.js').SuiteElement} SuiteElement
 * Runs the `lion-form` behavioural suite, moved out of `test/lion-form.test.js` so a Subclasser can run
 * the same guarantees against its own element. Pass `tagString` to point it at your registered
 * tag; see docs/guides/principles/test-suites.md.
 * `tagString`, `klass` and the older role tag keys are deprecated: pass `classes` instead (Lion
 * itself uses `classes` everywhere).
 * @param {import('@lion/ui/types/test-suites.js').SuiteConfig<{'button-reset': SuiteElement; 'button-submit': SuiteElement; 'checkbox-group': SuiteElement; 'radio-group': SuiteElement; checkbox: SuiteElement; fieldset: SuiteElement; host: SuiteElement; listbox: SuiteElement; option: SuiteElement; radio: SuiteElement}, {buttonResetTagString?: any; buttonSubmitTagString?: any; checkboxGroupTagString?: any; checkboxTagString?: any; fieldsetTagString?: any; listboxTagString?: any; optionTagString?: any; radioGroupTagString?: any; radioTagString?: any}>} [customConfig]
 */
export function runFormSuite({
  classes: {
    host: hostEl = LionForm,
    'checkbox-group': roleCheckboxGroup = LionCheckboxGroup,
    'radio-group': roleRadioGroup = LionRadioGroup,
    fieldset: roleFieldset = LionFieldset,
    checkbox: roleCheckbox = LionCheckbox,
    listbox: roleListbox = LionListbox,
    option: roleOption = LionOption,
    radio: roleRadio = LionRadio,
    'button-submit': roleButtonSubmit = LionButtonSubmit,
    'button-reset': roleButtonReset = LionButtonReset,
  } = {},
  tagString: legacyTagString,
  checkboxGroupTagString: legacyCheckboxGroupTagString,
  radioGroupTagString: legacyRadioGroupTagString,
  fieldsetTagString: legacyFieldsetTagString,
  checkboxTagString: legacyCheckboxTagString,
  listboxTagString: legacyListboxTagString,
  optionTagString: legacyOptionTagString,
  radioTagString: legacyRadioTagString,
  buttonSubmitTagString: legacyButtonSubmitTagString,
  buttonResetTagString: legacyButtonResetTagString,
} = {}) {
  const tag = unsafeStatic(resolveSuiteTag(hostEl, legacyTagString));
  const tagNameCheckboxGroup = resolveSuiteTag(roleCheckboxGroup, legacyCheckboxGroupTagString);
  const tagCheckboxGroup = unsafeStatic(tagNameCheckboxGroup);
  const tagNameRadioGroup = resolveSuiteTag(roleRadioGroup, legacyRadioGroupTagString);
  const tagRadioGroup = unsafeStatic(tagNameRadioGroup);
  const tagNameFieldset = resolveSuiteTag(roleFieldset, legacyFieldsetTagString);
  const tagFieldset = unsafeStatic(tagNameFieldset);
  const tagNameCheckbox = resolveSuiteTag(roleCheckbox, legacyCheckboxTagString);
  const tagCheckbox = unsafeStatic(tagNameCheckbox);
  const tagNameListbox = resolveSuiteTag(roleListbox, legacyListboxTagString);
  const tagListbox = unsafeStatic(tagNameListbox);
  const tagNameOption = resolveSuiteTag(roleOption, legacyOptionTagString);
  const tagOption = unsafeStatic(tagNameOption);
  const tagNameRadio = resolveSuiteTag(roleRadio, legacyRadioTagString);
  const tagRadio = unsafeStatic(tagNameRadio);
  const tagNameButtonSubmit = resolveSuiteTag(roleButtonSubmit, legacyButtonSubmitTagString);
  const tagButtonSubmit = unsafeStatic(tagNameButtonSubmit);
  const tagNameButtonReset = resolveSuiteTag(roleButtonReset, legacyButtonResetTagString);
  const tagButtonReset = unsafeStatic(tagNameButtonReset);

  /**
   * @typedef {import('lit').TemplateResult} TemplateResult
   */
  const fixture = /** @type {(arg: TemplateResult) => Promise<LionForm>} */ (_fixture);

  const childTagString = defineCE(
    class extends LionField {
      get slots() {
        return {
          input: () => document.createElement('input'),
        };
      }
    },
  );
  const childTag = unsafeStatic(childTagString);

  describe('<lion-form>', () => {
    it('is an instance of LionFieldSet', async () => {
      const el = await fixture(html`
        <${tag}>
          <form></form>
        </${tag}>
      `);
      expect(el).to.be.instanceOf(LionFieldset);
    });

    it('relies on the native form for its accessible role', async () => {
      const el = await fixture(html`
        <${tag}>
          <form></form>
        </${tag}>
      `);
      expect(el.getAttribute('role')).to.be.null;
    });

    it('has a custom reset that gets triggered by native reset', async () => {
      const withDefaults = await fixture(html`
        <${tag}>
          <form>
            <${childTag} name="firstName" .modelValue="${'Foo'}"></${childTag}>
            <input type="reset" value="reset-button" />
          </form>
        </${tag}>
      `);
      const resetButton = /** @type {HTMLInputElement} */ (
        withDefaults.querySelector('input[type=reset]')
      );

      withDefaults.formElements.firstName.modelValue = 'updatedFoo';
      expect(withDefaults.modelValue).to.deep.equal({
        firstName: 'updatedFoo',
      });

      withDefaults.reset();
      expect(withDefaults.modelValue).to.deep.equal({
        firstName: 'Foo',
      });

      // use button
      withDefaults.formElements.firstName.modelValue = 'updatedFoo';
      expect(withDefaults.modelValue).to.deep.equal({
        firstName: 'updatedFoo',
      });

      resetButton.click();
      expect(withDefaults.modelValue).to.deep.equal({
        firstName: 'Foo',
      });
    });

    it('dispatches reset events', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${childTag} name="firstName" .modelValue="${'Foo'}"></${childTag}>
          </form>
        </${tag}>
      `);

      setTimeout(() => el.reset());
      const resetEv = await oneEvent(el, 'reset');
      expect(resetEv).to.be.instanceOf(Event);
      expect(resetEv.type).to.equal('reset');
      expect(resetEv.target).to.equal(el);
      expect(resetEv.bubbles).to.be.true;
      expect(resetEv.composed).to.be.false;
    });

    it('works with the native submit event (triggered via a button)', async () => {
      const submitSpy = spy();
      const el = await fixture(html`
        <${tag} @submit=${submitSpy}>
          <form>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);

      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      button.click();
      expect(submitSpy.callCount).to.equal(1);
    });

    it('dispatches submit events', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      setTimeout(() => button.click());
      const submitEv = await oneEvent(el, 'submit');
      expect(submitEv).to.be.instanceOf(Event);
      expect(submitEv.type).to.equal('submit');
      expect(submitEv.target).to.equal(el);
      expect(submitEv.bubbles).to.be.true;
      expect(submitEv.composed).to.be.false;
    });

    it('redispatches a submit event on the native form node when calling submit() imperatively', async () => {
      const nativeFormSubmitEventSpy = spy();
      const el = await fixture(html`
        <${tag}>
          <form @submit=${nativeFormSubmitEventSpy}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const submitSpy = spy(el, 'submit');
      const submitGroupSpy = spy(el, 'submitGroup');
      el.submit();
      expect(submitSpy.calledOnce).to.be.true;
      expect(nativeFormSubmitEventSpy.calledOnce).to.be.true;
      expect(submitGroupSpy.calledOnce).to.be.true;
    });

    it('handles internal submit handler before dispatch', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const internalHandlerSpy = spy(el, 'submitGroup');
      const dispatchSpy = spy(el, 'dispatchEvent');
      await aTimeout(0);
      button.click();
      expect(internalHandlerSpy).to.be.calledBefore(dispatchSpy);
    });

    it('handles internal submit handler before dispatch', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const internalHandlerSpy = spy(el, 'submitGroup');
      const dispatchSpy = spy(el, 'dispatchEvent');
      button.click();
      expect(dispatchSpy.args[0][0].type).to.equal('submit');
      expect(internalHandlerSpy).to.be.calledBefore(dispatchSpy);
    });

    it('handles internal reset handler before dispatch', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <button type="reset">reset</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const internalHandlerSpy = spy(el, 'resetGroup');
      const dispatchSpy = spy(el, 'dispatchEvent');
      button.click();
      expect(dispatchSpy.args[0][0].type).to.equal('reset');
      expect(internalHandlerSpy).to.be.calledBefore(dispatchSpy);
    });

    it('sets focus on submit to the first erroneous form element', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${childTag} name="firstName" .modelValue=${'Foo'} .validators=${[
              new Required(),
            ]}></${childTag}>
            <${childTag} name="lastName" .validators=${[new Required()]}></${childTag}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      expect(el.getAttribute('aria-invalid')).to.equal('false');
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const dispatchSpy = spy(el, 'dispatchEvent');
      button.click();
      expect(dispatchSpy.args.map(args => args[0].type)).to.contain('submit');
      // @ts-ignore [allow-protected] in test
      expect(isActiveElement(el.formElements[1]._inputNode)).to.be.true;
    });

    it('sets focus on submit to the first erroneous form element within a fieldset', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${tagFieldset} name="name">
              <${childTag} name="firstName" .modelValue=${'Foo'} .validators=${[
                new Required(),
              ]}></${childTag}>
              <${childTag} name="lastName" .validators=${[new Required()]}></${childTag}>
            </${tagFieldset}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const dispatchSpy = spy(el, 'dispatchEvent');
      button.click();
      expect(dispatchSpy.args.map(args => args[0].type)).to.contain('submit');
      const fieldset = el.formElements[0];
      // @ts-ignore [allow-protected] in test
      expect(isActiveElement(fieldset.formElements[1]._inputNode)).to.be.true;
    });

    it('sets focus on submit to the first form element within a erroneous fieldset', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${tagFieldset} name="name" .validators=${[new Required()]}>
              <${childTag} name="firstName"></${childTag}>
              <${childTag} name="lastName"></${childTag}>
            </${tagFieldset}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const dispatchSpy = spy(el, 'dispatchEvent');
      button.click();
      expect(dispatchSpy.args.map(args => args[0].type)).to.contain('submit');
      const fieldset = el.formElements[0];
      expect(isActiveElement(fieldset.formElements[0]._inputNode)).to.be.true;
    });

    it('sets focus on submit to the first form element within a erroneous fieldset within another fieldset', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${tagFieldset} name="parentFieldset">
              <${tagFieldset} name="childFieldset" .validators="${[new Required()]}">
                <${childTag} name="firstName"></${childTag}>
              </${tagFieldset}>
            </${tagFieldset}>

            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const parentFieldSetEl = el.formElements[0];
      const childFieldsetEl = parentFieldSetEl.formElements[0];
      const inputEl = childFieldsetEl.formElements[0];
      button.click();
      expect(isActiveElement(inputEl._focusableNode)).to.be.true;
    });

    it('sets focus on submit to the first form element within a erroneous listbox', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${tagListbox} name="name" .validators="${[new Required()]}">
              <${tagOption} value="a">a</${tagOption}>
              <${tagOption} value="b">b</${tagOption}>
            </${tagListbox}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      button.click();
      const listboxEl = el.formElements[0];
      expect(isActiveElement(listboxEl._inputNode)).to.be.true;
    });

    it('sets focus on submit to the first form element within a erroneous listbox within a fieldset', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${tagFieldset} name="fieldset">
              <${tagListbox} name="name" .validators="${[new Required()]}">
                <${tagOption} value="a">a</${tagOption}>
                <${tagOption} value="b">b</${tagOption}>
              </${tagListbox}>
            </${tagFieldset}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      button.click();
      const fieldsetEl = el.formElements[0];
      const listboxEl = fieldsetEl.formElements[0];
      expect(isActiveElement(listboxEl._inputNode)).to.be.true;
    });

    it('sets focus on submit to the first form element within a erroneous checkbox-group', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
            <${tagCheckboxGroup} name="name" .validators="${[new Required()]}">
              <${tagCheckbox} .choiceValue=${'a'} label="a"></${tagCheckbox}>
              <${tagCheckbox} .choiceValue=${'b'} label="b"></${tagCheckbox}>
            </${tagCheckboxGroup}>
            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));
      const checkboxGroupEl = el.formElements[0];
      const checkboxEl = checkboxGroupEl.formElements[0];
      button.click();
      expect(isActiveElement(checkboxEl._focusableNode)).to.be.true;
    });

    it('sets focus on submit to the first form element within a erroneous radio-group', async () => {
      const el = await fixture(html`
        <${tag}>
          <form>
              <${tagRadioGroup} name="name" .validators="${[new Required()]}">
                <${tagRadio} .choiceValue=${'a'} label="a"></${tagRadio}>
                <${tagRadio} .choiceValue=${'b'} label="b"></${tagRadio}>
              </${tagRadioGroup}>
            </${tagFieldset}>

            <button type="submit">submit</button>
          </form>
        </${tag}>
      `);
      const button = /** @type {HTMLButtonElement} */ (el.querySelector('button'));

      const radioGroupEl = el.formElements[0];
      const radioEl = radioGroupEl.formElements[0];
      button.click();
      expect(isActiveElement(radioEl._focusableNode)).to.be.true;
    });

    describe('ID and native node management', () => {
      it('assigns a unique suffixed ID to the native form node when lion-form has an ID', async () => {
        const el = await fixture(html`
          <${tag} id="my-form">
            <form></form>
          </${tag}>
        `);
        // @ts-ignore
        expect(el._formNode.id).to.equal('my-form__native');
      });

      it('assigns the inherited _inputId to the native form node when lion-form has no ID', async () => {
        const el = await fixture(html`
          <${tag}>
            <form></form>
          </${tag}>
        `);
        // @ts-ignore
        expect(el._formNode.id).to.equal(el._inputId);
        // @ts-ignore
        expect(el._formNode.id).to.be.a('string').and.not.be.empty;
      });

      it('does not overwrite a pre-existing custom id explicitly defined on the form node', async () => {
        const elWithId = await fixture(html`
          <${tag} id="parent-form">
            <form id="explicit-id"></form>
          </${tag}>
        `);
        // @ts-ignore
        expect(elWithId._formNode.id).to.equal('explicit-id');

        const elWithoutId = await fixture(html`
          <${tag}>
            <form id="another-explicit-id"></form>
          </${tag}>
        `);
        // @ts-ignore
        expect(elWithoutId._formNode.id).to.equal('another-explicit-id');
      });

      it('guarantees no duplicate IDs exist between lion-form and form in the document', async () => {
        const container = await fixture(html`
          <div>
            <${tag} id="collision-test">
              <form></form>
            </${tag}>
            <${tag}>
              <form></form>
            </${tag}>
          </div>
        `);
        const hostTagName = resolveSuiteTag(hostEl, legacyTagString);
        const [formWithId, formWithoutId] = /** @type {NodeListOf<LionForm>} */ (
          container.querySelectorAll(hostTagName)
        );

        // lion-form with ID
        expect(formWithId.id).to.equal('collision-test');
        // @ts-ignore
        expect(formWithId._formNode.id).to.equal('collision-test__native');
        expect(container.querySelectorAll('#collision-test')).to.have.lengthOf(1);
        expect(container.querySelectorAll('#collision-test__native')).to.have.lengthOf(1);
        // @ts-ignore
        expect(formWithId.id).to.not.equal(formWithId._formNode.id);

        // lion-form without ID
        expect(formWithoutId.hasAttribute('id')).to.be.false;
        // @ts-ignore
        expect(formWithoutId._formNode.id).to.be.a('string').and.not.be.empty;
        // @ts-ignore
        expect(container.querySelectorAll(`[id="${formWithoutId._formNode.id}"]`)).to.have.lengthOf(
          1,
        );
        // @ts-ignore
        expect(formWithoutId.id).to.not.equal(formWithoutId._formNode.id);

        await expect(container).to.be.accessible();
      });

      it('supports external button form targets for both native and lion buttons', async () => {
        const submitSpy = spy();
        const resetSpy = spy();
        const container = await fixture(html`
          <div>
            <${tag} id="ext-form" @submit=${submitSpy} @reset=${resetSpy}>
              <form></form>
            </${tag}>
            <button type="submit" form="ext-form__native" id="native-submit">Submit Native</button>
            <button type="reset" form="ext-form__native" id="native-reset">Reset Native</button>
            <${tagButtonSubmit} form="ext-form" id="lion-submit">Submit Lion</${tagButtonSubmit}>
            <${tagButtonReset} form="ext-form" id="lion-reset">Reset Lion</${tagButtonReset}>
          </div>
        `);
        const nativeSubmit = /** @type {HTMLButtonElement} */ (
          container.querySelector('#native-submit')
        );
        const nativeReset = /** @type {HTMLButtonElement} */ (
          container.querySelector('#native-reset')
        );
        const lionSubmit = /** @type {HTMLElement} */ (container.querySelector('#lion-submit'));
        const lionReset = /** @type {HTMLElement} */ (container.querySelector('#lion-reset'));

        nativeSubmit.click();
        expect(submitSpy.callCount).to.equal(1);

        nativeReset.click();
        expect(resetSpy.callCount).to.equal(1);

        lionSubmit.click();
        expect(submitSpy.callCount).to.equal(2);

        lionReset.click();
        expect(resetSpy.callCount).to.equal(2);
      });
    });
  });
}
