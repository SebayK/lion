/* eslint-disable lit-a11y/click-events-have-key-events */
import { LionButtonReset } from '@lion/ui/button.js';
import '@lion/ui/define/lion-form.js';
import { aTimeout, defineCE, expect, fixture, html, unsafeStatic } from '@open-wc/testing';
import { LitElement } from 'lit';
import sinon from 'sinon';
import { resolveSuiteTag } from '../../core/test-helpers/resolveSuiteTag.js';

/**
 * Runs the `LionButtonReset` behavioural suite. The caller hands the element to run against; anything
 * left out keeps the element this suite registers from the Lion class.
 * @typedef {import('@lion/ui/types/test-suites.js').SuiteElement} SuiteElement
 * @param {import('@lion/ui/types/test-suites.js').SuiteConfig<{host: SuiteElement}>} [customConfig]
 */
export function LionButtonResetSuite({ classes = {}, tagString } = {}) {
  const tagStringButtonReset = resolveSuiteTag(classes.host, tagString, LionButtonReset);
  const tagButtonReset = unsafeStatic(tagStringButtonReset);

  describe('LionButtonReset', () => {
    it('has .type="reset" and type="reset" by default', async () => {
      const el = /** @type {LionButtonReset} */ (
        await fixture(html`<${tagButtonReset}>foo</${tagButtonReset}>`)
      );
      expect(el.type).to.equal('reset');
      expect(el.getAttribute('type')).to.be.equal('reset');
    });

    /**
     * Notice functionality below is not purely for type="reset", also for type="submit".
     * For mainainability purposes the submit functionality is part of LionButtonReset.
     * (it needs the same logic)
     * LionButtonReset could therefore actually be considered as 'LionButtonForm' (without the
     * implicit form submission logic), but LionButtonReset is an easier to grasp name for
     * Application Developers: for reset buttons, always use LionButtonReset, for submit
     * buttons always use LionButton.
     * For buttons that should support all three types (like native <button>); use LionButton.
     */
    describe('Form integration', () => {
      describe('With submit event', () => {
        it('behaves like native `button` when clicked', async () => {
          const formSubmitSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
          const form = await fixture(html`
            <form @submit="${formSubmitSpy}">
              <${tagButtonReset} type="submit">foo</${tagButtonReset}>
            </form>
          `);
          const button /** @type {LionButtonReset} */ = /** @type {LionButtonReset} */ (
            form.querySelector(tagStringButtonReset)
          );
          button.click();
          expect(formSubmitSpy).to.have.been.calledOnce;
        });

        it('behaves like native `button` when interacted with keyboard space', async () => {
          const formSubmitSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
          const form = await fixture(html`
            <form @submit="${formSubmitSpy}">
              <${tagButtonReset} type="submit">foo</${tagButtonReset}>
            </form>
          `);
          const button /** @type {LionButtonReset} */ = /** @type {LionButtonReset} */ (
            form.querySelector(tagStringButtonReset)
          );
          button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
          await aTimeout(0);
          await aTimeout(0);
          expect(formSubmitSpy).to.have.been.calledOnce;
        });

        it('behaves like native `button` when interacted with keyboard enter', async () => {
          const formSubmitSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
          const form = await fixture(html`
            <form @submit="${formSubmitSpy}">
              <${tagButtonReset} type="submit">foo</${tagButtonReset}>
            </form>
          `);

          const button = /** @type {LionButtonReset} */ (form.querySelector(tagStringButtonReset));
          button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
          await aTimeout(0);
          await aTimeout(0);

          expect(formSubmitSpy).to.have.been.calledOnce;
        });

        it('supports resetting form inputs in a native form', async () => {
          const form = await fixture(html`
            <form>
              <input name="firstName" />
              <input name="lastName" />
              <${tagButtonReset} type="reset">reset</${tagButtonReset}>
            </form>
          `);
          const btn /** @type {LionButtonReset} */ = /** @type {LionButtonReset} */ (
            form.querySelector(tagStringButtonReset)
          );
          const firstName = /** @type {HTMLInputElement} */ (
            form.querySelector('input[name=firstName]')
          );
          const lastName = /** @type {HTMLInputElement} */ (
            form.querySelector('input[name=lastName]')
          );
          firstName.value = 'Foo';
          lastName.value = 'Bar';

          expect(firstName.value).to.equal('Foo');
          expect(lastName.value).to.equal('Bar');

          btn.click();

          expect(firstName.value).to.be.empty;
          expect(lastName.value).to.be.empty;
        });
      });
    });

    it('is fired once outside and inside the form', async () => {
      const outsideSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
      const insideSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
      const formSpyEarly = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
      const formSpyLater = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));

      const el = /** @type {HTMLDivElement} */ (
        await fixture(
          html`
            <div @click="${outsideSpy}">
              <form @click="${formSpyEarly}">
                <div @click="${insideSpy}">
                  <${tagButtonReset}>foo</${tagButtonReset}>
                </div>
              </form>
            </div>
          `,
        )
      );
      const lionButton = /** @type {LionButtonReset} */ (el.querySelector(tagStringButtonReset));
      const form = /** @type {HTMLFormElement} */ (el.querySelector('form'));
      form.addEventListener('click', formSpyLater);

      lionButton.click();
      // trying to wait for other possible redispatched events
      await aTimeout(0);
      await aTimeout(0);

      expect(insideSpy).to.have.been.calledOnce;
      expect(outsideSpy).to.have.been.calledOnce;
      // A small sacrifice for event listeners registered early: we get the native button evt.
      expect(formSpyEarly).to.have.been.calledTwice;
      expect(formSpyLater).to.have.been.calledOnce;
    });

    it('works when connected to different form', async () => {
      const form1El = /** @type {HTMLFormElement} */ (
        await fixture(
          html`
            <form>
              <${tagButtonReset}>foo</${tagButtonReset}>
            </form>
          `,
        )
      );
      const lionButton = /** @type {LionButtonReset} */ (
        form1El.querySelector(tagStringButtonReset)
      );

      expect(lionButton._form).to.equal(form1El);

      // Now we add the lionButton to a different form.
      // We disconnect and connect and check if everything still works as expected
      const outsideSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
      const insideSpy = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
      const formSpyEarly = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));
      const formSpyLater = /** @type {EventListener} */ (sinon.spy(e => e.preventDefault()));

      const form2El = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <div @click="${outsideSpy}">
            <form @click="${formSpyEarly}">
              <div @click="${insideSpy}">${lionButton}</div>
            </form>
          </div>
        `)
      );
      const form2Node = /** @type {HTMLFormElement} */ (form2El.querySelector('form'));

      expect(lionButton._form).to.equal(form2Node);

      form2Node.addEventListener('click', formSpyLater);
      lionButton.click();
      // trying to wait for other possible redispatched events
      await aTimeout(0);
      await aTimeout(0);

      expect(insideSpy).to.have.been.calledOnce;
      expect(outsideSpy).to.have.been.calledOnce;
      // A small sacrifice for event listeners registered early: we get the native button evt.
      expect(formSpyEarly).to.have.been.calledTwice;
      expect(formSpyLater).to.have.been.calledOnce;
    });

    describe('Detached form button', () => {
      it('resets a detached native form via form attribute', async () => {
        const el = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <form id="my-form">
                <input name="firstName" />
              </form>
              <${tagButtonReset} form="my-form">reset</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (el.querySelector(tagStringButtonReset));
        const input = /** @type {HTMLInputElement} */ (el.querySelector('input'));

        input.value = 'Foo';
        expect(input.value).to.equal('Foo');
        btn.click();
        expect(input.value).to.be.empty;
      });

      it('submits a detached native form via form attribute', async () => {
        const submitSpy = sinon.spy(e => e.preventDefault());
        const el = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <form id="my-form" @submit="${submitSpy}">
                <input name="firstName" />
              </form>
              <${tagButtonReset} type="submit" form="my-form">submit</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (el.querySelector(tagStringButtonReset));
        btn.click();
        expect(submitSpy).to.have.been.calledOnce;
      });

      it('resets a detached lion-form via form attribute', async () => {
        const resetSpy = sinon.spy();
        const el = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <lion-form id="my-lion-form" @reset="${resetSpy}">
                <form>
                  <input name="firstName" />
                </form>
              </lion-form>
              <${tagButtonReset} form="my-lion-form">reset</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (el.querySelector(tagStringButtonReset));
        btn.click();
        expect(resetSpy).to.have.been.calledOnce;
      });

      it('submits a detached lion-form via form attribute', async () => {
        const submitSpy = sinon.spy();
        const el = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <lion-form id="my-lion-form" @submit="${submitSpy}">
                <form>
                  <input name="firstName" />
                </form>
              </lion-form>
              <${tagButtonReset} type="submit" form="my-lion-form">submit</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (el.querySelector(tagStringButtonReset));
        btn.click();
        expect(submitSpy).to.have.been.calledOnce;
      });

      it('resets a detached native form via .formElement property', async () => {
        const formEl = /** @type {HTMLFormElement} */ (
          await fixture(html`
            <form>
              <input name="firstName" />
            </form>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (
          await fixture(html`
            <${tagButtonReset} .formElement="${formEl}">reset</${tagButtonReset}>
          `)
        );
        const input = /** @type {HTMLInputElement} */ (formEl.querySelector('input'));

        input.value = 'Foo';
        expect(input.value).to.equal('Foo');
        btn.click();
        expect(input.value).to.be.empty;
      });

      it('submits a detached native form via .formElement property', async () => {
        const submitSpy = sinon.spy(e => e.preventDefault());
        const formEl = /** @type {HTMLFormElement} */ (
          await fixture(html`
            <form @submit="${submitSpy}">
              <input name="firstName" />
            </form>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (
          await fixture(html`
            <${tagButtonReset} type="submit" .formElement="${formEl}">submit</${tagButtonReset}>
          `)
        );
        btn.click();
        expect(submitSpy).to.have.been.calledOnce;
      });

      it('resets a detached lion-form via .formElement property', async () => {
        const resetSpy = sinon.spy();
        const lionForm = /** @type {import('@lion/ui/form.js').LionForm} */ (
          await fixture(html`
            <lion-form @reset="${resetSpy}">
              <form>
                <input name="firstName" />
              </form>
            </lion-form>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (
          await fixture(html`
            <${tagButtonReset} .formElement="${lionForm}">reset</${tagButtonReset}>
          `)
        );
        btn.click();
        expect(resetSpy).to.have.been.calledOnce;
      });

      it('submits a detached lion-form via .formElement property', async () => {
        const submitSpy = sinon.spy();
        const lionForm = /** @type {import('@lion/ui/form.js').LionForm} */ (
          await fixture(html`
            <lion-form @submit="${submitSpy}">
              <form>
                <input name="firstName" />
              </form>
            </lion-form>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (
          await fixture(html`
            <${tagButtonReset} type="submit" .formElement="${lionForm}">submit</${tagButtonReset}>
          `)
        );
        btn.click();
        expect(submitSpy).to.have.been.calledOnce;
      });

      it('ignores non-form elements and does not attempt submission', async () => {
        const el = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <div id="not-a-form"></div>
              <${tagButtonReset} form="not-a-form">reset</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (el.querySelector(tagStringButtonReset));
        expect(btn._form).to.be.null;
        // Clicking should not throw or attempt helper button appending
        btn.click();
        expect(btn._form).to.be.null;
      });

      it('falls back to host document when button is inside a shadow root', async () => {
        const tagShadowHostString = defineCE(
          class extends LitElement {
            render() {
              return html`<${tagButtonReset} form="doc-form">reset</${tagButtonReset}>`;
            }
          },
        );
        const tagShadowHost = unsafeStatic(tagShadowHostString);
        const wrapper = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <form id="doc-form">
                <input name="firstName" />
              </form>
              <${tagShadowHost}></${tagShadowHost}>
            </div>
          `)
        );
        const host = /** @type {HTMLElement} */ (wrapper.querySelector(tagShadowHostString));
        const btn = /** @type {LionButtonReset} */ (
          host.shadowRoot?.querySelector(tagStringButtonReset)
        );
        const form = /** @type {HTMLFormElement} */ (wrapper.querySelector('#doc-form'));
        const input = /** @type {HTMLInputElement} */ (form.querySelector('input'));

        input.value = 'Foo';
        expect(input.value).to.equal('Foo');
        btn.click();
        expect(input.value).to.be.empty;
      });

      it('associates across two separate components with separate shadow roots via form attribute', async () => {
        const tagFormCompString = defineCE(
          class extends LitElement {
            render() {
              return html`
                <form>
                  <input name="field" />
                </form>
              `;
            }
          },
        );
        const tagActionCompString = defineCE(
          class extends LitElement {
            static properties = {
              targetForm: { type: String },
            };

            constructor() {
              super();
              /** @type {string|undefined} */
              this.targetForm = undefined;
            }

            render() {
              return html`<${tagButtonReset} form="${this.targetForm}">reset</${tagButtonReset}>`;
            }
          },
        );
        const tagFormComp = unsafeStatic(tagFormCompString);
        const tagActionComp = unsafeStatic(tagActionCompString);

        const wrapper = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <${tagFormComp} id="comp-form"></${tagFormComp}>
              <${tagActionComp} targetForm="comp-form"></${tagActionComp}>
            </div>
          `)
        );

        const formComp = /** @type {HTMLElement} */ (wrapper.querySelector(tagFormCompString));
        const actionComp = /** @type {HTMLElement} */ (wrapper.querySelector(tagActionCompString));
        const form = /** @type {HTMLFormElement} */ (formComp.shadowRoot?.querySelector('form'));
        const input = /** @type {HTMLInputElement} */ (form.querySelector('input'));
        const btn = /** @type {LionButtonReset} */ (
          actionComp.shadowRoot?.querySelector(tagStringButtonReset)
        );

        input.value = 'TestValue';
        expect(input.value).to.equal('TestValue');
        btn.click();
        expect(input.value).to.be.empty;
      });

      it('associates across two separate components with separate shadow roots via .formElement property', async () => {
        const tagFormCompString = defineCE(
          class extends LitElement {
            render() {
              return html`
                <form>
                  <input name="field" />
                </form>
              `;
            }

            get formNode() {
              return this.shadowRoot?.querySelector('form');
            }
          },
        );
        const tagActionCompString = defineCE(
          class extends LitElement {
            static properties = {
              formElement: { attribute: false },
            };

            constructor() {
              super();
              /** @type {any} */
              this.formElement = undefined;
            }

            render() {
              return html`<${tagButtonReset} .formElement="${this.formElement}">reset</${tagButtonReset}>`;
            }
          },
        );
        const tagFormComp = unsafeStatic(tagFormCompString);
        const tagActionComp = unsafeStatic(tagActionCompString);

        const wrapper = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <${tagFormComp}></${tagFormComp}>
              <${tagActionComp}></${tagActionComp}>
            </div>
          `)
        );

        const formComp = /** @type {any} */ (wrapper.querySelector(tagFormCompString));
        const actionComp = /** @type {any} */ (wrapper.querySelector(tagActionCompString));
        actionComp.formElement = formComp.formNode;
        await actionComp.updateComplete;

        const form = /** @type {HTMLFormElement} */ (formComp.shadowRoot?.querySelector('form'));
        const input = /** @type {HTMLInputElement} */ (form.querySelector('input'));
        const btn = /** @type {LionButtonReset} */ (
          actionComp.shadowRoot?.querySelector(tagStringButtonReset)
        );

        input.value = 'ShadowTest';
        expect(input.value).to.equal('ShadowTest');
        btn.click();
        expect(input.value).to.be.empty;
      });

      it('dynamically switches targets when form attribute changes', async () => {
        const wrapper = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <form id="form-a">
                <input name="a" />
              </form>
              <form id="form-b">
                <input name="b" />
              </form>
              <${tagButtonReset} form="form-a">reset</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (wrapper.querySelector(tagStringButtonReset));
        const inputA = /** @type {HTMLInputElement} */ (wrapper.querySelector('#form-a input'));
        const inputB = /** @type {HTMLInputElement} */ (wrapper.querySelector('#form-b input'));

        inputA.value = 'ValA';
        inputB.value = 'ValB';

        btn.click();
        expect(inputA.value).to.be.empty;
        expect(inputB.value).to.equal('ValB');

        btn.form = 'form-b';
        await btn.updateComplete;

        inputA.value = 'ValA2';
        btn.click();
        expect(inputA.value).to.equal('ValA2');
        expect(inputB.value).to.be.empty;
      });

      it('dynamically switches targets when .formElement property changes', async () => {
        const formA = /** @type {HTMLFormElement} */ (
          await fixture(html`
            <form>
              <input name="a" />
            </form>
          `)
        );
        const formB = /** @type {HTMLFormElement} */ (
          await fixture(html`
            <form>
              <input name="b" />
            </form>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (
          await fixture(html`
            <${tagButtonReset} .formElement="${formA}">reset</${tagButtonReset}>
          `)
        );
        const inputA = /** @type {HTMLInputElement} */ (formA.querySelector('input'));
        const inputB = /** @type {HTMLInputElement} */ (formB.querySelector('input'));

        inputA.value = 'ValA';
        inputB.value = 'ValB';

        btn.click();
        expect(inputA.value).to.be.empty;
        expect(inputB.value).to.equal('ValB');

        btn.formElement = formB;
        await btn.updateComplete;

        inputA.value = 'ValA2';
        btn.click();
        expect(inputA.value).to.equal('ValA2');
        expect(inputB.value).to.be.empty;
      });

      it('performs lazy resolution on click if form is mounted after button connects', async () => {
        const container = /** @type {HTMLDivElement} */ (
          await fixture(html`
            <div>
              <${tagButtonReset} form="delayed-form">reset</${tagButtonReset}>
            </div>
          `)
        );
        const btn = /** @type {LionButtonReset} */ (container.querySelector(tagStringButtonReset));
        expect(btn._form).to.be.null;

        const form = document.createElement('form');
        form.id = 'delayed-form';
        const input = document.createElement('input');
        input.name = 'test';
        form.appendChild(input);
        container.appendChild(form);

        input.value = 'Foo';
        expect(input.value).to.equal('Foo');

        btn.click();
        expect(input.value).to.be.empty;
        expect(btn._form).to.equal(form);
      });

      describe('aria-controls synchronization', () => {
        it('sets aria-controls to form ID when form attribute is set', async () => {
          const btn = /** @type {LionButtonReset} */ (
            await fixture(html`<${tagButtonReset} form="my-form">reset</${tagButtonReset}>`)
          );
          expect(btn.getAttribute('aria-controls')).to.equal('my-form');

          btn.form = 'other-form';
          await btn.updateComplete;
          expect(btn.getAttribute('aria-controls')).to.equal('other-form');

          btn.removeAttribute('form');
          await btn.updateComplete;
          expect(btn.hasAttribute('aria-controls')).to.be.false;
        });

        it('sets aria-controls to form ID when .formElement has an id', async () => {
          const form = /** @type {HTMLFormElement} */ (
            await fixture(html`<form id="form-with-id"></form>`)
          );
          const btn = /** @type {LionButtonReset} */ (
            await fixture(html`<${tagButtonReset} .formElement="${form}">reset</${tagButtonReset}>`)
          );
          expect(btn.getAttribute('aria-controls')).to.equal('form-with-id');

          const formWithoutId = /** @type {HTMLFormElement} */ (await fixture(html`<form></form>`));
          btn.formElement = formWithoutId;
          await btn.updateComplete;
          expect(btn.hasAttribute('aria-controls')).to.be.false;
        });
      });

      it('cleans up event listeners from associated form when disconnected', async () => {
        const form = /** @type {HTMLFormElement} */ (
          await fixture(html`<form id="clean-form"></form>`)
        );
        const container = /** @type {HTMLDivElement} */ (await fixture(html`<div></div>`));
        const btn = /** @type {LionButtonReset} */ (
          await fixture(html`<${tagButtonReset} form="clean-form">reset</${tagButtonReset}>`, {
            parentNode: container,
          })
        );
        const removeSpy = sinon.spy(form, 'removeEventListener');

        btn.remove();
        expect(removeSpy).to.have.been.calledWith('click', sinon.match.func);
      });
    });
  });
}
