import { LionButton } from './LionButton.js';

/**
 * @typedef {import('lit').TemplateResult} TemplateResult
 */

/**
 * This adds functionality for form buttons (type 'submit' and 'reset').
 * It allows to submit or reset a <form> by spawning a click on a temporrary native button inside
 * the form.
 * Use LionButtonSubmit when implicit form submission should be supported as well.
 *
 * Functionality in this button is not purely for type="reset", also for type="submit".
 * For mainainability purposes the submit functionality is part of LionButtonReset
 * (it needs the same logic).
 * LionButtonReset could therefore actually be considered as 'LionButtonForm' (without the
 * implicit form submission logic), but LionButtonReset is an easier to grasp name for
 * Application Developers: for reset buttons, always use LionButtonReset, for submit
 * buttons always use LionButtonSubmit.
 *
 * @property {string} [form]
 * @property {HTMLFormElement | import('../../form/src/LionForm.js').LionForm} [formElement]
 * @customElement lion-button-reset
 */
export class LionButtonReset extends LionButton {
  static get properties() {
    return {
      ...super.properties,
      form: { type: String, reflect: true },
      formElement: { attribute: false },
    };
  }

  constructor() {
    super();
    this.type = 'reset';
    this.__setupDelegationInConstructor();

    /** @type {string|undefined} */
    this.form = undefined;
    /** @type {HTMLFormElement|import('../../form/src/LionForm.js').LionForm|undefined} */
    this.formElement = undefined;

    /** @type {HTMLButtonElement} */
    this.__submitAndResetHelperButton = document.createElement('button');

    /** @type {EventListener} */
    this.__preventEventLeakage = this.__preventEventLeakage.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // Old browsers (IE11, Old Edge, Firefox ESR 60) don't have the `.form`
    // property defined immediately on the native button, so do this after first render on connected.
    this.updateComplete.then(() => {
      this._setupSubmitAndResetHelperOnConnected();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardownSubmitAndResetHelperOnDisconnected();
  }

  /**
   * @param {import('lit').PropertyValues} changedProperties
   */
  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('form') || changedProperties.has('formElement')) {
      this._teardownSubmitAndResetHelper();
      this._form = this._resolveForm();
      this._setupSubmitAndResetHelper();
      this._syncAriaControls();
    }
  }

  /**
   * Prevents that someone who listens outside or on form catches the click event
   * @param {Event} e
   * @private
   */
  __preventEventLeakage(e) {
    if (e.target === this.__submitAndResetHelperButton) {
      e.stopImmediatePropagation();
    }
  }

  /**
   * Resolves target form:
   * 1. Direct reference via `formElement`.
   * 2. ID lookup via `form` attribute in root node, falling back to document scope if in ShadowRoot.
   * 3. Fallback to ancestral form lookup via helper button.
   * @protected
   * @returns {HTMLFormElement|null}
   */
  _resolveForm() {
    /** @type {any} */
    let target = null;
    if (this.formElement) {
      target = this.formElement;
    } else if (this.form) {
      const root = this.getRootNode();
      // @ts-expect-error
      target = root && 'getElementById' in root ? root.getElementById(this.form) : null;
      if (!target && typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
        target = this.ownerDocument ? this.ownerDocument.getElementById(this.form) : null;
      }
    }

    if (target) {
      const formNode =
        target._formNode ||
        (target.shadowRoot &&
          (target.shadowRoot.querySelector('form') ||
            target.shadowRoot.querySelector('lion-form')?._formNode)) ||
        target;
      if (formNode instanceof HTMLFormElement) {
        return formNode;
      }
      return null;
    }

    this.appendChild(this.__submitAndResetHelperButton);
    const { form } = this.__submitAndResetHelperButton;
    this.removeChild(this.__submitAndResetHelperButton);
    return form;
  }

  /**
   * Synchronizes `aria-controls` attribute when a form ID is present.
   * @protected
   */
  _syncAriaControls() {
    const formId = this.form || (this.formElement && this.formElement.id);
    if (formId) {
      this.setAttribute('aria-controls', formId);
    } else {
      this.removeAttribute('aria-controls');
    }
  }

  /**
   * @protected
   */
  _setupSubmitAndResetHelper() {
    if (this._form) {
      this._form.addEventListener('click', this.__preventEventLeakage);
    }
  }

  /**
   * @protected
   */
  _teardownSubmitAndResetHelper() {
    if (this._form) {
      this._form.removeEventListener('click', this.__preventEventLeakage);
    }
  }

  /**
   * @protected
   */
  _setupSubmitAndResetHelperOnConnected() {
    this._teardownSubmitAndResetHelper();
    this._form = this._resolveForm();
    this._setupSubmitAndResetHelper();
    this._syncAriaControls();
  }

  /**
   * @protected
   */
  _teardownSubmitAndResetHelperOnDisconnected() {
    this._teardownSubmitAndResetHelper();
  }

  /**
   * Delegate click, by flashing a native button as a direct child
   * of the form, and firing click on this button. This will fire the form submit
   * without side effects caused by the click bubbling back up to lion-button.
   * @param {Event} ev
   * @protected
   * @returns {Promise<void>}
   */
  // TODO: rename to _clickDelegationHandler in v1
  async __clickDelegationHandler(ev) {
    if (!this._form) {
      this._form = this._resolveForm();
      if (!this._form) {
        await this.updateComplete;
        this._form = this._resolveForm();
      }
      if (this._form) {
        this._setupSubmitAndResetHelper();
      }
    }

    if ((this.type === 'submit' || this.type === 'reset') && ev.target === this && this._form) {
      /**
       * Here, we make sure our button is compatible with a native form, by firing a click
       * from a native button that our form responds to. The native button we spawn will be a direct
       * child of the form, plus the click event that will be sent will be prevented from
       * propagating outside of the form. This will keep the amount of 'noise' (click events
       * from 'ghost elements' that can be intercepted by listeners in the bubble chain) to an
       * absolute minimum.
       */
      this.__submitAndResetHelperButton.type = this.type;

      this._form.appendChild(this.__submitAndResetHelperButton);
      // Form submission or reset will happen
      this.__submitAndResetHelperButton.click();
      this._form.removeChild(this.__submitAndResetHelperButton);
    }
  }

  /**
   * @private
   */
  __setupDelegationInConstructor() {
    // do not move to connectedCallback, otherwise IE11 breaks.
    // more info: https://github.com/ing-bank/lion/issues/179#issuecomment-511763835
    this.addEventListener('click', this.__clickDelegationHandler, true);
  }
}
